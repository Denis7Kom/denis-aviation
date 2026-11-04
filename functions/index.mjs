import { createHash } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { isAdministrator, checkedText, validateRequest, nextMessageQuota } from './domain.mjs';

initializeApp();
const db = getFirestore();
const options = { region: 'europe-west1', maxInstances: 3 };
const authenticate = (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in first.');
  return request.auth;
};
function validation(action) {
  try {
    return action();
  } catch (error) {
    throw new HttpsError(
      error.message === 'resource-exhausted' ? 'resource-exhausted' : 'invalid-argument',
      error.message === 'past-date'
        ? 'The selected time has passed.'
        : 'Check the submitted fields.',
    );
  }
}
export const requestServiceHealth = onRequest(options, (_request, response) => {
  response.json({ version: 1, service: 'denis-aviation-requests' });
});
export const createFlightRequest = onCall(options, async (request) => {
  const auth = authenticate(request);
  if (auth.token.email_verified !== true || typeof auth.token.email !== 'string')
    throw new HttpsError('permission-denied', 'A verified email is required.');
  const { data, scheduledAt } = validation(() => validateRequest(request.data));
  const ref = db.collection('flightRequests').doc();
  const quota = db.doc(`requestQuotas/${auth.uid}`);
  await db.runTransaction(async (tx) => {
    const previous = (await tx.get(quota)).data();
    const now = Date.now(),
      day = new Date(now).toISOString().slice(0, 10);
    const count =
      previous?.updatedAt?.toDate().toISOString().slice(0, 10) === day ? previous.count : 0;
    if (count >= 5) throw new HttpsError('resource-exhausted', 'Daily request limit reached.');
    if (scheduledAt < now)
      throw new HttpsError('invalid-argument', 'The selected time has passed.');
    tx.set(quota, {
      count: count + 1,
      updatedAt: FieldValue.serverTimestamp(),
      requestId: ref.id,
    });
    tx.create(ref, {
      ...data,
      scheduledAt: Timestamp.fromMillis(scheduledAt),
      owner: auth.uid,
      ownerEmail: auth.token.email,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { id: ref.id };
});
export const sendRequestMessage = onCall(options, async (request) => {
  const auth = authenticate(request);
  const id = validation(() => checkedText(request.data?.requestId, 128));
  if (!/^[A-Za-z0-9_-]+$/.test(id))
    throw new HttpsError('invalid-argument', 'Invalid request.');
  const body = validation(() => checkedText(request.data?.body, 150));
  const ref = db.doc(`flightRequests/${id}`),
    quota = db.doc(`requestMessageQuotas/${auth.uid}`);
  const message = ref.collection('messages').doc();
  await db.runTransaction(async (tx) => {
    const [parent, previous] = await Promise.all([tx.get(ref), tx.get(quota)]);
    if (!parent.exists || (parent.data().owner !== auth.uid && !isAdministrator(auth)))
      throw new HttpsError('permission-denied', 'Request unavailable.');
    // The client-first restriction remains an interface rule, as requested.
    const next = validation(() => nextMessageQuota(previous.data(), Date.now()));
    tx.set(quota, next);
    tx.create(message, {
      body,
      authorUid: auth.uid,
      authorRole: isAdministrator(auth) ? 'admin' : 'client',
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  return { id: message.id };
});
const tokenId = (token) => createHash('sha256').update(token).digest('hex');
export const registerRequestPush = onCall(options, async (request) => {
  const auth = authenticate(request);
  const token = validation(() => checkedText(request.data?.token, 4096));
  if (token.length < 20 || !/^[A-Za-z0-9_:\-]+$/.test(token))
    throw new HttpsError('invalid-argument', 'Invalid push token.');
  const language = ['ru', 'en', 'it'].includes(request.data?.language)
    ? request.data.language
    : 'ru';
  const devices = await db
    .collection('requestPushDevices')
    .where('uid', '==', auth.uid)
    .limit(21)
    .get();
  const id = tokenId(token);
  if (devices.size >= 20 && !devices.docs.some((device) => device.id === id))
    throw new HttpsError('resource-exhausted', 'Too many registered devices.');
  await db
    .doc(`requestPushDevices/${id}`)
    .set({
      token,
      uid: auth.uid,
      role: isAdministrator(auth) ? 'admin' : 'client',
      language,
      updatedAt: FieldValue.serverTimestamp(),
    });
  return { registered: true };
});
async function deliver(event, kind, requestId, owner, authorUid) {
  const receipt = db.doc(`requestPushDeliveries/${tokenId(event.id)}`);
  const lease = await db.runTransaction(async (tx) => {
    const current = (await tx.get(receipt)).data();
    if (current?.done) return false;
    if (current?.leaseUntil > Date.now())
      throw new Error('Notification delivery already running');
    tx.set(receipt, { done: false, leaseUntil: Date.now() + 120000 });
    return true;
  });
  if (!lease) return;
  try {
    const [clients, admins] = await Promise.all([
      db.collection('requestPushDevices').where('uid', '==', owner).limit(20).get(),
      db.collection('requestPushDevices').where('role', '==', 'admin').limit(100).get(),
    ]);
    const devices = new Map(
      [...clients.docs, ...admins.docs].map((device) => [device.id, device]),
    );
    const targets = [...devices.values()].filter((device) => {
      const data = device.data();
      if (data.uid === authorUid) return false;
      if (kind === 'request') return data.role === 'admin';
      return kind !== 'status' || data.uid === owner || data.role === 'admin';
    });
    if (targets.length) {
      const result = await getMessaging().sendEach(
        targets.map((device) => ({
          token: device.data().token,
          data: { kind, requestId, language: device.data().language || 'ru' },
          webpush: {
            headers: { TTL: '3600', Urgency: 'normal', Topic: tokenId(requestId).slice(0, 32) },
          },
        })),
      );
      let transient = false;
      await Promise.all(
        result.responses.map(async (response, index) => {
          if (response.success) return;
          if (
            [
              'messaging/registration-token-not-registered',
              'messaging/invalid-registration-token',
            ].includes(response.error?.code)
          )
            await targets[index].ref.delete();
          else transient = true;
        }),
      );
      if (transient) throw new Error('Temporary push delivery failure');
    }
    await receipt.set({
      done: true,
      leaseUntil: 0,
      expiresAt: Timestamp.fromMillis(Date.now() + 7 * 86400000),
    });
  } catch (error) {
    await receipt.set({ done: false, leaseUntil: 0 }, { merge: true });
    throw error;
  }
}
export const notifyRequestCreated = onDocumentCreated(
  { ...options, document: 'flightRequests/{requestId}', retry: true },
  async (event) => {
    const data = event.data?.data();
    if (data) await deliver(event, 'request', event.params.requestId, data.owner, data.owner);
  },
);
export const notifyRequestMessage = onDocumentCreated(
  { ...options, document: 'flightRequests/{requestId}/messages/{messageId}', retry: true },
  async (event) => {
    const message = event.data?.data();
    if (!message) return;
    const parent = await db.doc(`flightRequests/${event.params.requestId}`).get();
    if (parent.exists)
      await deliver(
        event,
        'message',
        event.params.requestId,
        parent.data().owner,
        message.authorUid,
      );
  },
);
export const notifyRequestStatus = onDocumentUpdated(
  { ...options, document: 'flightRequests/{requestId}', retry: true },
  async (event) => {
    const before = event.data?.before.data(),
      after = event.data?.after.data();
    if (before?.status !== after?.status)
      await deliver(
        event,
        'status',
        event.params.requestId,
        after.owner,
        after.status === 'cancelled' ? after.owner : '',
      );
  },
);
