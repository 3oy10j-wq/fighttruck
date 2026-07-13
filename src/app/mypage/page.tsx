'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserReports, deleteUserReport, updateUserReport } from '@/lib/firebase/reports';
import { getUserPremiumInfo } from '@/lib/firebase/subscription-management';
import { MessageCircle, Edit2, Trash2, ArrowLeft, Heart } from 'lucide-react';
import { getFirebaseDb } from '@/lib/firebase/config';
import { doc, updateDoc, collection, getDocs, query, where, getDoc, documentId } from 'firebase/firestore';
import { getSpots } from '@/lib/firebase/spots';
import { isFavorited } from '@/lib/firebase/favorites';
import type { Report } from '@/lib/types';

export default function MypagePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Report>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [premiumInfo, setPremiumInfo] = useState<{ isPremium: boolean; subscriptionStatus: string | null } | null>(null);

  // 段階2機能
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ name: profile?.name || '' });
  const [favorites, setFavorites] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [joinedDaysAgo, setJoinedDaysAgo] = useState<number>(0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const db = getFirebaseDb();

        // レポート取得
        const userReports = await getUserReports(user.uid);
        setReports(userReports);

        // プレミアム情報取得
        const premium = await getUserPremiumInfo(user.uid);
        if (premium) {
          setPremiumInfo(premium);
        }

        // ユーザードキュメント取得（createdAt等）
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // ファイトラック歴を計算
          if (userData.createdAt) {
            const createdDate = userData.createdAt.toDate?.() || new Date(userData.createdAt);
            const today = new Date();
            const diffTime = today.getTime() - createdDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            setJoinedDaysAgo(diffDays);
          }
        }

        // お気に入りスポット取得 (favorites に保存された情報を活用)
        console.log('[マイページ] お気に入い読み込み開始:', user.uid);

        const favoritesRef = collection(db, 'users', user.uid, 'favorites');
        const favoritesSnap = await getDocs(favoritesRef);
        const favoriteDocs = favoritesSnap.docs.map(doc => ({
          ...doc.data(),
          docId: doc.id,
        }));

        console.log('[マイページ] favorites に登録されている:', favoriteDocs.length, '件');

        if (favoriteDocs.length === 0) {
          console.log('[マイページ] お気に入いスポットなし');
          setFavorites([]);
        } else {
          // spotType によって処理を分ける
          const firestoreIds = favoriteDocs.filter(f => f.spotType !== 'michinoeki').map(f => f.spotId);
          const michinoekiDocs = favoriteDocs.filter(f => f.spotType === 'michinoeki');

          const favoriteSpots: any[] = [];

          // Firestore スポット（documentId() で検索可能）
          if (firestoreIds.length > 0) {
            for (let i = 0; i < firestoreIds.length; i += 10) {
              const batch = firestoreIds.slice(i, i + 10);
              console.log(`[マイページ] Firestore スポット取得 (バッチ ${i / 10 + 1}):`, batch);

              const q = query(collection(db, 'spots'), where(documentId(), 'in', batch));
              const spotsSnap = await getDocs(q);

              const retrievedSpots = spotsSnap.docs.map(doc => doc.data());
              favoriteSpots.push(...retrievedSpots);
              console.log(`[マイページ] Firestore バッチ ${i / 10 + 1}：`, retrievedSpots.length, '件');
            }
          }

          // 道の駅（ローカル ID: michinoeki_XXX）は favorites の情報をそのまま使用
          if (michinoekiDocs.length > 0) {
            console.log('[マイページ] 道の駅：', michinoekiDocs.length, '件（ローカル ID）');
            michinoekiDocs.forEach(fav => {
              favoriteSpots.push({
                id: fav.spotId,
                name: fav.spotName,
                type: fav.spotType,
                address: '',
                lat: 0,
                lng: 0,
                facilities: {},
                hours: '',
                region: 'kanto',
                createdAt: null,
                updatedAt: null,
                source: 'michinoeki',
              });
            });
          }

          console.log('[マイページ] お気に入いスポット合計:', favoriteSpots.length, '件（Firestore:', firestoreIds.length, '件 + 道の駅:', michinoekiDocs.length, '件）');

          // 重複排除（同じ spotId が複数回登録されている場合に対応）
          const uniqueFavorites = favoriteSpots.filter((spot, index, self) =>
            self.findIndex(s => s.id === spot.id) === index
          );
          console.log('[マイページ] 重複排除後:', uniqueFavorites.length, '件');

          setFavorites(uniqueFavorites);
        }

        // 申請したスポット取得（今は空）
        // 実装時にはspot_submissionsコレクションから取得
        setSubmissions([]);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データ取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDelete = async (reportId: string) => {
    if (!user) return;
    if (!confirm('このレポートを削除してもよろしいですか?')) return;

    try {
      await deleteUserReport(reportId, user.uid);
      setReports(reports.filter((r) => r.id !== reportId));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  const handleProfileSave = async () => {
    if (!user || !profileFormData.name.trim()) {
      setError('表示名を入力してください');
      return;
    }

    try {
      const db = getFirebaseDb();
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        name: profileFormData.name.trim(),
      });
      setShowProfileEdit(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      router.refresh();
    } catch (err) {
      console.error('プロフィール更新エラー:', err);
      setError('プロフィール更新に失敗しました');
    }
  };

  const handleEditStart = (report: Report) => {
    setEditingId(report.id);
    setEditFormData({
      ratings: report.ratings,
      comment: report.comment,
    });
  };

  const handleEditSave = async (reportId: string) => {
    if (!user) return;

    try {
      await updateUserReport(reportId, user.uid, editFormData);
      const updatedReports = reports.map((r) =>
        r.id === reportId ? { ...r, ...editFormData } : r
      );
      setReports(updatedReports);
      setEditingId(null);
      setEditFormData({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    }
  };

  if (!loading && !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold" style={{ color: '#1F2933' }}>
            マイページ
          </h1>
          <p className="text-lg" style={{ color: '#52606D' }}>
            ログインが必要です
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full px-8 py-3 font-bold text-white transition-all hover:scale-105"
            style={{ backgroundColor: '#E8722C' }}
          >
            ログイン
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <p style={{ color: '#52606D' }}>読み込み中...</p>
      </div>
    );
  }

  const userInitial = (profile?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
      {/* ── プロフィールヘッダーカード ── */}
      <section className="px-4 py-8" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="mx-auto max-w-5xl">
          <Link
            href="/spots"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors mb-8"
            style={{ color: '#E8722C' }}
          >
            <ArrowLeft size={16} />
            スポット一覧に戻る
          </Link>

          <div
            className="rounded-xl border p-8"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
          >
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              {/* アバター */}
              <div className="flex-shrink-0">
                <div
                  className="h-24 w-24 rounded-full flex items-center justify-center text-white text-4xl font-bold"
                  style={{ backgroundColor: '#E8722C' }}
                >
                  {userInitial}
                </div>
              </div>

              {/* プロフィール情報 */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#1F2933' }}>
                  {profile?.name || user?.email || 'ユーザー'}
                </h1>
                <p className="text-base mb-1" style={{ color: '#52606D' }}>
                  {user?.email}
                </p>
                <p className="text-sm mb-6" style={{ color: '#7B8794' }}>
                  ファイトラック歴 {joinedDaysAgo} 日
                </p>

                {/* ボタン */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowProfileEdit(true)}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold text-white transition-all hover:scale-105"
                    style={{ backgroundColor: '#E8722C' }}
                  >
                    プロフィール編集
                  </button>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold text-white transition-all hover:scale-105"
                    style={{ backgroundColor: '#E8722C' }}
                  >
                    <MessageCircle size={16} />
                    お問い合わせ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 統計セクション ── */}
      <section className="px-4 py-12" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 投稿レポート */}
            <div
              className="rounded-xl border p-8 text-center"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
            >
              <p className="text-sm font-medium mb-3" style={{ color: '#52606D' }}>
                投稿レポート
              </p>
              <p className="text-5xl font-bold" style={{ color: '#E8722C' }}>
                {reports.length}
              </p>
              <p className="text-xs mt-3" style={{ color: '#7B8794' }}>
                件
              </p>
            </div>

            {/* 平均評価 */}
            <div
              className="rounded-xl border p-8 text-center"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
            >
              <p className="text-sm font-medium mb-3" style={{ color: '#52606D' }}>
                平均評価
              </p>
              <p className="text-5xl font-bold" style={{ color: '#E8722C' }}>
                {reports.length > 0
                  ? (reports.reduce((sum, r) => sum + r.ratings.overall_satisfaction, 0) / reports.length).toFixed(1)
                  : '-'}
              </p>
              <p className="text-xs mt-3" style={{ color: '#7B8794' }}>
                / 5.0
              </p>
            </div>

            {/* 駐車可スポット */}
            <div
              className="rounded-xl border p-8 text-center"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
            >
              <p className="text-sm font-medium mb-3" style={{ color: '#52606D' }}>
                駐車可スポット
              </p>
              <p className="text-5xl font-bold" style={{ color: '#E8722C' }}>
                {reports.filter((r) => r.ratings.can_park).length}
              </p>
              <p className="text-xs mt-3" style={{ color: '#7B8794' }}>
                件
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── メッセージ表示 ── */}
      <section className="px-4 py-4" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="mx-auto max-w-5xl">
          {error && (
            <div
              className="rounded-xl border px-6 py-4 text-sm font-medium mb-4"
              style={{ backgroundColor: '#FFEBEE', borderColor: '#EF5350', color: '#C62828' }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="rounded-xl border px-6 py-4 text-sm font-medium mb-4"
              style={{ backgroundColor: '#E8F5E9', borderColor: '#4CAF50', color: '#2E7D32' }}
            >
              ✓ 更新しました
            </div>
          )}
        </div>
      </section>

      {/* ── 投稿したレポート ── */}
      <section className="px-4 py-12" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-8" style={{ color: '#1F2933' }}>
            投稿したレポート
          </h2>

          {reports.length === 0 ? (
            <div
              className="rounded-xl border-2 border-dashed p-12 text-center"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
            >
              <div className="text-5xl mb-4">📝</div>
              <p className="text-lg font-medium mb-2" style={{ color: '#1F2933' }}>
                まだレポートを投稿していません
              </p>
              <p className="text-sm mb-6" style={{ color: '#52606D' }}>
                スポットを探してレポートを投稿してみましょう!
              </p>
              <Link
                href="/spots"
                className="inline-block rounded-full px-6 py-3 font-bold text-white transition-all hover:scale-105"
                style={{ backgroundColor: '#E8722C' }}
              >
                🗺 スポットを探す
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-xl border overflow-hidden transition-all hover:shadow-lg"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
                >
                  {editingId === report.id ? (
                    <div className="p-6 space-y-4">
                      <h3 className="text-lg font-bold" style={{ color: '#1F2933' }}>
                        {report.spotName}
                      </h3>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1" style={{ color: '#52606D' }}>
                            駐車の容易さ
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={editFormData.ratings?.parking_ease || 3}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                ratings: {
                                  ...(editFormData.ratings || report.ratings),
                                  parking_ease: parseInt(e.target.value),
                                },
                              })
                            }
                            className="w-full px-2 py-1 rounded border text-center"
                            style={{ backgroundColor: '#FAF9F6', borderColor: '#E5E3DC', color: '#1F2933' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1" style={{ color: '#52606D' }}>
                            清潔さ
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={editFormData.ratings?.cleanliness || 3}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                ratings: {
                                  ...(editFormData.ratings || report.ratings),
                                  cleanliness: parseInt(e.target.value),
                                },
                              })
                            }
                            className="w-full px-2 py-1 rounded border text-center"
                            style={{ backgroundColor: '#FAF9F6', borderColor: '#E5E3DC', color: '#1F2933' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1" style={{ color: '#52606D' }}>
                            総合満足度
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={editFormData.ratings?.overall_satisfaction || 3}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                ratings: {
                                  ...(editFormData.ratings || report.ratings),
                                  overall_satisfaction: parseInt(e.target.value),
                                },
                              })
                            }
                            className="w-full px-2 py-1 rounded border text-center"
                            style={{ backgroundColor: '#FAF9F6', borderColor: '#E5E3DC', color: '#1F2933' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#52606D' }}>
                          コメント
                        </label>
                        <textarea
                          value={editFormData.comment || ''}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, comment: e.target.value })
                          }
                          rows={3}
                          className="w-full px-3 py-2 rounded border"
                          style={{ backgroundColor: '#FAF9F6', borderColor: '#E5E3DC', color: '#1F2933' }}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleEditSave(report.id)}
                          className="flex-1 rounded-lg px-4 py-2 font-bold text-white transition-all hover:scale-105"
                          style={{ backgroundColor: '#4CAF50' }}
                        >
                          ✓ 保存
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditFormData({});
                          }}
                          className="flex-1 rounded-lg px-4 py-2 font-bold text-white transition-all hover:scale-105"
                          style={{ backgroundColor: '#9E9E9E' }}
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <Link
                        href={`/spots/${report.spotId}`}
                        className="text-xl font-bold block mb-2 transition-colors"
                        style={{ color: '#E8722C' }}
                      >
                        {report.spotName}
                      </Link>
                      <p className="text-xs mb-4" style={{ color: '#7B8794' }}>
                        {new Date(report.timestamp).toLocaleDateString('ja-JP')}
                      </p>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm" style={{ color: '#52606D' }}>
                            総合満足度
                          </span>
                          <span className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className="text-lg"
                                style={{
                                  color: star <= report.ratings.overall_satisfaction ? '#FFC107' : '#D0D0D0',
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </span>
                          <span className="text-sm font-semibold ml-auto" style={{ color: '#E8722C' }}>
                            {report.ratings.overall_satisfaction}/5
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div
                            className="rounded p-3"
                            style={{ backgroundColor: '#FAF9F6', borderColor: '#E5E3DC' }}
                          >
                            <p style={{ color: '#52606D' }}>駐車の容易さ</p>
                            <p className="font-semibold" style={{ color: '#E8722C' }}>
                              {report.ratings.parking_ease}/5
                            </p>
                          </div>
                          <div
                            className="rounded p-3"
                            style={{ backgroundColor: '#FAF9F6' }}
                          >
                            <p style={{ color: '#52606D' }}>清潔さ</p>
                            <p className="font-semibold" style={{ color: '#E8722C' }}>
                              {report.ratings.cleanliness}/5
                            </p>
                          </div>
                        </div>
                      </div>

                      {report.comment && (
                        <div className="mb-4 pb-4" style={{ borderBottomColor: '#E5E3DC', borderBottomWidth: '1px' }}>
                          <p className="text-sm" style={{ color: '#1F2933' }}>
                            {report.comment}
                          </p>
                        </div>
                      )}

                      <div className="mb-4">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: report.ratings.can_park ? '#E8F5E9' : '#FFEBEE',
                            color: report.ratings.can_park ? '#2E7D32' : '#C62828',
                            borderWidth: '1px',
                            borderColor: report.ratings.can_park ? '#4CAF50' : '#EF5350',
                          }}
                        >
                          {report.ratings.can_park ? '✓ 駐車可能' : '✗ 駐車不可'}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditStart(report)}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 font-bold text-sm text-white transition-all hover:scale-105"
                          style={{ backgroundColor: '#2196F3' }}
                        >
                          <Edit2 size={14} />
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 font-bold text-sm text-white transition-all hover:scale-105"
                          style={{ backgroundColor: '#EF5350' }}
                        >
                          <Trash2 size={14} />
                          削除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── プロフィール編集モーダル ── */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div
            className="rounded-xl p-8 max-w-md w-full"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <h3 className="text-2xl font-bold mb-6" style={{ color: '#1F2933' }}>
              プロフィール編集
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#52606D' }}>
                表示名
              </label>
              <input
                type="text"
                value={profileFormData.name}
                onChange={(e) => setProfileFormData({ name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ backgroundColor: '#FAF9F6', borderColor: '#E5E3DC', color: '#1F2933' }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleProfileSave}
                className="flex-1 rounded-full px-6 py-3 font-bold text-white transition-all hover:scale-105"
                style={{ backgroundColor: '#E8722C' }}
              >
                保存
              </button>
              <button
                onClick={() => setShowProfileEdit(false)}
                className="flex-1 rounded-full px-6 py-3 font-bold transition-all hover:scale-105"
                style={{ backgroundColor: '#E5E3DC', color: '#1F2933' }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── お気に入りスポット ── */}
      <section className="px-4 py-12" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-8" style={{ color: '#1F2933' }}>
            ❤️ お気に入りスポット
          </h2>

          {favorites.length === 0 ? (
            <div
              className="rounded-xl border-2 border-dashed p-12 text-center"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
            >
              <p className="text-lg font-medium mb-2" style={{ color: '#1F2933' }}>
                お気に入りはまだ登録されていません
              </p>
              <p className="text-sm mb-6" style={{ color: '#52606D' }}>
                スポット詳細ページから「お気に入り」ボタンで登録できます
              </p>
              <Link
                href="/spots"
                className="inline-block rounded-full px-6 py-3 font-bold text-white transition-all hover:scale-105"
                style={{ backgroundColor: '#E8722C' }}
              >
                スポットを探す
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {favorites.map((spot) => (
                <div
                  key={spot.id}
                  className="rounded-xl border overflow-hidden transition-all hover:shadow-lg"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }}
                >
                  <div className="p-6">
                    <Link
                      href={`/spots/${spot.id}`}
                      className="text-xl font-bold block mb-2 transition-colors"
                      style={{ color: '#E8722C' }}
                    >
                      {spot.name}
                    </Link>
                    <p className="text-xs mb-4" style={{ color: '#7B8794' }}>
                      {spot.type === 'michinoeki' ? '🏛️ 道の駅' : '⭐ 厳選スポット'}
                    </p>

                    {spot.address && (
                      <p className="text-sm mb-4" style={{ color: '#52606D' }}>
                        📍 {spot.address}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Link
                        href={`/spots/${spot.id}`}
                        className="flex-1 inline-flex items-center justify-center rounded-lg px-3 py-2 font-bold text-sm text-white transition-all hover:scale-105"
                        style={{ backgroundColor: '#E8722C' }}
                      >
                        詳細を見る
                      </Link>
                      <a
                        href={
                          (() => {
                            const query = spot.name.includes('道の駅')
                              ? spot.name
                              : `道の駅${spot.name}`;
                            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                          })()
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center rounded-lg px-3 py-2 font-bold text-sm text-white transition-all hover:scale-105"
                        style={{ backgroundColor: '#2196F3' }}
                      >
                        Maps で開く
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 申請したスポット ── */}
      <section className="px-4 py-12" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-8" style={{ color: '#1F2933' }}>
            📝 申請したスポット
          </h2>

          {submissions.length === 0 ? (
            <div
              className="rounded-xl border-2 border-dashed p-12 text-center"
              style={{ backgroundColor: '#FAF9F6', borderColor: '#E5E3DC' }}
            >
              <p className="text-lg font-medium mb-2" style={{ color: '#1F2933' }}>
                申請したスポットがありません
              </p>
              <p className="text-sm mb-6" style={{ color: '#52606D' }}>
                新しい休憩スポットを見つけたら、ぜひ申請してください
              </p>
              <Link
                href="/spots"
                className="inline-block rounded-full px-6 py-3 font-bold text-white transition-all hover:scale-105"
                style={{ backgroundColor: '#E8722C' }}
              >
                新しいスポットを申請する
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 申請したスポット一覧（実装予定） */}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
