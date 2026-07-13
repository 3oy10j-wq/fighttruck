'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { isAdmin } from '@/lib/firebase/admin';
import { getFirebaseDb } from '@/lib/firebase/config';
import type { UserProfile } from '@/lib/types';

interface UserWithId extends UserProfile {
  id: string;
}

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 管理者チェック
  useEffect(() => {
    if (!loading && (!user || !isAdmin(user.email))) {
      router.push('/');
    }
  }, [user, loading, router]);

  // ユーザー一覧を取得
  useEffect(() => {
    if (!user || !isAdmin(user.email)) return;

    const fetchUsers = async () => {
      try {
        setDataLoading(true);
        const db = getFirebaseDb();
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);

        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as UserWithId));

        setUsers(usersList.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
        }));
      } catch (err) {
        console.error('ユーザー取得エラー:', err);
        setError('ユーザーの取得に失敗しました');
      } finally {
        setDataLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">登録ユーザー一覧</h1>
          <p className="text-gray-600">全登録ユーザー: {users.length}人</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div className="rounded-lg bg-white px-6 py-12 text-center border border-gray-200">
            <p className="text-gray-500 text-lg">登録ユーザーがいません</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* テーブル（デスクトップ） */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">名前</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">メールアドレス</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">プラン</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">登録日</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{u.email || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.plan === 'premium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.plan === 'premium' ? 'Premium' : 'Free'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {u.createdAt ? new Date(u.createdAt.toDate()).toLocaleDateString('ja-JP') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* カード表示（モバイル） */}
            <div className="md:hidden space-y-4 p-4">
              {users.map((u) => (
                <div key={u.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-bold text-gray-900 mb-2">{u.name}</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">メール:</span>{' '}
                      <span className="font-mono">{u.email || '-'}</span>
                    </p>
                    <p>
                      <span className="font-medium">プラン:</span>{' '}
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        u.plan === 'premium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.plan === 'premium' ? 'Premium' : 'Free'}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">登録日:</span>{' '}
                      {u.createdAt ? new Date(u.createdAt.toDate()).toLocaleDateString('ja-JP') : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
