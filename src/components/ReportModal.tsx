'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createReport, uploadReportImage } from '@/lib/firebase/reports';
import StarRating from '@/components/StarRating';

interface ReportModalProps {
  spotId: string;
  spotName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportModal({
  spotId,
  spotName,
  onClose,
  onSuccess,
}: ReportModalProps) {
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userName, setUserName] = useState('');
  const [parkingEase, setParkingEase] = useState(3);
  const [cleanliness, setCleanliness] = useState(3);
  const [overallSatisfaction, setOverallSatisfaction] = useState(3);
  const [canPark, setCanPark] = useState(true);
  const [comment, setComment] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile?.name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserName(profile.name);
    }
  }, [profile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      let imageUrl = '';

      if (imageFile) {
        imageUrl = await uploadReportImage(imageFile, spotId);
      }

      // Generate anonymous user ID if not logged in
      const userId = user?.uid || `anonymous_${Date.now()}`;
      const displayName = userName || '匿名ドライバー';

      await createReport(
        spotId,
        userId,
        displayName,
        {
          parking_ease: parkingEase,
          cleanliness: cleanliness,
          overall_satisfaction: overallSatisfaction,
          can_park: canPark,
        },
        comment,
        imageUrl
      );

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('レポート送信エラー:', err);
      setError(err instanceof Error ? err.message : 'レポート送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{spotName}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700 font-bold"
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <p className="text-green-600 font-semibold mb-2">✓ レポートを送信しました</p>
            <p className="text-sm text-gray-600">ありがとうございます！</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* User Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                名前（オプション）
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="匿名ドライバーで送信"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Ratings */}
            <div className="space-y-3">
              <StarRating
                label="駐車の容易さ"
                value={parkingEase}
                onChange={setParkingEase}
              />
              <StarRating
                label="清潔さ"
                value={cleanliness}
                onChange={setCleanliness}
              />
              <StarRating
                label="総合満足度"
                value={overallSatisfaction}
                onChange={setOverallSatisfaction}
              />
            </div>

            {/* Can Park Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                駐車可能ですか？
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCanPark(true)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    canPark
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ✓ はい
                </button>
                <button
                  type="button"
                  onClick={() => setCanPark(false)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    !canPark
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ✗ いいえ
                </button>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                コメント（オプション）
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="このスポットについてのコメント..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                写真（オプション）
              </label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="プレビュー"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition-colors text-gray-600 hover:text-orange-500"
                >
                  📷 画像を選択
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
            >
              {loading ? '送信中...' : 'レポートを送信'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
