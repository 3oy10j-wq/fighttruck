'use client';

// 位置情報ユーティリティ

export interface LocationCoords {
  lat: number;
  lng: number;
}

// ハバーサイン公式で2点間の距離（km）を計算
export function calculateDistance(from: LocationCoords, to: LocationCoords): number {
  if (
    !from ||
    !to ||
    typeof from.lat !== 'number' ||
    typeof from.lng !== 'number' ||
    typeof to.lat !== 'number' ||
    typeof to.lng !== 'number' ||
    isNaN(from.lat) ||
    isNaN(from.lng) ||
    isNaN(to.lat) ||
    isNaN(to.lng)
  ) {
    return 0;
  }

  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 現在地を取得
export function getCurrentLocation(): Promise<LocationCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation API is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

// アドレスを座標に変換（Geocoding API）- 精度向上版
export async function geocodeAddress(address: string): Promise<LocationCoords | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('❌ API キーが設定されていません');
      return null;
    }

    // 日本の主要都市の場合、駅を追加して精度を向上
    let searchQuery = address;
    const majorCities = ['東京', '大阪', '名古屋', '京都', '横浜', '福岡', '札幌', '広島', '神戸', '仙台'];
    if (majorCities.some(city => address.includes(city)) && !address.includes('駅')) {
      searchQuery = `${address}駅`;
    }

    const encodedAddress = encodeURIComponent(searchQuery);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&region=JP&key=${apiKey}`;

    const response = await fetch(url);
    console.log('📍 HTTP レスポンスステータス:', response.status, response.statusText);
    const data = await response.json();
    console.log('📍 Google Geocoding API レスポンス全体:', data);

    if (data.status === 'OK' && data.results?.[0]) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }

    console.warn('⚠️ ジオコード失敗:', data.status, '検索:', searchQuery);
    if (data.error_message) {
      console.error('❌ API エラーメッセージ:', data.error_message);
    }
    return null;
  } catch (err) {
    console.error('❌ geocodeAddress エラー:', err);
    console.error('❌ エラー詳細:', JSON.stringify(err, null, 2));
    return null;
  }
}
