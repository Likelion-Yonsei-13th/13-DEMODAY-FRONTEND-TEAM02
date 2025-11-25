"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type RequestItem = {
  id: number;
  title: string;
  area: string;
  tags: string[];
};

const REQUESTS: RequestItem[] = [
  {
    id: 1,
    title: "종로구 한국체험",
    area: "종로구, 중구",
    tags: ["힐링여행", "빠빠빡", "로컬맛집"],
  },
];

export default function ProposalLocal() {
  const [activeTab, setActiveTab] = useState<"recent" | "unread" | "mine">(
    "recent"
  );

  return (
    <div className="mx-auto w-full max-w-[420px] bg-white pb-24">
      {/* HEADER */}
      <header className="border-b border-[#E5E5E5] px-5 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-bold text-[#111]">요청서</h1>
          <button aria-label="알림" className="p-1">
            <Image src="/bell.svg" alt="알림" width={20} height={20} />
          </button>
        </div>

        {/* TAB BAR */}
        <nav className="mt-4 flex text-[13px] font-semibold">
          {[
            { key: "recent", label: "최근 받은 요청서" },
            { key: "unread", label: "안읽은 요청서" },
            { key: "mine", label: "내 제안서" },
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  setActiveTab(tab.key as "recent" | "unread" | "mine")
                }
                className={`flex-1 pb-2 ${
                  active
                    ? "border-b-2 border-[#FFC727] text-[#FFC727]"
                    : "text-[#777]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* LIST */}
      <main className="px-5 pt-4">
        {REQUESTS.map((r) => (
          <article
            key={r.id}
            className="border-b border-[#EDEDED] py-4 last:border-none"
          >
            <div className="flex items-start justify-between">
              {/* LEFT */}
              <div>
                <p className="text-[14px] font-semibold text-[#111]">
                  {r.title}
                </p>
                <p className="mt-[2px] text-[12px] text-[#555]">{r.area}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {r.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] text-[#999] whitespace-nowrap"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 제안서 보내기 버튼 */}
              <Link
                href="/proposal/send"
                className="flex flex-col items-center text-[11px] text-[#FFC727] font-semibold"
              >
                <Image
                  src="/send-yellow.svg"
                  alt="제안"
                  width={22}
                  height={22}
                />
                제안서 보내기
              </Link>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
