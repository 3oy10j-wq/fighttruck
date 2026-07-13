import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { getFirebaseDb } from './config';
import type { SpotSubmission, Spot } from '@/lib/types';

// 承認待ちの申請を取得
export async function getPendingSubmissions(): Promise<(SpotSubmission & { id: string })[]> {
  try {
    const db = getFirebaseDb();
    const submissionsRef = collection(db, 'spot_submissions');
    const q = query(submissionsRef, where('status', '==', 'pending'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as SpotSubmission & { id: string }));
  } catch (error) {
    console.error('❌ 承認待ち申請取得エラー:', error);
    throw error;
  }
}

// 申請を承認し、spots に追加
export async function approveSubmission(submissionId: string): Promise<void> {
  try {
    const db = getFirebaseDb();

    // 申請データを取得
    const submissionRef = doc(db, 'spot_submissions', submissionId);
    const submissionSnap = await getDocs(query(collection(db, 'spot_submissions'), where('__name__', '==', submissionId)));

    if (submissionSnap.empty) {
      throw new Error('申請が見つかりません');
    }

    const submission = submissionSnap.docs[0].data() as SpotSubmission;

    // spots に新規スポットとして保存（申請情報も引き継ぐ）
    const spotsRef = collection(db, 'spots');
    await addDoc(spotsRef, {
      name: submission.name,
      lat: submission.lat,
      lng: submission.lng,
      address: submission.name,  // 申請時は住所がないので施設名を使う
      type: 'user_submitted',
      source: 'user',  // ユーザー追加スポット
      submissionId: submissionId,  // 元の申請IDを保存
      can_park: submission.can_park,  // 大型トラック対応状況
      comment: submission.comment,  // 申請時のコメント
      submitterName: submission.submitterName,  // 投稿者名
      facilities: {
        shower: false,
        sleepingArea: false,
        largeParking: false,
        restaurant: false,
        onsen: false,
        laundry: false,
        open24h: false,
      },
      hours: '',
      region: 'kanto',  // デフォルト値（後で改善可能）
      verifiedByAdmin: true,  // ✅ 運営確認済みバッジ
      verifiedAt: Timestamp.now(),  // ✅ 確認日時
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // 申請のステータスを "approved" に更新
    await updateDoc(submissionRef, {
      status: 'approved',
    });

    console.log('✓ 申請を承認しました:', submissionId);
  } catch (error) {
    console.error('❌ 申請承認エラー:', error);
    throw error;
  }
}

// 申請を却下
export async function rejectSubmission(submissionId: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    const submissionRef = doc(db, 'spot_submissions', submissionId);

    await updateDoc(submissionRef, {
      status: 'rejected',
    });

    console.log('✓ 申請を却下しました:', submissionId);
  } catch (error) {
    console.error('❌ 申請却下エラー:', error);
    throw error;
  }
}

// 承認済みスポット（ユーザー追加）を取得
export async function getApprovedUserSpots(): Promise<(Spot & { id: string })[]> {
  try {
    const db = getFirebaseDb();
    const spotsRef = collection(db, 'spots');
    const q = query(spotsRef, where('source', '==', 'user'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Spot & { id: string }));
  } catch (error) {
    console.error('❌ 承認済みスポット取得エラー:', error);
    throw error;
  }
}

// 承認を取り消す（spots から削除、申請を pending に戻す）
export async function revokeApproval(spotId: string, submissionId: string): Promise<void> {
  try {
    const db = getFirebaseDb();

    // spots から削除
    const spotRef = doc(db, 'spots', spotId);
    await deleteDoc(spotRef);

    // 申請を pending に戻す
    const submissionRef = doc(db, 'spot_submissions', submissionId);
    await updateDoc(submissionRef, {
      status: 'pending',
    });

    console.log('✓ 承認を取り消しました:', spotId);
  } catch (error) {
    console.error('❌ 承認取り消しエラー:', error);
    throw error;
  }
}

// 申請内容を編集（管理者のみ）
export async function updateSubmission(
  submissionId: string,
  updates: {
    name?: string;
    type?: string;
    can_park?: string;
    comment?: string;
  }
): Promise<void> {
  try {
    const db = getFirebaseDb();
    const submissionRef = doc(db, 'spot_submissions', submissionId);

    await updateDoc(submissionRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    console.log('✓ 申請を更新しました:', submissionId);
  } catch (error) {
    console.error('❌ 申請更新エラー:', error);
    throw error;
  }
}
