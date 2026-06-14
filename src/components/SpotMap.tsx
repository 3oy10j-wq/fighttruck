'use client';

import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api';
import { FACILITY_LABELS } from '@/lib/constants';
import type { Spot } from '@/lib/types';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 36.2048,
  lng: 138.2529,
};

interface SpotMapProps {
  spots: Spot[];
  selectedSpot: Spot | null;
  onSelectSpot: (spot: Spot | null) => void;
}

export default function SpotMap({ spots, selectedSpot, onSelectSpot }: SpotMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  });

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-base-2 text-ink/60">
        地図を読み込み中...
      </div>
    );
  }

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={6}>
      {spots.map((spot) => (
        <MarkerF
          key={spot.id}
          position={{ lat: spot.lat, lng: spot.lng }}
          onClick={() => onSelectSpot(spot)}
        />
      ))}

      {selectedSpot && (
        <InfoWindowF
          position={{ lat: selectedSpot.lat, lng: selectedSpot.lng }}
          onCloseClick={() => onSelectSpot(null)}
        >
          <div className="max-w-[220px] text-sm text-ink">
            <p className="font-bold">{selectedSpot.name}</p>
            <p className="mt-1 text-xs text-ink/60">{selectedSpot.address}</p>
            <p className="mt-1 text-xs text-ink/60">営業時間: {selectedSpot.hours}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(Object.keys(FACILITY_LABELS) as (keyof typeof FACILITY_LABELS)[])
                .filter((key) => selectedSpot.facilities?.[key])
                .map((key) => (
                  <span
                    key={key}
                    className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
                  >
                    {FACILITY_LABELS[key]}
                  </span>
                ))}
            </div>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
