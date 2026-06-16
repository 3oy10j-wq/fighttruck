import { collection, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from './config';
import type { Spot } from '@/lib/types';

export async function getSpots(): Promise<Spot[]> {
  const snapshot = await getDocs(collection(getFirebaseDb(), 'spots'));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Spot, 'id'>),
  }));
}
