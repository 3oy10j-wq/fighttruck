import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '休憩スポット検索',
  description: '全国のトラックドライバー向け休憩スポットを地域・設備で検索できます。シャワー・仮眠室・大型駐車場・温泉・ランドリーなど設備で絞り込み可能。',
  openGraph: {
    title: '休憩スポット検索 | ファイトラック',
    description: '全国のトラックドライバー向け休憩スポットを地域・設備で検索できます。',
    url: '/spots',
  },
};

export default function SpotsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
