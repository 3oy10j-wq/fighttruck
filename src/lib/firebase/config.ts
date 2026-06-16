import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
	apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase の各サービスはモジュールロード時ではなく、
// 実際に使用するタイミングで初期化する。
// ビルド時(プリレンダリング)に環境変数が未設定でも例外が起きないようにするため。
let _app: FirebaseApp | undefined;
function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return _app;
}

let _auth: Auth | undefined;
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

let _db: Firestore | undefined;
export function getFirebaseDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

let _storage: FirebaseStorage | undefined;
export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) {
    _storage = getStorage(getFirebaseApp());
  }
  return _storage;
}
