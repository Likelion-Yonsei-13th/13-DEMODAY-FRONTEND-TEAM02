"use client";
import { useParams, useRouter } from "next/navigation";
import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/nav/Navbar";
import { absUrl, usePlaceDetail, useMyWishlists, useAddToWishlist, useCreateWishlist } from "@/lib/api/queries.place";
import { useState } from "react";

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const placeId = Number(id);
  const { data: place } = usePlaceDetail(placeId);
  const { data: lists } = useMyWishlists(true);
  const addToWishlist = useAddToWishlist();
  const createWishlist = useCreateWishlist();
  const [mode, setMode] = useState<"pick" | "create">("pick");
  const [newTitle, setNewTitle] = useState("");

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-[calc(80px+env(safe-area-inset-bottom))]">
      <TopHeader />
      <section className="mx-auto w-full max-w-[420px] px-5 pt-4 pb-24">
        <button className="mb-3 text-[13px] text-gray-500" onClick={() => router.back()}>← 목록으로</button>
        {place && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={absUrl(place.photo)} alt={place.name} className="h-[200px] w-full rounded object-cover" />
            <div className="mt-3">
              <div className="text-[12px] text-gray-500">{place.country} {place.state} {place.city} {place.district}</div>
              <h1 className="mt-1 text-[18px] font-bold">{place.name}</h1>
              <div className="mt-1 text-[12px] text-gray-500">좋아요 {place.likes_count} · 조회 {place.view_count}</div>
            </div>

            <div className="mt-5 rounded border p-3">
              <div className="mb-2 text-[13px] font-semibold">위시리스트 추가</div>
              {mode === "pick" ? (
                <div className="flex items-center gap-2">
                  <select className="flex-1 rounded border px-2 py-2 text-[13px]" id="wl-detail">
                    {(lists ?? []).map((w) => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>
                  <button className="rounded bg-[#FFC727] px-3 py-2 text-[13px] font-semibold" onClick={async () => {
                    const el = document.getElementById("wl-detail") as HTMLSelectElement | null;
                    const wid = Number(el?.value);
                    if (!wid) return alert("위시리스트를 선택하세요");
                    try {
                      await addToWishlist.mutateAsync({ wishlistId: wid, placeId });
                      alert("추가되었습니다.");
                    } catch (e: any) {
                      alert(e?.response?.data?.detail || "추가 실패");
                    }
                  }}>추가</button>
                  <button className="rounded border px-3 py-2 text-[13px]" onClick={() => setMode("create")}>새 폴더</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="새 폴더 이름" className="flex-1 rounded border px-2 py-2 text-[13px]" />
                  <button className="rounded bg-[#FFC727] px-3 py-2 text-[13px] font-semibold" onClick={async () => {
                    if (!newTitle.trim()) return alert("폴더 이름을 입력하세요");
                    try {
                      const res = await createWishlist.mutateAsync({ title: newTitle });
                      await addToWishlist.mutateAsync({ wishlistId: res.id, placeId });
                      alert("생성 및 추가 완료");
                      setMode("pick");
                      setNewTitle("");
                    } catch (e: any) {
                      alert(e?.response?.data?.detail || "생성 실패");
                    }
                  }}>생성+추가</button>
                  <button className="rounded border px-3 py-2 text-[13px]" onClick={() => setMode("pick")}>취소</button>
                </div>
              )}
            </div>
          </>
        )}
      </section>
      <Navbar />
    </main>
  );
}
