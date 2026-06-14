import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
	apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// firebase/auth は初期化時にAPIキーの形式を検証するため、APIキーが
// 未設定の環境(ビルド時のプリレンダリングなど)で呼び出すと
// auth/invalid-api-key で例外を投げる。実際に使用されるまで遅延させる。
let _auth: Auth | undefined;
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(app);
  }
  return _auth;
}

export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
