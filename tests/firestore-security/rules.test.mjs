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
  runTransaction,
  writeBatch,
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
  ownerEmail: `${owner}@example.invalid`,
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

async function create(ref, data) {
  const db = ref.firestore;
  const quota = doc(db, 'requestQuotas', data.owner);
  return runTransaction(db, async (tx) => {
    const previous = await tx.get(quota);
    const old = previous.exists() ? previous.data() : null;
    const sameDay =
      old?.updatedAt?.toDate().toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
    tx.set(quota, {
      count: sameDay ? old.count + 1 : 1,
      updatedAt: serverTimestamp(),
      requestId: ref.id,
    });
    tx.set(ref, data);
  });
}

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
    create(path(alice, 'valid'), { ...request('alice'), createdAt: serverTimestamp() }),
  );
  await assertSucceeds(
    create(path(alice, 'without-contact'), {
      ...request('alice'),
      contact: '',
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    create(path(alice, 'invalid-contact-type'), {
      ...request('alice'),
      contact: 123,
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    create(path(alice, 'contact-too-long'), {
      ...request('alice'),
      contact: 'a'.repeat(121),
      createdAt: serverTimestamp(),
    }),
  );
  await assertSucceeds(
    create(path(alice, 'valid-boundary'), {
      ...request('alice'),
      date: '2030-12-31',
      time: '23:59',
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    create(path(guest, 'anonymous'), { ...request('alice'), createdAt: serverTimestamp() }),
  );
  await assertFails(
    create(path(bob, 'forged-owner'), { ...request('alice'), createdAt: serverTimestamp() }),
  );
  await assertFails(create(path(alice, 'forged-time'), request('alice')));
  await assertFails(
    create(path(alice, 'forged-email'), {
      ...request('alice'),
      ownerEmail: 'bob@example.invalid',
      createdAt: serverTimestamp(),
    }),
  );
  const { ownerEmail: ignoredEmail, ...missingEmail } = request('alice');
  await assertFails(
    create(path(alice, 'missing-email'), { ...missingEmail, createdAt: serverTimestamp() }),
  );
  await assertFails(
    create(path(noEmail, 'no-email-create'), {
      ...request('no-email'),
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    create(path(notVerified, 'unverified-email'), {
      ...request('not-verified'),
      ownerEmail: 'deniska7best@gmail.com',
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    create(path(alice, 'extra-field'), {
      ...request('alice'),
      createdAt: serverTimestamp(),
      role: 'admin',
    }),
  );
  await assertFails(
    create(path(alice, 'wrong-status'), {
      ...request('alice', 'confirmed'),
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    create(path(alice, 'wrong-type'), {
      ...request('alice'),
      type: 'other',
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    create(path(alice, 'long-notes'), {
      ...request('alice'),
      notes: 'a'.repeat(501),
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
      create(path(alice, id), { ...request('alice'), date, time, createdAt: serverTimestamp() }),
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

  await assertFails(updateDoc(path(alice, 'alice-new'), { adminComment: 'forged' }));
  await assertFails(updateDoc(path(bob, 'alice-new'), { adminComment: 'forged' }));
  await assertFails(updateDoc(path(notVerified, 'alice-new'), { adminComment: 'forged' }));
  await assertFails(updateDoc(path(admin, 'alice-new'), { adminComment: 'x'.repeat(501) }));
  await assertFails(updateDoc(path(admin, 'alice-new'), { adminComment: 42 }));
  await assertFails(
    updateDoc(path(admin, 'alice-new'), { adminComment: 'hello', status: 'confirmed' }),
  );
  await assertSucceeds(updateDoc(path(admin, 'alice-new'), { adminComment: 'hello' }));
  assert.equal((await getDoc(path(alice, 'alice-new'))).data().adminComment, 'hello');
  await assertSucceeds(updateDoc(path(admin, 'alice-cancelled'), { adminComment: 'closed' }));
  await assertSucceeds(updateDoc(path(admin, 'alice-new'), { adminComment: '' }));
  await assertFails(updateDoc(path(bob, 'alice-new'), { status: 'cancelled' }));
  await assertFails(updateDoc(path(guest, 'alice-new'), { status: 'cancelled' }));
  await assertFails(updateDoc(path(alice, 'alice-new'), { route: 'altered' }));
  await assertFails(updateDoc(path(alice, 'alice-new'), { ownerEmail: 'bob@example.invalid' }));
  await assertFails(updateDoc(path(admin, 'alice-new'), { ownerEmail: 'bob@example.invalid' }));
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

  // Atomic quota enforcement, including bypass attempts and a new UTC day.
  const limited = environment
    .authenticatedContext('limited', google('limited@example.invalid'))
    .firestore();
  for (let i = 0; i < 5; i++) {
    await assertSucceeds(
      create(path(limited, `daily-${i}`), { ...request('limited'), createdAt: serverTimestamp() }),
    );
  }
  await assertFails(
    create(path(limited, 'daily-six'), { ...request('limited'), createdAt: serverTimestamp() }),
  );
  await assertFails(
    setDoc(path(limited, 'without-quota'), { ...request('limited'), createdAt: serverTimestamp() }),
  );
  await assertFails(
    updateDoc(doc(limited, 'requestQuotas', 'limited'), { count: 0, updatedAt: serverTimestamp() }),
  );
  await assertFails(deleteDoc(doc(limited, 'requestQuotas', 'limited')));
  await assertFails(getDoc(doc(bob, 'requestQuotas', 'limited')));
  await assertFails(
    setDoc(doc(bob, 'requestQuotas', 'limited'), {
      count: 1,
      updatedAt: serverTimestamp(),
      requestId: 'fake',
    }),
  );
  await environment.withSecurityRulesDisabled(async (context) => {
    await updateDoc(doc(context.firestore(), 'requestQuotas', 'limited'), {
      updatedAt: Timestamp.fromMillis(Date.now() - 86400000),
    });
  });
  await assertSucceeds(
    create(path(limited, 'next-day'), { ...request('limited'), createdAt: serverTimestamp() }),
  );
  const batch = writeBatch(limited);
  batch.set(path(limited, 'batch-one'), { ...request('limited'), createdAt: serverTimestamp() });
  batch.set(path(limited, 'batch-two'), { ...request('limited'), createdAt: serverTimestamp() });
  batch.set(doc(limited, 'requestQuotas', 'limited'), {
    count: 2,
    updatedAt: serverTimestamp(),
    requestId: 'batch-one',
  });
  await assertFails(batch.commit());
  // Chat author, participant, timestamp and immutable message checks.
  const message = {
    authorUid: 'alice',
    authorRole: 'client',
    body: '<img src=x onerror=alert(1)>',
    createdAt: serverTimestamp(),
  };
  const msg = (db, id, parentId = 'valid') => doc(db, 'flightRequests', parentId, 'messages', id);
  await assertSucceeds(setDoc(msg(alice, 'client'), message));
  await assertSucceeds(setDoc(msg(alice, 'boundary'), { ...message, body: 'a'.repeat(50) }));
  await assertFails(
    setDoc(msg(admin, 'long-admin'), {
      ...message,
      authorUid: 'admin',
      authorRole: 'admin',
      body: 'a'.repeat(51),
    }),
  );
  await assertSucceeds(
    setDoc(msg(admin, 'admin'), { ...message, authorUid: 'admin', authorRole: 'admin' }),
  );
  await assertSucceeds(getDocs(collection(alice, 'flightRequests', 'valid', 'messages')));
  await assertSucceeds(getDoc(msg(admin, 'client')));
  await assertFails(getDoc(msg(bob, 'client')));
  await assertFails(getDoc(msg(guest, 'client')));
  await assertFails(setDoc(msg(bob, 'foreign'), { ...message, authorUid: 'bob' }));
  await assertFails(setDoc(msg(alice, 'forged-role'), { ...message, authorRole: 'admin' }));
  await assertFails(setDoc(msg(alice, 'forged-author'), { ...message, authorUid: 'bob' }));
  await assertFails(
    setDoc(msg(notVerified, 'admin'), {
      ...message,
      authorUid: 'not-verified',
      authorRole: 'admin',
    }),
  );
  for (const [id, extra] of [
    ['empty', { body: '' }],
    ['long', { body: 'a'.repeat(51) }],
    ['expiry', { expiresAt: Timestamp.now() }],
    ['time', { createdAt: Timestamp.fromMillis(1) }],
    ['extra', { secret: true }],
  ]) {
    await assertFails(setDoc(msg(alice, id), { ...message, ...extra }));
  }
  await assertFails(updateDoc(msg(alice, 'client'), { body: 'edited' }));
  await assertFails(deleteDoc(msg(admin, 'client')));
  await assertFails(
    setDoc(msg(admin, 'orphan', 'missing'), {
      ...message,
      authorUid: 'admin',
      authorRole: 'admin',
    }),
  );
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(path(context.firestore(), 'expired'), {
      ...request('alice'),
      createdAt: Timestamp.fromMillis(Date.now() - 366 * 86400000),
    });
  });
  await assertSucceeds(setDoc(msg(alice, 'old-message', 'expired'), message));
  console.log(
    'PASS: Firestore ownership, cancellation, admin identity, validation and denied operations',
  );
} finally {
  await environment.cleanup();
}
