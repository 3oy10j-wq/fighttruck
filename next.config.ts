import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fighttruck.jp',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
