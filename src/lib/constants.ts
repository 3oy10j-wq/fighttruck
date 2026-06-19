import type { RegionCode, SpotFacilities } from '@/lib/types';

export const FACILITY_LABELS: Record<keyof SpotFacilities, string> = {
  shower: 'シャワー',
  sleepingArea: '仮眠室',
  largeParking: '大型駐車場',
  restaurant: '食堂',
  onsen: '温泉',
  laundry: 'ランドリー',
  open24h: '24時間',
};

export const REGION_LABELS: Record<RegionCode, string> = {
  hokkaido: '北海道',
  tohoku: '東北',
  kanto: '関東',
  chubu: '中部',
  kinki: '近畿',
  chugoku: '中国',
  shikoku: '四国',
  kyushu: '九州',
};

export const SPOT_TYPE_LABELS: Record<'official_rest' | 'michinoeki', string> = {
  official_rest: '厳選スポット',
  michinoeki: '道の駅',
};

export const SPOT_TYPE_COLORS: Record<'official_rest' | 'michinoeki', string> = {
  official_rest: '#f97316',
  michinoeki: '#3b82f6',
};
