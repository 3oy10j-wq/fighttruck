// 全スポットの住所・座標をGoogle Geocoding APIで検証するスクリプト
import { spots } from './spots-data.mjs';

const API_KEY = 'AIzaSyDO22jXsmEV41NdjYK1NcmDpyx3oDRnLZg';

async function geocode(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=ja&region=JP&key=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.status !== 'OK' || !json.results[0]) return null;
  const result = json.results[0];
  return {
    formatted: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
  };
}

function dist(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

console.log('=== スポット座標検証 ===\n');

const results = [];
for (const spot of spots) {
  const geo = await geocode(spot.name + ' ' + spot.address);
  if (!geo) {
    console.log(`❓ [検索失敗] ${spot.name}`);
    results.push({ spot, geo: null, ok: false });
    continue;
  }
  const km = dist(spot.lat, spot.lng, geo.lat, geo.lng);
  const ok = km < 5; // 5km以内なら正常
  console.log(`${ok ? '✅' : '❌'} ${spot.name}`);
  console.log(`   登録: lat=${spot.lat}, lng=${spot.lng} / ${spot.address}`);
  console.log(`   API : lat=${geo.lat.toFixed(6)}, lng=${geo.lng.toFixed(6)} / ${geo.formatted}`);
  console.log(`   ズレ: ${km.toFixed(1)}km\n`);
  results.push({ spot, geo, ok, km });
}

const ng = results.filter(r => !r.ok);
console.log(`\n=== 要修正: ${ng.length}件 ===`);
ng.forEach(r => {
  console.log(`- ${r.spot.name} (ズレ: ${r.km ? r.km.toFixed(1)+'km' : '検索失敗'})`);
});
