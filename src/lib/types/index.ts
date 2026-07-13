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
  source?: 'official' | 'michinoeki' | 'user';  // ユーザー追加スポット判定
  submissionId?: string;  // ユーザー申請のドキュメントID（source: "user"の場合）
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface Report {
  id: string;
  spotId: string;
  spotName?: string;
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

export interface SpotSubmission {
  id: string;
  name: string;
  type: 'convenience' | 'parking' | 'gas_station' | 'other';
  lat: number;
  lng: number;
  can_park: 'yes' | 'maybe' | 'no';
  comment: string;
  imageUrl: string;
  submitterName: string;
  status: 'pending';
  createdAt: Timestamp;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  category: '不具合報告' | '機能要望' | 'その他';
  message: string;
  userId: string | null;
  status: '未対応' | '対応中' | '対応済み';
  createdAt: Timestamp;
}
