// src/app/search/page.tsx
"use client";

import Image from "next/image";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/nav/Navbar";
import { usePlacesByRegion, useSearchPlaces, useStoriesByRegion, absUrl, type TravelPlace, type StoryListItem } from "@/lib/api/queries.place";

function SearchContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("q") || "";
  const router = useRouter();

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

  // 선택된 지역 상태 (country는 기본 KR로 가정)
  const [region, setRegion] = useState<{ country?: string; state?: string; city?: string; district?: string }>({ country: "KR" });
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: suggestPlaces } = useSearchPlaces({ search: keyword || undefined, country: region.country });

  // 키워드만 있는 경우, 제안 결과의 첫 번째를 기준으로 지역을 추론
  const effectiveRegion = useMemo(() => {
    if (region.state || region.city || region.district) return region;
    const firstWithState = (suggestPlaces || []).find((p) => !!p.state);
    if (firstWithState) {
      return { country: firstWithState.country || "KR", state: firstWithState.state };
    }
    const inferred = inferStateFromKeyword(keyword);
    if (inferred) return { country: "KR", state: inferred };
    const first = suggestPlaces?.[0];
    if (first) return { country: first.country || "KR" };
    return { country: "KR" };
  }, [region, suggestPlaces, keyword]);

  const { data: placesByRegion } = usePlacesByRegion({ ...effectiveRegion, order: "likes", enabled: true });
  const regionReady = !!(effectiveRegion.state || effectiveRegion.city || effectiveRegion.district);
  const { data: stories } = useStoriesByRegion({ ...effectiveRegion, sort: "latest", enabled: regionReady });

  // 보여줄 place 소스: 해당 지역 리스트 우선, 없으면 검색 제안 상위 몇 개
  const placeCards: TravelPlace[] = useMemo(() => {
    if (placesByRegion && placesByRegion.length > 0) return placesByRegion;
    if (suggestPlaces && suggestPlaces.length > 0) return suggestPlaces.slice(0, 10);
    return [];
  }, [placesByRegion, suggestPlaces]);

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-[calc(80px+env(safe-area-inset-bottom))]">
      <TopHeader />

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
          <TravelerStorySection stories={stories ?? []} />
        )}

        {/* ===== 로컬's 제안서 섹션 ===== */}
        <LocalProposalSection />
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
    <article className="w-[260px] flex-none overflow-hidden rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="relative h-[150px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={absUrl(place.photo)} alt={place.name} className="h-full w-full object-cover" />
      </div>
      <div className="border-t border-gray-100 px-3 py-3">
        <p className="text-[11px] text-gray-500">{place.city} {place.district}</p>
        <p className="mt-1 text-[13px] font-semibold text-gray-900">
          {place.name}
        </p>
      </div>
    </article>
  );
}

/* -------------------------- 여행자 이야기 리스트 -------------------------- */

function TravelerStorySection({ stories }: { stories: StoryListItem[] }) {
  // 그룹 토글 형태 유지 (한 그룹만 사용)
  return (
    <section className="bg-white">
      <TravelerStoryGroup stories={stories} />
    </section>
  );
}

function TravelerStoryGroup({ stories }: { stories: StoryListItem[] }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="px-5 pt-4 pb-2">
      {/* 제목 + 토글 */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between cursor-pointer select-none"
      >
        <span className="text-[14px] font-semibold text-gray-900">
          여행자 이야기
        </span>

        {/* 위/아래 화살표 */}
        <span className="text-[18px] text-gray-500">
          {open ? "⌃" : "⌄"}
        </span>
      </button>

      {/* 제목 아래 border */}
      <div className="mt-1 border-t border-gray-200" />

      {/* 내용 (토글 열렸을 때만) */}
      {open && (
        <div className="pt-4 pb-2">
          <div className="space-y-3">
            {(stories ?? []).slice(0, 5).map((s) => (
              <div key={s.id} className="flex gap-3">
                {/* 왼쪽 썸네일 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={absUrl(s.photo_url)} alt={s.title} className="h-[72px] w-[96px] rounded object-cover border" />
                {/* 오른쪽 텍스트 */}
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-gray-900">{s.title}</p>
                  <p className="mt-1 text-[11px] text-gray-500 line-clamp-2">{s.preview || s.content?.slice(0, 80)}</p>
                  <div className="mt-1 text-[10px] text-gray-400">좋아요 {s.liked_count} · 조회 {s.view_count}</div>
                </div>
              </div>
            ))}
            {(stories ?? []).length === 0 && (
              <div className="py-6 text-center text-[12px] text-gray-400">해당 지역의 이야기가 없습니다.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* 리스트/상세는 /places, /places/[id] 페이지에서 처리 */

/* -------------------------- 로컬's 제안서 섹션 -------------------------- */

function LocalProposalSection() {
  const cards = [1, 2]; // 예시 2개

  return (
    <section className="bg-[#F4F4F4] pt-4">
      <div className="mx-auto w-full max-w-[420px] px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-gray-900">로컬&apos;s 제안서</h2>
          <button className="text-[11px] text-gray-400">
            실시간 제안서 더보기
          </button>
        </div>
      </div>

      <div className="-mx-5 overflow-x-auto pb-4">
        <div className="mx-auto flex w-full max-w-[420px] gap-4 px-5">
          {cards.map((i) => (
            <LocalProposalCard key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalProposalCard() {
  return (
    <article className="w-[260px] flex-none overflow-hidden rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="h-[200px] w-full overflow-hidden">
        <Image
          src="/travel.png"
          alt="local proposal"
          width={260}
          height={200}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex items-center gap-3 border-t border-gray-100 px-4 py-3">
        <div className="h-[32px] w-[32px] rounded-full bg-gray-200" />
        <div>
          <p className="text-[11px] text-gray-500">이름</p>
          <p className="text-[13px] font-semibold text-gray-900">소개글</p>
        </div>
      </div>
    </article>
  );
}
