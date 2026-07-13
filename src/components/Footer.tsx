import Link from 'next/link';
import { Truck } from 'lucide-react';

const LINKS = [
  { href: '/spots', label: 'スポット検索' },
  { href: '/contact', label: 'お問い合わせ' },
  { href: '/privacy', label: 'プライバシーポリシー' },
  { href: '/about', label: '運営者情報' },
  { href: '/login', label: 'ログイン' },
  { href: '/register', label: '新規登録' },
];

export default function Footer() {
  return (
    <footer className="border-t px-4 py-10" style={{ borderColor: '#EEECE5', backgroundColor: '#FFFFFF' }}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-bold" style={{ color: '#1F2933' }}>
            <Truck
              size={24}
              strokeWidth={1.8}
              className="flex-shrink-0"
              style={{ color: '#E8722C' }}
            />
            <span>ファイトラック</span>
          </Link>
          <nav className="flex gap-6">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm transition-colors hover:text-orange-500"
                style={{ color: '#52606D' }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-center text-xs" style={{ color: '#7B8794' }}>
          © 2024 ファイトラック. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
