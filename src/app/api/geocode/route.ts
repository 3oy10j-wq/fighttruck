import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface GeocodeRequest {
  address: string;
}

interface GeocodeResponse {
  lat: number;
  lng: number;
}

export async function POST(request: NextRequest) {
  try {
    const { address } = (await request.json()) as GeocodeRequest;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_GEOCODING_API_KEY;
    if (!apiKey) {
      console.error('❌ GOOGLE_MAPS_GEOCODING_API_KEY is not set');
      return NextResponse.json(
        { error: 'Geocoding API is not configured' },
        { status: 503 }
      );
    }

    // 日本の主要都市の場合、駅を追加して精度を向上
    let searchQuery = address;
    const majorCities = ['東京', '大阪', '名古屋', '京都', '横浜', '福岡', '札幌', '広島', '神戸', '仙台'];
    if (majorCities.some(city => address.includes(city)) && !address.includes('駅')) {
      searchQuery = `${address}駅`;
    }

    const encodedAddress = encodeURIComponent(searchQuery);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&region=JP&key=${apiKey}`;

    console.log('📍 Geocoding API リクエスト:', searchQuery);

    const response = await fetch(url);
    const data = await response.json();

    console.log('📍 Geocoding API レスポンス:', data.status);

    if (data.status === 'OK' && data.results?.[0]) {
      const location = data.results[0].geometry.location;
      const result: GeocodeResponse = {
        lat: location.lat,
        lng: location.lng,
      };
      console.log('✓ ジオコード成功:', searchQuery, result);
      return NextResponse.json(result);
    }

    console.warn('⚠️ ジオコード失敗:', data.status, '検索:', searchQuery);
    if (data.error_message) {
      console.error('❌ API エラーメッセージ:', data.error_message);
    }

    return NextResponse.json(
      { error: `Geocoding failed: ${data.status}`, details: data },
      { status: 400 }
    );
  } catch (err) {
    console.error('❌ Geocoding API error:', err);
    return NextResponse.json(
      { error: 'Geocoding request failed' },
      { status: 500 }
    );
  }
}
