'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { isAdmin, getUserCount, getReportCount, getNewUsersCount7Days, getNewReportsCount7Days } from '@/lib/firebase/admin';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    userCount: 0,
    reportCount: 0,
    newUsersCount7Days: 0,
    newReportsCount7Days: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    // 管理者チェック
    if (!user || !isAdmin(user.email)) {
      router.push('/');
      return;
    }

    // 統計データ取得
    const fetchStats = async () => {
      try {
        const [userCount, reportCount, newUsersCount7Days, newReportsCount7Days] = await Promise.all([
          getUserCount(),
          getReportCount(),
          getNewUsersCount7Days(),
          getNewReportsCount7Days(),
        ]);

        setStats({
          userCount,
          reportCount,
          newUsersCount7Days,
          newReportsCount7Days,
        });
      } catch (error) {
        console.error('統計データ取得エラー:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchStats();
  }, [user, loading, router]);

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!user || !isAdmin(user.email)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">🛠 管理ダッシュボード</h1>
          <p className="text-gray-600 mt-2">ファイトラック サービス統計</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 登録ユーザー数 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">登録ユーザー数</p>
                <p className="text-4xl font-bold text-gray-900">{stats.userCount}</p>
                <p className="text-xs text-gray-500 mt-2">全ユーザーの総数</p>
              </div>
              <div className="text-5xl">👥</div>
            </div>
          </div>

          {/* 投稿レポート総数 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">投稿レポート総数</p>
                <p className="text-4xl font-bold text-gray-900">{stats.reportCount}</p>
                <p className="text-xs text-gray-500 mt-2">全レポートの総数</p>
              </div>
              <div className="text-5xl">📋</div>
            </div>
          </div>

          {/* 直近7日間の新規ユーザー数 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">直近7日間の新規ユーザー</p>
                <p className="text-4xl font-bold text-blue-600">{stats.newUsersCount7Days}</p>
                <p className="text-xs text-gray-500 mt-2">この1週間の新規登録</p>
              </div>
              <div className="text-5xl">🆕</div>
            </div>
          </div>

          {/* 直近7日間の新規レポート数 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">直近7日間の新規レポート</p>
                <p className="text-4xl font-bold text-orange-600">{stats.newReportsCount7Days}</p>
                <p className="text-xs text-gray-500 mt-2">この1週間の投稿</p>
              </div>
              <div className="text-5xl">📝</div>
            </div>
          </div>
        </div>

        {/* 管理ツール */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">管理ツール</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* スポット申請レビュー */}
            <Link
              href="/admin/submissions"
              className="block bg-white border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-lg p-6 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">📍 スポット申請レビュー</p>
                  <p className="text-sm text-gray-600 mt-1">ドライバーからの新規スポット申請を確認・承認</p>
                </div>
                <div className="text-3xl">→</div>
              </div>
            </Link>

            {/* ユーザーメールアドレス一覧 */}
            <Link
              href="/admin/users"
              className="block bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg p-6 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">👥 登録ユーザー一覧</p>
                  <p className="text-sm text-gray-600 mt-1">メールアドレス・プラン・登録日を確認</p>
                </div>
                <div className="text-3xl">→</div>
              </div>
            </Link>

            {/* 問い合わせ管理 */}
            <Link
              href="/admin/inquiries"
              className="block bg-white border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 rounded-lg p-6 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">💬 問い合わせ管理</p>
                  <p className="text-sm text-gray-600 mt-1">ユーザーからの問い合わせを確認・対応</p>
                </div>
                <div className="text-3xl">→</div>
              </div>
            </Link>
          </div>
        </div>

        {/* 管理者情報 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
          <p>
            <span className="font-semibold">管理者ログイン中：</span> {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
