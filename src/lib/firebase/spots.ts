import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from './config';
import type { Spot } from '@/lib/types';

export async function getSpots(): Promise<Spot[]> {
  const snapshot = await getDocs(collection(getFirebaseDb(), 'spots'));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Spot, 'id'>),
  }));
}

export async function getSpotById(id: string): Promise<Spot | null> {
  const snap = await getDoc(doc(getFirebaseDb(), 'spots', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Spot, 'id'>) };
}
