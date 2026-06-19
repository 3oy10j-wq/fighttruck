import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getSpotById } from '@/lib/firebase/spots';
import { FACILITY_LABELS, REGION_LABELS } from '@/lib/constants';
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
  const spot = await getSpotById(id);
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

        <div className="space-y-2">
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            {REGION_LABELS[spot.region]}
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink">{spot.name}</h1>
          <p className="text-sm text-ink/60">{spot.address}</p>
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
          <h2 className="font-serif text-lg font-bold text-ink">基本情報</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 font-medium text-ink/60">住所</dt>
              <dd className="text-ink">{spot.address}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 font-medium text-ink/60">営業時間</dt>
              <dd className="text-ink">{spot.hours}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 rounded-2xl border border-accent/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-ink">設備</h2>
          <div className="flex flex-wrap gap-2">
            {FACILITY_KEYS.map((key) => (
              <span
                key={key}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  spot.facilities?.[key]
                    ? 'bg-accent text-white'
                    : 'bg-accent/10 text-accent/40'
                }`}
              >
                {FACILITY_LABELS[key]}
              </span>
            ))}
          </div>
          <p className="text-xs text-ink/40">色付き: 利用可能　薄色: 利用不可</p>
        </div>

        <div className="pt-2">
          <a
            href={spot.placeId
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}&query_place_id=${spot.placeId}`
              : `https://maps.google.com/?q=${spot.lat},${spot.lng}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent/90"
          >
            Google Mapsで開く
          </a>
        </div>

      </div>
    </div>
  );
}
