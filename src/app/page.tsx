import Link from 'next/link';

const FEATURE_CARDS = [
  { icon: '🚛', title: '休憩スポット共有', desc: 'シャワー・仮眠室・大型駐車場など全国のスポットを検索・共有' },
  { icon: '📻', title: 'ドライバー交流掲示板', desc: '路線情報・渋滞・天気など現場のリアルな情報を交換' },
  { icon: '🍜', title: 'おすすめグルメ情報', desc: 'ドライバー御用達の食堂・SA・PAのおすすめメシを共有' },
  { icon: '💬', title: '仕事の相談', desc: '待遇・会社選び・働き方の悩みをベテランドライバーに相談' },
  { icon: '📅', title: 'イベント情報', desc: 'ドライバー向けイベント・安全講習・交流会の最新情報' },
  { icon: '💼', title: '求人情報', desc: '条件の良い求人を現役ドライバーの口コミ付きで紹介' },
];

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0f1e] via-[#111827] to-[#0f172a] px-4 py-24 md:py-36">

        {/* 背景の装飾グリッド */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(249,115,22,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* オレンジのグロー */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#f97316]/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* テキスト */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-4 py-2 text-sm font-medium text-[#f97316]">
                <span>🚛</span>
                <span>トラックドライバーのためのコミュニティ</span>
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                全国のドライバーと<br />
                <span className="text-[#f97316]">つながる。</span>
              </h1>
              <p className="text-lg leading-relaxed text-[#94a3b8] md:text-xl">
                休憩場所、仕事の悩み、情報共有。<br />
                トラックドライバーのためのコミュニティ。
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#f97316] px-8 text-base font-bold text-white transition-all hover:scale-105 hover:bg-[#ea6d0e] hover:shadow-xl hover:shadow-orange-500/30"
                >
                  今すぐ参加する
                </Link>
                <Link
                  href="/spots"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/20 px-8 text-base font-medium text-white transition-all hover:scale-105 hover:border-white/40 hover:bg-white/10"
                >
                  スポットを探す
                </Link>
              </div>
            </div>

            {/* トラックSVGイラスト */}
            <div className="flex justify-center">
              <svg viewBox="0 0 480 280" className="w-full max-w-md drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                {/* 道路 */}
                <rect x="0" y="230" width="480" height="50" rx="4" fill="#1e293b" />
                <rect x="0" y="248" width="480" height="4" fill="#334155" />
                {/* センターライン */}
                <rect x="40" y="253" width="60" height="3" rx="1.5" fill="#f97316" opacity="0.6" />
                <rect x="140" y="253" width="60" height="3" rx="1.5" fill="#f97316" opacity="0.6" />
                <rect x="240" y="253" width="60" height="3" rx="1.5" fill="#f97316" opacity="0.6" />
                <rect x="340" y="253" width="60" height="3" rx="1.5" fill="#f97316" opacity="0.6" />
                {/* トレーラー荷台 */}
                <rect x="20" y="130" width="280" height="100" rx="8" fill="#2d3748" stroke="#3b82f6" strokeWidth="2" />
                <rect x="25" y="135" width="270" height="20" rx="4" fill="#374151" />
                <text x="155" y="188" textAnchor="middle" fill="#f97316" fontSize="18" fontWeight="bold" fontFamily="sans-serif">ファイトラック</text>
                {/* キャブ */}
                <rect x="300" y="150" width="150" height="80" rx="8" fill="#1e40af" stroke="#3b82f6" strokeWidth="2" />
                {/* フロントガラス */}
                <rect x="390" y="158" width="52" height="40" rx="4" fill="#bfdbfe" opacity="0.7" />
                {/* サイドウィンドウ */}
                <rect x="308" y="158" width="75" height="35" rx="4" fill="#bfdbfe" opacity="0.5" />
                {/* バンパー */}
                <rect x="295" y="225" width="165" height="10" rx="4" fill="#374151" />
                {/* ヘッドライト */}
                <circle cx="450" cy="220" r="8" fill="#fef08a" opacity="0.9" />
                <ellipse cx="450" cy="220" rx="16" ry="8" fill="#fef08a" opacity="0.2" />
                {/* タイヤ */}
                <circle cx="80" cy="232" r="22" fill="#111827" stroke="#475569" strokeWidth="3" />
                <circle cx="80" cy="232" r="10" fill="#1e293b" />
                <circle cx="220" cy="232" r="22" fill="#111827" stroke="#475569" strokeWidth="3" />
                <circle cx="220" cy="232" r="10" fill="#1e293b" />
                <circle cx="340" cy="232" r="22" fill="#111827" stroke="#475569" strokeWidth="3" />
                <circle cx="340" cy="232" r="10" fill="#1e293b" />
                <circle cx="420" cy="232" r="22" fill="#111827" stroke="#475569" strokeWidth="3" />
                <circle cx="420" cy="232" r="10" fill="#1e293b" />
                {/* 星（夜空） */}
                <circle cx="50" cy="40" r="2" fill="white" opacity="0.6" />
                <circle cx="120" cy="20" r="1.5" fill="white" opacity="0.5" />
                <circle cx="200" cy="50" r="2" fill="white" opacity="0.7" />
                <circle cx="320" cy="30" r="1.5" fill="white" opacity="0.5" />
                <circle cx="400" cy="60" r="2" fill="white" opacity="0.6" />
                <circle cx="460" cy="25" r="1.5" fill="white" opacity="0.4" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* 統計バー */}
      <section className="border-y border-white/10 bg-[#111827] px-4 py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6 text-center">
          {[
            { num: '21+', label: '登録スポット' },
            { num: '全国', label: '対応エリア' },
            { num: '無料', label: '完全無料' },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-[#f97316] md:text-4xl">{num}</p>
              <p className="mt-1 text-sm text-[#94a3b8]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 機能カードセクション */}
      <section className="bg-[#0a0f1e] px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              ドライバーの毎日を<span className="text-[#f97316]">サポート</span>
            </h2>
            <p className="mt-4 text-[#94a3b8]">現場で役立つ機能を、すべて一か所に。</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_CARDS.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/10 bg-[#111827] p-6 transition-all duration-300 hover:border-[#f97316]/40 hover:shadow-lg hover:shadow-orange-500/10"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10 text-2xl transition-transform duration-300 group-hover:scale-110">
                  {icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-[#94a3b8]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="bg-gradient-to-r from-[#1e3a5f] to-[#1e40af] px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            今日から仲間に加わろう
          </h2>
          <p className="mt-4 text-lg text-blue-200">
            登録無料。全国のドライバーと情報をシェアしよう。
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#f97316] px-10 text-base font-bold text-white transition-all hover:scale-105 hover:bg-[#ea6d0e] hover:shadow-xl hover:shadow-orange-500/40"
            >
              無料で始める
            </Link>
            <Link
              href="/spots"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/30 px-10 text-base font-medium text-white transition-all hover:scale-105 hover:bg-white/10"
            >
              スポットを見る
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
