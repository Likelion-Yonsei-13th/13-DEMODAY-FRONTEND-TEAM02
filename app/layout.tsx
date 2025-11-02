import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import Providers from '@/components/Providers'; // 1. 방금 만든 Providers 임포트

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '데모데이 프론트엔드 팀02', // <--- 타이틀도 수정해 보세요!
  description: '멋진 데모데이 프로젝트',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* 2. <Providers>로 children 감싸기 */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
