'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginWithEmail, signInWithGoogle, resetPassword } from '@/lib/firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.push('/mypage');
    } catch {
      setError('メールアドレスまたはパスワードが正しくありません。');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/mypage');
    } catch {
      setError('Googleログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetMessage('メールアドレスを入力してください。');
      setResetStatus('error');
      return;
    }

    setResetStatus('loading');
    setResetMessage(null);
    try {
      // Firebaseのパスワードリセット機能を呼ぶ
      // （メール列挙保護により、登録の有無は確実に判定できないため、
      //   常に同じメッセージを返す）
      await resetPassword(resetEmail);

      setResetStatus('success');
      setResetMessage('再設定用のメールを送信しました（ご登録がある場合）。数分待ってもメールが届かない場合は、Googleログインで登録されている可能性があります。その場合は「Googleでログイン」からお入りください。');
      setResetEmail('');
    } catch (err) {
      // エラーが発生した場合でも、ユーザーを不安にさせないメッセージ
      setResetStatus('success');
      setResetMessage('再設定用のメールを送信しました（ご登録がある場合）。数分待ってもメールが届かない場合は、Googleログインで登録されている可能性があります。その場合は「Googleでログイン」からお入りください。');
      setResetEmail('');
      console.error('❌ パスワードリセットエラー:', err);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-accent/20 bg-white p-8 shadow-sm">
        {!isResetMode ? (
          <>
            <div className="text-center">
              <h1 className="font-serif text-2xl font-bold text-black">ログイン</h1>
              <p className="mt-2 text-sm text-gray-700">FightTruckへようこそ</p>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 font-medium">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black font-medium focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-500"
            />
          </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black">
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black font-medium focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                ログイン
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsResetMode(true)}
                className="text-sm text-accent hover:underline font-medium"
              >
                パスワードをお忘れですか？
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-300" />
              <span className="text-xs text-gray-600">または</span>
              <div className="h-px flex-1 bg-gray-300" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 font-medium text-black transition hover:bg-gray-100 disabled:opacity-50"
            >
              Googleでログイン
            </button>

            <p className="text-center text-sm text-gray-700">
              アカウントをお持ちでない方は{' '}
              <Link href="/register" className="font-medium text-accent hover:underline">
                新規登録
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="text-center">
              <h1 className="font-serif text-2xl font-bold text-black">パスワード再設定</h1>
            </div>

            {/* 上部の案内文 */}
            <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-gray-900 border border-blue-200">
              <p className="font-semibold text-gray-900 mb-2">🔹 Googleでログインされた方へ</p>
              <p className="text-gray-800">Googleでログインされた方は、パスワードの再設定は不要です。ログイン画面の「Googleでログイン」からお入りください。</p>
              <p className="text-gray-700 mt-2">メールアドレスとパスワードで登録された方のみ、下記から再設定してください。</p>
            </div>

            {resetStatus === 'success' && (
              <div className="space-y-4">
                <p className="rounded-lg bg-green-50 px-4 py-4 text-sm text-green-800 font-medium border border-green-200 leading-relaxed">
                  {resetMessage}
                </p>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      setResetStatus('idle');
                      setResetMessage(null);
                      setResetEmail('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    ← ログインに戻る
                  </button>
                </div>
              </div>
            )}

            {resetStatus !== 'success' && (
              <>
                {resetStatus === 'error' && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 font-medium border border-red-200">
                    {resetMessage}
                  </p>
                )}

                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-black">
                      メールアドレス
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black font-medium focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-gray-500"
                      placeholder="your@email.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetStatus === 'loading'}
                    className="w-full rounded-lg bg-accent py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {resetStatus === 'loading' ? '送信中...' : '再設定メールを送信'}
                  </button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      setResetStatus('idle');
                      setResetMessage(null);
                      setResetEmail('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    ← ログインに戻る
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
