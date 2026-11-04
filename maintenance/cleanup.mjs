import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { cleanExpiredRequests, RETENTION_MS } from './cleanup-core.mjs';
const projectId = 'denis-komarov---aviation';
try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('missing-secret');
  const key = JSON.parse(raw);
  if (key.project_id !== projectId) throw new Error('wrong-project');
  initializeApp({ credential: cert(key), projectId });
  const cutoff = Timestamp.fromMillis(Date.now() - RETENTION_MS);
  const result = await cleanExpiredRequests(getFirestore(), cutoff, {
    apply: process.argv.includes('--apply'),
  });
  console.log(JSON.stringify(result));
} catch (_) {
  // SDK errors can contain credential material or request data; do not print the raw exception.
  console.error(
    'Cleanup failed. Check the GitHub secret, service account permissions and Firestore availability. No credentials are logged.',
  );
  process.exitCode = 1;
}
