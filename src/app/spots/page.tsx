'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSpots } from '@/lib/firebase/spots';
import { FACILITY_LABELS, REGION_LABELS } from '@/lib/constants';
import type { RegionCode, Spot, SpotFacilities } from '@/lib/types';
import SpotMap from '@/components/SpotMap';

const FACILITY_KEYS = Object.keys(FACILITY_LABELS) as (keyof SpotFacilities)[];
const REGION_KEYS = Object.keys(REGION_LABELS) as RegionCode[];

function SpotsPageContent() {
  const searchParams = useSearchParams();

  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const [region, setRegion] = useState<RegionCode | ''>(() => {
    const regionParam = searchParams.get('region');
    return regionParam && (REGION_KEYS as string[]).includes(regionParam)
      ? (regionParam as RegionCode)
      : '';
  });
  const [facilities, setFacilities] = useState<Set<keyof SpotFacilities>>(() => {
    const facilitiesParam = searchParams.get('facilities');
    if (!facilitiesParam) return new Set();
    const keys = facilitiesParam
      .split(',')
      .filter((key): key is keyof SpotFacilities => (FACILITY_KEYS as string[]).includes(key));
    return new Set(keys);
  });

  useEffect(() => {
    getSpots()
      .then(setSpots)
      .catch(() => setError('スポット情報の取得に失敗しました。'))
      .finally(() => setLoading(false));
  }, []);

  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      if (region && spot.region !== region) return false;
      for (const key of facilities) {
        if (!spot.facilities?.[key]) return false;
      }
      return true;
    });
  }, [spots, region, facilities]);

  const visibleSelectedSpot =
    selectedSpot && filteredSpots.some((spot) => spot.id === selectedSpot.id)
      ? selectedSpot
      : null;

  function toggleFacility(key: keyof SpotFacilities) {
    setFacilities((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-base px-4 py-12">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <h1 className="font-serif text-3xl font-bold text-ink">休憩スポット検索</h1>

        <div className="space-y-4 rounded-2xl border border-accent/20 bg-white p-6 shadow-sm">
          <div>
            <p className="mb-2 text-sm font-bold text-ink">地域</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRegion('')}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  region === ''
                    ? 'bg-accent text-white'
                    : 'bg-accent/10 text-accent'
                }`}
              >
                すべて
              </button>
              {REGION_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRegion((prev) => (prev === key ? '' : key))}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    region === key
                      ? 'bg-accent text-white'
                      : 'bg-accent/10 text-accent'
                  }`}
                >
                  {REGION_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-ink">設備</p>
            <div className="flex flex-wrap gap-2">
              {FACILITY_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleFacility(key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    facilities.has(key)
                      ? 'bg-accent text-white'
                      : 'bg-accent/10 text-accent'
                  }`}
                >
                  {FACILITY_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-96 w-full overflow-hidden rounded-2xl border border-accent/20 shadow-sm">
          <SpotMap
            spots={filteredSpots}
            selectedSpot={visibleSelectedSpot}
            onSelectSpot={setSelectedSpot}
          />
        </div>

        {visibleSelectedSpot && (
          <div className="space-y-2 rounded-2xl border border-accent/40 bg-accent/5 p-6 shadow-sm">
            <p className="font-serif text-xl font-bold text-ink">{visibleSelectedSpot.name}</p>
            <p className="text-sm text-ink/60">{visibleSelectedSpot.address}</p>
            <p className="text-sm text-ink/60">営業時間: {visibleSelectedSpot.hours}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {FACILITY_KEYS.filter((key) => visibleSelectedSpot.facilities?.[key]).map((key) => (
                <span
                  key={key}
                  className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                >
                  {FACILITY_LABELS[key]}
                </span>
              ))}
            </div>
          </div>
        )}

        {loading && <p className="text-ink/60">読み込み中...</p>}
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredSpots.map((spot) => (
            <button
              key={spot.id}
              type="button"
              onClick={() => setSelectedSpot(spot)}
              className={`space-y-2 rounded-2xl border bg-white p-6 text-left shadow-sm transition-colors ${
                selectedSpot?.id === spot.id
                  ? 'border-accent'
                  : 'border-accent/20 hover:border-accent/40'
              }`}
            >
              <p className="font-serif text-xl font-bold text-ink">{spot.name}</p>
              <p className="text-sm text-ink/60">{spot.address}</p>
              <p className="text-sm text-ink/60">営業時間: {spot.hours}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {FACILITY_KEYS.filter((key) => spot.facilities?.[key]).map((key) => (
                  <span
                    key={key}
                    className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                  >
                    {FACILITY_LABELS[key]}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {!loading && !error && filteredSpots.length === 0 && (
          <p className="text-ink/60">条件に一致するスポットが見つかりませんでした。</p>
        )}
      </div>
    </div>
  );
}

export default function SpotsPage() {
  return (
    <Suspense>
      <SpotsPageContent />
    </Suspense>
  );
}
