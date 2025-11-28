import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: {
    // Vercel 환경 변수가 없을 때 기본값 사용
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://d-tour.kr',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'd-tour.kr',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'd-tour.kr',
        port: '',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;
