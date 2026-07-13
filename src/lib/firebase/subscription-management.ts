import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { getFirebaseDb } from './config';

// ユーザーのサブスクリプション情報を更新
export async function updateUserSubscription(
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string
): Promise<void> {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      isPremium: true,
      stripeCustomerId,
      stripeSubscriptionId,
      subscriptionStatus: 'active',
      subscriptionUpdatedAt: Timestamp.now(),
    });

    console.log('✓ ユーザーのサブスクリプション情報を更新しました:', userId);
  } catch (error) {
    console.error('❌ サブスクリプション情報更新エラー:', error);
    throw error;
  }
}

// サブスクリプションをキャンセル（解約）
export async function cancelUserSubscription(userId: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      isPremium: false,
      subscriptionStatus: 'canceled',
      subscriptionUpdatedAt: Timestamp.now(),
    });

    console.log('✓ ユーザーのサブスクリプションをキャンセルしました:', userId);
  } catch (error) {
    console.error('❌ サブスクリプションキャンセルエラー:', error);
    throw error;
  }
}

// ユーザーのプレミアム情報を取得
export async function getUserPremiumInfo(userId: string): Promise<{
  isPremium: boolean;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
} | null> {
  try {
    const db = getFirebaseDb();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    return {
      isPremium: data.isPremium || false,
      subscriptionStatus: data.subscriptionStatus || null,
      stripeCustomerId: data.stripeCustomerId || null,
    };
  } catch (error) {
    console.error('❌ プレミアム情報取得エラー:', error);
    throw error;
  }
}
