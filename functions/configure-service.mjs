// Run only after deploying the functions, rules and indexes. Uses ADC, never a key in the repository.
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
const projectId = 'denis-komarov---aviation';
const key = process.argv
  .find((arg) => arg.startsWith('--vapid-key='))
  ?.slice('--vapid-key='.length);
if (!process.argv.includes('--activate') || !/^[A-Za-z0-9_-]{87}$/.test(key || ''))
  throw new Error('Use --activate --vapid-key=<public Web Push certificate key>');
const health = await fetch(
  `https://europe-west1-${projectId}.cloudfunctions.net/requestServiceHealth`,
);
if (!health.ok || (await health.json()).service !== 'denis-aviation-requests')
  throw new Error('Deploy the request functions before activation.');
initializeApp({ projectId, credential: applicationDefault() });
await getFirestore()
  .doc('requestService/config')
  .set({ secureApi: true, vapidKey: key }, { merge: true });
console.log('Secure request API and Web Push enabled. Reload requests.html.');
