"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/nav/Navbar";
import { usePlacesByRegion, absUrl, type TravelPlace } from "@/lib/api/queries.place";

function PlacesContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const region = {
    country: sp.get("country") || undefined,
    state: sp.get("state") || undefined,
    city: sp.get("city") || undefined,
    district: sp.get("district") || undefined,
  };
  const { data: places } = usePlacesByRegion({ ...region, order: "likes", enabled: true });

  const title = [region.state, region.city].filter(Boolean).join(" ") || region.country || "장소";

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-[calc(80px+env(safe-area-inset-bottom))]">
      <TopHeader />
      <section className="mx-auto w-full max-w-[420px] px-5 pt-4 pb-24">
        <h1 className="mb-3 text-[18px] font-bold">{title} 장소</h1>
        <div className="grid grid-cols-2 gap-3">
          {(places ?? []).map((p) => (
            <button key={p.id} className="rounded-[10px] bg-white text-left shadow" onClick={() => router.push(`/places/${p.id}`)}>
              {p.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={absUrl(p.photo)} alt={p.name} className="h-[120px] w-full rounded-t-[10px] object-cover" />
              ) : (
                <div className="h-[120px] w-full rounded-t-[10px] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-[12px]">이미지 없음</span>
                </div>
              )}
              <div className="px-3 py-2">
                <div className="text-[11px] text-gray-500">{p.city} {p.district}</div>
                <div className="mt-1 truncate text-[13px] font-semibold">{p.name}</div>
              </div>
            </button>
          ))}
          {(places ?? []).length === 0 && (
            <div className="col-span-2 py-10 text-center text-[13px] text-gray-500">표시할 장소가 없습니다.</div>
          )}
        </div>
      </section>
      <Navbar />
    </main>
  );
}

export default function PlacesPage() {
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
      <PlacesContent />
    </Suspense>
  );
}
