// Firestoreの placeId を確認
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

  console.log('=== Firestore の placeId 確認 ===\n');
  console.log('施設名 | placeId | Google Maps URL\n');

  for (const doc of snapshot.docs) {
    const spot = doc.data();
    const placeId = spot.placeId || '(なし)';
    let mapsUrl = '';

    if (spot.placeId) {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}&query_place_id=${spot.placeId}`;
    } else {
      mapsUrl = `https://maps.google.com/?q=${spot.lat},${spot.lng}`;
    }

    console.log(`${spot.name}`);
    console.log(`  placeId: ${placeId}`);
    console.log(`  URL: ${mapsUrl}\n`);
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
