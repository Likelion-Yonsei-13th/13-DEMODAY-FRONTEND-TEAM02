"use client";

import { useState } from "react";
import Image from "next/image";

export default function DayDetailSection({
  day,
  onClose,
}: {
  day: number;
  onClose: () => void;
}) {
  const [startHour, setStartHour] = useState(1);
  const [startMin, setStartMin] = useState(30);
  const [endHour, setEndHour] = useState(1);
  const [endMin, setEndMin] = useState(30);

  return (
    <div className="mt-3 bg-[#F2F2F2] px-5 py-5 shadow-sm relative">

      {/* 오른쪽 위 X 아이콘 */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4"
        aria-label="닫기"
      >
        <Image
          src="/x.svg"
          alt="닫기"
          width={20}
          height={20}
          className="opacity-70"
        />
      </button>

      {/* 날짜 */}
      <p className="text-[15px] font-semibold text-[#333] mb-4">
        25년 11월 {day}일
      </p>

      {/* 시간 선택 */}
      <p className="text-[12px] text-[#333] font-medium mb-2">시간선택</p>

      <div className="flex gap-3 items-center flex-wrap">
        {/* 시작 */}
        <select
          value={startHour}
          onChange={(e) => setStartHour(Number(e.target.value))}
          className="w-[70px] h-[40px] rounded-[6px] border border-[#D1D5DB] bg-white px-2 text-[14px]"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>

        <span className="text-[14px]">시</span>

        <select
          value={startMin}
          onChange={(e) => setStartMin(Number(e.target.value))}
          className="w-[70px] h-[40px] rounded-[6px] border bg-white px-2 text-[14px]"
        >
          {[0, 30].map((n) => (
            <option key={n}>{String(n).padStart(2, "0")}</option>
          ))}
        </select>

        <span className="text-[14px]">분</span>

        <span className="text-[14px] text-[#555]">~</span>

        {/* 종료 */}
        <select
          value={endHour}
          onChange={(e) => setEndHour(Number(e.target.value))}
          className="w-[70px] h-[40px] rounded-[6px] border bg-white px-2 text-[14px]"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>

        <span className="text-[14px]">시</span>

        <select
          value={endMin}
          onChange={(e) => setEndMin(Number(e.target.value))}
          className="w-[70px] h-[40px] rounded-[6px] border bg-white px-2 text-[14px]"
        >
          {[0, 30].map((n) => (
            <option key={n}>{String(n).padStart(2, "0")}</option>
          ))}
        </select>

        <span className="text-[14px]">분</span>
      </div>

      {/* 장소 */}
      <input
        placeholder="장소, 주소를 입력해주세요"
        className="mt-4 w-full h-[44px] rounded-[6px] border border-[#D1D5DB] px-3 text-[14px] bg-white"
      />

      {/* 제목 */}
      <input
        placeholder="제목을 입력해주세요"
        className="mt-3 w-full h-[44px] rounded-[6px] border border-[#D1D5DB] px-3 text-[14px] bg-white"
      />

      {/* 설명 */}
      <textarea
        placeholder="장소 특징이나 활동 등을 적어주세요."
        className="mt-4 w-full min-h-[110px] rounded-[8px] border border-[#D1D5DB] px-3 py-3 bg-[#F7F7F7] text-[13px] text-[#333]"
      />
    </div>
  );
}
