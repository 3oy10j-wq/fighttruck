'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { Truck } from 'lucide-react';
import { getFirebaseAuth } from '@/lib/firebase/config';
import { useAuth } from '@/lib/hooks/useAuth';
import { isAdmin } from '@/lib/firebase/admin';

const NAV_LINKS = [
  { href: '/spots', label: 'スポット検索' },
  { href: '/reports', label: 'みんなの報告' },
  { href: '/contact', label: 'お問い合わせ' },
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
    <header className="sticky top-0 z-[100] border-b bg-white pointer-events-auto" style={{ borderColor: '#EEECE5' }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">

        {/* ロゴ */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-bold transition-opacity hover:opacity-80"
          style={{ color: '#1F2933' }}
        >
          <Truck
            size={30}
            strokeWidth={1.8}
            className="flex-shrink-0"
            style={{ color: '#E8722C' }}
          />
          <span>ファイトラック</span>
        </Link>

        {/* デスクトップナビ */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium transition-colors"
              style={{ color: isActive(href) ? '#E8722C' : '#52606D' }}
              onMouseEnter={(e) => !isActive(href) && (e.currentTarget.style.color = '#E8722C')}
              onMouseLeave={(e) => !isActive(href) && (e.currentTarget.style.color = '#52606D')}
            >
              {label}
            </Link>
          ))}

          {!loading && (
            user ? (
              <div className="flex items-center gap-4">
                {isAdmin(user.email) && (
                  <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium transition-colors"
                    style={{ color: isActive('/admin/dashboard') ? '#E8722C' : '#52606D' }}
                    onMouseEnter={(e) => !isActive('/admin/dashboard') && (e.currentTarget.style.color = '#E8722C')}
                    onMouseLeave={(e) => !isActive('/admin/dashboard') && (e.currentTarget.style.color = '#52606D')}
                  >
                    🛠 管理画面
                  </Link>
                )}
                <Link
                  href="/mypage"
                  className="text-sm font-medium transition-colors"
                  style={{ color: isActive('/mypage') ? '#E8722C' : '#52606D' }}
                  onMouseEnter={(e) => !isActive('/mypage') && (e.currentTarget.style.color = '#E8722C')}
                  onMouseLeave={(e) => !isActive('/mypage') && (e.currentTarget.style.color = '#52606D')}
                >
                  マイページ
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-full border px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50"
                  style={{ borderColor: '#D5D3CB', color: '#1F2933' }}
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors hover:text-[#E8722C]"
                  style={{ color: '#52606D' }}
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="rounded-full px-5 py-2 text-sm font-bold text-white transition-all hover:scale-105 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30"
                  style={{ backgroundColor: '#E8722C' }}
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
        <div className="border-t px-4 py-6 md:hidden" style={{ borderColor: '#EEECE5', backgroundColor: '#FAFAF8' }}>
          <nav className="flex flex-col gap-5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium"
                style={{ color: isActive(href) ? '#E8722C' : '#52606D' }}
              >
                {label}
              </Link>
            ))}

            {!loading && (
              user ? (
                <>
                  {isAdmin(user.email) && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="text-base font-medium"
                      style={{ color: isActive('/admin/dashboard') ? '#E8722C' : '#52606D' }}
                    >
                      🛠 管理画面
                    </Link>
                  )}
                  <Link
                    href="/mypage"
                    onClick={() => setMenuOpen(false)}
                    className="text-base font-medium"
                    style={{ color: isActive('/mypage') ? '#E8722C' : '#52606D' }}
                  >
                    マイページ
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full rounded-full border py-3 text-sm font-medium"
                    style={{ borderColor: '#D5D3CB', color: '#1F2933' }}
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-base font-medium"
                    style={{ color: '#52606D' }}
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full py-3 text-center text-sm font-bold text-white"
                    style={{ backgroundColor: '#E8722C' }}
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
