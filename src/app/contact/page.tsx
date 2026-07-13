'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ContactPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'不具合報告' | '機能要望' | 'その他'>('その他');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ログイン中のユーザー情報を自動入力
  useEffect(() => {
    if (!authLoading && user && profile) {
      setName(profile.name || '');
      setEmail(user.email || '');
    }
  }, [user, profile, authLoading]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // 必須項目チェック
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('すべての項目を入力してください');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          category,
          message: message.trim(),
          userId: user?.uid || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '送信に失敗しました');
      }

      // ✅ 送信成功：必ずローディングを解除して完了メッセージを表示
      setStatus('success');
      // フォームをリセット
      setName('');
      setEmail('');
      setCategory('その他');
      setMessage('');
      setLoading(false);
    } catch (error) {
      // ✅ エラーが発生した場合も必ずローディングを解除
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '送信に失敗しました。もう一度お試しください。');
      console.error('❌ 問い合わせ送信エラー:', error);
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base px-4 py-12">
        <div className="text-center text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4 py-12">
      <div className="w-full max-w-2xl space-y-6 rounded-2xl border border-accent/20 bg-white p-8 shadow-sm relative">
        {/* ✕ 閉じるボタン */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 font-bold text-2xl leading-none"
          aria-label="閉じる"
          title="閉じる"
        >
          ×
        </button>

        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-black">お問い合わせ</h1>
          <p className="mt-2 text-sm text-gray-700">
            ご質問、ご要望、不具合報告などお気軽にお寄せください
          </p>
        </div>

        {status === 'success' ? (
          <div className="space-y-6">
            <div className="rounded-lg bg-green-50 px-6 py-6 text-sm text-green-800 font-medium border border-green-200 leading-relaxed">
              <p className="mb-3">✅ お問い合わせを送信いただきありがとうございました</p>
              <p>
                ご入力いただいた内容を確認の上、通常3営業日以内にご連絡させていただきます。
              </p>
              <p className="mt-2">
                ご不明な点やご急のお問い合わせは、お気軽にお声がけください。
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                ← トップページに戻る
              </Link>
            </div>
          </div>
        ) : (
          <>
            {status === 'error' && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 font-medium border border-red-200">
                {errorMessage}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* お名前 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black font-medium focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-500"
                  placeholder="田中太郎"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black font-medium focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-500"
                  placeholder="your@email.com"
                />
              </div>

              {/* 種別 */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-black mb-1">
                  種別 <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black font-medium focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="不具合報告">不具合報告</option>
                  <option value="機能要望">機能要望</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              {/* 本文 */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-black mb-1">
                  本文 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black font-medium focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-500 resize-none"
                  placeholder="お問い合わせの内容をお聞かせください..."
                />
              </div>

              {/* 送信ボタン */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? '送信中...' : '送信する'}
              </button>
            </form>

            <div className="text-center text-xs text-gray-600">
              <p>
                ご入力いただいた個人情報は、問い合わせへのご対応にのみ使用いたします。
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
