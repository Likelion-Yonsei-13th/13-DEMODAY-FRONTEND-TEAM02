"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/nav/Navbar";
import Link from "next/link";

export default function WishDetailPage() {
  const [openSheet, setOpenSheet] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const items = Array(12).fill(0).map((_, i) => ({
    id: i,
    title: "서울 여행 TOP5",
    img: "/hot.png",
  }));

  return (
    <main className="min-h-screen bg-[#F5F5F5] pb-[80px]">
      {/* ---------- 헤더 ---------- */}
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/wish">
            <span className="text-[20px]">←</span>
          </Link>
          <div>
            <p className="text-[18px] font-bold">가을 여행 리스트</p>
            <p className="text-[12px] text-gray-500">12개의 항목</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* 삭제 버튼 */}
          <button
            onClick={() => setOpenDeleteModal(true)}
            className="text-[13px] text-gray-700"
          >
            삭제
          </button>

          {/* 점 3개 버튼 */}
          <button onClick={() => setOpenSheet(true)}>
            <Image src="/union.svg" width={3} height={13} alt="more" />
          </button>
        </div>
      </header>

      {/* ---------- 리스트 Grid ---------- */}
      <section className="grid grid-cols-3 gap-3 px-5">
        {items.map((item) => (
          <div key={item.id} className="relative aspect-square overflow-hidden rounded-[6px] bg-gray-200">
            <Image src={item.img} alt={item.title} fill className="object-cover" />

            <span className="absolute left-1.5 top-1.5 bg-[#F9D040] px-2 py-[2px] rounded-[4px] text-[10px] font-bold text-gray-900">
              NEW
            </span>

            <div className="absolute inset-x-0 bottom-0 bg-black/55 px-1.5 py-1">
              <p className="truncate text-[10px] text-white">{item.title}</p>
            </div>
          </div>
        ))}
      </section>

      <Navbar />

      {/* ---------- 바텀시트 ---------- */}
      {openSheet && (
  <div className="fixed inset-0 z-[200] bg-black/30">
    <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white pb-7 pt-5">
      {/* 상단 헤더 */}
      <div className="relative mb-4 flex items-center justify-center">
        <p className="text-[15px] font-semibold text-gray-900">환경설정</p>
        <button
          onClick={() => setOpenSheet(false)}
          className="absolute right-5 top-0"
        >
          <Image
            src="/close.svg"
            alt="close"
            width={20}
            height={20}
          />
        </button>
      </div>

      {/* 리스트 */}
      <div className="flex flex-col">
        {/* 1) 공유하기 */}
        <button className="flex h-12 w-full items-center border-b border-[#E5E5E5] px-5">
          <Image src="/share.svg" width={20} height={20} alt="share" />
          <span className="ml-3 text-[15px] text-gray-800">
            위시리스트 공유하기
          </span>
          <Image
            src="/expand_left.svg"
            width={20}
            height={20}
            alt="arrow"
            className="ml-auto" // → 오른쪽 방향
          />
        </button>

        {/* 2) 이름 변경 */}
        <button className="flex h-12 w-full items-center border-b border-[#E5E5E5] px-5">
          <Image src="/edit.svg" width={20} height={20} alt="edit" />
          <span className="ml-3 text-[15px] text-gray-800">이름 변경</span>
          <Image
            src="/expand_left.svg"
            width={20}
            height={20}
            alt="arrow"
            className="ml-auto"
          />
        </button>

        {/* 3) 위시리스트 삭제 */}
        <button
          onClick={() => {
            setOpenSheet(false);
            setOpenDeleteModal(true);
          }}
          className="flex h-12 w-full items-center px-5"
        >
          <Image src="/trash.svg" width={20} height={20} alt="trash" />
          <span className="ml-3 text-[15px] text-gray-800">
            위시리스트 삭제
          </span>
          <Image
            src="/expand_left.svg"
            width={20}
            height={20}
            alt="arrow"
            className="ml-auto"
          />
        </button>
      </div>
    </div>
  </div>
)}

      {/* ---------- 삭제 모달 ---------- */}
      {openDeleteModal && (
        <div className="fixed inset-0 z-[300] bg-black/30 flex items-center justify-center">
          <div className="w-[260px] rounded-xl bg-white p-5 text-center shadow-lg">
            <p className="mb-2 text-[15px] font-semibold">이 위시리스트를 삭제하시겠어요?</p>
            <p className="mb-4 text-[12px] text-gray-500">
              삭제 버튼을 누르시면, 항목들과 함께 삭제됩니다.
            </p>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setOpenDeleteModal(false)}
                className="w-[48%] rounded-md border py-2 text-[14px]"
              >
                취소
              </button>

              <button
                onClick={() => {
                  alert("삭제 완료");
                  setOpenDeleteModal(false);
                }}
                className="w-[48%] rounded-md py-2 text-[14px] text-[red]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
