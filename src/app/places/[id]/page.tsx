"use client";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/nav/Navbar";
import { absUrl, usePlaceDetail, useMyWishlists, useAddToWishlist, useCreateWishlist, usePlaceLike, usePlaceUnlike, useLikedPlaces } from "@/lib/api/queries.place";
import { useState, useEffect } from "react";

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const placeId = Number(id);
  const { data: place } = usePlaceDetail(placeId);
  const { data: lists } = useMyWishlists(true);
  const { data: likedPlaces } = useLikedPlaces();
  const addToWishlist = useAddToWishlist();
  const createWishlist = useCreateWishlist();
  const likeMutation = usePlaceLike();
  const unlikeMutation = usePlaceUnlike();
  
  const [mode, setMode] = useState<"pick" | "create">("pick");
  const [newTitle, setNewTitle] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(0);

  // 좋아요한 장소 목록에서 현재 장소가 있는지 확인
  useEffect(() => {
    if (likedPlaces && place) {
      const liked = likedPlaces.some(p => p.id === placeId);
      setIsLiked(liked);
      setLocalLikesCount(place.likes_count);
    } else if (place) {
      setLocalLikesCount(place.likes_count);
    }
  }, [likedPlaces, place, placeId]);
  
  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        // 좋아요 취소
        const result = await unlikeMutation.mutateAsync(placeId);
        setIsLiked(false);
        setLocalLikesCount(result.likes_count);
      } else {
        // 좋아요 추가
        const result = await likeMutation.mutateAsync(placeId);
        setIsLiked(true);
        setLocalLikesCount(result.likes_count);
      }
    } catch (error) {
      console.error("좋아요 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-[calc(80px+env(safe-area-inset-bottom))]">
      <TopHeader />
      <section className="mx-auto w-full max-w-[420px] px-5 pt-4 pb-24">
        <button className="mb-3 text-[13px] text-gray-500" onClick={() => router.back()}>← 목록으로</button>
        {place && (
          <>
            {place.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={absUrl(place.photo)} alt={place.name} className="h-[200px] w-full rounded object-cover" />
            ) : (
              <div className="h-[200px] w-full rounded bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-[14px]">이미지 없음</span>
              </div>
            )}
            <div className="mt-3">
              <div className="text-[12px] text-gray-500">{place.country} {place.state} {place.city} {place.district}</div>
              <h1 className="mt-1 text-[18px] font-bold">{place.name}</h1>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={handleLikeToggle}
                  disabled={likeMutation.isPending || unlikeMutation.isPending}
                  className={`flex items-center gap-1 rounded-[8px] border px-3 py-2 text-[13px] font-semibold transition-colors disabled:opacity-50 ${
                    isLiked 
                      ? 'border-[#FF3B30] bg-[#FF3B30] text-white hover:bg-[#E6342A]' 
                      : 'border-[#FF3B30] text-[#FF3B30] hover:bg-[#FFF5F5]'
                  }`}
                >
                  <span>{isLiked ? '❤️' : '♡'}</span>
                  <span>좋아요 {localLikesCount}</span>
                </button>
                <div className="text-[12px] text-gray-500">조회 {place.view_count}</div>
              </div>
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
                      console.error("위시리스트 추가 실패:", e);
                      console.error("에러 상세:", e?.response?.data);
                      const errorMsg = 
                        e?.response?.data?.non_field_errors?.[0] || 
                        e?.response?.data?.travel_spot?.[0] || 
                        e?.response?.data?.detail || 
                        e?.response?.data?.error || 
                        "추가 실패";
                      alert(errorMsg);
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
                      // 위시리스트 목록 새로고침
                      await queryClient.invalidateQueries({ queryKey: ["wishlists", "mine"] });
                      await addToWishlist.mutateAsync({ wishlistId: res.id, placeId });
                      alert("생성 및 추가 완료");
                      setMode("pick");
                      setNewTitle("");
                    } catch (e: any) {
                      console.error("위시리스트 생성 실패:", e);
                      const errorMsg = 
                        e?.response?.data?.non_field_errors?.[0] || 
                        e?.response?.data?.detail || 
                        e?.response?.data?.error || 
                        "생성 실패";
                      alert(errorMsg);
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
