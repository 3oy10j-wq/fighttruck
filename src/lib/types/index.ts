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
  type?: 'official_rest' | 'michinoeki';
  placeId?: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface Report {
  id: string;
  spotId: string;
  userId: string;
  userName: string;
  timestamp: Timestamp;
  ratings: {
    parking_ease: number;
    cleanliness: number;
    overall_satisfaction: number;
    can_park: boolean;
  };
  comment: string;
  imageUrl: string;
  status: 'published';
}
