// src/app/search/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/nav/Navbar";
import { useAuthRole } from "@/stores/authRole";
import { usePlacesByRegion, useSearchPlaces, useStoriesByRegion, absUrl, type TravelPlace, type StoryListItem } from "@/lib/api/queries.place";
import { useRoots, useRequests } from "@/lib/api/queries.document";

function SearchContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("q") || "";
  const initialStateParam = searchParams.get("state") || ""; // URL에서 state 파라미터 읽기
  const router = useRouter();

  // state 추론 (광역시/도)
  const inferStateFromKeyword = (k?: string) => {
    const s = (k || "").toLowerCase();
    if (s.includes("서울")) return "서울특별시";
    if (s.includes("부산")) return "부산광역시";
    if (s.includes("대구")) return "대구광역시";
    if (s.includes("인천")) return "인천광역시";
    if (s.includes("광주")) return "광주광역시";
    if (s.includes("대전")) return "대전광역시";
    if (s.includes("울산")) return "울산광역시";
    if (s.includes("세종")) return "세종특별자치시";
    if (s.includes("경기")) return "경기도";
    if (s.includes("강원")) return "강원도";
    if (s.includes("충북")) return "충청북도";
    if (s.includes("충남")) return "충청남도";
    if (s.includes("전북")) return "전라북도";
    if (s.includes("전남")) return "전라남도";
    if (s.includes("경북")) return "경상북도";
    if (s.includes("경남")) return "경상남도";
    if (s.includes("제주")) return "제주특별자치도";
    return undefined;
  };

  // city/district 추론 (구/동 단위)
  const inferCityOrDistrictFromKeyword = (k?: string) => {
    const s = (k || "").toLowerCase();
    // 서울 구 (정식 표기 포함)
    const seoulGus = [
      "종로구","중구","용산구","성동구","광진구","동대문구","중랑구","성북구","강북구","도봉구",
      "노원구","은평구","서대문구","마포구","양천구","강서구","구로구","금천구","영등포구","동작구",
      "관악구","서초구","강남구","송파구","강동구"
    ];
    for (const gu of seoulGus) {
      const base = gu.replace(/구$/, "");
      if (s.includes(gu) || s.includes(base)) return gu; // '중구' 또는 '중' 모두 대응하지 않음 -> base는 '중' 이라 충돌 가능성, 하지만 우선 포함 시 정식명 반환
    }
    return undefined;
  };

  // 선택된 지역 상태 (country는 기본 KR로 가정)
  const [region, setRegion] = useState<{ country?: string; state?: string; city?: string; district?: string }>({ country: "KR" });
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: suggestPlaces } = useSearchPlaces({ search: keyword || undefined, country: region.country });

  // 키어드만 있는 경우, 제안 결과의 첫 번째를 기준으로 지역을 추론
  const effectiveRegion = useMemo(() => {
    if (region.state || region.city || region.district) return region;
    
    // 0순위: URL 파라미터에서 전달된 state 우선 적용 (초기 지역 선택 유지)
    if (initialStateParam) {
      // 키어드에서 city/district 추론
      const inferredCityOrDistrict = inferCityOrDistrictFromKeyword(keyword);
      if (inferredCityOrDistrict) {
        return { country: "KR", state: initialStateParam, city: inferredCityOrDistrict };
      }
      return { country: "KR", state: initialStateParam };
    }
    
    // 1순위: 키어드에서 city/district 추론 (e.g., "종로" → "종로구")
    const inferredCityOrDistrict = inferCityOrDistrictFromKeyword(keyword);
    if (inferredCityOrDistrict) {
      // 결과에서 state와 city 정보를 가져옴 함께 반환
      const firstPlace = suggestPlaces?.[0];
      if (firstPlace?.state) {
        return { country: "KR", state: firstPlace.state, city: inferredCityOrDistrict };
      }
      return { country: "KR", city: inferredCityOrDistrict };
    }
    
    // 2순위: 제안 결과의 첫 번째를 기준으로 state 추론
    const firstWithState = (suggestPlaces || []).find((p) => !!p.state);
    if (firstWithState) {
      return { country: firstWithState.country || "KR", state: firstWithState.state };
    }
    
    // 3순위: state 키어드 추론 (e.g., "서울" → "서울특별시")
    const inferred = inferStateFromKeyword(keyword);
    if (inferred) return { country: "KR", state: inferred };
    
    // 마지막: API 결과의 첫 번째 장소 정보 활용
    const first = suggestPlaces?.[0];
    if (first) return { country: first.country || "KR" };
    return { country: "KR" };
  }, [region, suggestPlaces, keyword, initialStateParam]);

  const { data: placesByRegion } = usePlacesByRegion({ ...effectiveRegion, order: "likes", enabled: true });
  const regionReady = !!(effectiveRegion.state || effectiveRegion.city || effectiveRegion.district);
  const { data: stories } = useStoriesByRegion({ ...effectiveRegion, sort: "latest", enabled: regionReady });

  // 보여줄 place 소스: 해당 지역 리스트 우선, 없으면 검색 제안 상위 몇 개
  const placeCards: TravelPlace[] = useMemo(() => {
    // 지역 기반으로 동적 필터링
    const filterPlace = (place: TravelPlace): boolean => {
      // district > city > state 순서로 비교하되, state가 있으면 함께 일치시킴
      if (effectiveRegion.district) {
        const dMatch = !!place.district?.includes(effectiveRegion.district);
        if (!dMatch) return false;
        return !effectiveRegion.state || !!place.state?.includes(effectiveRegion.state);
      }
      if (effectiveRegion.city) {
        const cMatch = !!place.city?.includes(effectiveRegion.city);
        if (!cMatch) return false;
        return !effectiveRegion.state || !!place.state?.includes(effectiveRegion.state);
      }
      if (effectiveRegion.state) {
        return !!place.state?.includes(effectiveRegion.state);
      }
      return false;
    };

    if (placesByRegion && placesByRegion.length > 0) {
      return placesByRegion.filter(filterPlace);
    }
    if (suggestPlaces && suggestPlaces.length > 0) {
      return suggestPlaces.filter(filterPlace).slice(0, 10);
    }
    return [];
  }, [placesByRegion, suggestPlaces, effectiveRegion]);

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-[calc(80px+env(safe-area-inset-bottom))]">
      <TopHeader currentState={effectiveRegion.state || initialStateParam || undefined} />

      <section className="mx-auto w-full max-w-[420px] px-5 pt-4 pb-24 space-y-6">
        {/* 지도 영역 */}
        <div>
          <p className="text-[12px] text-gray-500">{keyword}</p>
          <div className="mt-2 h-[180px] w-full overflow-hidden rounded-[10px] bg-gray-300">
            <Image
              src="/map.png"
              alt="map"
              width={400}
              height={200}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* ===== 종로 place 섹션 ===== */}
        <section className="rounded-[10px] bg-white pt-4 pb-5 px-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[15px] font-bold">{(region.city || region.state || keyword || "지역").toString()} place</p>
            <button onClick={() => {
              const p = new URLSearchParams();
              if (effectiveRegion.country) p.set("country", effectiveRegion.country);
              if (effectiveRegion.state) p.set("state", effectiveRegion.state!);
              if (effectiveRegion.city) p.set("city", effectiveRegion.city!);
              if (effectiveRegion.district) p.set("district", effectiveRegion.district!);
              router.push(`/places?${p.toString()}`);
            }} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-[20px] leading-none" aria-label="장소 리스트">
              +
            </button>
          </div>

          {/* 가로 스크롤 카드 */}
          <div className="-mx-5 overflow-x-auto pb-2">
            <div className="flex gap-4 px-5">
              {placeCards.map((p) => (
                <PlaceCard key={p.id} place={p} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== 여행자 이야기 섹션 ===== */}
        {!regionReady ? (
          <div className="rounded-[10px] bg-white px-5 py-4 text-[13px] text-gray-500">정확한 지역을 선택하면 해당 지역의 여행자 이야기를 보여드립니다.</div>
        ) : (
          <TravelerStorySection stories={stories ?? []} region={effectiveRegion} />
        )}

        {/* ===== 로컬's 제안서 / 여행자's 제안서 섹션 ===== */}
        <LocalProposalSection region={effectiveRegion} />
      </section>

      {/* 장소 선택 모달 */}
      {/* 리스트 페이지로 이동하도록 변경했으므로 모달 제거 */}

      <Navbar />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩중...</div>}>
      <SearchContent />
    </Suspense>
  );
}

/* ----------------------------- place 카드 ----------------------------- */

function PlaceCard({ place }: { place: TravelPlace }) {
  return (
    <Link href={`/places/${place.id}`} className="w-[260px] flex-none overflow-hidden rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:opacity-80 transition-opacity">
      <div className="relative h-[150px] w-full overflow-hidden">
        {place.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={absUrl(place.photo)} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-[12px]">이미지 없음</span>
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 px-3 py-3">
        <p className="text-[11px] text-gray-500">{place.city} {place.district}</p>
        <p className="mt-1 text-[13px] font-semibold text-gray-900">
          {place.name}
        </p>
      </div>
    </Link>
  );
}

/* -------------------------- 여행자 이야기 리스트 -------------------------- */

function TravelerStorySection({ stories, region }: { stories: StoryListItem[]; region: { country?: string; state?: string; city?: string; district?: string } }) {
  // 조회수 높은 상위 5개 선별 (클라이언트 정렬)
  const top5 = [...(stories ?? [])].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5);
  return <TravelerStoryGroup stories={top5} region={region} />;
}

function TravelerStoryGroup({ stories, region }: { stories: StoryListItem[]; region: { country?: string; state?: string; city?: string; district?: string } }) {
  const router = useRouter();

  return (
    <section className="bg-[#F4F4F4] pt-4">
      <div className="mx-auto w-full max-w-[420px] px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-gray-900">여행자 이야기</h2>
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams();
              if (region.country) params.set("country", region.country);
              if (region.state) params.set("state", region.state);
              if (region.city) params.set("city", region.city);
              if (region.district) params.set("district", region.district);
              router.push(`/stories?${params.toString()}`);
            }}
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            모두 보기
          </button>
        </div>
      </div>

      <div className="-mx-5 overflow-x-auto pb-4">
        <div className="mx-auto flex w-full max-w-[420px] gap-3 px-5">
          {(stories ?? []).length > 0 ? (
            stories.map((s) => (
              <Link
                key={s.id}
                href={`/story/${s.id}`}
                className="w-[200px] flex-none overflow-hidden rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow"
              >
                <div className="h-[140px] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={absUrl(s.photo_url)} alt={s.title} className="h-full w-full object-cover" />
                </div>
                <div className="px-3 py-3">
                  <p className="text-[12px] font-semibold text-gray-900 line-clamp-1">{s.title}</p>
                  <p className="mt-1 text-[11px] text-gray-500 line-clamp-2">{s.preview || s.content?.slice(0, 60)}</p>
                  <div className="mt-2 text-[10px] text-gray-400">❤️ {s.liked_count} 👁 {s.view_count}</div>
                </div>
              </Link>
            ))
          ) : (
            <div className="mx-auto w-full max-w-[420px] px-5 text-center py-8">
              <p className="text-[12px] text-gray-500">해당 지역의 이야기가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* 리스트/상세는 /places, /places/[id] 페이지에서 처리 */

/* -------------------------- role별 제안서 섹션 (로컬's 제안서 / 여행자's 제안서) -------------------------- */

function LocalProposalSection({ region }: { region: { country?: string; state?: string; city?: string; district?: string } }) {
  const role = useAuthRole((s) => s.role);
  const { data: roots } = useRoots();
  const { data: requests } = useRequests();
  const router = useRouter();

  // 지역 기반 필터링 함수 (정확한 일치)
  const filterByRegion = (item: any): boolean => {
    const place = item.place;
    if (!place || typeof place === 'number') return false; // place 데이터 없으면 제외
    
    // 규른 렸른단계 슰쵴: state 봌중 (광역시/도) 물늤른 단계 토츅니굩
    // 예: "중구" 검색 시 "대전 중구" 단제 거른 줘나를 내 옵 단덱 state 필수
    
    if (region.district) {
      // district 지정 + state 포롄 확인
      const districtMatch = place.district?.includes(region.district);
      if (!districtMatch) return false;
      // state도 마찰가다 확인 (대전, 서울 등 선별)
      return !region.state || place.state?.includes(region.state);
    }
    
    if (region.city) {
      // city 지정 + state 포롄 확인
      const cityMatch = place.city?.includes(region.city);
      if (!cityMatch) return false;
      return !region.state || place.state?.includes(region.state);
    }
    
    if (region.state) {
      return !!place.state?.includes(region.state);
    }
    // country만 있으면 제외
    return false;
  };

  // role에 따라 표시할 데이터 결정
  const isUserRole = role === "user";
  const allProposals = isUserRole ? roots || [] : requests || [];
  
  // 지역 기반으로 필터링한 데이터
  const proposalList = allProposals.filter(filterByRegion);
  
  const sectionTitle = isUserRole ? "로컬's 제안서" : "여행자's 제안서";
  const moreButtonText = isUserRole ? "모든 로컬 제안서 더보기" : "모든 여행자 제안서 더보기";

  // 최대 4개 표시
  const displayCards = proposalList.slice(0, 4);

  return (
    <section className="bg-[#F4F4F4] pt-4">
      <div className="mx-auto w-full max-w-[420px] px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-gray-900">{sectionTitle}</h2>
          <button
            type="button"
            onClick={() => {
              if (isUserRole) {
                router.push("/local-proposals");
              } else {
                router.push("/proposal");
              }
            }}
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            {moreButtonText}
          </button>
        </div>
      </div>

      <div className="-mx-5 overflow-x-auto pb-4">
        <div className="mx-auto flex w-full max-w-[420px] gap-4 px-5">
          {displayCards.length > 0 ? (
            displayCards.map((item: any) => {
              // Root (로컬 제안서)
              if (isUserRole && 'founder' in item) {
                const root = item as any;
                return (
                  <Link
                    key={root.id}
                    href={`/proposal/${root.id}`}
                    className="w-[260px] flex-none overflow-hidden rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow"
                  >
                    <div className="h-[200px] w-full overflow-hidden">
                      {root.photo ? (
                        <img src={root.photo} alt={root.title || "제안서"} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-[12px]">이미지 없음</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 border-t border-gray-100 px-4 py-3">
                      {root.founder?.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={root.founder.photo_url}
                          alt={root.founder.display_name || "로컬"}
                          className="h-[32px] w-[32px] rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-[32px] w-[32px] rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                          {(root.founder?.display_name || "로")[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-500 truncate">{root.founder?.display_name || "로컬"}</p>
                        <p className="text-[13px] font-semibold text-gray-900 truncate">{root.title || "제안서"}</p>
                      </div>
                    </div>
                  </Link>
                );
              }
              // Request (여행자 요청서)
              if (!isUserRole && 'user' in item) {
                const request = item as any;
                return (
                  <Link
                    key={request.id}
                    href={`/proposal/${request.id}`}
                    className="w-[260px] flex-none overflow-hidden rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow"
                  >
                    <div className="h-[200px] w-full overflow-hidden">
                      <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-500 text-[12px]">이미지 없음</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-gray-100 px-4 py-3">
                      {request.user?.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={request.user.photo_url}
                          alt={request.user.display_name || "여행자"}
                          className="h-[32px] w-[32px] rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-[32px] w-[32px] rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                          {(request.user?.display_name || "여")[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-500 truncate">{request.user?.display_name || "여행자"}</p>
                        <p className="text-[13px] font-semibold text-gray-900 truncate">{request.place?.name || request.title || "요청서"}</p>
                      </div>
                    </div>
                  </Link>
                );
              }
              return null;
            })
          ) : (
            <div className="mx-auto w-full max-w-[420px] px-5 text-center py-8">
              <p className="text-[12px] text-gray-500">제안서가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
