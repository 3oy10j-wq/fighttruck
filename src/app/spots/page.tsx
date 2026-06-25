'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSpots } from '@/lib/firebase/spots';
import { geocodeAddress } from '@/lib/location-utils';
import SpotMap from '@/components/SpotMap';
import type { Spot } from '@/lib/types';

interface SpotWithDistance extends Spot {
  distance: number;
}

function SpotsPageContent() {
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const [michinoekiData, setMichinoekiData] = useState<Spot[]>([]);
  const [nearbySpots, setNearbySpots] = useState<SpotWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('map');
  const mapRef = useRef<google.maps.Map | null>(null);

  // スポットデータを読み込む
  useEffect(() => {
    Promise.all([
      getSpots(),
      fetch('/michinoeki-data.json').then(r => r.json()).then(d => d.data || []),
    ])
      .then(([official, michinoeki]: [Spot[], Record<string, unknown>[]]) => {
        setAllSpots(official);
        // 道の駅データに id フィールドを追加（name をベースに生成）
        const michinoekiWithId = michinoeki.map((spot, index: number) => ({
          id: `michinoeki_${index}_${String(spot.name)}`,
          ...spot,
        } as Spot));
        setMichinoekiData(michinoekiWithId);
      })
      .catch(e => console.error('データ読み込みエラー:', e))
      .finally(() => setLoading(false));
  }, []);

  // 検索実行
  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    setSearching(true);
    try {
      const coords = await geocodeAddress(searchInput);

      if (coords && mapRef.current) {
        mapRef.current.setCenter(coords);
        mapRef.current.setZoom(13);
      } else {
        console.warn('検索失敗: 座標またはマップが見つかりません', { coords, mapRef: mapRef.current });
      }
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // onUpdateNearbySpots をメモ化して、毎回同じ関数参照にする
  const handleUpdateNearbySpots = useCallback((spots: SpotWithDistance[]) => {
    setNearbySpots(spots);
  }, []);

  // allData をメモ化して、allSpots と michinoekiData が変わらない限り同じオブジェクト参照を保つ
  const allData = useMemo(() => [...allSpots, ...michinoekiData], [allSpots, michinoekiData]);

  const ListContent = (
    <div className="space-y-2">
      {nearbySpots.map((spot) => (
        <div
          key={`${spot.type}-${spot.name}`}
          onClick={() => {
            setSelectedSpot(spot);
            setMobileTab('map');
          }}
          className="border-l-4 border-orange-500 bg-gray-50 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-sm text-gray-900">{spot.name}</p>
            <span className="text-xs font-bold text-orange-600">{spot.distance.toFixed(1)}km</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
              {spot.type === 'michinoeki' ? '🏛️ 道の駅' : '⭐ 厳選'}
            </span>
          </div>
          {spot.address && (
            <p className="text-xs text-gray-600 mb-2">📍 {spot.address}</p>
          )}
          <a
            href={
              (() => {
                const query = spot.name.includes('道の駅')
                  ? spot.name
                  : `道の駅${spot.name}`;
                return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
              })()
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-blue-600 hover:underline"
          >
            🗺 Google Mapsで開く
          </a>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* 検索バー */}
      <div className="sticky top-16 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="地名や住所で検索... 例）渋谷、東京駅"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
          >
            {searching ? '検索中...' : '検索'}
          </button>
        </div>
      </div>

      {/* デスクトップ: 左リスト + 右地図 */}
      <div className="hidden md:flex" style={{ height: 'calc(100vh - 16rem)' }}>
        <div className="w-96 overflow-y-auto border-r border-gray-200 bg-white p-4">
          <div className="mb-2">
            <p className="text-sm font-semibold text-gray-900">
              近いスポット ({nearbySpots.length}件)
            </p>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : nearbySpots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">近くにスポットがありません</p>
            </div>
          ) : (
            ListContent
          )}
        </div>

        <div className="flex-1">
          <SpotMap
            allSpots={allData}
            selectedSpot={selectedSpot}
            onSelectSpot={setSelectedSpot}
            onUpdateNearbySpots={handleUpdateNearbySpots}
            mapRef={mapRef}
          />
        </div>
      </div>

      {/* モバイル: タブ切り替え */}
      <div className="md:hidden flex flex-col" style={{ height: 'calc(100vh - 16rem)' }}>
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mobileTab === 'list'
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-600'
            }`}
          >
            📋 リスト ({nearbySpots.length})
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mobileTab === 'map'
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-600'
            }`}
          >
            🗺 地図
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {mobileTab === 'list' ? (
            <div className="overflow-y-auto p-4">
              {loading ? (
                <p className="text-center text-gray-500">読み込み中...</p>
              ) : nearbySpots.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">近くにスポットがありません</p>
              ) : (
                ListContent
              )}
            </div>
          ) : (
            <SpotMap
              allSpots={allData}
              selectedSpot={selectedSpot}
              onSelectSpot={setSelectedSpot}
              onUpdateNearbySpots={handleUpdateNearbySpots}
              mapRef={mapRef}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default function SpotsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">読み込み中...</div>}>
      <SpotsPageContent />
    </Suspense>
  );
}
