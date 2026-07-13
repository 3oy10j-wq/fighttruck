import { getFirebaseDb } from '@/lib/firebase/config';
import { doc, collection, getDocs, addDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import type { Spot } from '@/lib/types';

// ユーザーのお気に入い情報（Firestore内の構造）
export interface FavoriteSpot {
  spotId: string;
  spotName: string;
  spotType?: string;
  addedAt: Timestamp;
}

// ユーザーのお気に入いを取得
export async function getUserFavorites(userId: string): Promise<Spot['id'][]> {
  try {
    const db = getFirebaseDb();
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const snapshot = await getDocs(favoritesRef);
    return snapshot.docs.map(doc => doc.data().spotId);
  } catch (err) {
    console.error('お気に入い取得エラー:', err);
    return [];
  }
}

// スポットをお気に入いに追加
export async function addToFavorites(userId: string, spot: Spot): Promise<boolean> {
  try {
    const db = getFirebaseDb();
    const favoritesRef = collection(db, 'users', userId, 'favorites');

    // 既に登録済みかチェック
    const q = query(favoritesRef, where('spotId', '==', spot.id));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.log('既にお気に入いに登録されています');
      return false;
    }

    // 新規登録
    await addDoc(favoritesRef, {
      spotId: spot.id,
      spotName: spot.name,
      spotType: spot.type,
      addedAt: Timestamp.now(),
    } as FavoriteSpot);

    return true;
  } catch (err) {
    console.error('お気に入い追加エラー:', err);
    throw err;
  }
}

// スポットをお気に入いから削除
export async function removeFromFavorites(userId: string, spotId: Spot['id']): Promise<boolean> {
  try {
    const db = getFirebaseDb();
    const favoritesRef = collection(db, 'users', userId, 'favorites');

    // spotIdで検索して削除
    const q = query(favoritesRef, where('spotId', '==', spotId));
    const snapshot = await getDocs(q);

    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(docSnapshot.ref);
    }

    return true;
  } catch (err) {
    console.error('お気に入い削除エラー:', err);
    throw err;
  }
}

// お気に入い登録状況を確認
export async function isFavorited(userId: string, spotId: Spot['id']): Promise<boolean> {
  try {
    const db = getFirebaseDb();
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const q = query(favoritesRef, where('spotId', '==', spotId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (err) {
    console.error('お気に入い確認エラー:', err);
    return false;
  }
}
