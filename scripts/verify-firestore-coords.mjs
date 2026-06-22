// Firestoreの座標が正確に保存されているか確認
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(
  readFileSync(new URL('../serviceAccountKey.json', import.meta.url), 'utf-8')
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('spots').get();

  console.log('=== Firestoreの座標確認 ===\n');

  for (const doc of snapshot.docs) {
    const spot = doc.data();
    console.log(`${spot.name}`);
    console.log(`  緯度: ${spot.lat}`);
    console.log(`  経度: ${spot.lng}`);
    console.log(`  Google Maps URL: https://maps.google.com/?q=${spot.lat},${spot.lng}\n`);
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
