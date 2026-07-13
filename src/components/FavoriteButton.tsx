'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { addToFavorites, removeFromFavorites, isFavorited } from '@/lib/firebase/favorites';
import { Star } from 'lucide-react';
import type { Spot } from '@/lib/types';

interface FavoriteButtonProps {
  spot: Spot;
}

export default function FavoriteButton({ spot }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorited_, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // ページ読み込み時にお気に入い状態を確認
  useEffect(() => {
    if (!user) return;

    const checkFavorite = async () => {
      try {
        const fav = await isFavorited(user.uid, spot.id);
        setIsFavorited(fav);
      } catch (err) {
        console.error('お気に入い状態確認エラー:', err);
      }
    };

    checkFavorite();
  }, [user, spot.id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('ログインするとお気に入いに登録できます');
      return;
    }

    try {
      setLoading(true);

      if (isFavorited_) {
        await removeFromFavorites(user.uid, spot.id);
        setIsFavorited(false);
      } else {
        await addToFavorites(user.uid, spot);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('お気に入い操作エラー:', err);
      alert('お気に入い操作に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
      style={{
        backgroundColor: isFavorited_ ? '#FFD700' : '#FFFFFF',
        borderColor: '#E8722C',
        borderWidth: '1px',
        color: isFavorited_ ? '#333333' : '#E8722C',
      }}
    >
      <Star
        className="w-4 h-4"
        fill={isFavorited_ ? 'currentColor' : 'none'}
      />
      {isFavorited_ ? 'お気に入り済み' : 'お気に入りに追加'}
    </button>
  );
}
