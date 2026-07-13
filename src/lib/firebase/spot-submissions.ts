import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getFirebaseDb } from './config';
import type { SpotSubmission } from '@/lib/types';

// スポット申請を保存
export async function submitSpot(
  submission: Omit<SpotSubmission, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  try {
    const db = getFirebaseDb();
    const submissionsRef = collection(db, 'spot_submissions');

    const docRef = await addDoc(submissionsRef, {
      ...submission,
      status: 'pending' as const,
      createdAt: Timestamp.now(),
    });

    console.log('✓ スポット申請を保存しました:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ スポット申請エラー:', error);
    throw error;
  }
}
