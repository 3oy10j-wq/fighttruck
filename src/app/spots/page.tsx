'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
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
  if (spot.placeId) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}&query_place_id=${spot.placeId}`;
  }
  return `https://maps.google.com/?q=${spot.lat},${spot.lng}`;
}

function SpotsPageContent() {
  const searchParams = useSearchParams();

  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');

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

  const mapRef = useRef<google.maps.Map | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  // ピンクリック → 地図は自動移動済み、左カードにスクロール
  function handleMapSelectSpot(spot: Spot | null) {
    setSelectedSpot(spot);
    if (spot) {
      setTimeout(() => {
        cardRefs.current[spot.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }

  // カードクリック → 地図をそのスポットへパン＋ズーム
  function handleCardClick(spot: Spot) {
    setSelectedSpot(spot);
    setMobileTab('map');
    if (mapRef.current) {
      mapRef.current.panTo({ lat: spot.lat, lng: spot.lng });
      mapRef.current.setZoom(13);
    }
  }

  function toggleFacility(key: keyof SpotFacilities) {
    setFacilities((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const SidePanel = (
    <div className="flex h-full flex-col bg-[#1a1f2e]">

      {/* ヘッダー */}
      <div className="shrink-0 border-b border-white/10 px-4 py-4">
        <h1 className="text-base font-bold text-white">🚛 休憩スポット検索</h1>
        <p className="mt-0.5 text-xs text-[#94a3b8]">
          {loading ? '読み込み中...' : `${filteredSpots.length}件のスポット`}
        </p>
      </div>

      {/* フィルター */}
      <div className="shrink-0 border-b border-white/10 px-4 py-3 space-y-3">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">地域</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setRegion('')}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                region === '' ? 'bg-[#f97316] text-white' : 'bg-white/10 text-[#cbd5e1] hover:bg-white/20'
              }`}
            >
              すべて
            </button>
            {REGION_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setRegion((prev) => (prev === key ? '' : key))}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  region === key ? 'bg-[#f97316] text-white' : 'bg-white/10 text-[#cbd5e1] hover:bg-white/20'
                }`}
              >
                {REGION_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">設備</p>
          <div className="flex flex-wrap gap-1.5">
            {FACILITY_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleFacility(key)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  facilities.has(key) ? 'bg-[#3b82f6] text-white' : 'bg-white/10 text-[#cbd5e1] hover:bg-white/20'
                }`}
              >
                {FACILITY_ICONS[key]} {FACILITY_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-3 rounded-lg bg-red-900/30 px-3 py-2 text-xs text-red-400">{error}</div>
      )}

      {/* スポットカードリスト */}
      <div className="flex-1 overflow-y-auto">
        {filteredSpots.map((spot) => {
          const isSelected = visibleSelectedSpot?.id === spot.id;
          return (
            <div
              key={spot.id}
              ref={(el) => { cardRefs.current[spot.id] = el; }}
              onClick={() => handleCardClick(spot)}
              className={`cursor-pointer border-b border-white/10 px-4 py-4 transition-colors ${
                isSelected ? 'bg-[#f97316]/15' : 'hover:bg-white/5'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold leading-snug ${isSelected ? 'text-[#f97316]' : 'text-white'}`}>
                    {spot.name}
                  </p>
                  {isSelected && (
                    <span className="shrink-0 rounded-full bg-[#f97316] px-2 py-0.5 text-[10px] font-bold text-white">
                      選択中
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#94a3b8]">📍 {spot.address}</p>
                <p className="text-xs text-[#94a3b8]">🕐 {spot.hours}</p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {FACILITY_KEYS.filter((k) => spot.facilities?.[k]).map((k) => (
                    <span key={k} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-[#cbd5e1]">
                      {FACILITY_ICONS[k]} {FACILITY_LABELS[k]}
                    </span>
                  ))}
                </div>
                <a
                  href={googleMapsUrl(spot)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-[#f97316] text-xs font-bold text-white transition-all hover:bg-[#ea6d0e]"
                >
                  🗺 Googleマップで経路案内
                </a>
              </div>
            </div>
          );
        })}

        {!loading && filteredSpots.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <span className="text-3xl">🔍</span>
            <p className="text-sm text-[#64748b]">条件に一致するスポットが見つかりませんでした</p>
          </div>
        )}
      </div>
    </div>
  );

  const MapArea = (
    <div className="h-full w-full">
      <SpotMap
        spots={filteredSpots}
        selectedSpot={visibleSelectedSpot}
        onSelectSpot={handleMapSelectSpot}
        mapRef={mapRef}
      />
    </div>
  );

  return (
    <>
      {/* デスクトップ：左320px固定＋右フル地図 */}
      <div
        className="hidden md:flex"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        <div className="w-80 shrink-0 overflow-hidden border-r border-white/10">
          {SidePanel}
        </div>
        <div className="flex-1">
          {MapArea}
        </div>
      </div>

      {/* モバイル：タブ切り替え */}
      <div
        className="flex flex-col md:hidden"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        <div className="flex shrink-0 border-b border-white/10 bg-[#1a1f2e]">
          <button
            type="button"
            onClick={() => setMobileTab('list')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${
              mobileTab === 'list' ? 'border-b-2 border-[#f97316] text-[#f97316]' : 'text-[#94a3b8]'
            }`}
          >
            📋 リスト
            {!loading && (
              <span className="text-xs font-normal">({filteredSpots.length}件)</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${
              mobileTab === 'map' ? 'border-b-2 border-[#f97316] text-[#f97316]' : 'text-[#94a3b8]'
            }`}
          >
            🗺 地図
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'list' ? SidePanel : MapArea}
        </div>
      </div>
    </>
  );
}

export default function SpotsPage() {
  return (
    <Suspense>
      <SpotsPageContent />
    </Suspense>
  );
}
