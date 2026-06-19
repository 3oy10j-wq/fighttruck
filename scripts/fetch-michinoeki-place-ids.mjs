// 道の駅データの placeId を Google Places API で一括取得
import { readFileSync, writeFileSync } from 'node:fs';

const API_KEY = 'AIzaSyDO22jXsmEV41NdjYK1NcmDpyx3oDRnLZg';
const DATA_PATH = './public/michinoeki-data.json';
const OUTPUT_PATH = './public/michinoeki-data.json';

async function getPlaceId(name, lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name)}&inputtype=textquery&fields=place_id&locationbias=point:${lat},${lng}&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (json.status !== 'OK' || !json.candidates?.[0]) {
      return null;
    }

    return json.candidates[0].place_id;
  } catch (e) {
    console.error(`  ❌ API エラー: ${e.message}`);
    return null;
  }
}

async function run() {
  console.log('=== 道の駅の placeId を取得中 ===\n');

  // データを読み込む
  const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < data.data.length; i++) {
    const station = data.data[i];

    const placeId = await getPlaceId(station.name, station.lat, station.lng);

    if (placeId) {
      station.placeId = placeId;
      successCount++;
      if (successCount % 100 === 0) {
        console.log(`✓ ${successCount}件取得完了`);
      }
    } else {
      failCount++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // データを保存
  writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`\n✅ 完了: ${successCount}件成功、${failCount}件失敗`);
  console.log(`📁 保存: ${OUTPUT_PATH}\n`);

  // 最初の10件を表示
  console.log('最初の10件:\n');
  for (let i = 0; i < Math.min(10, data.data.length); i++) {
    const s = data.data[i];
    console.log(`${s.name}: ${s.placeId || '(取得失敗)'}`);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
