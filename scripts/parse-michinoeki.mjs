// 国土数値情報の道の駅データ(GeoJSON)をパースして、公開データに整形
import { readFileSync, writeFileSync } from 'node:fs';

const GEOJSON_PATH = 'C:\\Users\\takuto\\AppData\\Local\\Temp\\P35-18_Roadside_Station.geojson';
const OUTPUT_PATH = './public/michinoeki-data.json';

// 座標の範囲検証（日本の約北緯20度～45度、東経123度～146度）
const JAPAN_BOUNDS = {
  minLat: 20,
  maxLat: 45.5,
  minLng: 123,
  maxLng: 146,
};

function validateCoordinates(lat, lng) {
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < JAPAN_BOUNDS.minLat || lat > JAPAN_BOUNDS.maxLat) return false;
  if (lng < JAPAN_BOUNDS.minLng || lng > JAPAN_BOUNDS.maxLng) return false;
  return true;
}

async function run() {
  console.log('=== 道の駅GeoJSONをパース中 ===\n');

  // GeoJSONを読み込む
  const geojsonText = readFileSync(GEOJSON_PATH, 'utf-8');
  const geojson = JSON.parse(geojsonText);

  const michinoeki = [];
  let validCount = 0;
  let invalidCount = 0;

  for (const feature of geojson.features) {
    const props = feature.properties || {};

    // GeoJSONは [lng, lat] の順序
    const [lng, lat] = feature.geometry.coordinates;

    // 属性情報: P35_001=lat, P35_002=lng, P35_003=都道府県, P35_004=市町村, P35_006=駅名(ひらがな)
    const municipality = props.P35_004 || '不明';
    const stationNameHiragana = props.P35_006 || '';

    // 駅名を構築（例：「美深」駅 in 中川郡美深町 → 「美深」）
    // P35_006にひらがな名がある場合、または公開URLから駅名を推測
    // 簡易的には：URL の view/{ID} から駅IDを取得
    const urlMatch = (props.P35_007 || '').match(/view\/(\d+)/);
    const stationId = urlMatch ? urlMatch[1] : '';

    // P35_006がある場合はそれを駅名として使用、ない場合は市町村名を使用
    const name = stationNameHiragana || municipality || '不明';

    // 座標検証
    if (!validateCoordinates(lat, lng)) {
      console.log(`⚠️  スキップ: ${name}`);
      console.log(`   座標: lat=${lat}, lng=${lng} (範囲外)\n`);
      invalidCount++;
      continue;
    }

    // 都道府県を取得（属性情報から）
    const prefecture = props.P35_003 || '不明';

    michinoeki.push({
      name,
      lat: parseFloat(lat.toFixed(7)),
      lng: parseFloat(lng.toFixed(7)),
      prefecture,
      municipality,
      type: 'michinoeki',
      placeId: '', // 後で埋める
    });

    validCount++;
    if (validCount % 100 === 0) {
      console.log(`✓ ${validCount}件処理中...`);
    }
  }

  console.log(`\n✅ パース完了: ${validCount}件有効、${invalidCount}件スキップ\n`);

  // JSONとして保存
  const output = {
    source: '出典：国土数値情報（道の駅データ）',
    timestamp: new Date().toISOString(),
    count: validCount,
    data: michinoeki,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`📁 保存: ${OUTPUT_PATH}`);
  console.log(`ファイルサイズ: ${(JSON.stringify(output).length / 1024 / 1024).toFixed(2)} MB\n`);

  // 最初の5件を表示
  console.log('最初の5件:\n');
  for (let i = 0; i < Math.min(5, michinoeki.length); i++) {
    const m = michinoeki[i];
    console.log(`${i + 1}. ${m.name}`);
    console.log(`   ${m.prefecture} ${m.municipality}`);
    console.log(`   座標: ${m.lat.toFixed(7)}, ${m.lng.toFixed(7)}\n`);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
