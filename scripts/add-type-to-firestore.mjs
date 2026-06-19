// 既存スポットに type フィールドを追加
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
  console.log('=== Firestore スポットに type を追加中 ===\n');

  // Firestoreのすべてのスポットを取得
  const firestoreSpots = await db.collection('spots').get();
  const firestoreMap = new Map();

  for (const doc of firestoreSpots.docs) {
    firestoreMap.set(doc.data().name, doc.id);
  }

  const batch = db.batch();
  let updateCount = 0;

  for (const spot of spots) {
    const docId = firestoreMap.get(spot.name);

    if (!docId) {
      console.log(`⚠️  ${spot.name} - Firestore に見つかりません`);
      continue;
    }

    const doc = db.collection('spots').doc(docId);
    batch.update(doc, { type: 'official_rest' });
    updateCount++;
  }

  await batch.commit();
  console.log(`✅ 完了: ${updateCount}件のスポットを更新しました\n`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
