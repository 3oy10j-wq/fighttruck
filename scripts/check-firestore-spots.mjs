// Firestoreに実際に保存されているスポット情報を確認
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { spots } from './spots-data.mjs';

const serviceAccount = JSON.parse(
  readFileSync(new URL('../serviceAccountKey.json', import.meta.url), 'utf-8')
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  console.log('=== Firestore vs spots-data.mjs 比較 ===\n');

  const fsSnapshot = await db.collection('spots').get();
  const fsSpots = fsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  let mismatches = 0;

  for (const localSpot of spots) {
    const dbSpot = fsSpots.find(s => s.name === localSpot.name);

    if (!dbSpot) {
      console.log(`❌ [Firestore未登録] ${localSpot.name}`);
      mismatches++;
      continue;
    }

    const latMatch = Math.abs(dbSpot.lat - localSpot.lat) < 0.0001;
    const lngMatch = Math.abs(dbSpot.lng - localSpot.lng) < 0.0001;
    const addrMatch = dbSpot.address === localSpot.address;

    if (!latMatch || !lngMatch || !addrMatch) {
      console.log(`⚠️  [不一致] ${localSpot.name}`);
      if (!addrMatch) console.log(`   住所: FS="${dbSpot.address}" vs Local="${localSpot.address}"`);
      if (!latMatch) console.log(`   緯度: FS=${dbSpot.lat} vs Local=${localSpot.lat}`);
      if (!lngMatch) console.log(`   経度: FS=${dbSpot.lng} vs Local=${localSpot.lng}`);
      console.log();
      mismatches++;
    } else {
      console.log(`✅ ${localSpot.name}`);
    }
  }

  console.log(`\n要確認: ${mismatches}件`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
