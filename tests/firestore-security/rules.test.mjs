import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setLogLevel,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

const projectId = 'demo-denis-aviation-rules';
// Expected permission denials are checked explicitly and need not flood the test output.
setLogLevel('silent');
const emulator = process.env.FIRESTORE_EMULATOR_HOST || '';
if (!/^(?:127\.0\.0\.1|localhost):\d+$/.test(emulator)) {
  throw new Error('A local Firestore emulator is required; production is never used.');
}
const environment = await initializeTestEnvironment({
  projectId,
  firestore: { rules: await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8') },
});
const google = (email) => ({
  email,
  email_verified: true,
  firebase: { sign_in_provider: 'google.com' },
});
const alice = environment
  .authenticatedContext('alice', google('alice@example.invalid'))
  .firestore();
const bob = environment.authenticatedContext('bob', google('bob@example.invalid')).firestore();
const noEmail = environment.authenticatedContext('no-email', {}).firestore();
const admin = environment
  .authenticatedContext('admin', google('deniska7best@gmail.com'))
  .firestore();
const notVerified = environment
  .authenticatedContext('not-verified', {
    ...google('deniska7best@gmail.com'),
    email_verified: false,
  })
  .firestore();
const wrongProvider = environment
  .authenticatedContext('password-login', {
    ...google('deniska7best@gmail.com'),
    firebase: { sign_in_provider: 'password' },
  })
  .firestore();
const guest = environment.unauthenticatedContext().firestore();
const path = (db, id) => doc(db, 'flightRequests', id);
const request = (owner, status = 'new') => ({
  owner,
  type: 'flight',
  network: 'VATSIM',
  date: '2030-01-01',
  time: '12:00',
  timezone: 'UTC',
  callsign: 'TEST1',
  route: 'UUEE LIRN',
  contact: 'test@example.invalid',
  notes: '',
  status,
  createdAt: Timestamp.fromDate(new Date('2026-01-01T00:00:00Z')),
});

try {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (const status of ['new', 'review', 'confirmed', 'declined', 'completed', 'cancelled']) {
      await setDoc(path(db, `alice-${status}`), request('alice', status));
    }
    await setDoc(path(db, 'bob-new'), request('bob'));
    await setDoc(path(db, 'no-email-new'), request('no-email'));
  });

  await assertSucceeds(
    setDoc(path(alice, 'valid'), { ...request('alice'), createdAt: serverTimestamp() }),
  );
  await assertSucceeds(
    setDoc(path(alice, 'valid-boundary'), {
      ...request('alice'),
      date: '2030-12-31',
      time: '23:59',
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    setDoc(path(guest, 'anonymous'), { ...request('alice'), createdAt: serverTimestamp() }),
  );
  await assertFails(
    setDoc(path(bob, 'forged-owner'), { ...request('alice'), createdAt: serverTimestamp() }),
  );
  await assertFails(setDoc(path(alice, 'forged-time'), request('alice')));
  await assertFails(
    setDoc(path(alice, 'extra-field'), {
      ...request('alice'),
      createdAt: serverTimestamp(),
      role: 'admin',
    }),
  );
  await assertFails(
    setDoc(path(alice, 'wrong-status'), {
      ...request('alice', 'confirmed'),
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    setDoc(path(alice, 'wrong-type'), {
      ...request('alice'),
      type: 'other',
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    setDoc(path(alice, 'long-notes'), {
      ...request('alice'),
      notes: 'a'.repeat(1001),
      createdAt: serverTimestamp(),
    }),
  );
  for (const [id, date, time] of [
    ['invalid-month', '2030-13-01', '12:00'],
    ['invalid-day', '2030-12-32', '12:00'],
    ['invalid-hour', '2030-12-01', '24:00'],
    ['invalid-minute', '2030-12-01', '12:60'],
  ]) {
    await assertFails(
      setDoc(path(alice, id), { ...request('alice'), date, time, createdAt: serverTimestamp() }),
    );
  }

  await assertSucceeds(getDoc(path(alice, 'alice-new')));
  await assertSucceeds(getDoc(path(noEmail, 'no-email-new')));
  await assertFails(getDoc(path(bob, 'alice-new')));
  await assertFails(getDoc(path(guest, 'alice-new')));
  await assertSucceeds(
    getDocs(query(collection(alice, 'flightRequests'), where('owner', '==', 'alice'))),
  );
  await assertFails(getDocs(collection(alice, 'flightRequests')));
  await assertSucceeds(getDocs(collection(admin, 'flightRequests')));
  await assertFails(getDoc(path(notVerified, 'alice-new')));
  await assertFails(getDoc(path(wrongProvider, 'alice-new')));

  await assertFails(updateDoc(path(bob, 'alice-new'), { status: 'cancelled' }));
  await assertFails(updateDoc(path(guest, 'alice-new'), { status: 'cancelled' }));
  await assertFails(updateDoc(path(alice, 'alice-new'), { route: 'altered' }));
  await assertFails(updateDoc(path(alice, 'alice-new'), { status: 'confirmed' }));
  await assertFails(updateDoc(path(alice, 'alice-new'), { status: 'cancelled', owner: 'bob' }));
  await assertFails(
    updateDoc(path(alice, 'alice-new'), { status: 'cancelled', contact: 'altered' }),
  );
  await assertFails(updateDoc(path(alice, 'alice-declined'), { status: 'cancelled' }));
  await assertFails(updateDoc(path(alice, 'alice-completed'), { status: 'cancelled' }));
  await assertFails(deleteDoc(path(alice, 'alice-new')));
  for (const status of ['new', 'review', 'confirmed']) {
    await assertSucceeds(updateDoc(path(alice, `alice-${status}`), { status: 'cancelled' }));
    assert.equal((await getDoc(path(alice, `alice-${status}`))).data().status, 'cancelled');
  }
  await assertFails(updateDoc(path(alice, 'alice-new'), { status: 'new' }));
  await assertFails(updateDoc(path(admin, 'alice-cancelled'), { status: 'new' }));
  await assertFails(updateDoc(path(admin, 'bob-new'), { status: 'confirmed', owner: 'admin' }));
  await assertFails(updateDoc(path(notVerified, 'bob-new'), { status: 'review' }));
  await assertFails(updateDoc(path(wrongProvider, 'bob-new'), { status: 'review' }));
  await assertSucceeds(updateDoc(path(noEmail, 'no-email-new'), { status: 'cancelled' }));
  await assertSucceeds(updateDoc(path(admin, 'bob-new'), { status: 'confirmed' }));
  await assertFails(deleteDoc(path(admin, 'bob-new')));
  await assertFails(getDoc(doc(alice, 'other', 'private')));
  console.log(
    'PASS: Firestore ownership, cancellation, admin identity, validation and denied operations',
  );
} finally {
  await environment.cleanup();
}
