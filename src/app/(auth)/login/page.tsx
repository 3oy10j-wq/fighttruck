'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginWithEmail, signInWithGoogle } from '@/lib/firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-accent/20 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-ink">ログイン</h1>
          <p className="mt-2 text-sm text-ink/60">FightTruckへようこそ</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-ink/10" />
          <span className="text-xs text-ink/40">または</span>
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-ink/15 py-2.5 font-medium text-ink transition hover:bg-ink/5 disabled:opacity-50"
        >
          Googleでログイン
        </button>

        <p className="text-center text-sm text-ink/60">
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="font-medium text-accent hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
