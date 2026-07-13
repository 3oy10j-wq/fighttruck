'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { isAdmin } from '@/lib/firebase/admin';
import { getPendingSubmissions, approveSubmission, rejectSubmission, getApprovedUserSpots, revokeApproval, updateSubmission } from '@/lib/firebase/submission-management';
import type { SpotSubmission, Spot } from '@/lib/types';

interface PendingSubmission extends SpotSubmission {
  id: string;
}

interface ApprovedSpot extends Spot {
  id: string;
}

interface EditingSubmission {
  name: string;
  type: 'convenience' | 'parking' | 'gas_station' | 'other';
  can_park: 'yes' | 'maybe' | 'no';
  comment: string;
}

export default function SubmissionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'pending' | 'approved'>('pending');
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [approvedSpots, setApprovedSpots] = useState<ApprovedSpot[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditingSubmission | null>(null);

  // 管理者チェック
  useEffect(() => {
    if (!loading && (!user || !isAdmin(user.email))) {
      router.push('/');
    }
  }, [user, loading, router]);

  // 申請一覧と承認済みスポットを取得
  useEffect(() => {
    if (!user || !isAdmin(user.email)) return;

    const fetchData = async () => {
      try {
        setDataLoading(true);
        const [pendingData, approvedData] = await Promise.all([
          getPendingSubmissions(),
          getApprovedUserSpots(),
        ]);
        setSubmissions(pendingData as PendingSubmission[]);
        setApprovedSpots(approvedData as ApprovedSpot[]);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApprove = async (submissionId: string) => {
    setProcessing(submissionId);
    setError(null);
    try {
      await approveSubmission(submissionId);
      setSubmissions(submissions.filter((s) => s.id !== submissionId) as PendingSubmission[]);
    } catch (err) {
      setError('承認に失敗しました。もう一度試してください。');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    setProcessing(submissionId);
    setError(null);
    try {
      await rejectSubmission(submissionId);
      setSubmissions(submissions.filter((s) => s.id !== submissionId) as PendingSubmission[]);
    } catch (err) {
      setError('却下に失敗しました。もう一度試してください。');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleRevoke = async (spotId: string, submissionId: string) => {
    setProcessing(spotId);
    setError(null);
    try {
      await revokeApproval(spotId, submissionId);
      setApprovedSpots(approvedSpots.filter((s) => s.id !== spotId));
    } catch (err) {
      setError('承認取り消しに失敗しました。もう一度試してください。');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleEditStart = (submission: PendingSubmission) => {
    setEditingId(submission.id);
    setEditData({
      name: submission.name,
      type: submission.type,
      can_park: submission.can_park,
      comment: submission.comment || '',
    });
  };

  const handleEditSave = async (submissionId: string) => {
    if (!editData) return;

    setProcessing(submissionId);
    setError(null);
    try {
      await updateSubmission(submissionId, editData);

      // ローカルの状態を更新
      setSubmissions(submissions.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              name: editData.name,
              type: editData.type,
              can_park: editData.can_park,
              comment: editData.comment,
            }
          : s
      ));

      setEditingId(null);
      setEditData(null);
    } catch (err) {
      setError('編集の保存に失敗しました。もう一度試してください。');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">スポット申請レビュー</h1>

          {/* タブ */}
          <div className="flex gap-0 border-b border-gray-200 mb-6">
            <button
              onClick={() => setTab('pending')}
              className={`px-4 py-3 font-bold transition-colors ${
                tab === 'pending'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 承認待ち ({submissions.length}件)
            </button>
            <button
              onClick={() => setTab('approved')}
              className={`px-4 py-3 font-bold transition-colors ${
                tab === 'approved'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✓ 承認済み ({approvedSpots.length}件)
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* 承認待ちタブ */}
        {tab === 'pending' && (
          <>
            {submissions.length === 0 ? (
              <div className="rounded-lg bg-white px-6 py-12 text-center border border-gray-200">
                <p className="text-gray-500 text-lg">承認待ちの申請はありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
              <div
                key={submission.id}
                className="rounded-lg bg-white border border-gray-200 overflow-hidden"
              >
                {/* ヘッダー */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{submission.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        申請者: {submission.submitterName || '匿名'} • 申請日: {new Date(submission.createdAt.toDate()).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      submission.type === 'convenience' ? 'bg-blue-100 text-blue-700' :
                      submission.type === 'parking' ? 'bg-green-100 text-green-700' :
                      submission.type === 'gas_station' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {submission.type === 'convenience' ? 'コンビニ' :
                       submission.type === 'parking' ? '駐車場' :
                       submission.type === 'gas_station' ? 'ガソリンスタンド' :
                       'その他'}
                    </span>
                  </div>
                </div>

                {/* 内容 - 表示モード */}
                {editingId !== submission.id && (
                  <div className="px-6 py-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">座標</p>
                        <p className="text-sm text-gray-900 font-mono">
                          {submission.lat.toFixed(6)}, {submission.lng.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">大型トラック対応</p>
                        <p className="text-sm text-gray-900 font-bold">
                          {submission.can_park === 'yes' ? '✓ 停められた' :
                           submission.can_park === 'maybe' ? '△ 微妙' :
                           '✗ 無理'}
                        </p>
                      </div>
                    </div>

                    {submission.comment && (
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">コメント</p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                          {submission.comment}
                        </p>
                      </div>
                    )}

                    {submission.imageUrl && (
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-2">写真</p>
                        <img
                          src={submission.imageUrl}
                          alt="申請画像"
                          className="max-w-xs rounded border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 内容 - 編集モード */}
                {editingId === submission.id && editData && (
                  <div className="px-4 sm:px-6 py-4 space-y-4 bg-blue-50 border-t border-b border-blue-200">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">施設名</label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black bg-white font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">タイプ</label>
                        <select
                          value={editData.type}
                          onChange={(e) => setEditData({ ...editData, type: e.target.value as 'convenience' | 'parking' | 'gas_station' | 'other' })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black bg-white font-semibold"
                        >
                          <option value="convenience">コンビニ</option>
                          <option value="parking">駐車場</option>
                          <option value="gas_station">ガソリンスタンド</option>
                          <option value="other">その他</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">大型トラック対応</label>
                        <select
                          value={editData.can_park}
                          onChange={(e) => setEditData({ ...editData, can_park: e.target.value as 'yes' | 'maybe' | 'no' })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black bg-white font-semibold"
                        >
                          <option value="yes">✓ 停められた</option>
                          <option value="maybe">△ 微妙</option>
                          <option value="no">✗ 無理</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">コメント</label>
                      <textarea
                        value={editData.comment}
                        onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black bg-white font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* ボタン - 表示モード */}
                {editingId !== submission.id && (
                  <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-200 grid grid-cols-2 sm:flex sm:gap-3 sm:justify-end gap-2">
                    <button
                      onClick={() => handleEditStart(submission)}
                      disabled={processing === submission.id}
                      className="px-4 py-3 sm:py-2 rounded-lg border-2 border-blue-500 text-blue-600 font-bold hover:bg-blue-50 disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-500 transition-colors text-sm sm:text-base"
                    >
                      ✏️ 編集
                    </button>
                    <button
                      onClick={() => handleReject(submission.id)}
                      disabled={processing === submission.id}
                      className="px-4 py-3 sm:py-2 rounded-lg border-2 border-red-500 text-red-600 font-bold hover:bg-red-50 disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-500 transition-colors text-sm sm:text-base"
                    >
                      {processing === submission.id ? '処理中...' : '却下'}
                    </button>
                    <button
                      onClick={() => handleApprove(submission.id)}
                      disabled={processing === submission.id}
                      className="col-span-2 sm:col-span-1 px-4 py-3 sm:py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 disabled:bg-gray-400 transition-colors text-sm sm:text-base"
                    >
                      {processing === submission.id ? '処理中...' : '承認'}
                    </button>
                  </div>
                )}

                {/* ボタン - 編集モード */}
                {editingId === submission.id && (
                  <div className="bg-blue-50 px-4 sm:px-6 py-4 border-t border-blue-200 grid grid-cols-2 sm:flex sm:gap-3 sm:justify-end gap-2">
                    <button
                      onClick={handleEditCancel}
                      disabled={processing === submission.id}
                      className="px-4 py-3 sm:py-2 rounded-lg border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 disabled:bg-gray-200 disabled:text-gray-500 transition-colors text-sm sm:text-base"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => handleEditSave(submission.id)}
                      disabled={processing === submission.id}
                      className="px-4 py-3 sm:py-2 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 disabled:bg-gray-400 transition-colors text-sm sm:text-base"
                    >
                      {processing === submission.id ? '保存中...' : '💾 保存'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
            )}
          </>
        )}

        {/* 承認済みタブ */}
        {tab === 'approved' && (
          <>
            {approvedSpots.length === 0 ? (
              <div className="rounded-lg bg-white px-6 py-12 text-center border border-gray-200">
                <p className="text-gray-500 text-lg">承認済みスポットはありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedSpots.map((spot) => (
                  <div
                    key={spot.id}
                    className="rounded-lg bg-white border border-gray-200 overflow-hidden"
                  >
                    {/* ヘッダー */}
                    <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{spot.name}</h2>
                          <p className="text-sm text-gray-600 mt-1">
                            承認日: {spot.createdAt ? new Date(spot.createdAt.toDate()).toLocaleDateString('ja-JP') : 'N/A'}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-200 text-green-700">
                          ✓ 承認済み
                        </span>
                      </div>
                    </div>

                    {/* 内容 */}
                    <div className="px-6 py-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 font-medium">座標</p>
                          <p className="text-sm text-gray-900 font-mono">
                            {spot.lat.toFixed(6)}, {spot.lng.toFixed(6)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">地図上</p>
                          <p className="text-sm text-green-600 font-bold">🟢 緑ピンで表示中</p>
                        </div>
                      </div>
                    </div>

                    {/* ボタン */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
                      <button
                        onClick={() => handleRevoke(spot.id, spot.submissionId || '')}
                        disabled={processing === spot.id || !spot.submissionId}
                        className="px-4 py-2 rounded-lg border-2 border-red-500 text-red-600 font-bold hover:bg-red-50 disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-500 transition-colors"
                      >
                        {processing === spot.id ? '処理中...' : '承認取り消し'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
