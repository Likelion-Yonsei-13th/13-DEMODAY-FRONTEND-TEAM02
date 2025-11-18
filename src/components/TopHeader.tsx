"use client";

import Image from "next/image";

export default function TopHeader() {
  return (
    <header className="bg-white">
      <div className="mx-auto w-full max-w-[420px] px-5 pt-5 pb-3">
        {/* 로고 / 프로필 아이콘 */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[20px] font-semibold">D-tour</span>
          <Image src="/profile.svg" alt="프로필" width={24} height={24} />
        </div>

        {/* 검색 박스 */}
        <div className="flex items-center gap-2 border-b border-black pb-1">
          <input
            type="text"
            placeholder="검색어를 입력해주세요"
            className="flex-1 border-none bg-transparent text-[14px] outline-none placeholder:text-gray-400"
          />
          <Image src="/search.svg" alt="검색" width={16} height={16} />
        </div>
      </div>
    </header>
  );
}
