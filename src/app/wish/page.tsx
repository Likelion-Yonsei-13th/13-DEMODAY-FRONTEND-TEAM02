// src/app/wish/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/nav/Navbar";

type WishList = {
  id: number;
  title: string;
  countLabel: string;
};

const WISH_LISTS: WishList[] = [
  { id: 1, title: "가을 여행 리스트", countLabel: "12개의 항목" },
  { id: 2, title: "리스트", countLabel: "3개의 항목" },
  { id: 3, title: "성수동", countLabel: "22개의 항목" },
];

export default function WishPage() {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const toggleMenu = (id: number) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-[calc(80px+env(safe-area-inset-bottom))]">
      <section className="mx-auto w-full max-w-[420px] px-5 pt-6 pb-24">
        {/* 상단 타이틀 */}
        <header className="flex items-center justify-between">
          <h1 className="text-[18px] font-semibold text-gray-900">
            호리&apos;s 여행리스트
          </h1>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-[20px] leading-none"
            aria-label="리스트 추가"
          >
            +
          </button>
        </header>

        {/* 2열 카드 레이아웃 */}
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-20">
          {WISH_LISTS.map((list) => (
            <WishCard
              key={list.id}
              data={list}
              isMenuOpen={openMenuId === list.id}
              onToggleMenu={() => toggleMenu(list.id)}
            />
          ))}
        </div>
      </section>

      <Navbar />
    </main>
  );
}

function WishCard({
  data,
  isMenuOpen,
  onToggleMenu,
}: {
  data: WishList;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}) {
  return (
    <article className="relative w-full">
      {/* 2x2 썸네일 콜라주 */}
      <div className="overflow-hidden bg-gray-200">
        <div className="grid h-[162px] w-full grid-cols-2 grid-rows-2 gap-[2px] bg-white">
          <Image
            src="/fall.png"
            alt="위시 썸네일 1"
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
          <Image
            src="/hanock.png"
            alt="위시 썸네일 2"
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
          <Image
            src="/palace.png"
            alt="위시 썸네일 3"
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
          <Image
            src="/nightview.png"
            alt="위시 썸네일 4"
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* 제목 / 항목수 / 메뉴 */}
      <div className="mt-2 flex items-start justify-between">
        <div>
          {/* 제목을 상세 페이지 링크로 */}
          <Link
            href={`/wish/${data.id}`}
            className="block text-[13px] font-semibold text-gray-900"
          >
            {data.title}
          </Link>
          <p className="mt-1 text-[11px] text-gray-500">{data.countLabel}</p>
        </div>

        <button
          type="button"
          onClick={onToggleMenu}
          className="mt-1 flex h-6 w-6 items-center justify-center rounded-full text-[18px] text-gray-500 hover:bg-gray-100"
          aria-label="위시 리스트 옵션"
        >
          ⋮
        </button>
      </div>

      {/* 옵션 메뉴 */}
      {isMenuOpen && (
        <div className="absolute right-0 top-[140px] z-10 w-[88px] rounded-md border border-gray-200 bg-white py-1 text-[11px] text-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <button className="flex w-full items-center justify-start px-3 py-1 hover:bg-gray-100">
            삭제
          </button>
          <button className="flex w-full items-center justify-start px-3 py-1 hover:bg-gray-100">
            이름 변경
          </button>
        </div>
      )}
    </article>
  );
}
