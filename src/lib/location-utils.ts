'use client';

// 位置情報ユーティリティ

export interface LocationCoords {
  lat: number;
  lng: number;
}

// ハバーサイン公式で2点間の距離（km）を計算
export function calculateDistance(from: LocationCoords, to: LocationCoords): number {
  // 入力値の有効性チェック
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

  const R = 6371; // 地球の半径（km）
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

// アドレスを座標に変換（Geocoding API）
export async function geocodeAddress(address: string): Promise<LocationCoords | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=JP&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (json.status !== 'OK' || !json.results[0]) {
      return null;
    }

    const loc = json.results[0].geometry.location;
    return {
      lat: loc.lat,
      lng: loc.lng,
    };
  } catch (e) {
    console.error('Geocoding error:', e);
    return null;
  }
}
