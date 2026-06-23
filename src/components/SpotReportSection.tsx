'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReportCard from '@/components/ReportCard';
import { subscribeToSpotReports } from '@/lib/firebase/reports';
import type { Report, Spot } from '@/lib/types';

interface SpotReportSectionProps {
  spot: Spot;
}

export default function SpotReportSection({ spot }: SpotReportSectionProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToSpotReports(spot.id, (newReports) => {
      setReports(newReports);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => unsubscribe();
  }, [spot.id]);

  if (loading) {
    return (
      <div className="space-y-4 rounded-2xl border border-accent/20 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-ink">コミュニティレポート</h2>
        <div className="text-center py-4 text-ink/60">読み込み中...</div>
      </div>
    );
  }

  // Calculate average ratings
  const avgParkingEase =
    reports.length > 0
      ? (
          reports.reduce((sum, r) => sum + r.ratings.parking_ease, 0) /
          reports.length
        ).toFixed(1)
      : 'N/A';

  const avgCleanliness =
    reports.length > 0
      ? (
          reports.reduce((sum, r) => sum + r.ratings.cleanliness, 0) /
          reports.length
        ).toFixed(1)
      : 'N/A';

  const avgOverallSatisfaction =
    reports.length > 0
      ? (
          reports.reduce((sum, r) => sum + r.ratings.overall_satisfaction, 0) /
          reports.length
        ).toFixed(1)
      : 'N/A';

  const canParkCount = reports.filter((r) => r.ratings.can_park).length;

  return (
    <div className="space-y-4 rounded-2xl border border-accent/20 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-ink">
          コミュニティレポート
        </h2>
        {reports.length > 0 && (
          <span className="text-sm text-ink/60">
            {reports.length}件の報告
          </span>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-ink/60 mb-4">
            このスポットはまだレポートがありません
          </p>
          <Link
            href={`/spots/${spot.id}#report`}
            className="text-sm text-accent hover:underline font-semibold"
          >
            最初のレポートを投稿してみませんか？
          </Link>
        </div>
      ) : (
        <>
          {/* Average Ratings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-accent/10">
            <div className="text-center">
              <p className="text-xs text-ink/60 mb-1">駐車の容易さ</p>
              <p className="text-xl font-bold text-accent">{avgParkingEase}</p>
              <p className="text-xs text-ink/40">/ 5.0</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-ink/60 mb-1">清潔さ</p>
              <p className="text-xl font-bold text-accent">{avgCleanliness}</p>
              <p className="text-xs text-ink/40">/ 5.0</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-ink/60 mb-1">総合満足度</p>
              <p className="text-xl font-bold text-accent">
                {avgOverallSatisfaction}
              </p>
              <p className="text-xs text-ink/40">/ 5.0</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-ink/60 mb-1">駐車可能</p>
              <p className="text-xl font-bold text-green-600">
                {canParkCount}/{reports.length}
              </p>
              <p className="text-xs text-ink/40">台</p>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-ink">最近のレポート</h3>
            {reports.slice(0, 5).map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                compact={true}
              />
            ))}
          </div>

          {/* View All Link */}
          {reports.length > 5 && (
            <div className="pt-2 border-t border-accent/10">
              <Link
                href={`/reports?spotId=${spot.id}`}
                className="inline-block text-sm text-accent hover:underline font-semibold"
              >
                すべてのレポートを見る →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
