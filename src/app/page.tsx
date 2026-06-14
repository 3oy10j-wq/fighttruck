'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FACILITY_LABELS, REGION_LABELS } from '@/lib/constants';
import type { RegionCode, SpotFacilities } from '@/lib/types';

const FACILITY_KEYS = Object.keys(FACILITY_LABELS) as (keyof SpotFacilities)[];
const REGION_KEYS = Object.keys(REGION_LABELS) as RegionCode[];

export default function Home() {
  const router = useRouter();
  const [region, setRegion] = useState<RegionCode | ''>('');
  const [facilities, setFacilities] = useState<Set<keyof SpotFacilities>>(new Set());

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

  function handleSearch() {
    const params = new URLSearchParams();
    if (region) params.set('region', region);
    if (facilities.size > 0) params.set('facilities', Array.from(facilities).join(','));
    const query = params.toString();
    router.push(query ? `/spots?${query}` : '/spots');
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-base px-4 py-16">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-bold text-ink">FightTruck</h1>
          <p className="text-ink/60">トラックドライバーのための休憩スポット検索</p>
        </div>

        <div className="space-y-6 rounded-2xl border border-accent/20 bg-white p-6 text-left shadow-sm">
          <div>
            <p className="mb-2 text-sm font-bold text-ink">地域</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRegion('')}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  region === '' ? 'bg-accent text-white' : 'bg-accent/10 text-accent'
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
                    region === key ? 'bg-accent text-white' : 'bg-accent/10 text-accent'
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
                    facilities.has(key) ? 'bg-accent text-white' : 'bg-accent/10 text-accent'
                  }`}
                >
                  {FACILITY_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="w-full rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent/90"
          >
            休憩スポットを検索する
          </button>
        </div>
      </div>
    </div>
  );
}
