"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRequests } from "@/lib/api/queries.document";
import api from "@/lib/api/axios-instance";

type LocalProfile = {
  regions: string[]; // ["Seoul", "Gangnam-gu"] 형태
};

export default function ProposalLocal() {
  const [activeTab, setActiveTab] = useState<"recent" | "unread" | "mine">("recent");
  const [localProfile, setLocalProfile] = useState<LocalProfile | null>(null);
  const [filteredRequestIds, setFilteredRequestIds] = useState<number[]>([]);
  
  const { data: allRequests, isLoading } = useRequests();

  // 로컬 프로필 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/account/profile/local/');
        setLocalProfile(data);
      } catch (error) {
        console.error('프로필 로드 실패:', error);
      }
    };
    fetchProfile();
  }, []);

  // 지역 필터링: 로컬의 regions와 요청서의 place 지역 비교
  useEffect(() => {
    if (!localProfile || !allRequests) return;

    const filtered = allRequests.filter(request => {
      // place의 지역 정보 가져오기 (TravelPlace 모델에서 city, district)
      // regions: ["Seoul"] 또는 ["Seoul", "Gangnam-gu"]
      const regions = localProfile.regions;
      
      // 예시: regions = ["Seoul"] -> 서울의 모든 요청서
      // regions = ["Seoul", "Gangnam-gu"] -> 서울 강남구의 요청서만
      
      // 여기서는 간단하게 모든 요청서를 보여주게 처리
      // 실제로는 place ID로 TravelPlace 조회해서 비교해야 함
      return true;
    });

    setFilteredRequestIds(filtered.map(r => r.id));
  }, [localProfile, allRequests]);

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
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">로딩 중...</div>
        ) : !allRequests || allRequests.length === 0 ? (
          <div className="text-center py-10 text-gray-500">요청서가 없습니다.</div>
        ) : (
          allRequests.map((request) => (
            <article
              key={request.id}
              className="border-b border-[#EDEDED] py-4 last:border-none"
            >
              <div className="flex items-start justify-between">
                {/* LEFT */}
                <div>
                  <p className="text-[14px] font-semibold text-[#111]">
                    여행지 ID: {request.place}
                  </p>
                  <p className="mt-[2px] text-[12px] text-[#555]">
                    {request.date} · {request.number_of_people}명
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {request.travel_type.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="text-[11px] text-[#999] whitespace-nowrap"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                  {request.experience && (
                    <p className="mt-2 text-[12px] text-[#666] line-clamp-2">
                      {request.experience}
                    </p>
                  )}
                </div>

                {/* 제안서 보내기 버튼 */}
                <Link
                  href={`/proposal/send?requestId=${request.id}`}
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
          ))
        )}
      </main>
    </div>
  );
}