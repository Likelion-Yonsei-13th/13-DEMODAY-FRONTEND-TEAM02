"use client";

import Image from "next/image";
import { useGetLocalProfile } from "@/lib/api/mutations";

export default function ProfileLocal() {
  const { data: profile, isLoading, error } = useGetLocalProfile();
  
  if (error) {
    console.error("프로필 로드 실패:", error);
  }
  
  return (
    <div className="mx-auto w-full max-w-[420px] bg-white pb-24">
      {/* --- 상단 프로필 영역 --- */}
      <section className="px-5 pt-10 pb-6">
        {/* 프로필 + 통계 + 프로필 수정 버튼 */}
        <div className="flex items-start justify-between">
          {/* 프로필 동그라미 */}
          <div className="flex items-center gap-4">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#E5E5E5]">
              <span className="text-[14px] font-semibold text-[#333]">
                프로필
              </span>
            </div>

            {/* 판매수 / 제안서 평점 / 후기수 */}
            <div className="flex gap-6 pt-1 text-center">
              {[
                { label: "판매수", value: 0 },
                { label: "제안서평점", value: 0 },
                { label: "후기수", value: 0 },
              ].map((item) => (
                <div key={item.label} className="min-w-[44px]">
                  <div className="text-[14px] font-semibold text-[#999999]">
                    {item.value}
                  </div>
                  <div className="mt-[2px] text-[11px] text-[#999999]">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 프로필 수정 버튼 */}
          <button className="h-8 rounded-full border border-[#333] px-4 text-[11px] font-medium text-[#333]">
            프로필 수정
          </button>
        </div>

        {/* 닉네임 / 한줄 소개 / MBTI + 날짜 / 수정 버튼 */}
        <div className="mt-5">
<p className="text-[18px] font-bold text-[#111]">{profile?.display_name ?? "닉네임"}</p>
          <p className="mt-1 text-[12px] text-[#555]">
            로컬이 적는 제안서 한줄 정리입니다
          </p>

          <div className="mt-3 text-[11px] text-[#666] leading-[1.4]">
            <p>MBTI_ISTJ</p>
            <p>25/09/22</p>
          </div>

          <div className="mt-3 flex justify-end">
            <button className="h-8 rounded-full border border-[#333] px-4 text-[12px] font-medium text-[#333]">
              수정
            </button>
          </div>
        </div>

        {/* 3 x 2 정사각형 그리드 */}
        <div className="mt-4 grid grid-cols-3 gap-[4px]">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-square bg-[#E5E5E5]"
            />
          ))}
        </div>
      </section>

      {/* --- 제안서 리스트 --- */}
      <section className="px-5 pt-8">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-[18px] font-bold text-[#111]">제안서</h2>
          <span className="text-[13px] font-semibold text-[#FFC727]">
            20개
          </span>
        </div>

        {/* 제안서 항목 2개만 예시로 */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border-b border-[#E5E5E5] pb-5 pt-5 first:pt-0"
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
              <div className="text-right text-[11px] font-semibold text-[#FFC727]">
                5회 판매
              </div>
            </div>
          </div>
        ))}

        {/* 전체보기 버튼 */}
        <div className="mt-6">
          <button className="h-11 w-full rounded-[4px] bg-gradient-to-r from-[#FFC727] to-[#FFB42B] text-[14px] font-semibold text-white">
            전체보기
          </button>
        </div>
      </section>

      {/* --- 제안서 후기 --- */}
      <section className="px-5 pt-10">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-[18px] font-bold text-[#111]">제안서 후기</h2>
          <span className="text-[13px] font-semibold text-[#FFC727]">
            4개
          </span>
        </div>

        {/* 후기 블록 3개 예시 */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="pb-5 pt-5 first:pt-0">
            <p className="mb-3 text-[14px] font-semibold text-[#111]">
              여행자이야기
            </p>
            <div className="border-t border-[#E5E5E5] flex gap-4">
              <div className="mt-[5px] h-[80px] w-[80px] bg-[#E5E5E5]" />
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
          </div>
        ))}

        {/* 후기 전체보기 버튼 */}
        <div className="mt-6">
          <button className="h-11 w-full rounded-[4px] bg-gradient-to-r from-[#FFC727] to-[#FFB42B] text-[14px] font-semibold text-white">
            전체보기
          </button>
        </div>
      </section>

      {/* --- 신뢰도 섹션 --- */}
      <section className="px-5 pt-10 pb-16">
        <h2 className="text-[18px] font-bold mb-4">
            <span className="text-[#F9D040]">신뢰도</span>
            <span className="text-black">를 올려보세요</span>
        </h2>

        {/* 본인인증 */}
        <div className="mt-6 border-b border-[#E5E5E5] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-[14px] font-semibold text-[#111]">
                본인인증
              </span>
              <span className="text-[14px] font-semibold text-[#FF3B30]">
                *
              </span>
            </div>
            <span className="text-[14px] font-semibold text-[#111]">인증</span>
          </div>
        </div>

        {/* 지역인증 */}
        <div className="border-b border-[#E5E5E5] py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[14px] font-semibold text-[#111]">
                  지역인증
                </span>
                <span className="text-[14px] font-semibold text-[#FF3B30]">
                  *
                </span>
              </div>
              <p className="mt-2 text-[12px] text-[#888]">
                인증된 지역의 제안만 가능해요
              </p>
            </div>
            <span className="text-[14px] font-semibold text-[#111]">인증</span>
          </div>
        </div>
      </section>
    </div>
  );
}
