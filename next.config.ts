import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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
