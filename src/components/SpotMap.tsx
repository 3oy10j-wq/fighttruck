'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import { SPOT_TYPE_COLORS } from '@/lib/constants';
import { calculateDistance, getCurrentLocation, LocationCoords } from '@/lib/location-utils';
import type { Spot } from '@/lib/types';

const containerStyle = {
  width: '100%',
  height: '100%',
  position: 'relative' as const,
  overflow: 'hidden' as const,
};

const mapOptions: google.maps.MapOptions = {
  draggable: true,
  zoomControl: true,
  scrollwheel: true,
  disableDoubleClickZoom: false,
  gestureHandling: 'greedy',
  fullscreenControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1a1f2e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1f2e' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d3748' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#374151' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#f97316' }, { weight: 0.5 }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
};

interface SpotWithDistance extends Spot {
  distance: number;
}

function getMapsUrl(spot: Spot): string {
  // 施設名ベースの検索リンク（placeID の誤りを回避）
  // 「道の駅」を含める（重複を防ぐ）
  const query = spot.name.includes('道の駅')
    ? spot.name
    : `道の駅${spot.name}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

interface SpotMapProps {
  allSpots: Spot[];
  selectedSpot: Spot | null;
  onSelectSpot: (spot: Spot | null) => void;
  onUpdateNearbySpots: (spots: SpotWithDistance[]) => void;
  mapRef?: React.MutableRefObject<google.maps.Map | null>;
}

const NEARBY_RADIUS_KM = 20;
const DISPLAY_LIMIT = 20;

export default function SpotMap({
  allSpots,
  selectedSpot,
  onSelectSpot,
  onUpdateNearbySpots,
  mapRef,
}: SpotMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  });

  const internalRef = useRef<google.maps.Map | null>(null);
  const [center, setCenter] = useState<LocationCoords | null>(null);
  const [nearbySpots, setNearbySpots] = useState<SpotWithDistance[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);

  // 初期現在地取得
  useEffect(() => {
    let isMounted = true;

    getCurrentLocation()
      .then((loc) => {
        if (isMounted) {
          setCenter(loc);
          setLocationError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLocationError('位置情報を取得できません。下の検索ボックスで地名を入力してください。');
        }
      });

    return () => { isMounted = false; };
  }, []);

  // 中心地点が変更されたら、近いスポットを計算
  useEffect(() => {
    if (!center) return;

    const nearby = allSpots
      .filter((spot) => {
        // 有効な座標をチェック
        return (
          typeof spot.lat === 'number' &&
          typeof spot.lng === 'number' &&
          !isNaN(spot.lat) &&
          !isNaN(spot.lng) &&
          spot.lat >= -90 &&
          spot.lat <= 90 &&
          spot.lng >= -180 &&
          spot.lng <= 180
        );
      })
      .map((spot) => ({
        ...spot,
        distance: calculateDistance(center, { lat: spot.lat, lng: spot.lng }),
      }))
      .filter((spot) => spot.distance <= NEARBY_RADIUS_KM)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, DISPLAY_LIMIT);

    // 結果が実際に変わったときだけ state を更新して親に通知
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNearbySpots(nearby);
    onUpdateNearbySpots(nearby);
  }, [center, allSpots, onUpdateNearbySpots]);

  const onLoad = useCallback((map: google.maps.Map) => {
    internalRef.current = map;
    if (mapRef) mapRef.current = map;

    if (center) {
      map.setCenter(center);
      map.setZoom(13);
    }
  }, [center, mapRef]);

  // 地図が止まったときに近いスポットを更新（onIdle）
  // setCenter は呼ばない（無限ループを防ぐため）。center は検索と現在地取得時だけ更新
  const handleMapIdle = useCallback(() => {
    // onIdle イベントは地図の状態追跡のみ。center state 更新はしない
    // これにより無限ループ（地図移動 → setCenter → 再描画 → onIdle 再発火）を防止
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1a1f2e] text-[#94a3b8]">
        <div className="text-center space-y-2">
          <div className="animate-spin text-3xl">🗺</div>
          <p className="text-sm">地図を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1a1f2e]">
        <div className="text-center space-y-4 px-4">
          <p className="text-2xl">📍</p>
          <p className="text-sm text-gray-400">{locationError}</p>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1a1f2e] text-[#94a3b8]">
        <div className="text-center space-y-2">
          <div className="animate-spin text-3xl">⏳</div>
          <p className="text-sm">現在地を取得中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full z-0 pointer-events-none">
      {/* 凡例 */}
      <div className="absolute left-4 top-4 z-10 space-y-1 rounded-lg bg-white/90 p-2 shadow-md text-xs pointer-events-auto">
        <div className="font-bold text-gray-900">近いスポット</div>
        <div className="text-gray-600">{nearbySpots.length}件表示</div>
        <div className="text-[10px] text-gray-500 mt-1">
          半径{NEARBY_RADIUS_KM}km以内
        </div>
      </div>

      <div className="pointer-events-auto h-full w-full">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          options={mapOptions}
          onLoad={onLoad}
          onIdle={handleMapIdle}
        >
        {/* 現在地マーカー */}
        <MarkerF
          position={center}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3b82f6',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }}
          title="現在地"
        />

        {/* スポットピン */}
        {nearbySpots.map((spot) => {
          const baseIcon = {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: selectedSpot?.name === spot.name
              ? '#fbbf24'
              : SPOT_TYPE_COLORS[spot.type || 'official_rest'],
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
            scale: selectedSpot?.name === spot.name ? 2 : 1.6,
            ...(typeof google !== 'undefined' && google.maps
              ? { anchor: new google.maps.Point(12, 22) }
              : {}),
          };

          return (
            <MarkerF
              key={`${spot.type || 'official_rest'}-${spot.name}`}
              position={{ lat: spot.lat, lng: spot.lng }}
              onClick={() => onSelectSpot(spot)}
              icon={baseIcon as unknown as google.maps.Icon}
            />
          );
        })}

        {/* InfoWindow */}
        {selectedSpot && (() => {
          const infoWindowOptions: google.maps.InfoWindowOptions = {};
          if (typeof google !== 'undefined' && google.maps) {
            infoWindowOptions.pixelOffset = new google.maps.Size(0, -36);
          }
          return (
            <InfoWindowF
              position={{ lat: selectedSpot.lat, lng: selectedSpot.lng }}
              onCloseClick={() => onSelectSpot(null)}
              options={infoWindowOptions}
            >
              <div className="max-w-[240px] p-2">
                <p className="font-bold text-sm text-gray-900 mb-1">{selectedSpot.name}</p>
                {'address' in selectedSpot && (
                  <p className="text-xs text-gray-500 mb-1">📍 {selectedSpot.address}</p>
                )}
                <p className="text-xs text-gray-500 mb-2">
                  📏 {nearbySpots.find(s => s.name === selectedSpot.name)?.distance?.toFixed(1) || '?'}km
                </p>
                <a
                  href={getMapsUrl(selectedSpot)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-lg bg-orange-500 py-2 text-center text-xs font-bold text-white hover:bg-orange-600"
                >
                  🗺 Google Mapsで開く
                </a>
              </div>
            </InfoWindowF>
          );
        })()}
      </GoogleMap>
      </div>
    </div>
  );
}
