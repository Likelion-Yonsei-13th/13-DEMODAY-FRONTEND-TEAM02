"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/nav/Navbar";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useWishlistDetail, useWishlistItems, useDeleteWishlist, absUrl } from "@/lib/api/queries.place";

export default function WishDetailPage() {
  const params = useParams();
  const router = useRouter();
  const wishlistId = Number(params.id);
  
  const [openSheet, setOpenSheet] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const { data: wishlist, isLoading: wishlistLoading } = useWishlistDetail(wishlistId);
  const { data: items, isLoading: itemsLoading } = useWishlistItems(wishlistId);
  const deleteWishlist = useDeleteWishlist();

  const handleDelete = async () => {
    await deleteWishlist.mutateAsync(wishlistId);
    router.push("/wish");
  };

  if (wishlistLoading || itemsLoading) {
    return (
      <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p>로딩 중...</p>
      </main>
    );
  }

  if (!wishlist) {
    return (
      <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p>위시리스트를 찾을 수 없습니다.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F5F5] pb-[80px]">
      {/* ---------- 헤더 ---------- */}
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/wish">
            <span className="text-[20px]">←</span>
          </Link>
          <div>
            <p className="text-[18px] font-bold">{wishlist.title}</p>
            <p className="text-[12px] text-gray-500">{items?.length || 0}개의 항목</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* 삭제 버튼 */}
          <button
            onClick={() => setOpenDeleteModal(true)}
            className="text-[13px] text-gray-700"
          >
            삭제
          </button>

          {/* 점 3개 버튼 */}
          <button onClick={() => setOpenSheet(true)}>
            <Image src="/union.svg" width={3} height={13} alt="more" />
          </button>
        </div>
      </header>

      {/* ---------- 리스트 Grid ---------- */}
      <section className="grid grid-cols-3 gap-3 px-5">
        {items && items.length > 0 ? (
          items.map((item) => {
            const place = item.travel_spot_detail;
            const imgSrc = place?.photo ? absUrl(place.photo) : "/hot.png";
            const placeName = place?.name || "여행지";
            
            return (
              <Link 
                key={item.id} 
                href={`/places/${item.travel_spot}`}
                className="relative aspect-square overflow-hidden rounded-[6px] bg-gray-200"
              >
                <Image src={imgSrc} alt={placeName} fill className="object-cover" />

                <div className="absolute inset-x-0 bottom-0 bg-black/55 px-1.5 py-1">
                  <p className="truncate text-[10px] text-white">{placeName}</p>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-3 text-center py-20 text-gray-500">
            <p>아직 추가된 여행지가 없습니다.</p>
          </div>
        )}
      </section>

      <Navbar />

      {/* ---------- 바텀시트 ---------- */}
      {openSheet && (
  <div className="fixed inset-0 z-[200] bg-black/30">
    <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white pb-7 pt-5">
      {/* 상단 헤더 */}
      <div className="relative mb-4 flex items-center justify-center">
        <p className="text-[15px] font-semibold text-gray-900">환경설정</p>
        <button
          onClick={() => setOpenSheet(false)}
          className="absolute right-5 top-0"
        >
          <Image
            src="/close.svg"
            alt="close"
            width={20}
            height={20}
          />
        </button>
      </div>

      {/* 리스트 */}
      <div className="flex flex-col">
        {/* 1) 공유하기 */}
        <button className="flex h-12 w-full items-center border-b border-[#E5E5E5] px-5">
          <Image src="/share.svg" width={20} height={20} alt="share" />
          <span className="ml-3 text-[15px] text-gray-800">
            위시리스트 공유하기
          </span>
          <Image
            src="/expand_left.svg"
            width={20}
            height={20}
            alt="arrow"
            className="ml-auto" // → 오른쪽 방향
          />
        </button>

        {/* 2) 이름 변경 */}
        <button className="flex h-12 w-full items-center border-b border-[#E5E5E5] px-5">
          <Image src="/edit.svg" width={20} height={20} alt="edit" />
          <span className="ml-3 text-[15px] text-gray-800">이름 변경</span>
          <Image
            src="/expand_left.svg"
            width={20}
            height={20}
            alt="arrow"
            className="ml-auto"
          />
        </button>

        {/* 3) 위시리스트 삭제 */}
        <button
          onClick={() => {
            setOpenSheet(false);
            setOpenDeleteModal(true);
          }}
          className="flex h-12 w-full items-center px-5"
        >
          <Image src="/trash.svg" width={20} height={20} alt="trash" />
          <span className="ml-3 text-[15px] text-gray-800">
            위시리스트 삭제
          </span>
          <Image
            src="/expand_left.svg"
            width={20}
            height={20}
            alt="arrow"
            className="ml-auto"
          />
        </button>
      </div>
    </div>
  </div>
)}

      {/* ---------- 삭제 모달 ---------- */}
      {openDeleteModal && (
        <div className="fixed inset-0 z-[300] bg-black/30 flex items-center justify-center">
          <div className="w-[260px] rounded-xl bg-white p-5 text-center shadow-lg">
            <p className="mb-2 text-[15px] font-semibold">이 위시리스트를 삭제하시겠어요?</p>
            <p className="mb-4 text-[12px] text-gray-500">
              삭제 버튼을 누르시면, 항목들과 함께 삭제됩니다.
            </p>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setOpenDeleteModal(false)}
                className="w-[48%] rounded-md border py-2 text-[14px]"
              >
                취소
              </button>

              <button
                onClick={handleDelete}
                className="w-[48%] rounded-md py-2 text-[14px] text-[red]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
