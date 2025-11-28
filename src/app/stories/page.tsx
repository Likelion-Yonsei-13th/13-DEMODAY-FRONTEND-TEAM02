"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/nav/Navbar";
import { absUrl, useStoriesByRegion, type StoryListItem } from "@/lib/api/queries.place";

function StoriesListContent() {
  const sp = useSearchParams();
  const region = {
    country: sp.get("country") || undefined,
    state: sp.get("state") || undefined,
    city: sp.get("city") || undefined,
    district: sp.get("district") || undefined,
  };
  const { data: stories } = useStoriesByRegion({ ...region, sort: "latest", enabled: true });

  const title = [region.state, region.city, region.district].filter(Boolean).join(" ") || region.country || "여행자 이야기";

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-[calc(80px+env(safe-area-inset-bottom))]">
      <TopHeader />
      <section className="mx-auto w-full max-w-[420px] px-5 pt-4 pb-24">
        <h1 className="mb-3 text-[18px] font-bold">{title} 여행자 이야기</h1>
        <div className="space-y-3">
          {[...(stories ?? [])]
            .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
            .map((s) => (
              <a key={s.id} href={`/story/${s.id}`} className="flex gap-3 rounded-[8px] bg-white p-3 shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={absUrl(s.photo_url)} alt={s.title} className="h-[80px] w-[110px] rounded object-cover" />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-gray-900 line-clamp-1">{s.title}</p>
                  <p className="mt-1 text-[12px] text-gray-500 line-clamp-2">{s.preview || s.content?.slice(0, 120)}</p>
                  <div className="mt-1 text-[11px] text-gray-400">좋아요 {s.liked_count} · 조회 {s.view_count}</div>
                </div>
              </a>
            ))}
          {(stories ?? []).length === 0 && (
            <div className="py-10 text-center text-[13px] text-gray-500">해당 지역의 이야기가 없습니다.</div>
          )}
        </div>
      </section>
      <Navbar />
    </main>
  );
}

export default function StoriesListPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F4F4F4] pb-[calc(80px+env(safe-area-inset-bottom))]">
        <TopHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading...</div>
        </div>
        <Navbar />
      </main>
    }>
      <StoriesListContent />
    </Suspense>
  );
}
