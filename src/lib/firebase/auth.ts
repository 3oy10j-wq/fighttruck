import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await createUserDocument(result.user);
  return result.user;
}

export async function registerWithEmail(email: string, password: string, name: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  await createUserDocument(result.user, name);
  return result.user;
}

export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function logout() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

async function createUserDocument(user: User, name?: string) {
  const ref = doc(db, 'users', user.uid);
  await setDoc(ref, {
    uid:           user.uid,
    name:          name ?? user.displayName ?? 'ドライバー',
    email:         user.email,
    avatar:        user.photoURL ?? null,
    plan:          'free',
    reviewCount:   0,
    favoriteCount: 0,
    createdAt:     serverTimestamp(),
    updatedAt:     serverTimestamp(),
  }, { merge: true });
}
