"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRoots } from "@/lib/api/queries.document";
import RatingModal from "@/components/RatingModal";

export default function LocalProposalsPage() {
  const router = useRouter();
  const { data: allRoots, isLoading } = useRoots();
  const [selectedRootForRating, setSelectedRootForRating] = useState<any | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // 전체 로컬 제안서 데이터
  const proposals = useMemo(() => {
    if (!allRoots) return [];
    return allRoots;
  }, [allRoots]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[420px] bg-white min-h-screen flex items-center justify-center">
        <p className="text-[14px] text-[#999]">로드 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[420px] bg-white pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 border-b border-[#E5E5E5] px-5 py-4 bg-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <Image src="/back.svg" alt="뒤로" width={24} height={24} />
          </button>
          <h1 className="text-[18px] font-bold text-[#111]">모든 로컬 제안서</h1>
        </div>
      </header>

      {/* 제안서 리스트 */}
      <main className="px-5 pt-4">
        {proposals.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px] text-[#999]">제안서가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-0">
            {proposals.map((root: any, idx: number) => (
              <article
                key={root.id}
                className={`border-b border-[#E5E5E5] py-4 ${idx === 0 ? "pt-0" : "pt-4"}`}
              >
                {/* 제안서 기본 정보 (클릭 시 평점 표시) */}
                <div className="flex items-center gap-3 mb-4">
                  {/* 로컬 프로필 이미지 또는 이니셜 */}
                  <div className="h-[48px] w-[48px] rounded-full bg-[#E5E5E5] flex items-center justify-center text-[18px] font-bold text-white flex-shrink-0">
                    {root.founder?.display_name?.charAt(0)?.toUpperCase() || "✢"}
                  </div>

                  {/* 제안서 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#888] truncate">
                      {typeof root.place === "object"
                        ? root.place?.name || root.place?.city || "여행지"
                        : "여행지"}
                    </p>
                    <p className="mt-[2px] text-[14px] font-semibold text-[#111] truncate">
                      {root.title || "제목 없음"}
                    </p>
                    <p className="mt-[2px] text-[12px] text-[#666]">
                      {root.founder?.display_name || "로컬"}
                    </p>

                    {/* 평점 표시 */}
                    {root.average_rating ? (
                      <p className="mt-2 text-[11px] text-[#FFC727]">
                        ★ {root.average_rating}점 ({root.rating_count}명)
                      </p>
                    ) : (
                      <p className="mt-2 text-[11px] text-[#CCC]">평점 없음</p>
                    )}
                  </div>

                  {/* 오른쪽 화살표 */}
                  <Image
                    src="/expand_left.svg"
                    alt=""
                    width={14}
                    height={14}
                    className="rotate-180 flex-shrink-0"
                  />
                </div>

                {/* 평점 섹션 (펼쳐지는 부분) */}
                <div className="rounded-[10px] border border-[#FFCC47] bg-white px-4 py-4 mb-4">
                  <p className="mb-3 text-center text-[14px] font-bold text-[#333]">
                    평점
                  </p>

                  {/* 별점 표시 */}
                  <div className="flex justify-center gap-2 text-[20px] mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={
                          root.average_rating && star <= Math.round(root.average_rating)
                            ? "text-[#FFC727]"
                            : "text-[#E5E5E5]"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* 평점 값 */}
                  <p className="text-center text-[12px] text-[#666] mb-3">
                    {root.average_rating ? `${root.average_rating}점` : "평점 없음"}
                  </p>

                  {/* 자세히 보기 버튼 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedRootForRating(root);
                        setIsRatingModalOpen(true);
                      }}
                      className="flex-1 rounded-full border border-[#FFCC47] bg-white px-3 py-2 text-[12px] font-medium text-[#FFCC47] hover:bg-[#FFFAF0]"
                    >
                      평점하기
                    </button>
                    <button
                      onClick={() => router.push(`/proposal/${root.id}`)}
                      className="flex-1 rounded-full bg-[#FFC727] px-3 py-2 text-[12px] font-medium text-white hover:bg-[#FFB700]"
                    >
                      자세히 보기
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* 평점 모달 */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onConfirm={async () => {
          return Promise.resolve();
        }}
        rootId={selectedRootForRating?.id || 0}
        rootTitle={selectedRootForRating?.title}
      />
    </div>
  );
}
