import assert from 'node:assert/strict';
import { initializeApp, deleteApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { cleanExpiredRequests, RETENTION_MS } from './cleanup-core.mjs';
if (!/^(?:127\.0\.0\.1|localhost):\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST || '')) {
  throw new Error('Local emulator required; production is never used.');
}
const app = initializeApp({ projectId: 'demo-denis-aviation-cleanup' });
const db = getFirestore(app);
try {
  const now = Date.now();
  const expired = db.doc('flightRequests/expired');
  const recent = db.doc('flightRequests/recent');
  await expired.set({
    createdAt: Timestamp.fromMillis(now - RETENTION_MS - 10000),
    notes: 'old request',
  });
  await recent.set({ createdAt: Timestamp.fromMillis(now), notes: 'keep' });
  const batch = db.batch();
  for (let i = 0; i < 205; i++)
    batch.set(expired.collection('messages').doc(String(i)), { body: 'old' });
  batch.set(recent.collection('messages').doc('keep'), { body: 'keep' });
  await batch.commit();
  const cutoff = Timestamp.fromMillis(now - RETENTION_MS);
  const dry = await cleanExpiredRequests(db, cutoff);
  assert.equal(dry.requests, 1);
  assert.equal(dry.messages, 205);
  assert((await expired.get()).exists);
  const applied = await cleanExpiredRequests(db, cutoff, { apply: true });
  assert.equal(applied.requests, 1);
  assert.equal(applied.messages, 205);
  assert(!(await expired.get()).exists);
  assert((await expired.collection('messages').get()).empty);
  assert((await recent.get()).exists);
  assert((await recent.collection('messages').doc('keep').get()).exists);
  const repeat = await cleanExpiredRequests(db, cutoff, { apply: true });
  assert.equal(repeat.requests, 0);
  console.log(
    'PASS: Admin SDK emulator cleanup, old schema, pagination, dry-run, recent preservation and repeat run',
  );
} finally {
  await db.terminate();
  await deleteApp(app);
}
