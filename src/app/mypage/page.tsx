'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { logout } from '@/lib/firebase/auth';

export default function MyPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <p className="text-ink/60">読み込み中...</p>
      </div>
    );
  }

  const displayName = profile?.name ?? user.displayName ?? 'ドライバー';

  return (
    <div className="min-h-screen bg-base px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="font-serif text-3xl font-bold text-ink">マイページ</h1>

        <div className="flex items-center gap-4 rounded-2xl border border-accent/20 bg-white p-6 shadow-sm">
          {profile?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={displayName}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-xl font-bold text-accent">
              {displayName.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-serif text-xl font-bold text-ink">{displayName}</p>
            <p className="text-sm text-ink/60">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-accent/20 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-accent">
              {profile?.reviewCount ?? 0}
            </p>
            <p className="text-sm text-ink/60">レビュー</p>
          </div>
          <div className="rounded-2xl border border-accent/20 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-accent">
              {profile?.favoriteCount ?? 0}
            </p>
            <p className="text-sm text-ink/60">お気に入り</p>
          </div>
          <div className="rounded-2xl border border-accent/20 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-accent">
              {profile?.plan === 'premium' ? 'プレミアム' : '無料'}
            </p>
            <p className="text-sm text-ink/60">プラン</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-lg border border-ink/15 py-2.5 font-medium text-ink transition hover:bg-ink/5"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
