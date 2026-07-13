'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { submitSpot } from '@/lib/firebase/spot-submissions';
import { getCurrentLocation } from '@/lib/location-utils';
import type { SpotSubmission } from '@/lib/types';

interface SubmitSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type SpotType = 'convenience' | 'parking' | 'gas_station' | 'other';
type CanPark = 'yes' | 'maybe' | 'no';

const SPOT_TYPES: { value: SpotType; label: string }[] = [
  { value: 'convenience', label: 'コンビニ' },
  { value: 'parking', label: '駐車場' },
  { value: 'gas_station', label: 'ガソリンスタンド' },
  { value: 'other', label: 'その他' },
];

const CAN_PARK_OPTIONS: { value: CanPark; label: string }[] = [
  { value: 'yes', label: '停められた' },
  { value: 'maybe', label: '微妙' },
  { value: 'no', label: '無理' },
];

export default function SubmitSpotModal({ isOpen, onClose, onSuccess }: SubmitSpotModalProps) {
  const [step, setStep] = useState<'location' | 'details' | 'confirm'>('location');
  const [name, setName] = useState('');
  const [type, setType] = useState<SpotType>('convenience');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [canPark, setCanPark] = useState<CanPark>('yes');
  const [comment, setComment] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleGetLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const location = await getCurrentLocation();
      setLat(location.lat);
      setLng(location.lng);
      setStep('details');
    } catch (err) {
      setError('位置情報を取得できませんでした。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLocation = () => {
    const addressInput = prompt('住所を入力してください:');
    if (addressInput) {
      // 本来は geocodeAddress を使って座標に変換
      // ここでは簡易的に表示のみ
      setStep('details');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('施設名を入力してください。');
      return;
    }

    if (lat === null || lng === null) {
      setError('位置情報が取得できていません。');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await submitSpot({
        name: name.trim(),
        type,
        lat,
        lng,
        can_park: canPark,
        comment: comment.trim(),
        imageUrl: '',
        submitterName: submitterName.trim() || '匿名',
      });

      // リセット
      setName('');
      setType('convenience');
      setLat(null);
      setLng(null);
      setCanPark('yes');
      setComment('');
      setSubmitterName('');
      setStep('location');

      onSuccess?.();
      onClose();
    } catch (err) {
      setError('申請に失敗しました。もう一度試してください。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-end bg-black/50 md:items-center md:justify-center">
      <div className="w-full rounded-t-2xl bg-white md:w-96 md:rounded-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <h2 className="text-lg font-bold text-gray-900">休憩スポットを追加</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="max-h-[calc(100vh-120px)] overflow-y-auto p-4 md:max-h-none">
          {/* ステップ1: 位置情報取得 */}
          {step === 'location' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">ステップ 1 / 3: 位置情報を取得</p>

              <button
                onClick={handleGetLocation}
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-500 px-4 py-3 font-bold text-white hover:bg-blue-600 disabled:bg-gray-400"
              >
                {isLoading ? '取得中...' : '📍 現在地を取得'}
              </button>

              <button
                onClick={handleManualLocation}
                disabled={isLoading}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-bold text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
              >
                🏠 住所で検索
              </button>
            </div>
          )}

          {/* ステップ2: 詳細情報入力 */}
          {step === 'details' && lat !== null && lng !== null && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">ステップ 2 / 3: スポット情報</p>

              {/* 施設名 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  施設名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例：○○コンビニ"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  disabled={isLoading}
                />
              </div>

              {/* タイプ選択 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">タイプ</label>
                <div className="grid grid-cols-2 gap-2">
                  {SPOT_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setType(value)}
                      className={`rounded-lg px-3 py-2 text-sm font-bold transition-all ${
                        type === value
                          ? 'bg-blue-500 text-white'
                          : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={isLoading}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 大型トラック対応 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  大型トラック
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CAN_PARK_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setCanPark(value)}
                      className={`rounded-lg px-2 py-2 text-xs font-bold transition-all ${
                        canPark === value
                          ? 'bg-green-500 text-white'
                          : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={isLoading}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* コメント */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  コメント（任意）
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="例：夜間も駐車可、トイレあり"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              {/* 申請者名 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  名前（任意・匿名OK）
                </label>
                <input
                  type="text"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="匿名でも大丈夫"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* ボタン */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('location')}
                  className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-3 font-bold text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
                  disabled={isLoading}
                >
                  戻る
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !name.trim()}
                  className="flex-1 rounded-lg bg-green-500 px-4 py-3 font-bold text-white hover:bg-green-600 disabled:bg-gray-400"
                >
                  {isLoading ? '送信中...' : '✓ 申請する'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
