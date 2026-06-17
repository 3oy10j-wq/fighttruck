// 全スポットの住所からGoogle Maps Reverse Geocoding APIで正確な座標を取得
import { spots } from './spots-data.mjs';

const API_KEY = 'AIzaSyDO22jXsmEV41NdjYK1NcmDpyx3oDRnLZg';

async function reverseGeocode(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=ja&region=JP&key=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== 'OK' || !json.results[0]) {
    return null;
  }

  const result = json.results[0];
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
  };
}

console.log('=== Google Maps APIで座標を取得（住所ベース） ===\n');

const updates = [];

for (const spot of spots) {
  const coords = await reverseGeocode(spot.address);

  if (!coords) {
    console.log(`❌ [取得失敗] ${spot.name}`);
    console.log(`   住所: ${spot.address}\n`);
    continue;
  }

  console.log(`✅ ${spot.name}`);
  console.log(`   登録住所: ${spot.address}`);
  console.log(`   Google: ${coords.formattedAddress}`);
  console.log(`   座標: lat=${coords.lat.toFixed(6)}, lng=${coords.lng.toFixed(6)}\n`);

  updates.push({
    name: spot.name,
    lat: coords.lat,
    lng: coords.lng,
  });
}

console.log('\n=== spots-data.mjs 更新用フォーマット ===\n');
updates.forEach(u => {
  console.log(`// ${u.name}`);
  console.log(`  lat: ${u.lat},`);
  console.log(`  lng: ${u.lng},\n`);
});
