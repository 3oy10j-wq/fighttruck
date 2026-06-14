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

export interface SpotFacilities {
  shower: boolean;
  sleepingArea: boolean;
  largeParking: boolean;
  restaurant: boolean;
  onsen: boolean;
  laundry: boolean;
  open24h: boolean;
}

export type RegionCode =
  | 'hokkaido'
  | 'tohoku'
  | 'kanto'
  | 'chubu'
  | 'kinki'
  | 'chugoku'
  | 'shikoku'
  | 'kyushu';

export interface Spot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  facilities: SpotFacilities;
  hours: string;
  region: RegionCode;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}
