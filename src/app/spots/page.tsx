'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSpots } from '@/lib/firebase/spots';
import { FACILITY_LABELS, REGION_LABELS } from '@/lib/constants';
import type { RegionCode, Spot, SpotFacilities } from '@/lib/types';
import SpotMap from '@/components/SpotMap';

const FACILITY_KEYS = Object.keys(FACILITY_LABELS) as (keyof SpotFacilities)[];
const REGION_KEYS = Object.keys(REGION_LABELS) as RegionCode[];

const FACILITY_ICONS: Record<keyof SpotFacilities, string> = {
  shower:       '🚿',
  sleepingArea: '🛏',
  largeParking: '🅿️',
  restaurant:   '🍜',
  onsen:        '♨️',
  laundry:      '👕',
  open24h:      '🕐',
};

function googleMapsUrl(spot: Spot) {
  return `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
}

function SpotsPageContent() {
  const searchParams = useSearchParams();

  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const [region, setRegion] = useState<RegionCode | ''>(() => {
    const p = searchParams.get('region');
    return p && (REGION_KEYS as string[]).includes(p) ? (p as RegionCode) : '';
  });
  const [facilities, setFacilities] = useState<Set<keyof SpotFacilities>>(() => {
    const p = searchParams.get('facilities');
    if (!p) return new Set();
    return new Set(
      p.split(',').filter((k): k is keyof SpotFacilities => (FACILITY_KEYS as string[]).includes(k))
    );
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
    selectedSpot && filteredSpots.some((s) => s.id === selectedSpot.id) ? selectedSpot : null;

  function toggleFacility(key: keyof SpotFacilities) {
    setFacilities((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] px-4 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">

        <h1 className="text-2xl font-bold text-white md:text-3xl">
          🚛 休憩スポット検索
        </h1>

        {/* フィルター */}
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-4 space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold text-[#94a3b8] uppercase tracking-wider">地域</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRegion('')}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  region === '' ? 'bg-[#f97316] text-white' : 'bg-white/10 text-[#e2e8f0] hover:bg-white/20'
                }`}
              >
                すべて
              </button>
              {REGION_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRegion((prev) => (prev === key ? '' : key))}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    region === key ? 'bg-[#f97316] text-white' : 'bg-white/10 text-[#e2e8f0] hover:bg-white/20'
                  }`}
                >
                  {REGION_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold text-[#94a3b8] uppercase tracking-wider">設備で絞り込む</p>
            <div className="flex flex-wrap gap-2">
              {FACILITY_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleFacility(key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    facilities.has(key) ? 'bg-[#3b82f6] text-white' : 'bg-white/10 text-[#e2e8f0] hover:bg-white/20'
                  }`}
                >
                  {FACILITY_ICONS[key]} {FACILITY_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 地図 */}
        <div className="overflow-hidden rounded-2xl border border-white/10 shadow-lg" style={{ height: '420px' }}>
          <SpotMap
            spots={filteredSpots}
            selectedSpot={visibleSelectedSpot}
            onSelectSpot={setSelectedSpot}
          />
        </div>

        {/* 選択スポットのナビパネル */}
        {visibleSelectedSpot && (
          <div className="rounded-2xl border border-[#f97316]/40 bg-[#1a1f2e] p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-lg font-bold text-white">{visibleSelectedSpot.name}</p>
                <p className="text-sm text-[#94a3b8]">📍 {visibleSelectedSpot.address}</p>
                <p className="text-sm text-[#94a3b8]">🕐 {visibleSelectedSpot.hours}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSpot(null)}
                className="text-[#94a3b8] hover:text-white text-xl leading-none shrink-0"
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {FACILITY_KEYS.filter((k) => visibleSelectedSpot.facilities?.[k]).map((k) => (
                <span key={k} className="rounded-full bg-[#3b82f6]/20 px-3 py-1 text-xs font-medium text-[#93c5fd]">
                  {FACILITY_ICONS[k]} {FACILITY_LABELS[k]}
                </span>
              ))}
            </div>
            {/* ナビボタン */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={googleMapsUrl(visibleSelectedSpot)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#f97316] text-base font-bold text-white transition-all hover:scale-105 hover:bg-[#ea6d0e] hover:shadow-lg hover:shadow-orange-500/30"
              >
                🗺 Googleマップで経路案内
              </a>
              <Link
                href={`/spots/${visibleSelectedSpot.id}`}
                className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                詳細を見る
              </Link>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-[#94a3b8]">
            <span className="animate-spin">⏳</span> 読み込み中...
          </div>
        )}
        {error && <p className="rounded-xl bg-red-900/30 px-4 py-3 text-sm text-red-400">{error}</p>}

        {/* スポットカード一覧 */}
        {!loading && (
          <>
            <p className="text-sm text-[#94a3b8]">
              {filteredSpots.length}件のスポット
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredSpots.map((spot) => (
                <div
                  key={spot.id}
                  className={`rounded-2xl border bg-[#111827] p-5 transition-all duration-200 ${
                    selectedSpot?.id === spot.id
                      ? 'border-[#f97316] shadow-lg shadow-orange-500/20'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {/* スポット情報 */}
                  <button
                    type="button"
                    onClick={() => setSelectedSpot(spot)}
                    className="w-full text-left space-y-2 mb-4"
                  >
                    <p className="text-base font-bold text-white leading-snug">{spot.name}</p>
                    <p className="text-xs text-[#94a3b8]">📍 {spot.address}</p>
                    <p className="text-xs text-[#94a3b8]">🕐 {spot.hours}</p>
                    {/* 設備バッジ */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {FACILITY_KEYS.filter((k) => spot.facilities?.[k]).map((k) => (
                        <span
                          key={k}
                          className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-[#e2e8f0]"
                        >
                          {FACILITY_ICONS[k]} {FACILITY_LABELS[k]}
                        </span>
                      ))}
                    </div>
                  </button>

                  {/* アクションボタン */}
                  <div className="flex gap-2">
                    <a
                      href={googleMapsUrl(spot)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#f97316] text-xs font-bold text-white transition-all hover:bg-[#ea6d0e] hover:shadow-md hover:shadow-orange-500/30"
                    >
                      🗺 経路案内
                    </a>
                    <Link
                      href={`/spots/${spot.id}`}
                      className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/20 text-xs font-medium text-[#e2e8f0] transition-colors hover:bg-white/10"
                    >
                      詳細
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filteredSpots.length === 0 && !loading && (
              <p className="rounded-xl border border-white/10 bg-[#111827] px-5 py-8 text-center text-[#94a3b8]">
                条件に一致するスポットが見つかりませんでした
              </p>
            )}
          </>
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
