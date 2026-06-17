import Link from 'next/link';

const LINKS = [
  { href: '/spots', label: 'スポット検索' },
  { href: '/login', label: 'ログイン' },
  { href: '/register', label: '新規登録' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0f1e] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="text-xl">🚛</span>
            <span>ファイトラック</span>
          </Link>
          <nav className="flex gap-6">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-[#94a3b8] transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-center text-xs text-[#94a3b8]">
          © 2024 ファイトラック. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
