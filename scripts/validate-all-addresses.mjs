// すべてのスポットの名前・住所をGoogle Geocoding APIで検証
// 不一致があれば修正内容を出力
import { spots } from './spots-data.mjs';

const API_KEY = 'AIzaSyDO22jXsmEV41NdjYK1NcmDpyx3oDRnLZg';

async function geocode(query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&language=ja&region=JP&key=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.status !== 'OK' || !json.results[0]) return null;
  return json.results[0];
}

console.log('=== 全21スポット検証 ===\n');

const updates = [];

for (const spot of spots) {
  console.log(`検証中: ${spot.name}`);
  const result = await geocode(spot.name);

  if (!result) {
    console.log(`  ❌ Google検索失敗\n`);
    continue;
  }

  const apiAddress = result.formatted_address;
  const apiLat = result.geometry.location.lat;
  const apiLng = result.geometry.location.lng;

  // 住所チェック
  const addressMatch = apiAddress.includes(spot.address.split(' ')[0]); // 最初の単語で部分一致確認

  if (!addressMatch) {
    console.log(`  ⚠️  住所不一致`);
    console.log(`     登録: ${spot.address}`);
    console.log(`     API : ${apiAddress}`);
    console.log(`     座標: lat=${apiLat}, lng=${apiLng}\n`);

    updates.push({
      name: spot.name,
      oldAddress: spot.address,
      newAddress: apiAddress,
      lat: apiLat,
      lng: apiLng,
    });
  } else {
    console.log(`  ✅ 一致\n`);
  }
}

console.log(`\n=== 要修正: ${updates.length}件 ===\n`);
updates.forEach(u => {
  console.log(`// ${u.name}`);
  console.log(`// 旧: ${u.oldAddress}`);
  console.log(`// 新: ${u.newAddress}`);
  console.log(`{`);
  console.log(`  name: '${u.name}',`);
  console.log(`  address: '${u.newAddress.replace(/日本、〒\d+\s/, '')}',`);
  console.log(`  lat: ${u.lat},`);
  console.log(`  lng: ${u.lng},`);
  console.log(`},\n`);
});
