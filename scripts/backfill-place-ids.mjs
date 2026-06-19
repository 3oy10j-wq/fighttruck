// 各スポットの placeId を Google Places API で取得して Firestore に保存
import { spots } from './spots-data.mjs';
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(
  readFileSync(new URL('../serviceAccountKey.json', import.meta.url), 'utf-8')
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const API_KEY = 'AIzaSyDO22jXsmEV41NdjYK1NcmDpyx3oDRnLZg';

async function getPlaceId(name, lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name)}&inputtype=textquery&fields=place_id,formatted_address&locationbias=point:${lat},${lng}&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (json.status !== 'OK' || !json.candidates?.[0]) {
      return null;
    }

    return {
      place_id: json.candidates[0].place_id,
      address: json.candidates[0].formatted_address,
    };
  } catch (e) {
    console.error(`  ❌ API エラー: ${e.message}`);
    return null;
  }
}

async function run() {
  console.log('=== placeId をバックフィル中 ===\n');

  // Firestoreのすべてのスポットを取得
  const firestoreSpots = await db.collection('spots').get();
  const firestoreMap = new Map();

  for (const doc of firestoreSpots.docs) {
    firestoreMap.set(doc.data().name, doc.id);
  }

  const batch = db.batch();
  let successCount = 0;
  let failCount = 0;

  for (const spot of spots) {
    const docId = firestoreMap.get(spot.name);

    if (!docId) {
      console.log(`⚠️  ${spot.name}`);
      console.log(`   Firestoreにドキュメントが見つかりません\n`);
      failCount++;
      continue;
    }

    const result = await getPlaceId(spot.name, spot.lat, spot.lng);

    if (result) {
      console.log(`✅ ${spot.name}`);
      console.log(`   place_id: ${result.place_id}`);
      console.log(`   Google住所: ${result.address}\n`);

      const doc = db.collection('spots').doc(docId);
      batch.update(doc, { placeId: result.place_id });
      successCount++;
    } else {
      console.log(`⚠️  ${spot.name}`);
      console.log(`   placeId取得失敗（フォールバック座標を使用します）\n`);

      const doc = db.collection('spots').doc(docId);
      batch.update(doc, { placeId: '' });
      failCount++;
    }

    // Rate limiting (Places API は 1 秒間に 50 リクエスト程度が推奨)
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  await batch.commit();
  console.log(`\n完了: ${successCount}件成功、${failCount}件失敗`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
