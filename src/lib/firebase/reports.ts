import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseDb, getFirebaseStorage } from '@/lib/firebase/config';
import type { Report } from '@/lib/types';

export async function createReport(
  spotId: string,
  spotName: string,
  userId: string,
  userName: string,
  ratings: Report['ratings'],
  comment: string,
  imageUrl: string
): Promise<string> {
  try {
    const db = getFirebaseDb();
    const reportsRef = collection(db, 'reports');
    const docRef = await addDoc(reportsRef, {
      spotId,
      spotName,
      userId,
      userName: userName || '匿名',
      timestamp: Timestamp.now(),
      ratings,
      comment,
      imageUrl,
      status: 'published',
    });
    return docRef.id;
  } catch (error) {
    console.error('レポート作成エラー:', error);
    throw error;
  }
}

export async function getReportsBySpot(spotId: string): Promise<Report[]> {
  try {
    const db = getFirebaseDb();
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef,
      where('spotId', '==', spotId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Report));
  } catch (error) {
    console.error('スポットレポート取得エラー:', error);
    throw error;
  }
}

export async function getSpotReports(
  spotId: string,
  limitCount: number = 5
): Promise<Report[]> {
  try {
    const db = getFirebaseDb();
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef,
      where('spotId', '==', spotId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Report));
  } catch (error) {
    console.error('スポット最新レポート取得エラー:', error);
    throw error;
  }
}

export async function getRecentReports(limitCount: number = 20): Promise<Report[]> {
  try {
    const db = getFirebaseDb();
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Report));
  } catch (error) {
    console.error('最新レポート取得エラー:', error);
    throw error;
  }
}

export function subscribeToSpotReports(
  spotId: string,
  callback: (reports: Report[]) => void
): () => void {
  try {
    const db = getFirebaseDb();
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef,
      where('spotId', '==', spotId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as Report));
      callback(reports);
    });

    return unsubscribe;
  } catch (error) {
    console.error('レポート購読エラー:', error);
    throw error;
  }
}

export function subscribeToRecentReports(
  limitCount: number = 20,
  callback: (reports: Report[]) => void
): () => void {
  try {
    const db = getFirebaseDb();
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as Report));
      callback(reports);
    });

    return unsubscribe;
  } catch (error) {
    console.error('最新レポート購読エラー:', error);
    throw error;
  }
}

export async function deleteReport(reportId: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    const reportRef = doc(db, 'reports', reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    console.error('レポート削除エラー:', error);
    throw error;
  }
}

export async function uploadReportImage(
  file: File,
  spotId: string
): Promise<string> {
  try {
    const storage = getFirebaseStorage();
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `reports/${spotId}/${filename}`);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    throw error;
  }
}
