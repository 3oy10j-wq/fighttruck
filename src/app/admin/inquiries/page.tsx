'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { isAdmin } from '@/lib/firebase/admin';
import { getInquiries, updateInquiryStatus, getUnresolvedInquiryCount } from '@/lib/firebase/inquiry-management';
import type { Inquiry } from '@/lib/types';

export default function AdminInquiries() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<(Inquiry & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [unresolvedCount, setUnresolvedCount] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin(user.email)) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [inquiriesData, count] = await Promise.all([
          getInquiries(),
          getUnresolvedInquiryCount(),
        ]);
        setInquiries(inquiriesData);
        setUnresolvedCount(count);
      } catch (error) {
        console.error('問い合わせ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  const handleStatusChange = async (inquiryId: string, newStatus: '未対応' | '対応中' | '対応済み') => {
    try {
      await updateInquiryStatus(inquiryId, newStatus);
      const updatedInquiries = inquiries.map((inq) =>
        inq.id === inquiryId ? { ...inq, status: newStatus } : inq
      );
      setInquiries(updatedInquiries);

      // 未対応件数を更新
      const newCount = updatedInquiries.filter((inq) => inq.status === '未対応').length;
      setUnresolvedCount(newCount);
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!user || !isAdmin(user.email)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
            ← ダッシュボードに戻る
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">💬 問い合わせ管理</h1>
              <p className="text-gray-600 mt-2">ユーザーからの問い合わせ一覧</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-red-100 border border-red-300 rounded-lg px-4 py-2">
                <p className="text-sm text-gray-600 font-medium">未対応件数</p>
                <p className="text-2xl font-bold text-red-600">{unresolvedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 問い合わせ一覧 */}
        {inquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">問い合わせはまだありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-6">
                  {/* ヘッダー行 */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{inquiry.name}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          inquiry.category === '不具合報告' ? 'bg-red-100 text-red-700' :
                          inquiry.category === '機能要望' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {inquiry.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{inquiry.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(inquiry.createdAt.toDate?.() || inquiry.createdAt).toLocaleString('ja-JP')}
                      </p>
                    </div>

                    {/* ステータス変更 */}
                    <div className="flex items-center gap-2">
                      <select
                        value={inquiry.status}
                        onChange={(e) => handleStatusChange(inquiry.id, e.target.value as any)}
                        className={`px-3 py-2 rounded-lg border font-medium text-sm cursor-pointer transition-colors ${
                          inquiry.status === '未対応' ? 'bg-red-50 border-red-300 text-red-700' :
                          inquiry.status === '対応中' ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
                          'bg-green-50 border-green-300 text-green-700'
                        }`}
                      >
                        <option value="未対応">未対応</option>
                        <option value="対応中">対応中</option>
                        <option value="対応済み">対応済み</option>
                      </select>
                      <button
                        onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
                        className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        {expandedId === inquiry.id ? '▲ 閉じる' : '▼ 表示'}
                      </button>
                    </div>
                  </div>

                  {/* 本文（展開時のみ表示） */}
                  {expandedId === inquiry.id && (
                    <div className="border-t pt-4 mt-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {inquiry.message}
                        </p>
                      </div>
                      {inquiry.userId && (
                        <p className="text-xs text-gray-500 mt-3">
                          ユーザーID: {inquiry.userId}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
