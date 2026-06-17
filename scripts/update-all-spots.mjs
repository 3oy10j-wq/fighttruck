// 全スポット（12件修正分含む）をFirestoreに更新するスクリプト
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
  const existing = await db.collection('spots').get();

  for (const doc of existing.docs) {
    await doc.ref.delete();
  }

  if (existing.size > 0) {
    console.log(`既存データを削除: ${existing.size}件\n`);
  }

  for (const spot of spots) {
    const ref = db.collection('spots').doc();
    await ref.set({
      ...spot,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✅ ${spot.name}`);
    console.log(`   住所: ${spot.address}`);
    console.log(`   座標: lat=${spot.lat}, lng=${spot.lng}\n`);
  }

  console.log(`完了: ${spots.length}件をFirestoreに反映しました。`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
