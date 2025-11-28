// src/app/wish/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/nav/Navbar";
import { useMyWishlists, useDeleteWishlist, useCreateWishlist, useUpdateWishlist, absUrl } from "@/lib/api/queries.place";

export default function WishPage() {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameId, setRenameId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const { data: wishlists, isLoading } = useMyWishlists();
  const deleteWishlist = useDeleteWishlist();
  const createWishlist = useCreateWishlist();
  const updateWishlist = useUpdateWishlist();

  const toggleMenu = (id: number) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const handleDelete = async (id: number) => {
    if (confirm("이 위시리스트를 삭제하시겠어요?")) {
      await deleteWishlist.mutateAsync(id);
      setOpenMenuId(null);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      alert("위시리스트 이름을 입력해주세요.");
      return;
    }
    await createWishlist.mutateAsync({ title: newTitle });
    setNewTitle("");
    setShowCreateModal(false);
  };

  const handleRename = async () => {
    if (!newTitle.trim()) {
      alert("새 이름을 입력해주세요.");
      return;
    }
    if (renameId) {
      await updateWishlist.mutateAsync({ id: renameId, title: newTitle });
      setNewTitle("");
      setRenameId(null);
      setShowRenameModal(false);
      setOpenMenuId(null);
    }
  };

  const openRenameModal = (id: number, currentTitle: string) => {
    setRenameId(id);
    setNewTitle(currentTitle);
    setShowRenameModal(true);
    setOpenMenuId(null);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <p>로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-[calc(80px+env(safe-area-inset-bottom))]">
      <section className="mx-auto w-full max-w-[420px] px-5 pt-6 pb-24">
        {/* 상단 타이틀 */}
        <header className="flex items-center justify-between">
          <h1 className="text-[18px] font-semibold text-gray-900">
            나의 여행리스트
          </h1>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-[20px] leading-none"
            aria-label="리스트 추가"
          >
            +
          </button>
        </header>

        {/* 2열 카드 레이아웃 */}
        {wishlists && wishlists.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-20">
            {wishlists.map((list) => (
              <WishCard
                key={list.id}
                data={list}
                isMenuOpen={openMenuId === list.id}
                onToggleMenu={() => toggleMenu(list.id)}
                onDelete={() => handleDelete(list.id)}
                onRename={() => openRenameModal(list.id, list.title)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-20 text-center text-gray-500">
            <p>아직 위시리스트가 없습니다.</p>
            <p className="mt-2 text-sm">+ 버튼을 눌러 새 리스트를 만들어보세요!</p>
          </div>
        )}
      </section>

      <Navbar />

      {/* 위시리스트 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[300] bg-black/30 flex items-center justify-center">
          <div className="w-[300px] rounded-xl bg-white p-5 shadow-lg">
            <h3 className="text-[16px] font-semibold mb-4">새 위시리스트</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="리스트 이름"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTitle("");
                }}
                className="px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-100 rounded-md"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 text-[14px] bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이름 변경 모달 */}
      {showRenameModal && (
        <div className="fixed inset-0 z-[300] bg-black/30 flex items-center justify-center">
          <div className="w-[300px] rounded-xl bg-white p-5 shadow-lg">
            <h3 className="text-[16px] font-semibold mb-4">이름 변경</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="새 이름"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setNewTitle("");
                  setRenameId(null);
                }}
                className="px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-100 rounded-md"
              >
                취소
              </button>
              <button
                onClick={handleRename}
                className="px-4 py-2 text-[14px] bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function WishCard({
  data,
  isMenuOpen,
  onToggleMenu,
  onDelete,
  onRename,
}: {
  data: { id: number; title: string; items?: Array<{ travel_spot_detail?: { photo: string } }> };
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onDelete: () => void;
  onRename: () => void;
}) {
  // 위시리스트의 처음 4개 아이템 썸네일 이미지 추출
  const thumbnails = data.items?.slice(0, 4).map(item => 
    absUrl(item.travel_spot_detail?.photo)
  ) || [];
  
  // 4개 미만이면 기본 이미지로 채우기
  const defaultImages = ["/fall.png", "/hanock.png", "/palace.png", "/nightview.png"];
  while (thumbnails.length < 4) {
    thumbnails.push(defaultImages[thumbnails.length]);
  }
  
  const itemCount = data.items?.length || 0;
  return (
    <article className="relative w-full">
      {/* 2x2 썸네일 콜라주 */}
      <div className="overflow-hidden bg-gray-200">
        <div className="grid h-[162px] w-full grid-cols-2 grid-rows-2 gap-[2px] bg-white">
          {thumbnails.map((src, idx) => (
            <Image
              key={idx}
              src={src}
              alt={`위시 썸네일 ${idx + 1}`}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ))}
        </div>
      </div>

      {/* 제목 / 항목수 / 메뉴 */}
      <div className="mt-2 flex items-start justify-between">
        <div>
          {/* 제목을 상세 페이지 링크로 */}
          <Link
            href={`/wish/${data.id}`}
            className="block text-[13px] font-semibold text-gray-900"
          >
            {data.title}
          </Link>
          <p className="mt-1 text-[11px] text-gray-500">{itemCount}개의 항목</p>
        </div>

        <button
          type="button"
          onClick={onToggleMenu}
          className="mt-1 flex h-6 w-6 items-center justify-center rounded-full text-[18px] text-gray-500 hover:bg-gray-100"
          aria-label="위시 리스트 옵션"
        >
          ⋮
        </button>
      </div>

      {/* 옵션 메뉴 */}
      {isMenuOpen && (
        <div className="absolute right-0 top-[140px] z-10 w-[88px] rounded-md border border-gray-200 bg-white py-1 text-[11px] text-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <button 
            onClick={onDelete}
            className="flex w-full items-center justify-start px-3 py-1 hover:bg-gray-100"
          >
            삭제
          </button>
          <button 
            onClick={onRename}
            className="flex w-full items-center justify-start px-3 py-1 hover:bg-gray-100"
          >
            이름 변경
          </button>
        </div>
      )}
    </article>
  );
}
