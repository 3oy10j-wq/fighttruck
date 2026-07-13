'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { Truck, CheckCircle, Users, Plus, Star, MapPin, MessageSquare, User } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col bg-white">
      {/* ── ヒーローセクション ── */}
      <section className="relative w-full overflow-hidden px-4 py-20 md:py-32">
        {/* ヒーロー背景画像 */}
        <div className="absolute inset-0">
          <Image
            src="/hero.jpg"
            alt="トラックドライバー向け休憩スポット"
            fill
            className="object-cover object-center md:object-[center_35%]"
            priority
            quality={85}
          />
        </div>

        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative mx-auto max-w-5xl">
          <div className="space-y-6 text-center md:space-y-8">
            {/* 小ラベル */}
            <div className="inline-block" style={{ color: '#F5C26B' }}>
              <span className="text-xs font-bold tracking-widest md:text-sm">
                トラックドライバーのための休憩スポット検索サイト
              </span>
            </div>

            {/* キャッチコピー */}
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              あなたの休憩が、<br />
              誰かの明日を運ぶ。
            </h1>

            {/* サブコピー */}
            <p className="mx-auto max-w-2xl text-lg text-gray-100 leading-relaxed md:text-xl">
              大型トラックOK・24時間・シャワーの有無まで。全国1,150件以上から、今すぐ停められる場所が見つかる。
            </p>

            {/* CTA ボタン */}
            <div className="flex justify-center pt-4">
              <Link
                href="/spots"
                className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#E8722C' }}
              >
                近くのスポットを探す
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 数字セクション ── */}
      <section id="stats" className="w-full px-4 py-20 md:py-28" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* 統計1 */}
            <div className="text-center">
              <p className="mb-2 text-5xl font-bold md:text-6xl" style={{ color: '#E8722C' }}>
                1,150
              </p>
              <p className="text-lg font-semibold" style={{ color: '#1F2933' }}>
                件以上のスポット
              </p>
              <p className="text-sm" style={{ color: '#52606D' }}>
                収録スポット数
              </p>
            </div>

            {/* 統計2 */}
            <div className="text-center">
              <p className="mb-2 text-5xl font-bold md:text-6xl" style={{ color: '#E8722C' }}>
                47
              </p>
              <p className="text-lg font-semibold" style={{ color: '#1F2933' }}>
                都道府県
              </p>
              <p className="text-sm" style={{ color: '#52606D' }}>
                全国カバー
              </p>
            </div>

            {/* 統計3 */}
            <div className="text-center">
              <p className="mb-2 text-5xl font-bold md:text-6xl" style={{ color: '#E8722C' }}>
                0
              </p>
              <p className="text-lg font-semibold" style={{ color: '#1F2933' }}>
                円
              </p>
              <p className="text-sm" style={{ color: '#52606D' }}>
                ずっと無料
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 特徴セクション ── */}
      <section className="w-full px-4 py-20 md:py-28" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="mx-auto max-w-5xl">
          {/* セクション見出し */}
          <div className="mb-16 text-center md:mb-20">
            <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#1F2933' }}>
              走るプロのための、3つの安心
            </h2>
          </div>

          {/* カード3枚 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* カード1 */}
            <div
              className="rounded-xl border p-8 transition-all hover:shadow-lg"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
            >
              <div className="mb-4 inline-flex rounded-2xl p-3" style={{ backgroundColor: '#FFF3E9' }}>
                <Truck className="h-6 w-6" style={{ color: '#E8722C' }} />
              </div>
              <h3 className="mb-3 text-xl font-bold" style={{ color: '#1F2933' }}>
                大型トラックでも、余裕で停められる
              </h3>
              <p className="text-base leading-relaxed" style={{ color: '#52606D' }}>
                駐車スペースの広さ・大型可否を事前にチェック。「行ってみたら停められなかった」をなくします。
              </p>
            </div>

            {/* カード2 */}
            <div
              className="rounded-xl border p-8 transition-all hover:shadow-lg"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
            >
              <div className="mb-4 inline-flex rounded-2xl p-3" style={{ backgroundColor: '#FFF3E9' }}>
                <CheckCircle className="h-6 w-6" style={{ color: '#E8722C' }} />
              </div>
              <h3 className="mb-3 text-xl font-bold" style={{ color: '#1F2933' }}>
                運営が確認した正しい情報
              </h3>
              <p className="text-base leading-relaxed" style={{ color: '#52606D' }}>
                ユーザー投稿のスポットは運営が確認してから掲載。「運営確認済み」バッジが目印。
              </p>
            </div>

            {/* カード3 */}
            <div
              className="rounded-xl border p-8 transition-all hover:shadow-lg"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
            >
              <div className="mb-4 inline-flex rounded-2xl p-3" style={{ backgroundColor: '#FFF3E9' }}>
                <Users className="h-6 w-6" style={{ color: '#E8722C' }} />
              </div>
              <h3 className="mb-3 text-xl font-bold" style={{ color: '#1F2933' }}>
                ドライバー同士で情報交換
              </h3>
              <p className="text-base leading-relaxed" style={{ color: '#52606D' }}>
                「今日は満車だった」「シャワーがきれい」——現場のリアルな報告が集まる。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 投稿呼びかけセクション ── */}
      <section className="w-full px-4 py-20 md:py-28" style={{ backgroundColor: '#FFF3E9' }}>
        <div className="mx-auto max-w-3xl text-center">
          {/* 丸アイコン */}
          <div className="mb-6 flex justify-center">
            <div
              className="flex items-center justify-center rounded-full p-4"
              style={{ backgroundColor: '#E8722C' }}
            >
              <Plus className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* 見出し */}
          <h2 className="mb-6 text-3xl font-bold md:text-4xl" style={{ color: '#1F2933' }}>
            あなたの「いつもの場所」が、誰かを助ける。
          </h2>

          {/* 本文 */}
          <p className="mb-8 text-lg leading-relaxed" style={{ color: '#52606D' }}>
            「ここ、意外と停められるんだよな」——
            <br className="hidden sm:inline" />
            そんなあなただけが知っている休憩スポットを、ぜひ教えてください。
            <br className="hidden sm:inline" />
            あなたの投稿が、全国のドライバーの助けになります。
          </p>

          {/* ボタン */}
          <Link
            href="/spots"
            className="inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#E8722C' }}
          >
            休憩スポットを投稿する
          </Link>
        </div>
      </section>

      {/* ── 会員登録のメリット ── */}
      {!user && (
        <section className="w-full px-4 py-20 md:py-28" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="mx-auto max-w-5xl">
            {/* ラベル */}
            <div className="mb-6 text-center" style={{ color: '#E8722C', letterSpacing: '0.14em' }}>
              <span className="text-sm font-bold tracking-widest">FREE MEMBERSHIP</span>
            </div>

            {/* 見出し */}
            <h2 className="mb-4 text-center text-2xl font-bold md:text-3xl" style={{ color: '#1F2933' }}>
              登録しなくても使えます。でも、登録するともっと便利に。
            </h2>

            {/* サブテキスト */}
            <p className="mx-auto mb-12 max-w-2xl text-center text-base leading-relaxed" style={{ color: '#52606D' }}>
              スポット検索は登録なしで誰でも利用OK。
              <br />
              無料の会員登録をすると、次のことができるようになります。
            </p>

            {/* メリットカード 4つ */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-12">
              {/* カード1: お気に入り登録 */}
              <div
                className="rounded-xl border p-8"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
              >
                <div className="mb-4 inline-flex rounded-2xl p-3" style={{ backgroundColor: '#FFF3E9' }}>
                  <Star className="h-6 w-6" style={{ color: '#E8722C' }} />
                </div>
                <h3 className="mb-3 text-lg font-bold" style={{ color: '#1F2933' }}>
                  ★ お気に入り登録
                </h3>
                <p className="text-base leading-relaxed" style={{ color: '#52606D' }}>
                  よく使うスポットを保存して、マイページからすぐアクセス。
                </p>
              </div>

              {/* カード2: スポットの投稿 */}
              <div
                className="rounded-xl border p-8"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
              >
                <div className="mb-4 inline-flex rounded-2xl p-3" style={{ backgroundColor: '#FFF3E9' }}>
                  <MapPin className="h-6 w-6" style={{ color: '#E8722C' }} />
                </div>
                <h3 className="mb-3 text-lg font-bold" style={{ color: '#1F2933' }}>
                  📍 スポットの投稿
                </h3>
                <p className="text-base leading-relaxed" style={{ color: '#52606D' }}>
                  あなたの知っている休憩場所を共有。全国のドライバーの助けに。
                </p>
              </div>

              {/* カード3: リアルタイム報告 */}
              <div
                className="rounded-xl border p-8"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
              >
                <div className="mb-4 inline-flex rounded-2xl p-3" style={{ backgroundColor: '#FFF3E9' }}>
                  <MessageSquare className="h-6 w-6" style={{ color: '#E8722C' }} />
                </div>
                <h3 className="mb-3 text-lg font-bold" style={{ color: '#1F2933' }}>
                  📝 リアルタイム報告
                </h3>
                <p className="text-base leading-relaxed" style={{ color: '#52606D' }}>
                  「今日は満車」「シャワーがきれい」——現場の情報をみんなに届ける。
                </p>
              </div>

              {/* カード4: マイページ */}
              <div
                className="rounded-xl border p-8"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
              >
                <div className="mb-4 inline-flex rounded-2xl p-3" style={{ backgroundColor: '#FFF3E9' }}>
                  <User className="h-6 w-6" style={{ color: '#E8722C' }} />
                </div>
                <h3 className="mb-3 text-lg font-bold" style={{ color: '#1F2933' }}>
                  👤 マイページ
                </h3>
                <p className="text-base leading-relaxed" style={{ color: '#52606D' }}>
                  自分の投稿・お気に入りをまとめて管理。ファイトラック歴も表示。
                </p>
              </div>
            </div>

            {/* CTA ボタン */}
            <div className="text-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-bold text-white transition-all hover:scale-105 active:scale-95 mb-4"
                style={{ backgroundColor: '#E8722C' }}
              >
                無料で会員登録する
              </Link>
              <p className="text-sm" style={{ color: '#7B8794' }}>
                登録は30秒。ずっと無料です。
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── OUR STORY セクション ── */}
      <section
        className="w-full border-t px-4 py-20 md:py-28"
        style={{ borderColor: '#EEECE5', backgroundColor: '#FFFFFF' }}
      >
        <div className="mx-auto max-w-3xl text-center">
          {/* ラベル */}
          <div className="mb-6" style={{ color: '#E8722C', letterSpacing: '0.14em' }}>
            <span className="text-sm font-bold tracking-widest">OUR STORY</span>
          </div>

          {/* 本文 */}
          <p
            className="text-lg leading-loose"
            style={{ color: '#1F2933', lineHeight: '2.0' }}
          >
            作ったのは、トラックを愛するいちファンです。
            <br />
            「今日はどこで休もう」——その悩みに、日本中のドライバーが
            <br />
            毎日向き合っていることを知りました。
            <br />
            日本の物流を支えるプロたちが、安心して休める場所を
            <br />
            すぐに見つけられるように。その一心で、このサービスを作っています。
          </p>

          {/* 署名 */}
          <p className="mt-8 text-sm" style={{ color: '#7B8794' }}>
            — ファイトラック運営事務局
          </p>
        </div>
      </section>
    </div>
  );
}
