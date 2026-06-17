import Link from 'next/link';

const STATS = [
  { value: '21', label: 'スポット登録数', icon: '📍' },
  { value: '100%', label: '公式データのみ', icon: '✅' },
  { value: '24h', label: '対応スポットあり', icon: '🕐' },
  { value: '無料', label: '完全無料で使える', icon: '🎁' },
];

const FEATURES = [
  {
    icon: '🗺️',
    title: 'スポット検索',
    desc: '地域・設備でかんたん絞り込み。見つけたらワンタップでGoogleマップ経路案内。',
  },
  {
    icon: '✅',
    title: '公式データのみ掲載',
    desc: '国土交通省・日本トラック協会の公式データをもとに審査済みのスポットだけを掲載。',
  },
  {
    icon: '📱',
    title: 'ブラウザで使える',
    desc: 'アプリのインストール不要。スマホ・タブレット・PCのブラウザからすぐに使えます。',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col bg-[#0a0f1e]">

      {/* ── ヒーロー ── */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        {/* グリッド背景 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#f97316 1px,transparent 1px),linear-gradient(90deg,#f97316 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* オレンジグロー */}
        <div className="pointer-events-none absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-[#f97316]/10 blur-[120px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">

          {/* 左：テキスト */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-4 py-1.5 text-xs font-semibold text-[#f97316]">
              🚛 トラックドライバー専用サービス
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.2] tracking-tight text-white md:text-5xl">
              全国のトラックドライバーに。<br />
              <span className="text-[#f97316]">休憩スポットを、</span><br />
              もっと簡単に。
            </h1>

            <p className="text-base leading-relaxed text-[#94a3b8] md:text-lg">
              国土交通省・日本トラック協会の公式データのみ掲載。<br />
              安心して使える休憩スポット検索サービス。
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/spots"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#f97316] px-8 text-base font-bold text-white transition-all hover:scale-105 hover:bg-[#ea6d0e] hover:shadow-xl hover:shadow-orange-500/30"
              >
                スポットを探す →
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/25 px-8 text-base font-medium text-white transition-all hover:border-white/50 hover:bg-white/10"
              >
                無料登録する
              </Link>
            </div>
          </div>

          {/* 右：スマホモックアップSVG */}
          <div className="flex justify-center lg:justify-end">
            <svg viewBox="0 0 280 520" className="w-48 drop-shadow-2xl md:w-64" xmlns="http://www.w3.org/2000/svg">
              {/* 本体 */}
              <rect x="10" y="10" width="260" height="500" rx="32" fill="#111827" stroke="#334155" strokeWidth="2"/>
              <rect x="10" y="10" width="260" height="500" rx="32" fill="url(#phoneGrad)"/>
              <defs>
                <linearGradient id="phoneGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1e293b"/>
                  <stop offset="100%" stopColor="#0f172a"/>
                </linearGradient>
              </defs>
              {/* ノッチ */}
              <rect x="100" y="18" width="80" height="14" rx="7" fill="#0f172a"/>
              {/* 地図エリア */}
              <rect x="22" y="45" width="236" height="300" rx="8" fill="#1e3a5f"/>
              {/* 道路 */}
              <line x1="22" y1="195" x2="258" y2="195" stroke="#334155" strokeWidth="8"/>
              <line x1="140" y1="45" x2="140" y2="345" stroke="#334155" strokeWidth="8"/>
              {/* ピン1 */}
              <ellipse cx="140" cy="175" rx="18" ry="6" fill="#f97316" opacity="0.3"/>
              <circle cx="140" cy="155" r="16" fill="#f97316"/>
              <circle cx="140" cy="155" r="8" fill="white"/>
              <polygon points="140,178 130,162 150,162" fill="#f97316"/>
              {/* ピン2（小） */}
              <circle cx="90" cy="110" r="10" fill="#3b82f6"/>
              <circle cx="90" cy="110" r="5" fill="white"/>
              <polygon points="90,126 83,116 97,116" fill="#3b82f6"/>
              {/* ピン3（小） */}
              <circle cx="200" cy="250" r="10" fill="#3b82f6"/>
              <circle cx="200" cy="250" r="5" fill="white"/>
              <polygon points="200,266 193,256 207,256" fill="#3b82f6"/>
              {/* カードパネル */}
              <rect x="22" y="355" width="236" height="130" rx="10" fill="#1e293b"/>
              <text x="38" y="380" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">道の駅 まし子</text>
              <text x="38" y="396" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">栃木県芳賀郡益子町</text>
              {/* 設備バッジ */}
              <rect x="38" y="406" width="36" height="14" rx="7" fill="#f97316" opacity="0.2"/>
              <text x="46" y="416" fill="#f97316" fontSize="8" fontFamily="sans-serif">🅿️ 駐車場</text>
              <rect x="80" y="406" width="30" height="14" rx="7" fill="#3b82f6" opacity="0.2"/>
              <text x="87" y="416" fill="#93c5fd" fontSize="8" fontFamily="sans-serif">🍜 食堂</text>
              {/* ナビボタン */}
              <rect x="38" y="428" width="200" height="36" rx="10" fill="#f97316"/>
              <text x="138" y="451" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">🗺 経路案内</text>
              {/* ホームバー */}
              <rect x="110" y="500" width="60" height="4" rx="2" fill="#475569"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── 統計バー ── */}
      <section className="border-y border-white/10 bg-[#111827] px-4 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 text-center md:grid-cols-4">
          {STATS.map(({ value, label, icon }) => (
            <div key={label} className="space-y-1">
              <div className="text-2xl">{icon}</div>
              <p className="text-3xl font-extrabold text-[#f97316]">{value}</p>
              <p className="text-xs text-[#94a3b8]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 機能カード ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center space-y-3">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              ドライバーが<span className="text-[#f97316]">本当に必要な</span>機能だけ
            </h2>
            <p className="text-[#94a3b8]">余分な機能は作らない。現場で使いやすいことを最優先に。</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/10 bg-[#111827] p-7 transition-all duration-300 hover:border-[#f97316]/40 hover:shadow-xl hover:shadow-orange-500/10"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f97316]/10 text-3xl transition-transform duration-300 group-hover:scale-110">
                  {icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-[#94a3b8]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-white/10 bg-[#111827] px-4 py-20">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            今すぐ無料で始めよう
          </h2>
          <p className="text-[#94a3b8]">
            登録はメールアドレスだけ。1分で完了します。
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[#f97316] px-10 text-base font-bold text-white transition-all hover:scale-105 hover:bg-[#ea6d0e] hover:shadow-xl hover:shadow-orange-500/30"
            >
              無料で始める →
            </Link>
            <Link
              href="/spots"
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/25 px-10 text-base font-medium text-white transition-all hover:bg-white/10"
            >
              まずスポットを見る
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
