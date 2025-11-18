// src/components/TopHeader.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function TopHeader() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keyword.trim() !== "") {
      router.push(`/search?q=${keyword}`);
    }
  };

  return (
    <header className="w-full max-w-[420px] mx-auto px-5 pt-4 bg-white">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[18px] font-bold">D-tour</h1>
        <Image src="/profile.svg" alt="profile" width={24} height={24} />
      </div>

      {/* 검색창 */}
      <div className="flex items-center border-b border-gray-300 pb-2">
        <input
          placeholder="검색어를 입력해주세요"
          className="w-full bg-transparent outline-none text-[14px]"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button
          onClick={() => router.push(`/search?q=${keyword}`)}
          className="cursor-pointer"
        >
          <Image src="/search.svg" alt="search" width={18} height={18} />
        </button>
      </div>
    </header>
  );
}
