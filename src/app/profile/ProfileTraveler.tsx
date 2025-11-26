// src/app/profile/ProfileTraveler.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetUserProfile } from "@/lib/api/mutations";

export default function ProfileTraveler() {
  const router = useRouter();
  const { data: profile, isLoading, error } = useGetUserProfile();
  
  if (error) {
    console.error("프로필 로드 실패:", error);
  }
  
  // 여행자 이야기 토글 상태 (index별로 on/off)
  const storyIds = [1, 2, 3];
  const [openStories, setOpenStories] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
  });

  const toggleStory = (id: number) => {
    setOpenStories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="mx-auto w-full max-w-[420px] bg-white pb-24">
      {/* ===== 상단 프로필 영역 ===== */}
      <section className="px-5 pt-10 pb-6">
        <div className="flex items-start justify-between">
          {/* 왼쪽: 프로필 동그라미 + 텍스트들 */}
          <div>
            {/* 프로필 동그라미 */}
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#E5E5E5]">
              <span className="text-[14px] font-semibold text-[#333]">
                프로필
              </span>
            </div>

            {/* 닉네임 / 한줄 소개 / MBTI + 날짜 */}
            <div className="mt-4">
<p className="text-[18px] font-bold text-[#111]">{profile?.display_name ?? "닉네임"}</p>
              <p className="mt-1 text-[12px] text-[#555]">
                {profile?.bio || "자기소개를 작성해주세요"}
              </p>
              <div className="mt-3 text-[11px] leading-[1.4] text-[#666]">
                <p>MBTI: {profile?.mbti || "정보 없음"}</p>
                <p>여행 스타일: {profile?.travel_style || "정보 없음"}</p>
              </div>
            </div>
          </div>

          {/* 프로필 수정 버튼 */}
          <button
            type="button"
            onClick={() => router.push("/profile/edit/user")}
            className="mt-6 flex w-[85px] items-center justify-center gap-[10px] rounded-[10px] border border-black bg-white/90 px-2 py-1 text-[11px] font-medium text-[#111]"
          >
            프로필 수정
          </button>
        </div>

        {/* 썸네일 3 x 2 그리드 */}
        <div className="mt-6 grid grid-cols-3 gap-[4px]">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="aspect-square bg-[#E5E5E5]" />
          ))}
        </div>
      </section>

      {/* ===== OO님이 작성한 후기 ===== */}
      <section className="px-5 pt-8">
        {/* 타이틀 줄 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[18px] font-bold text-[#111]">
              00님이 작성한 후기
            </h2>
            <span className="text-[13px] font-semibold text-[#FFC727]">
              12개
            </span>
          </div>

          {/* 오른쪽 연필 아이콘 */}
          <button type="button" aria-label="후기 편집">
            <Image src="/edit.svg" alt="후기 편집" width={16} height={16} />
          </button>
        </div>

        {/* 여행자 이야기 리스트 */}
        {storyIds.map((id) => {
          const isOpen = openStories[id] ?? true;

          return (
            <div key={id} className="border-b border-[#E5E5E5] pb-5">
              {/* 헤더: 여행자 이야기 + 토글 화살표 */}
              <button
                type="button"
                className="flex w-full items-center justify-between pt-5"
                onClick={() => toggleStory(id)}
                aria-expanded={isOpen}
              >
                <span className="text-[14px] font-semibold text-[#111]">
                  여행자 이야기
                </span>
                <Image
                  src="/taggle.svg"
                  alt={isOpen ? "접기" : "펼치기"}
                  width={16}
                  height={16}
                  className={`transition-transform ${
                    isOpen ? "" : "rotate-180"
                  }`}
                />
              </button>

              {/* 내용 영역 (토글) */}
              {isOpen && (
                <div className="mt-4 flex gap-4">
                  <div className="h-[80px] w-[80px] bg-[#E5E5E5]" />
                  <div className="flex-1">
                    <p className="text-[12px] text-[#555]">
                      [카테고리명] 후기 제목을 입력하세요
                      <br />
                      후기 내용 미리보기
                    </p>
                    <div className="mt-3 flex gap-6 text-[11px] text-[#999]">
                      <span>좋아요수</span>
                      <span>댓글수</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 후기 전체보기 버튼 */}
        <div className="mt-6">
          <button className="h-11 w-full rounded-[4px] bg-gradient-to-r from-[#FFC727] to-[#FFB42B] text-[14px] font-semibold text-white">
            전체보기
          </button>
        </div>
      </section>

      {/* ===== 구매한 제안서 ===== */}
      <section className="px-5 pt-10">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-[18px] font-bold text-[#111]">구매한 제안서</h2>
          <span className="text-[13px] font-semibold text-[#FFC727]">9개</span>
        </div>

        {/* 첫 번째 카드 + 평점 박스 */}
        <div className="border-b border-[#E5E5E5] pb-6 pt-5">
          {/* 제안서 기본 정보 */}
          <div className="flex items-center gap-3">
            <div className="h-[44px] w-[44px] rounded-full bg-[#E5E5E5]" />
            <div className="flex-1">
              <p className="text-[11px] text-[#888]">종로구 한국체험</p>
              <p className="mt-[2px] text-[14px] font-semibold text-[#111]">
                종로구 A to Z 체험!
              </p>
              <p className="mt-[2px] text-[12px] text-[#666]">
                로컬이 적는 제안서 한줄 정리입니다
              </p>
              <p className="mt-[4px] text-[11px] text-[#999]">
                로컬이름(닉네임)
              </p>
            </div>
          </div>

          {/* 평점 남기기 박스 (디자인 박스) */}
          <div className="mt-5 rounded-[10px] border border-[#FFCC47] bg-white px-6 py-4">
            <p className="mb-3 text-center text-[16px] font-bold text-[#333]">
              평점을 남겨주세요
            </p>

            {/* 별점 (샘플) */}
            <div className="flex justify-center gap-3 text-[20px]">
              <span className="text-[#FFC727]">★</span>
              <span className="text-[#FFC727]">★</span>
              <span className="text-[#CCCCCC]">★</span>
              <span className="text-[#CCCCCC]">★</span>
              <span className="text-[#CCCCCC]">★</span>
            </div>

            <div className="mt-3 flex justify-center">
              <button className="h-8 min-w-[60px] rounded-full border border-[#FFCC47] bg-white px-4 text-[14px] font-medium text-[#FFCC47]">
                완료
              </button>
            </div>
          </div>
        </div>

        {/* 나머지 구매 제안서 샘플 2개 */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border-b border-[#E5E5E5] pb-6 pt-6 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="h-[44px] w-[44px] rounded-full bg-[#E5E5E5]" />
              <div className="flex-1">
                <p className="text-[11px] text-[#888]">종로구 한국체험</p>
                <p className="mt-[2px] text-[14px] font-semibold text-[#111]">
                  종로구 A to Z 체험!
                </p>
                <p className="mt-[2px] text-[12px] text-[#666]">
                  로컬이 적는 제안서 한줄 정리입니다
                </p>
                <p className="mt-[4px] text-[11px] text-[#999]">
                  로컬이름(닉네임)
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* 전체보기 버튼 */}
        <div className="mt-6 mb-4">
          <button className="h-11 w-full rounded-[4px] bg-gradient-to-r from-[#FFC727] to-[#FFB42B] text-[14px] font-semibold text-white">
            전체보기
          </button>
        </div>
      </section>
    </div>
  );
}
