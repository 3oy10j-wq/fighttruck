// Firestoreに休憩スポットのサンプルデータを投入するスクリプト(Firebase Admin SDK)
// 事前準備:
//   1. Firebaseコンソール > プロジェクトの設定 > サービスアカウント から秘密鍵(JSON)を生成
//   2. プロジェクト直下に `serviceAccountKey.json` として保存(.gitignore済み)
// 実行: npm run seed:spots
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { spots } from './spots-data.mjs';

const serviceAccount = JSON.parse(
  readFileSync(new URL('../serviceAccountKey.json', import.meta.url), 'utf-8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function seed() {
  const existing = await db.collection('spots').get();
  for (const doc of existing.docs) {
    await doc.ref.delete();
  }
  if (existing.size > 0) {
    console.log(`既存データを削除しました: ${existing.size}件`);
  }

  for (const spot of spots) {
    const ref = db.collection('spots').doc();
    await ref.set({
      ...spot,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`追加しました: ${spot.name}`);
  }
  console.log(`完了: ${spots.length}件のスポットを投入しました。`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('投入に失敗しました:', err);
    process.exit(1);
  });
