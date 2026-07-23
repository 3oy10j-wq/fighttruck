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

// アドレスを座標に変換（API Route 経由で Geocoding API を呼び出し）
export async function geocodeAddress(address: string): Promise<LocationCoords | null> {
  try {
    console.log('📍 ジオコード開始:', address);

    // API Route に POST リクエストを送信
    const response = await fetch('/api/geocode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn('⚠️ ジオコード失敗:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    console.log('✓ ジオコード成功:', address, data);
    return data as LocationCoords;
  } catch (err) {
    console.error('❌ geocodeAddress エラー:', err);
    return null;
  }
}
