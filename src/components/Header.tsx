'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/config';
import { useAuth } from '@/lib/hooks/useAuth';

const NAV_LINKS = [
  { href: '/spots', label: 'スポット検索' },
] as const;

export default function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    router.push('/');
    setMenuOpen(false);
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-accent/20 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">

        {/* ロゴ */}
        <Link
          href="/"
          className="font-serif text-xl font-bold text-ink hover:text-accent transition-colors"
        >
          ファイトラック
        </Link>

        {/* デスクトップナビ */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                isActive(href) ? 'text-accent' : 'text-ink/70 hover:text-ink'
              }`}
            >
              {label}
            </Link>
          ))}

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/mypage"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/mypage') ? 'text-accent' : 'text-ink/70 hover:text-ink'
                    }`}
                  >
                    マイページ
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-full border border-accent/30 px-4 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-white transition-colors hover:bg-accent/90"
                  >
                    新規登録
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>

        {/* ハンバーガーボタン（スマホ） */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg md:hidden"
          aria-label="メニューを開く"
        >
          <span
            className={`block h-0.5 w-5 bg-ink transition-transform duration-200 ${
              menuOpen ? 'translate-y-2 rotate-45' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-ink transition-opacity duration-200 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-ink transition-transform duration-200 ${
              menuOpen ? '-translate-y-2 -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* スマホメニュー */}
      {menuOpen && (
        <div className="border-t border-accent/20 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium ${
                  isActive(href) ? 'text-accent' : 'text-ink/70'
                }`}
              >
                {label}
              </Link>
            ))}

            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/mypage"
                      onClick={() => setMenuOpen(false)}
                      className={`text-sm font-medium ${
                        isActive('/mypage') ? 'text-accent' : 'text-ink/70'
                      }`}
                    >
                      マイページ
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full rounded-full border border-accent/30 py-2 text-sm font-medium text-accent"
                    >
                      ログアウト
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="text-sm font-medium text-ink/70"
                    >
                      ログイン
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-full bg-accent py-2 text-center text-sm font-bold text-white"
                    >
                      新規登録
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
