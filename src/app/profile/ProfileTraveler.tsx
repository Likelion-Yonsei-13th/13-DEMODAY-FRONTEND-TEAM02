// src/app/profile/ProfileTraveler.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetUserProfile } from "@/lib/api/mutations";
import { useQuery } from "@tanstack/react-query";
import { useRoots } from "@/lib/api/queries.document";
import api from "@/lib/api/axios-instance";
import { endpoints } from "@/lib/api/endpoints";
import RatingModal from "@/components/RatingModal";

export default function ProfileTraveler() {
  const router = useRouter();
  const { data: profile, isLoading, error } = useGetUserProfile();
  const [userId, setUserId] = useState<string | null>(null);
  const [purchasedRootIds, setPurchasedRootIds] = useState<number[]>([]);
  const [selectedRootForRating, setSelectedRootForRating] = useState<any | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const { data: allRoots } = useRoots();
  
  useEffect(() => {
    const id = localStorage.getItem("user_id");
    setUserId(id);
    
    // 구매된 제안서 ID 가져오기
    const purchased = JSON.parse(localStorage.getItem("purchased_roots") || "[]");
    setPurchasedRootIds(purchased);
  }, []);
  
  // 내 스토리 목록 조회
  const { data: allStoriesData } = useQuery<any>({
    queryKey: ["stories", "all"],
    queryFn: async () => {
      const { data } = await api.get(endpoints.story.list);
      console.log("[ProfileTraveler] 전체 스토리:", data);
      return data;
    },
    retry: false,
  });

  // 구매된 제안서 필터링
  const purchasedProposals = useMemo(() => {
    if (!allRoots || purchasedRootIds.length === 0) return [];
    return allRoots.filter((root: any) => purchasedRootIds.includes(root.id));
  }, [allRoots, purchasedRootIds]);
  
  // 내 스토리만 필터링
  const stories = React.useMemo(() => {
    if (!allStoriesData || !userId) return [];
    const allStories = allStoriesData.results || allStoriesData;
    console.log("[ProfileTraveler] allStories:", allStories);
    console.log("[ProfileTraveler] userId:", userId, "type:", typeof userId);
    
    const myStories = allStories.filter((s: any) => {
      console.log(`[ProfileTraveler] 스토리 author: ${s.author} (type: ${typeof s.author}), userId: ${userId}`);
      return String(s.author) === String(userId);
    });
    console.log("[ProfileTraveler] 내 스토리:", myStories);
    return myStories;
  }, [allStoriesData, userId]);
  
  if (error) {
    console.error("프로필 로드 실패:", error);
  }

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
              {profile?.display_name || "닉네임"}님이 작성한 후기
            </h2>
            <span className="text-[13px] font-semibold text-[#FFC727]">
              {stories.length}개
            </span>
          </div>

          {/* 오른쪽 연필 아이콘 - 스토리 추가 */}
          <button 
            type="button" 
            onClick={() => router.push("/story/create")}
            aria-label="스토리 추가"
          >
            <Image src="/edit.svg" alt="스토리 추가" width={16} height={16} />
          </button>
        </div>

        {/* 여행자 이야기 리스트 */}
        {stories.length === 0 ? (
          <div className="py-10 text-center text-[14px] text-[#999]">
            작성한 이야기가 없습니다.
          </div>
        ) : (
          <div className="space-y-0">
            {stories.map((story: any) => (
              <div 
                key={story.id} 
                className="border-b border-[#E5E5E5] py-5 cursor-pointer hover:bg-[#F9F9F9] transition-colors"
                onClick={() => router.push(`/story/${story.id}`)}
              >
                <div className="flex gap-4">
                  {/* 사진 */}
                  {story.photo_url && (
                    <div className="h-[80px] w-[80px] flex-shrink-0 overflow-hidden rounded bg-[#E5E5E5]">
                      <img 
                        src={story.photo_url} 
                        alt={story.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          console.error(`[이미지 로드 실패] URL:`, story.photo_url);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-[#111] truncate">
                      {story.title}
                    </h3>
                    <p className="mt-1 text-[12px] text-[#555] line-clamp-2">
                      {story.city && story.district 
                        ? `[${story.city} ${story.district}] `
                        : ""}
                      {story.preview || story.content?.substring(0, 100)}
                    </p>
                    <div className="mt-2 flex gap-4 text-[11px] text-[#999]">
                      <span>좋아요 {story.liked_count || 0}</span>
                      <span>조회 {story.view_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 후기 전체보기 버튼 */}
        <div className="mt-6">
          <button className="h-11 w-full rounded-[4px] bg-gradient-to-r from-[#FFC727] to-[#FFB42B] text-[14px] font-semibold text-white">
            전체보기
          </button>
        </div>
      </section>

      {/* ===== 구매한 제안서 ===== */}
      <section className="px-5 pt-10 pb-20">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-[18px] font-bold text-[#111]">구매한 제안서</h2>
          <span className="text-[13px] font-semibold text-[#FFC727]">{purchasedProposals.length}개</span>
        </div>

        {/* 구매한 제안서 목록 */}
        {purchasedProposals.length === 0 ? (
          <div className="py-10 text-center text-[14px] text-[#999]">
            구매한 제안서가 없습니다
          </div>
        ) : (
          purchasedProposals.map((root: any, idx: number) => (
            <div
              key={root.id}
              className={`${idx > 0 ? "pt-6" : "pt-5"} pb-6 ${idx < purchasedProposals.length - 1 ? "border-b" : ""} border-[#E5E5E5]`}
            >
              {/* 제안서 기본 정보 */}
              <div className="flex items-center gap-3">
                <div className="h-[44px] w-[44px] rounded-full bg-[#E5E5E5] flex items-center justify-center text-[18px] font-bold text-white">
                  {root.founder?.display_name?.charAt(0)?.toUpperCase() || '✢'}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-[#888]">
                    {typeof root.place === 'object'
                      ? root.place?.name || root.place?.city || '여행지'
                      : '여행지'}
                  </p>
                  <p className="mt-[2px] text-[14px] font-semibold text-[#111]">
                    {root.title || '제목 없음'}
                  </p>
                  <p className="mt-[2px] text-[12px] text-[#666]">
                    {root.founder?.display_name || '로컬'}
                  </p>
                </div>
              </div>

              {/* 평점 남기기 박스 */}
              <div className="mt-5 rounded-[10px] border border-[#FFCC47] bg-white px-6 py-4">
                <p className="mb-3 text-center text-[16px] font-bold text-[#333]">
                  평점을 남겨주세요
                </p>

                {/* 별점 선택 (숨김 - 모달에서만 표시) */}

                <div className="mt-3 flex justify-center">
                  <button
                    onClick={() => {
                      setSelectedRootForRating(root);
                      setIsRatingModalOpen(true);
                    }}
                    className="h-8 min-w-[60px] rounded-full border border-[#FFCC47] bg-white px-4 text-[14px] font-medium text-[#FFCC47] hover:bg-[#FFFAF0]"
                  >
                    완료
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
      
      {/* 평점 모달 */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onConfirm={async () => {
          // 평점 저장 로직
          return Promise.resolve();
        }}
        rootId={selectedRootForRating?.id || 0}
        rootTitle={selectedRootForRating?.title}
      />
    </div>
  );
}
