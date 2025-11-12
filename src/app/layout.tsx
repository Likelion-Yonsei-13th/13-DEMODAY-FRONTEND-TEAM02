import "./globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";

const roboto = Roboto({ subsets: ["latin"], weight: ["400","500","700"] });

export const metadata: Metadata = {
  title: "D-tour",
  description: "로컬이 만들어주는 맞춤 여행 가이드 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={roboto.className + " min-h-screen"}>{children}</body>
    </html>
  );
}
