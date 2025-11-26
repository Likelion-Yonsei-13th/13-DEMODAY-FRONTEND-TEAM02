// src/app/search/page.tsx
"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/nav/Navbar";

function SearchContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("q") || "종로";

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-[calc(80px+env(safe-area-inset-bottom))]">
      <TopHeader />

      <section className="mx-auto w-full max-w-[420px] px-5 pt-4 pb-24 space-y-6">
        {/* 지도 영역 */}
        <div>
          <p className="text-[12px] text-gray-500">{keyword}</p>
          <div className="mt-2 h-[180px] w-full overflow-hidden rounded-[10px] bg-gray-300">
            <Image
              src="/map.png"
              alt="map"
              width={400}
              height={200}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* ===== 종로 place 섹션 ===== */}
        <section className="rounded-[10px] bg-white pt-4 pb-5 px-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[15px] font-bold">{keyword} place</p>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-[20px] leading-none">
              +
            </button>
          </div>

          {/* 가로 스크롤 카드 */}
          <div className="-mx-5 overflow-x-auto pb-2">
            <div className="flex gap-4 px-5">
              {[1, 2].map((i) => (
                <PlaceCard key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== 여행자 이야기 섹션 ===== */}
        <TravelerStorySection />

        {/* ===== 로컬's 제안서 섹션 ===== */}
        <LocalProposalSection />
      </section>

      <Navbar />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩중...</div>}>
      <SearchContent />
    </Suspense>
  );
}

/* ----------------------------- place 카드 ----------------------------- */

function PlaceCard() {
  return (
    <article className="w-[260px] flex-none overflow-hidden rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="relative h-[150px] w-full overflow-hidden">
        <Image
          src="/hot.png"
          alt="place"
          width={260}
          height={150}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full border border-[#0B3B75] bg-white px-3 py-1 text-[10px] font-semibold text-[#0B3B75]">
          NEW
        </span>
      </div>
      <div className="border-t border-gray-100 px-3 py-3">
        <p className="text-[11px] text-gray-500">서울 공방 TOP 10</p>
        <p className="mt-1 text-[13px] font-semibold text-gray-900">
          요즘은 이 공방이 유행!
        </p>
      </div>
    </article>
  );
}

/* -------------------------- 여행자 이야기 리스트 -------------------------- */

function TravelerStorySection() {
  // 여행자 이야기 “덩어리” 3개 정도 예시
  const groups = [1, 2, 3];

  return (
    <section className="bg-white">
      {groups.map((id) => (
        <TravelerStoryGroup key={id} />
      ))}
    </section>
  );
}

function TravelerStoryGroup() {
  const [open, setOpen] = useState(true);

  return (
    <div className="px-5 pt-4 pb-2">
      {/* 제목 + 토글 */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between cursor-pointer select-none"
      >
        <span className="text-[14px] font-semibold text-gray-900">
          여행자 이야기
        </span>

        {/* 위/아래 화살표 */}
        <span className="text-[18px] text-gray-500">
          {open ? "⌃" : "⌄"}
        </span>
      </button>

      {/* 제목 아래 border */}
      <div className="mt-1 border-t border-gray-200" />

      {/* 내용 (토글 열렸을 때만) */}
      {open && (
        <div className="pt-4 pb-2">
          {/* 카드 1개만 렌더링 */}
          <div className="mb-0">
            <div className="flex gap-3">

              {/* 왼쪽: 썸네일 + 좋아요수 */}
              <div className="flex w-[72px] flex-col items-start">
                <div className="h-[72px] w-[72px] border border-gray-300 bg-white" />
                <div className="mt-2 text-[10px] text-gray-400">
                  좋아요수
                </div>
              </div>

              {/* 오른쪽: 텍스트 */}
              <div className="flex-1">
                <p className="text-[12px] font-medium text-gray-900">
                  [카테고리명] 후기 제목을 입력하세요
                </p>
                <p className="mt-1 text-[11px] text-gray-500">
                  후기 내용 미리보기
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------- 로컬's 제안서 섹션 -------------------------- */

function LocalProposalSection() {
  const cards = [1, 2]; // 예시 2개

  return (
    <section className="bg-[#F4F4F4] pt-4">
      <div className="mx-auto w-full max-w-[420px] px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-gray-900">로컬&apos;s 제안서</h2>
          <button className="text-[11px] text-gray-400">
            실시간 제안서 더보기
          </button>
        </div>
      </div>

      <div className="-mx-5 overflow-x-auto pb-4">
        <div className="mx-auto flex w-full max-w-[420px] gap-4 px-5">
          {cards.map((i) => (
            <LocalProposalCard key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalProposalCard() {
  return (
    <article className="w-[260px] flex-none overflow-hidden rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="h-[200px] w-full overflow-hidden">
        <Image
          src="/travel.png"
          alt="local proposal"
          width={260}
          height={200}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex items-center gap-3 border-t border-gray-100 px-4 py-3">
        <div className="h-[32px] w-[32px] rounded-full bg-gray-200" />
        <div>
          <p className="text-[11px] text-gray-500">이름</p>
          <p className="text-[13px] font-semibold text-gray-900">소개글</p>
        </div>
      </div>
    </article>
  );
}
