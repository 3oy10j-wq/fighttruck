'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Link href="/" className="text-sm text-orange-400 hover:text-orange-300 mb-6 inline-block">
            ← ホームに戻る
          </Link>
          <h1 className="text-4xl font-bold text-white">プライバシーポリシー</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8 text-gray-300">
          {/* Intro */}
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-6">
            <p className="text-gray-400 mb-2 text-sm">制定日：2024年6月</p>
            <p className="text-gray-400 text-sm">最終改定日：2024年6月</p>
          </div>

          {/* 本文 */}
          <section>
            <p className="text-gray-300 leading-relaxed mb-8">
              ファイトラック運営事務局（以下「当社」）が提供するFightTruck（以下「本サービス」）は、ユーザーのプライバシーを重視しています。本プライバシーポリシーは、本サービスにおけるユーザーの個人情報の収集、利用、管理について説明するものです。
            </p>
          </section>

          {/* 1. 収集する情報 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. 収集する情報</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">1-1. アカウント登録時</h3>
                <p className="text-gray-400 mb-2">以下の情報を収集します：</p>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-2">
                  <li>メールアドレス</li>
                  <li>表示名</li>
                  <li>プロフィール画像</li>
                </ul>
                <p className="text-gray-400 text-sm mt-3">
                  Google ログインをご利用の場合、上記情報はGoogle アカウントから取得されます。当社は、Google アカウント内の他の情報にはアクセスしません。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">1-2. スポット申請・レポート投稿時</h3>
                <p className="text-gray-400 mb-2">以下の情報を収集します：</p>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-2">
                  <li>位置情報（GPS）※ユーザーの明示的な許可を得た場合のみ</li>
                  <li>スポット名、説明、評価、写真</li>
                  <li>投稿日時</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">1-3. お問い合わせ時</h3>
                <p className="text-gray-400 mb-2">以下の情報を収集します：</p>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-2">
                  <li>名前</li>
                  <li>メールアドレス</li>
                  <li>お問い合わせ内容</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">1-4. サービス利用に関する情報</h3>
                <p className="text-gray-400 mb-2">本サービスの提供・改善のため、以下の情報を自動的に収集する場合があります：</p>
                <ul className="list-disc list-inside text-gray-300 space-y-1 ml-2">
                  <li>アクセスログ（ページ閲覧履歴、アクセス時刻など）</li>
                  <li>デバイス情報（ブラウザの種類、OS、IPアドレスなど）</li>
                  <li>Cookie によって識別される情報</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. 利用目的 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. 利用目的</h2>
            <p className="text-gray-400 mb-4">
              当社は、収集した個人情報を以下の目的で利用します：
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-2">
              <li>本サービスの提供、管理、運営</li>
              <li>ユーザーからのお問い合わせへの対応</li>
              <li>本サービスの改善・機能向上</li>
              <li>不正利用の防止、セキュリティの維持</li>
              <li>利用統計の作成、分析（個人を特定できない形での統計）</li>
              <li>本ポリシーで定める範囲内での、関連情報の提供</li>
            </ul>
          </section>

          {/* 3. 第三者サービスの利用 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. 第三者サービスの利用</h2>
            <p className="text-gray-400 mb-4">
              本サービスは、以下の第三者サービスを利用しており、これらのサービスに個人情報が提供される場合があります：
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">3-1. Firebase（Google LLC）</h3>
                <p className="text-gray-400 mb-2">
                  当社は、認証機能およびデータ保存（Firestore）にFirebase を使用しています。メールアドレス、表示名、投稿内容などの情報がFirebase に保存されます。
                </p>
                <p className="text-gray-400 text-sm">
                  詳細は <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">Firebase のプライバシーポリシー</a> をご参照ください。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">3-2. Google Maps</h3>
                <p className="text-gray-400 mb-2">
                  本サービスは地図表示に Google Maps を使用しています。位置情報がGoogle に送信される場合があります。
                </p>
                <p className="text-gray-400 text-sm">
                  詳細は <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">Google のプライバシーポリシー</a> をご参照ください。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">3-3. Google AdSense</h3>
                <p className="text-gray-400 mb-2">
                  本サービスは広告配信に Google AdSense を使用しています。Google は Cookie を使用して、本サービスおよび他のウェブサイトでのアクセス情報に基づいてパーソナライズされた広告を配信します。
                </p>
                <p className="text-gray-400 mb-2">
                  Google 広告内での Cookie の使用を無効にするには、<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">Google 広告設定ページ</a>をご参照ください。
                </p>
                <p className="text-gray-400 text-sm">
                  詳細は <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">Google のプライバシーポリシー</a> をご参照ください。
                </p>
              </div>
            </div>
          </section>

          {/* 4. Cookie の使用 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Cookie の使用</h2>
            <p className="text-gray-400 mb-4">
              本サービスは Cookie を使用しています。Cookie は、ユーザーのブラウザに保存される小さなテキストファイルであり、以下の目的で使用されます：
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-2">
              <li>ユーザーのログイン状態の維持</li>
              <li>ユーザーの設定情報の保存</li>
              <li>サービス利用の分析・改善</li>
              <li>パーソナライズされた広告の配信（Google AdSense）</li>
            </ul>
            <p className="text-gray-400 mt-4">
              ユーザーのブラウザ設定により、Cookie の受け入れを拒否することができます。ただし、Cookie を拒否した場合、本サービスの一部機能が正常に動作しない可能性があります。
            </p>
          </section>

          {/* 5. 情報の第三者提供 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. 情報の第三者提供</h2>
            <p className="text-gray-400">
              当社は、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供いたしません。法令に基づく場合とは、司法機関の命令、法律で許容される範囲での提供などを指します。
            </p>
          </section>

          {/* 6. 情報の保護 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. 情報の保護</h2>
            <p className="text-gray-400">
              当社は、個人情報の紛失、破壊、改ざんおよび不正なアクセスから保護するため、適切なセキュリティ対策を実施しています。ただし、インターネットを通じた完全なセキュリティを保証することはできません。
            </p>
          </section>

          {/* 7. お問い合わせ */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. お問い合わせ</h2>
            <p className="text-gray-400 mb-4">
              本プライバシーポリシーに関するご質問、ご不明な点については、以下よりお問い合わせください：
            </p>
            <div className="inline-block">
              <Link
                href="/contact"
                className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 transition-colors"
              >
                💬 お問い合わせフォーム
              </Link>
            </div>
          </section>

          {/* 変更について */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. ポリシーの変更</h2>
            <p className="text-gray-400">
              当社は、必要に応じて本プライバシーポリシーを変更することがあります。変更があった場合は、本ページに最終改定日を記載して通知いたします。ユーザーが変更後も本サービスを継続して利用された場合、変更に同意したものとみなします。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
