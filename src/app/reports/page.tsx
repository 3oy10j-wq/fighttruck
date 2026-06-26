'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReportCard from '@/components/ReportCard';
import { subscribeToRecentReports } from '@/lib/firebase/reports';
import { getSpots } from '@/lib/firebase/spots';
import type { Report, Spot } from '@/lib/types';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpotId, setSelectedSpotId] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest'>('newest');

  useEffect(() => {
    const loadSpots = async () => {
      try {
        const data = await getSpots();
        setSpots(data);
      } catch (error) {
        console.error('スポット読み込みエラー:', error);
      }
    };
    loadSpots();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToRecentReports(100, (newReports) => {
      setReports(newReports);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => unsubscribe();
  }, []);

  // Filter reports by selected spot
  const filteredReports = selectedSpotId
    ? reports.filter((r) => r.spotId === selectedSpotId)
    : reports;

  // Sort reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.timestamp.toDate?.() || b.timestamp).getTime() -
             new Date(a.timestamp.toDate?.() || a.timestamp).getTime();
    }
    // highest rated
    const avgA = (a.ratings.parking_ease + a.ratings.cleanliness + a.ratings.overall_satisfaction) / 3;
    const avgB = (b.ratings.parking_ease + b.ratings.cleanliness + b.ratings.overall_satisfaction) / 3;
    return avgB - avgA;
  });

  const getSpotName = (report: Report) => {
    // spotName があればそれを使用
    if (report.spotName) {
      return report.spotName;
    }

    // Firestore スポットから検索
    const firestoreSpot = spots.find((s) => s.id === report.spotId);
    if (firestoreSpot) {
      return firestoreSpot.name;
    }

    // 道の駅データの場合、spotId から名前を抽出
    // spotId形式: michinoeki_${index}_${name}
    if (report.spotId.startsWith('michinoeki_')) {
      const parts = report.spotId.split('_');
      if (parts.length >= 3) {
        // 最後の部分（またはアンダースコア区切りで複数ワードの場合）をスポット名として使用
        return parts.slice(2).join('_');
      }
    }

    return '不明なスポット';
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/spots"
            className="mb-4 inline-block text-sm text-accent hover:underline"
          >
            ← スポット一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">コミュニティレポート</h1>
          <p className="text-gray-600">
            ドライバーからのリアルな情報を見る
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4 rounded-lg bg-white p-4 shadow-sm">
          {/* Spot Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              スポットで絞込み
            </label>
            <select
              value={selectedSpotId}
              onChange={(e) => setSelectedSpotId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">すべてのスポット</option>
              {spots.map((spot) => (
                <option key={spot.id} value={spot.id}>
                  {spot.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              並び順
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('newest')}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  sortBy === 'newest'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                最新順
              </button>
              <button
                onClick={() => setSortBy('highest')}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  sortBy === 'highest'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                高評価順
              </button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : sortedReports.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center">
              <p className="text-gray-500">レポートはまだありません</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-4">
                {sortedReports.length}件のレポート
              </div>
              {sortedReports.map((report) => (
                <div key={report.id} className="space-y-2">
                  <div className="text-xs text-gray-500 font-semibold px-2">
                    {getSpotName(report)}
                  </div>
                  <ReportCard report={report} compact={false} />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
