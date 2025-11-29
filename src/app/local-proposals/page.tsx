"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRoots } from "@/lib/api/queries.document";

export default function LocalProposalsPage() {
  const router = useRouter();
  const { data: allRoots, isLoading } = useRoots();

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
                {/* 제안서 기본 정보 (단순 리스트 뷰 - 클릭 시 줄드 상세페이지로) */}
                <div 
                  onClick={() => router.push(`/proposal/${root.id}`)}
                  className="flex items-center gap-3 cursor-pointer hover:bg-[#F9F9F9] transition-colors px-1 py-2 rounded-[8px]"
                >
                  {/* 로컬 프로필 이미지 또는 이니셔 */}
                  <div className="h-[48px] w-[48px] rounded-full bg-[#E5E5E5] flex items-center justify-center text-[18px] font-bold text-white flex-shrink-0">
                    {root.founder?.display_name?.charAt(0)?.toUpperCase() || "\u2722"}
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
              </article>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
