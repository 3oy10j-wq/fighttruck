'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReportCard from '@/components/ReportCard';
import { subscribeToRecentReports, deleteReport } from '@/lib/firebase/reports';
import { getSpots } from '@/lib/firebase/spots';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Report, Spot } from '@/lib/types';

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadSpots = async () => {
      try {
        const data = await getSpots();
        setSpots(data);
      } catch (err) {
        console.error('スポット読み込みエラー:', err);
      }
    };
    loadSpots();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToRecentReports(200, (newReports) => {
      setReports(newReports);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (reportId: string) => {
    if (!confirm('このレポートを削除しますか？')) return;

    setDeleting(reportId);
    setError(null);

    try {
      await deleteReport(reportId);
      // Reports will be updated via subscription
    } catch (err) {
      console.error('削除エラー:', err);
      setError(err instanceof Error ? err.message : 'レポート削除に失敗しました');
    } finally {
      setDeleting(null);
    }
  };

  const getSpotName = (report: Report) => {
    return report.spotName || spots.find((s) => s.id === report.spotId)?.name || '不明なスポット';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-semibold mb-4">
            管理画面を表示するにはログインしてください
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            ログインへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-block text-sm text-accent hover:underline"
          >
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            レポート管理
          </h1>
          <p className="text-gray-600">
            すべてのコミュニティレポートを管理
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Reports List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center">
              <p className="text-gray-500">レポートはありません</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-4">
                計 {reports.length} 件のレポート
              </div>
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-lg border border-gray-200 bg-white overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-900">
                      {getSpotName(report)}
                    </div>
                    <button
                      onClick={() => handleDelete(report.id)}
                      disabled={deleting === report.id}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded font-semibold disabled:opacity-50"
                    >
                      {deleting === report.id ? '削除中...' : '削除'}
                    </button>
                  </div>
                  <div className="p-4">
                    <ReportCard
                      report={report}
                      compact={false}
                      canDelete={false}
                    />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
