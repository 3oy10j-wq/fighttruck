'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Link href="/" className="text-sm text-orange-400 hover:text-orange-300 mb-6 inline-block">
            ← ホームに戻る
          </Link>
          <h1 className="text-4xl font-bold text-white">運営者情報</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">
          {/* サービス紹介 */}
          <section className="rounded-lg bg-slate-900 border border-slate-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">FightTruck について</h2>

            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-3">サービス名</h3>
                <p className="text-gray-300 text-lg font-bold">FightTruck（ファイトラック）</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-3">サービス概要</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  FightTruck は、トラックドライバーのための休憩スポット検索サービスです。
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  2024年の改善基準告示改正により、ドライバーの休憩時間取得が法的に厳格化されました。本サービスは、安全で衛生的な休憩スポット情報をドライバー同士で共有することで、長時間労働の疲労軽減と安全運転の実現を支援することを目的としています。
                </p>
                <p className="text-gray-300 leading-relaxed">
                  ドライバーの皆さまが投稿されたリアルな評価・コメントをもとに、最適な休憩スポットを見つけることができます。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-3">主な機能</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-2">
                  <li>スポット検索：地図上から周辺の休憩スポットを検索</li>
                  <li>スポット評価：駐車のしやすさ、清潔さ、総合満足度を評価</li>
                  <li>コミュニティ：ドライバーのリアルな体験を共有</li>
                  <li>プロフィール管理：個人の投稿履歴を一元管理</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 運営者情報 */}
          <section className="rounded-lg bg-slate-900 border border-slate-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">運営会社</h2>

            <div className="space-y-4 text-gray-300">
              <div className="flex justify-between border-b border-slate-700 pb-3">
                <span className="font-semibold text-gray-400">運営者名</span>
                <span className="text-gray-300">ファイトラック運営事務局</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-3">
                <span className="font-semibold text-gray-400">代表者</span>
                <span className="text-gray-300">中川拓人</span>
              </div>
              <div className="flex justify-between pb-3">
                <span className="font-semibold text-gray-400">事業内容</span>
                <span className="text-gray-300">Webサービス開発・運営</span>
              </div>
            </div>
          </section>

          {/* お問い合わせ */}
          <section className="rounded-lg bg-slate-900 border border-slate-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">お問い合わせ</h2>

            <p className="text-gray-300 mb-6">
              本サービスに関するご質問、ご意見、ご報告は、以下のお問い合わせフォームよりお気軽にお問い合わせください。
            </p>

            <Link
              href="/contact"
              className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 transition-colors"
            >
              💬 お問い合わせフォーム
            </Link>
          </section>

          {/* ポリシー */}
          <section className="rounded-lg bg-slate-900 border border-slate-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">ご確認ください</h2>

            <div className="space-y-3">
              <p className="text-gray-300">
                本サービスをご利用いただく前に、以下をご確認ください：
              </p>
              <div className="flex gap-3">
                <Link
                  href="/privacy"
                  className="inline-block rounded-lg bg-slate-800 px-6 py-2 font-bold text-orange-400 hover:text-orange-300 hover:bg-slate-700 transition-colors"
                >
                  📋 プライバシーポリシー
                </Link>
              </div>
            </div>
          </section>

          {/* 最後の一文 */}
          <div className="text-center text-gray-500 text-sm pt-6 border-t border-slate-800">
            <p>ドライバーの安全と快適な運行をサポートするため、日々改善を続けています。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
