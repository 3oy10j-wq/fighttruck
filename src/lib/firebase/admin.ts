import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { getFirebaseDb } from './config';

// 管理者ユーザーのメールアドレス
const ADMIN_EMAIL = 'gensui1732x@gmail.com';

// ユーザーが管理者かチェック
export function isAdmin(email: string | null | undefined): boolean {
  return email === ADMIN_EMAIL;
}

// 登録ユーザー数を取得
export async function getUserCount(): Promise<number> {
  try {
    console.log('🔍 getUserCount 実行開始');
    const db = getFirebaseDb();
    console.log('✓ getFirebaseDb() 完了');
    const usersRef = collection(db, 'users');
    console.log('✓ collection(db, "users") 完了');
    const snapshot = await getDocs(usersRef);
    console.log('✓ getDocs 完了:', { size: snapshot.size, docs: snapshot.docs.length });
    return snapshot.size;
  } catch (error) {
    console.error('❌ ユーザー数取得エラー:', error);
    return 0;
  }
}

// 投稿レポート総数を取得
export async function getReportCount(): Promise<number> {
  try {
    const db = getFirebaseDb();
    const reportsRef = collection(db, 'reports');
    const snapshot = await getDocs(reportsRef);
    return snapshot.size;
  } catch (error) {
    console.error('レポート数取得エラー:', error);
    return 0;
  }
}

// 直近7日間の新規ユーザー数を取得
export async function getNewUsersCount7Days(): Promise<number> {
  try {
    const db = getFirebaseDb();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('直近7日間のユーザー数取得エラー:', error);
    return 0;
  }
}

// 直近7日間の新規レポート数を取得
export async function getNewReportsCount7Days(): Promise<number> {
  try {
    const db = getFirebaseDb();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo)));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('直近7日間のレポート数取得エラー:', error);
    return 0;
  }
}
