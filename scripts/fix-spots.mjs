// 誤りのある6件のスポットをFirestoreで更新するスクリプト
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(
  readFileSync(new URL('../serviceAccountKey.json', import.meta.url), 'utf-8')
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const fixes = [
  {
    name: '谷田部東パーキングエリア(上り線)',
    address: '茨城県つくば市下原263-2',
    lat: 36.038517,
    lng: 140.138206,
  },
  {
    name: '道の駅 とうや湖',
    address: '北海道虻田郡洞爺湖町香川9-4',
    lat: 42.664726,
    lng: 140.822164,
  },
  {
    name: '道の駅 富士川楽座',
    address: '静岡県富士市岩淵1488-1',
    lat: 35.161880,
    lng: 138.618457,
  },
  {
    name: '道の駅 針T.R.S',
    address: '奈良県奈良市針町345',
    lat: 34.610207,
    lng: 135.962355,
  },
  {
    name: '道の駅 北の関宿安芸高田',
    address: '広島県安芸高田市美土里町横田331-1',
    lat: 34.721488,
    lng: 132.680960,
  },
  {
    name: '豊浜サービスエリア(松山方面)',
    address: '香川県観音寺市豊浜町箕浦2180-1',
    lat: 34.056951,
    lng: 133.637171,
  },
];

async function run() {
  const snapshot = await db.collection('spots').get();
  let updated = 0;

  for (const fix of fixes) {
    const doc = snapshot.docs.find(d => d.data().name === fix.name);
    if (!doc) {
      console.log(`⚠️  見つからない: ${fix.name}`);
      continue;
    }
    await doc.ref.update({
      address: fix.address,
      lat: fix.lat,
      lng: fix.lng,
    });
    console.log(`✅ 修正完了: ${fix.name}`);
    console.log(`   住所: ${fix.address}`);
    console.log(`   座標: lat=${fix.lat}, lng=${fix.lng}\n`);
    updated++;
  }
  console.log(`完了: ${updated}件を修正しました。`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
