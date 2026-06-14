import { collection, getDocs } from 'firebase/firestore';
import { db } from './config';
import type { Spot } from '@/lib/types';

export async function getSpots(): Promise<Spot[]> {
  const snapshot = await getDocs(collection(db, 'spots'));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Spot, 'id'>),
  }));
}
