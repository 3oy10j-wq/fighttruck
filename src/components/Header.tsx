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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0f1e]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">

        {/* ロゴ */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-white transition-opacity hover:opacity-80"
        >
          <span className="text-2xl">🚛</span>
          <span>ファイトラック</span>
        </Link>

        {/* デスクトップナビ */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'text-[#f97316]'
                  : 'text-[#e2e8f0]/70 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}

          {!loading && (
            user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/mypage"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/mypage') ? 'text-[#f97316]' : 'text-[#e2e8f0]/70 hover:text-white'
                  }`}
                >
                  マイページ
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-[#e2e8f0] transition-all hover:border-white/40 hover:bg-white/10"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#e2e8f0]/70 transition-colors hover:text-white"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-[#f97316] px-5 py-2 text-sm font-bold text-white transition-all hover:scale-105 hover:bg-[#ea6d0e] hover:shadow-lg hover:shadow-orange-500/30"
                >
                  新規登録
                </Link>
              </div>
            )
          )}
        </nav>

        {/* ハンバーガー（スマホ） */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg md:hidden"
          aria-label="メニューを開く"
        >
          <span className={`block h-0.5 w-5 bg-white transition-transform duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-5 bg-white transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-5 bg-white transition-transform duration-200 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* スマホメニュー */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-[#111827] px-4 py-6 md:hidden">
          <nav className="flex flex-col gap-5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`text-base font-medium ${isActive(href) ? 'text-[#f97316]' : 'text-[#e2e8f0]'}`}
              >
                {label}
              </Link>
            ))}

            {!loading && (
              user ? (
                <>
                  <Link
                    href="/mypage"
                    onClick={() => setMenuOpen(false)}
                    className={`text-base font-medium ${isActive('/mypage') ? 'text-[#f97316]' : 'text-[#e2e8f0]'}`}
                  >
                    マイページ
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full rounded-full border border-white/20 py-3 text-sm font-medium text-[#e2e8f0]"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-base font-medium text-[#e2e8f0]"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full bg-[#f97316] py-3 text-center text-sm font-bold text-white"
                  >
                    新規登録
                  </Link>
                </>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
