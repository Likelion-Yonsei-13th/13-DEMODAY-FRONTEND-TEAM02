"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from '../components/nav/Navbar';
import TopHeader from "@/components/TopHeader";
import { useAuthRole } from "@/stores/authRole";
import { useRequests, useRoots } from "@/lib/api/queries.document";

const CATEGORIES = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산"
];

const TREND = [
  { id: 1, title: "요즘은 이 공방이 유행!", tag: "서울 공방 TOP 10", img: "/travel.png" },
  { id: 2, title: "지금 이 시간만 가능한 뷰", tag: "가을 단풍 명소", img: "/travel.png" },
];

export default function HomePage() {
  const role = useAuthRole((state) => state.role);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Roots(로컬 제안서) 또는 Requests(여행자 요청서) 조회
  const { data: rootsData, isLoading: rootsLoading, error: rootsError } = useRoots();
  const { data: requestsData, isLoading: requestsLoading, error: requestsError } = useRequests();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Hydration mismatch 방지
  }

  // role에 따라 표시할 데이터와 텍스트 결정
  const isUserRole = role === "user";
  const proposalData = isUserRole ? rootsData || [] : requestsData || [];
  const isLoading = isUserRole ? rootsLoading : requestsLoading;
  const error = isUserRole ? rootsError : requestsError;
  const sectionTitle = isUserRole ? "로컬's 제안서" : "여행자's 제안서";

  // 데이터가 없을 때 더미 데이터 (기존 유지)
  const dummyData = [
    { id: 1, title: "제안서를 기다리는 중", name: "이름", intro: "소개글", image: "/travel.png" },
    { id: 2, title: "더 많은 제안서를 만나보세요", name: "이름", intro: "소개글", image: "/travel.png" },
  ];
  const displayData = proposalData.length > 0 
    ? proposalData.slice(0, 4) // 최대 4개만 표시
    : (dummyData as any);
  return (
    <main className="min-h-screen pb-[88px] bg-white">
      {/* ===== 헤더 ===== */}

      <TopHeader />

      {/* ===== 지역 카테고리 ===== */}
      <section className="mx-auto w-full max-w-[420px] px-5">

        <div className="mt-10">
          <div className="flex flex-wrap gap-3 bg-[#F7F8FA] justify-center py-5">
            {CATEGORIES.map((t, i) => {
              // state 매핑
              const stateMap: Record<string, string> = {
                "서울": "서울특별시",
                "부산": "부산광역시",
                "대구": "대구광역시",
                "인천": "인천광역시",
                "광주": "광주광역시",
                "대전": "대전광역시",
                "울산": "울산광역시",
              };
              const state = stateMap[t];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => router.push(`/search?q=${t}&state=${encodeURIComponent(state || '')}`)}
                  className="px-4 py-2 rounded-[30px] border border-[#93AAC3] bg-white text-[14px] text-black transition-colors hover:text-white hover:border-transparent hover:bg-gradient-to-r hover:from-[#F9D040] hover:to-[#F6BB33]"
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Trend ===== */}
      <section className="mx-auto w-full max-w-[420px] px-5 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] font-bold text-gray-900">Trend</h3>
        </div>

        <div className="mt-3 overflow-x-auto">
          <div className="flex gap-3 w-max">
            {TREND.map((item) => (
              <article
                key={item.id}
                className="w-[240px] shrink-0 rounded-[12px] bg-white overflow-hidden"
              >
                <div className="relative h-[240px]">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                  <span className="absolute left-3 top-3 text-[12px] font-semibold text-[#0A2D5E] bg-white/90 rounded-full border border-[#0A2D5E] px-3 py-1">
                    NEW
                  </span>
                </div>

                <div className="px-4 py-3">
                  <p className="text-[12px] text-gray-500">{item.tag}</p>
                  <p className="mt-2 text-[16px] font-semibold text-gray-900">
                    {item.title}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 제안서 섹션 (Role별) ===== */}
      <section className="mx-auto w-full max-w-[420px] px-5 mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] font-bold text-gray-900">{sectionTitle}</h3>
          <button className="text-[12px] border-b border-gray-500 text-gray-500" type="button">
            {isUserRole ? "모든 로컬 제안서" : "모든 여행자 요청서"}
          </button>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="mt-3 text-center text-gray-500 py-8">
            <p>제안서를 불러오는 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="mt-3 text-center text-red-500 py-8">
            <p>제안서를 불러올 수 없습니다.</p>
          </div>
        )}

        {/* 제안서 카드 */}
        {!isLoading && (
          <div className="mt-3 overflow-x-auto">
            <div className="flex gap-3 w-max">
              {displayData.map((item: any) => {
                // Root(로컬 제안서)
                if (isUserRole && 'founder' in item) {
                  const root = item as any;
                  return (
                    <article
                      key={root.id}
                      className="w-[240px] shrink-0 rounded-[12px] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-[240px]">
                        <Image
                          src={root.photo || "/travel.png"}
                          alt={root.title || "제안서"}
                          fill
                          className="object-cover"
                          sizes="240px"
                        />
                      </div>
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {root.founder?.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={root.founder.photo_url}
                              alt={root.founder.display_name || "로컬"}
                              className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                              {(root.founder?.display_name || "로")[0]}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium text-gray-900 truncate">
                              {root.founder?.display_name || "로컬"}
                            </p>
                            <p className="text-[12px] text-gray-500 truncate">
                              {root.title || "제안서"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
                // Request(여행자 요청서)
                if (!isUserRole && 'user' in item) {
                  const request = item as any;
                  return (
                    <article
                      key={request.id}
                      className="w-[240px] shrink-0 rounded-[12px] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-[240px]">
                        <Image
                          src={request.place?.photo || "/travel.png"}
                          alt={request.place?.name || request.title || "요청서"}
                          fill
                          className="object-cover"
                          sizes="240px"
                        />
                      </div>
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {request.user?.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={request.user.photo_url}
                              alt={request.user.display_name || "여행자"}
                              className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                              {(request.user?.display_name || "여")[0]}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium text-gray-900 truncate">
                              {request.user?.display_name || "여행자"}
                            </p>
                            <p className="text-[12px] text-gray-500 truncate">
                              {request.place?.name || request.title || "요청서"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
                // 더미 데이터 (데이터 없을 때)
                return (
                  <article
                    key={item.id}
                    className="w-[240px] shrink-0 rounded-[12px] bg-white overflow-hidden shadow-sm"
                  >
                    <div className="relative h-[240px]">
                      <Image
                        src={item.image || "/travel.png"}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="240px"
                      />
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                        <div>
                          <p className="text-[14px] font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-[12px] text-gray-500">{item.intro}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

    <Navbar />
    </main>
  );
}
