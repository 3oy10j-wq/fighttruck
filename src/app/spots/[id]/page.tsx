import { notFound } from 'next/navigation';
import Link from 'next/link';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Metadata } from 'next';
import { getSpotById } from '@/lib/firebase/spots';
import { FACILITY_LABELS, REGION_LABELS } from '@/lib/constants';
import SpotReportSection from '@/components/SpotReportSection';
import FavoriteButton from '@/components/FavoriteButton';
import type { SpotFacilities } from '@/lib/types';

const FACILITY_KEYS = Object.keys(FACILITY_LABELS) as (keyof SpotFacilities)[];

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const spot = await getSpotById(id);
  if (!spot) return { title: 'スポットが見つかりません' };

  return {
    title: spot.name,
    description: `${spot.address}にある休憩スポット。営業時間: ${spot.hours}`,
    openGraph: {
      title: `${spot.name} | ファイトラック`,
      description: `${spot.address}にある休憩スポット。営業時間: ${spot.hours}`,
      url: `/spots/${id}`,
    },
  };
}

export default async function SpotDetailPage({ params }: Props) {
  const { id } = await params;

  let spot: (typeof import('@/lib/types').Spot) | null = null;

  // Check if id is from michinoeki data
  if (id.startsWith('michinoeki_')) {
    try {
      const filePath = join(process.cwd(), 'public', 'michinoeki-data.json');
      const fileContent = readFileSync(filePath, 'utf-8');
      const michinoekiRawData = JSON.parse(fileContent);
      const data = michinoekiRawData.data || [];

      // Extract index from id (format: michinoeki_{index})
      const indexStr = id.replace('michinoeki_', '');
      const index = parseInt(indexStr, 10);

      if (!isNaN(index) && index >= 0 && index < data.length) {
        const michinoekiSpot = data[index];
        spot = {
          id,
          ...michinoekiSpot,
        } as typeof import('@/lib/types').Spot;
      }
    } catch (error) {
      console.error('Failed to load michinoeki data:', error);
    }
  } else {
    // Try to load from Firestore
    spot = await getSpotById(id);
  }

  if (!spot) notFound();

  const mapsEmbedUrl = `https://www.google.com/maps?q=${spot.lat},${spot.lng}&output=embed`;

  return (
    <div className="flex min-h-screen flex-col bg-base px-4 py-12">
      <div className="mx-auto w-full max-w-3xl space-y-8">

        <div>
          <Link
            href="/spots"
            className="text-sm text-accent hover:underline"
          >
            ← スポット一覧に戻る
          </Link>
        </div>

        <div className="space-y-3">
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            {REGION_LABELS[spot.region]}
          </span>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="font-serif text-3xl font-bold text-white">{spot.name}</h1>
              <p className="text-sm text-gray-400">{spot.address}</p>
            </div>
            <FavoriteButton spot={spot} />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-accent/20 shadow-sm">
          <iframe
            src={mapsEmbedUrl}
            width="100%"
            height="360"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${spot.name}の地図`}
          />
        </div>

        <div className="space-y-4 rounded-2xl border border-accent/20 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold text-gray-900">基本情報</h2>
            {/* ✓ 運営確認済みバッジ */}
            {(spot as any).verifiedByAdmin && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                ✓ 運営確認済み
              </span>
            )}
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 font-medium text-gray-700">住所</dt>
              <dd className="text-gray-900">{spot.address}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 font-medium text-gray-700">営業時間</dt>
              <dd className="text-gray-900">{spot.hours}</dd>
            </div>
          </dl>
        </div>

        {/* 設備欄 - 既存スポット（道の駅など）のみ表示 */}
        {spot.source !== 'user' && (
          <div className="space-y-4 rounded-2xl border border-accent/20 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-gray-900">設備</h2>
            <div className="flex flex-wrap gap-2">
              {FACILITY_KEYS.map((key) => (
                <span
                  key={key}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    spot.facilities?.[key]
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {FACILITY_LABELS[key]}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-600">色付き: 利用可能　薄色: 利用不可</p>
          </div>
        )}

        {/* 申請情報 - ユーザー追加スポットのみ表示 */}
        {spot.source === 'user' && (
          <div className="space-y-4 rounded-2xl border border-accent/20 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-gray-900">申請情報</h2>
            <dl className="space-y-3 text-sm">
              {spot.type && (
                <div className="flex gap-4">
                  <dt className="w-24 shrink-0 font-medium text-gray-700">タイプ</dt>
                  <dd className="text-gray-900">
                    {spot.type === 'user_submitted'
                      ? 'ユーザー申請スポット'
                      : spot.type}
                  </dd>
                </div>
              )}
              {(spot as any).can_park && (
                <div className="flex gap-4">
                  <dt className="w-24 shrink-0 font-medium text-gray-700">大型トラック</dt>
                  <dd className="text-gray-900">
                    {(spot as any).can_park === 'yes'
                      ? '✓ 停められた'
                      : (spot as any).can_park === 'maybe'
                      ? '△ 微妙'
                      : '✗ 無理'}
                  </dd>
                </div>
              )}
              {(spot as any).comment && (
                <div className="flex gap-4">
                  <dt className="w-24 shrink-0 font-medium text-gray-700">コメント</dt>
                  <dd className="text-gray-900">{(spot as any).comment}</dd>
                </div>
              )}
              {(spot as any).submitterName && (
                <div className="flex gap-4">
                  <dt className="w-24 shrink-0 font-medium text-gray-700">投稿者</dt>
                  <dd className="text-gray-900">{(spot as any).submitterName || '匿名ドライバー'}</dd>
                </div>
              )}
              {spot.createdAt && (
                <div className="flex gap-4">
                  <dt className="w-24 shrink-0 font-medium text-gray-700">申請日</dt>
                  <dd className="text-gray-900">
                    {new Date(spot.createdAt.toDate()).toLocaleDateString('ja-JP')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <div className="pt-2">
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
            className="inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent/90"
          >
            Google Mapsで開く
          </a>
        </div>

        {/* Community Reports Section */}
        <SpotReportSection spot={spot} />

      </div>
    </div>
  );
}
