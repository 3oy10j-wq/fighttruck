import type { Timestamp } from 'firebase/firestore';

export type UserPlan = 'free' | 'premium';

export interface UserProfile {
  uid: string;
  name: string;
  email: string | null;
  avatar: string | null;
  plan: UserPlan;
  reviewCount: number;
  favoriteCount: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}
