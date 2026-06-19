'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import { FACILITY_LABELS, SPOT_TYPE_COLORS } from '@/lib/constants';
import type { Spot } from '@/lib/types';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 36.5, lng: 137.0 };

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

const FACILITY_ICONS: Record<keyof typeof FACILITY_LABELS, string> = {
  shower: '🚿',
  sleepingArea: '🛏',
  largeParking: '🅿️',
  restaurant: '🍜',
  onsen: '♨️',
  laundry: '👕',
  open24h: '🕐',
};

function getMapsUrl(spot: Spot): string {
  if (spot.placeId) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}&query_place_id=${spot.placeId}`;
  }
  return `https://maps.google.com/?q=${spot.lat},${spot.lng}`;
}

interface SpotMapProps {
  spots: Spot[];
  selectedSpot: Spot | null;
  onSelectSpot: (spot: Spot | null) => void;
  mapRef?: React.MutableRefObject<google.maps.Map | null>;
}

export default function SpotMap({ spots, selectedSpot, onSelectSpot, mapRef }: SpotMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  });

  const internalRef = useRef<google.maps.Map | null>(null);
  const [michinoekiData, setMichinoekiData] = useState<any[]>([]);
  const [showMichinoeki, setShowMichinoeki] = useState(true);
  const [visibleSpots, setVisibleSpots] = useState(spots);

  useEffect(() => {
    fetch('/michinoeki-data.json')
      .then(r => r.json())
      .then(d => setMichinoekiData(d.data || []))
      .catch(e => console.warn('道の駅データ読み込み失敗:', e));
  }, []);

  useEffect(() => {
    const merged = [
      ...spots,
      ...(showMichinoeki ? michinoekiData : []),
    ];
    setVisibleSpots(merged);
  }, [spots, michinoekiData, showMichinoeki]);

  const onLoad = useCallback((map: google.maps.Map) => {
    internalRef.current = map;
    if (mapRef) mapRef.current = map;
  }, [mapRef]);

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

  return (
    <div className="relative h-full w-full">
      {/* 凡例 & トグル */}
      <div className="absolute left-4 top-4 z-10 space-y-2 rounded-lg bg-white/90 p-3 shadow-md">
        <div className="text-xs font-bold text-gray-900">凡例</div>
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: SPOT_TYPE_COLORS.official_rest }}></div>
          <span>厳選スポット ({spots.length})</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input
            type="checkbox"
            checked={showMichinoeki}
            onChange={(e) => setShowMichinoeki(e.target.checked)}
            className="h-3 w-3"
          />
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: SPOT_TYPE_COLORS.michinoeki }}></div>
          <span>道の駅 ({michinoekiData.length})</span>
        </label>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={5}
        options={mapOptions}
        onLoad={onLoad}
      >
        {visibleSpots.map((spot) => (
          <MarkerF
            key={`${spot.type || 'official_rest'}-${spot.name}`}
            position={{ lat: spot.lat, lng: spot.lng }}
            onClick={() => onSelectSpot(spot)}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
              fillColor: selectedSpot?.name === spot.name && selectedSpot?.type === spot.type
                ? '#fbbf24'
                : SPOT_TYPE_COLORS[spot.type || 'official_rest'],
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 1.5,
              scale: selectedSpot?.name === spot.name && selectedSpot?.type === spot.type ? 2 : 1.6,
              anchor: new window.google.maps.Point(12, 22),
            }}
          />
        ))}

        {selectedSpot && (
          <InfoWindowF
            position={{ lat: selectedSpot.lat, lng: selectedSpot.lng }}
            onCloseClick={() => onSelectSpot(null)}
            options={{ pixelOffset: new window.google.maps.Size(0, -36) }}
          >
            <div className="max-w-[240px] p-2">
              <p className="font-bold text-sm text-gray-900 mb-1">{selectedSpot.name}</p>
              {'address' in selectedSpot && (
                <p className="text-xs text-gray-500 mb-1">📍 {selectedSpot.address}</p>
              )}
              {'hours' in selectedSpot && (
                <p className="text-xs text-gray-500 mb-2">🕐 {selectedSpot.hours}</p>
              )}
              {selectedSpot.type === 'official_rest' && 'facilities' in selectedSpot && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {(Object.keys(FACILITY_LABELS) as (keyof typeof FACILITY_LABELS)[])
                    .filter((k) => selectedSpot.facilities?.[k])
                    .map((k) => (
                      <span key={k} className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700">
                        {FACILITY_ICONS[k]} {FACILITY_LABELS[k]}
                      </span>
                    ))}
                </div>
              )}
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
        )}
      </GoogleMap>
    </div>
  );
}
