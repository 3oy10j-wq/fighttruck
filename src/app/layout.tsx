import type { Metadata } from "next";
import { Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fighttruck.jp';

export const metadata: Metadata = {
  title: {
    default: 'ファイトラック | トラックドライバーの休憩スポット検索',
    template: '%s | ファイトラック',
  },
  description: '全国のトラックドライバー向け休憩スポット検索サービス。シャワー・仮眠室・大型駐車場・温泉など設備で絞り込めます。',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteUrl,
    siteName: 'ファイトラック',
    title: 'ファイトラック | トラックドライバーの休憩スポット検索',
    description: '全国のトラックドライバー向け休憩スポット検索サービス。シャワー・仮眠室・大型駐車場・温泉など設備で絞り込めます。',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ファイトラック' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ファイトラック | トラックドライバーの休憩スポット検索',
    description: '全国のトラックドライバー向け休憩スポット検索サービス。シャワー・仮眠室・大型駐車場・温泉など設備で絞り込めます。',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'a3dd5ca59fefbd46',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSerifJP.variable} ${notoSansJP.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
