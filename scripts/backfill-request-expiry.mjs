// Dry-run by default. Uses Application Default Credentials via the official Admin SDK.
// Run from a separate maintenance directory with firebase-admin installed (see documentation).
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(resolve(process.cwd(), 'package.json'));
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldPath } = require('firebase-admin/firestore');
const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error('Set FIREBASE_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS.');
}
const apply = process.argv.includes('--apply');
initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();
const retention = 365 * 86400000;
let cursor,
  scanned = 0,
  missing = 0,
  updated = 0;
while (true) {
  let query = db.collection('flightRequests').orderBy(FieldPath.documentId()).limit(100);
  if (cursor) query = query.startAfter(cursor);
  const page = await query.get();
  if (page.empty) break;
  for (const document of page.docs) {
    scanned++;
    const data = document.data();
    if (data.expiresAt) continue;
    const created = data.createdAt?.toMillis?.();
    if (!Number.isFinite(created)) {
      missing++;
      continue;
    }
    if (apply) {
      // Do not overwrite a document changed after this snapshot.
      await document.ref.update(
        { expiresAt: Timestamp.fromMillis(created + retention) },
        { lastUpdateTime: document.updateTime },
      );
    }
    updated++;
  }
  cursor = page.docs.at(-1);
}
console.log(
  JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    scanned,
    eligible: updated,
    missingCreatedAt: missing,
  }),
);
