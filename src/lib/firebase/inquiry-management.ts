import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { getFirebaseDb } from './config';
import type { Inquiry } from '@/lib/types';

// 問い合わせを作成
export async function createInquiry(
  name: string,
  email: string,
  category: '不具合報告' | '機能要望' | 'その他',
  message: string,
  userId: string | null = null
): Promise<string> {
  try {
    const db = getFirebaseDb();
    const inquiriesRef = collection(db, 'inquiries');

    const docRef = await addDoc(inquiriesRef, {
      name,
      email,
      category,
      message,
      userId,
      status: '未対応',
      createdAt: Timestamp.now(),
    });

    console.log('✓ 問い合わせを作成しました:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ 問い合わせ作成エラー:', error);
    throw error;
  }
}

// 管理者用：すべての問い合わせを新着順に取得
export async function getInquiries(): Promise<(Inquiry & { id: string })[]> {
  try {
    const db = getFirebaseDb();
    const inquiriesRef = collection(db, 'inquiries');
    const q = query(inquiriesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Inquiry & { id: string }));
  } catch (error) {
    console.error('❌ 問い合わせ取得エラー:', error);
    throw error;
  }
}

// 未対応の問い合わせ件数を取得
export async function getUnresolvedInquiryCount(): Promise<number> {
  try {
    const db = getFirebaseDb();
    const inquiriesRef = collection(db, 'inquiries');
    const q = query(inquiriesRef, where('status', '==', '未対応'));
    const snapshot = await getDocs(q);
    return snapshot.docs.length;
  } catch (error) {
    console.error('❌ 未対応件数取得エラー:', error);
    return 0;
  }
}

// 問い合わせのステータスを更新
export async function updateInquiryStatus(
  inquiryId: string,
  status: '未対応' | '対応中' | '対応済み'
): Promise<void> {
  try {
    const db = getFirebaseDb();
    const inquiryRef = doc(db, 'inquiries', inquiryId);
    await updateDoc(inquiryRef, { status });
    console.log('✓ 問い合わせステータスを更新しました:', inquiryId);
  } catch (error) {
    console.error('❌ ステータス更新エラー:', error);
    throw error;
  }
}
