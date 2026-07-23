'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSpots } from '@/lib/firebase/spots';
import { geocodeAddress } from '@/lib/location-utils';
import { useAuth } from '@/lib/hooks/useAuth';
import SpotMap from '@/components/SpotMap';
import SubmitSpotModal from '@/components/SubmitSpotModal';
import type { Spot } from '@/lib/types';
import type { SpotMapHandle } from '@/components/SpotMap';
import type { LocationCoords } from '@/lib/location-utils';

interface SpotWithDistance extends Spot {
  distance: number;
}

function SpotsPageContent() {
  const { user } = useAuth();
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const [michinoekiData, setMichinoekiData] = useState<Spot[]>([]);
  const [nearbySpots, setNearbySpots] = useState<SpotWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('map');
  const [searchedLocation, setSearchedLocation] = useState<{ coords: LocationCoords; query: string } | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const pcMapRef = useRef<SpotMapHandle>(null);
  const mobileMapRef = useRef<SpotMapHandle>(null);

  // スポットデータを読み込む
  useEffect(() => {
    Promise.all([
      getSpots(),
      fetch('/michinoeki-data.json').then(r => r.json()).then(d => d.data || []),
    ])
      .then(([official, michinoeki]: [Spot[], Record<string, unknown>[]]) => {
        setAllSpots(official);
        // 道の駅データに id フィールドを追加（index のみを使用してURLセーフに）
        const michinoekiWithId = michinoeki.map((spot, index: number) => ({
          id: `michinoeki_${index}`,
          ...spot,
        } as Spot));
        setMichinoekiData(michinoekiWithId);
      })
      .catch(e => console.error('データ読み込みエラー:', e))
      .finally(() => setLoading(false));
  }, []);

  // 検索実行
  const handleSearch = async () => {
    if (!searchInput.trim()) {
      return;
    }

    setSearching(true);
    try {
      const coords = await geocodeAddress(searchInput);

      if (coords) {
        // PC版とモバイル版の両方の地図に center を更新（両方の ref に setCenterTo）
        pcMapRef.current?.setCenterTo(coords);
        mobileMapRef.current?.setCenterTo(coords);
        // 検索地点の情報を保存（マーカー表示用）
        setSearchedLocation({ coords, query: searchInput.trim() });
      } else {
        alert(`「${searchInput}」が見つかりません。別の場所を検索してください。`);
        setSearchedLocation(null);
      }
    } catch (error) {
      console.error('❌ 検索エラー:', error);
      alert('検索中にエラーが発生しました。もう一度試してください。');
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
          className="p-3 cursor-pointer transition-all hover:shadow-md relative rounded-lg"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E5E3DC',
            borderWidth: '1px',
            borderRadius: '12px',
          }}
        >
          <div
            onClick={() => {
              setSelectedSpot(spot);
              setMobileTab('map');
            }}
            className="mb-2"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-semibold text-sm" style={{ color: '#1F2933' }}>{spot.name}</p>
              <span className="text-xs font-bold" style={{ color: '#E8722C' }}>{spot.distance.toFixed(1)}km</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F1EFE8', color: '#52606D' }}>
                {spot.type === 'michinoeki' ? '🏛️ 道の駅' : '⭐ 厳選'}
              </span>
            </div>
            {spot.address && (
              <p className="text-xs mb-2" style={{ color: '#52606D' }}>📍 {spot.address}</p>
            )}
          </div>
          <div className="flex gap-2">
            <a
              href={`/spots/${spot.id}`}
              className="flex-1 text-xs text-white font-medium text-center py-2 transition-all hover:opacity-90"
              style={{
                backgroundColor: '#E8722C',
                borderRadius: '9px',
              }}
            >
              📋 詳細
            </a>
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
              className="flex-1 text-xs font-medium text-center py-2 transition-all hover:opacity-90"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#D5D3CB',
                borderWidth: '1px',
                color: '#52606D',
                borderRadius: '9px',
              }}
            >
              🗺 Maps
            </a>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* 検索バー + 追加ボタン */}
      <div className="sticky top-16 z-10 px-4 py-3 shadow-sm" style={{ backgroundColor: '#FAF9F6', borderBottomColor: '#EEECE5', borderBottomWidth: '1px' }}>
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-3 md:gap-2 mb-2">
          <input
            type="text"
            placeholder="地名や住所で検索... 例）渋谷、東京駅"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E0DED6',
              borderWidth: '1px',
              borderRadius: '12px',
            }}
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="w-full md:w-auto px-6 py-4 md:py-3 text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: '#E8722C',
              borderRadius: '12px',
            }}
          >
            {searching ? '検索中...' : '検索'}
          </button>
        </div>
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="w-full px-4 py-3 font-semibold rounded-lg transition-all hover:opacity-90 text-sm"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E8722C',
              borderWidth: '1px',
              color: '#E8722C',
            }}
          >
            + 休憩スポットを追加
          </button>
        </div>
      </div>

      {/* デスクトップ: 左リスト + 右地図 */}
      <div className="hidden md:flex" style={{ height: 'calc(100vh - 14rem)' }}>
        <div className="w-96 overflow-y-auto p-4" style={{ backgroundColor: '#FFFFFF', borderRightColor: '#E5E3DC', borderRightWidth: '1px' }}>
          <div className="mb-2">
            <p className="text-sm font-semibold" style={{ color: '#1F2933' }}>
              近いスポット ({nearbySpots.length}件)
            </p>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <p style={{ color: '#52606D' }}>読み込み中...</p>
            </div>
          ) : nearbySpots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm font-medium" style={{ color: '#52606D' }}>
                {searchInput.trim()
                  ? `「${searchInput}」周辺のスポットが見つかりません`
                  : '近くにスポットがありません'}
              </p>
              {searchInput.trim() && (
                <p className="text-xs mt-2" style={{ color: '#7B8794' }}>別の場所で検索してください</p>
              )}
            </div>
          ) : (
            ListContent
          )}
        </div>

        <div className="flex-1">
          <SpotMap
            ref={pcMapRef}
            allSpots={allData}
            selectedSpot={selectedSpot}
            onSelectSpot={setSelectedSpot}
            onUpdateNearbySpots={handleUpdateNearbySpots}
            mapRef={mapRef}
            searchedLocation={searchedLocation}
          />
        </div>
      </div>

      {/* モバイル: タブ切り替え */}
      <div className="md:hidden flex flex-col min-h-screen">
        <div className="flex" style={{ backgroundColor: '#FFFFFF', borderBottomColor: '#E5E3DC', borderBottomWidth: '1px' }}>
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mobileTab === 'list'
                ? 'border-b-2'
                : ''
            }`}
            style={{
              color: mobileTab === 'list' ? '#E8722C' : '#52606D',
              borderBottomColor: mobileTab === 'list' ? '#E8722C' : 'transparent',
            }}
          >
            📋 リスト ({nearbySpots.length})
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mobileTab === 'map'
                ? 'border-b-2'
                : ''
            }`}
            style={{
              color: mobileTab === 'map' ? '#E8722C' : '#52606D',
              borderBottomColor: mobileTab === 'map' ? '#E8722C' : 'transparent',
            }}
          >
            🗺 地図
          </button>
        </div>

        <div style={{ backgroundColor: '#FFFFFF' }}>
          {mobileTab === 'list' ? (
            <div className="p-4">
              {loading ? (
                <p className="text-center" style={{ color: '#52606D' }}>読み込み中...</p>
              ) : nearbySpots.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm font-medium" style={{ color: '#52606D' }}>
                    {searchInput.trim()
                      ? `「${searchInput}」周辺のスポットが見つかりません`
                      : '近くにスポットがありません'}
                  </p>
                  {searchInput.trim() && (
                    <p className="text-xs mt-2" style={{ color: '#7B8794' }}>別の場所で検索してください</p>
                  )}
                </div>
              ) : (
                ListContent
              )}
            </div>
          ) : (
            <SpotMap
              ref={mobileMapRef}
              allSpots={allData}
              selectedSpot={selectedSpot}
              onSelectSpot={setSelectedSpot}
              onUpdateNearbySpots={handleUpdateNearbySpots}
              mapRef={mapRef}
              searchedLocation={searchedLocation}
            />
          )}
        </div>
      </div>

      {/* スポット申請モーダル */}
      <SubmitSpotModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => {
          // 申請成功時の処理（必要に応じて）
          console.log('✓ スポット申請が成功しました');
        }}
      />
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
