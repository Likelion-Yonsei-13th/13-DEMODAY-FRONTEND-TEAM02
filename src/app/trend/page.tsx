// src/app/trend/page.tsx
import Image from "next/image";
import Navbar from "@/components/nav/Navbar";
import TopHeader from "@/components/TopHeader";

export default function TrendPage() {
  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-[calc(80px+env(safe-area-inset-bottom))]">
      <TopHeader />

      {/* 컨텐츠 영역 */}
      <section className="mx-auto w-full max-w-[420px] px-5 pt-4 pb-24">
        {/* MAGAZINE 섹션 */}
        <div className="mb-6">
          <p className="text-[16px] font-bold tracking-[0.08em] text-black">
            MAGAZINE
          </p>

          <div className="mt-3 space-y-2">
            <div className="relative h-[133px] w-full overflow-hidden rounded-[10px] bg-gray-300 overflow-hidden">
              <Image
                src="/megazine.png"
                alt="매거진 1"
                width={335}
                height={133}
                className="h-full w-full object-cover"
              />

              <div className="absolute left-5 bottom-5">
                <p className="text-[15px] font-semibold text-white drop-shadow">
                    11월 첫째주 여행 TREND
                </p>
                <p className="text-[12px] font-medium text-white opacity-80 drop-shadow">
                    #단풍 #핫플 #동궁과월지 #종로 #일본감성
                </p>
              </div>
            </div>

            <div className="relative h-[133px] w-full overflow-hidden rounded-[10px] bg-gray-300">
              <Image
                src="/megazine.png"
                alt="매거진 2"
                width={335}
                height={133}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-5 bottom-5">
                <p className="text-[15px] font-semibold text-white drop-shadow">
                    11월 첫째주 여행 TREND
                </p>
                <p className="text-[12px] font-medium text-white opacity-80 drop-shadow">
                    #전시회 #팝업 #뮤지컬
                </p>
              </div>
            </div>
            
          </div>
        </div>

        {/* 이번주 제일 많이 검색된 주제 (Top 리스트) */}
        <div className="mb-8">
          <p className="mb-2 text-[12px] font-semibold text-gray-700">
            이번주 제일 많이 검색된 주제
          </p>

          <div className="overflow-hidden text-[14px]">
            {[
              { rank: "Top1", label: "팝업" },
              { rank: "Top2", label: "장소" },
              { rank: "Top3", label: "테마" },
              { rank: "Top4", label: "동네" },
            ].map((row, idx) => (
              <div
                key={row.rank}
                className={`flex h-[24px] items-center text-[14px] mt-[10px]`}
                style={{
                    background: "linear-gradient(90deg, #F9D040 0%, #FFF0BB 100%)",
                }}
              >
                <div className="flex w-[56px] items-center justify-center font-semibold">
                  {row.rank}
                </div>
                <div className="flex-1 px-4">{row.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 제안요청이 많은 장소 */}
        <TrendCardSection
          title="최근 제안요청이 많은 장소"
          subtitle="최근 제안요청이 많이 들어온 여행지들을 모았어요."
        />

        {/* 최근 조회수가 많은 제안서 */}
        <TrendCardSection
          title="최근 조회수가 많은 제안서"
          subtitle="많은 여행자들이 보고 있는 제안서예요."
        />

        {/* 최근 채팅이 많이 된 로컬 */}
        <TrendCardSection
          title="최근 채팅이 많이 된 로컬"
          subtitle="요즘 가장 활발하게 활동 중인 로컬들이에요."
        />
      </section>

      {/* 하단 고정 내비게이션 */}
      <Navbar />
    </main>
  );
}

/* ===== 재사용 섹션 컴포넌트 ===== */

type TrendCardSectionProps = {
  title: string;
  subtitle?: string;
};

function TrendCardSection({ title, subtitle }: TrendCardSectionProps) {
  const cards = [1, 2, 3]; // 샘플 카드 3개

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-[11px] text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>

      {/* 가로 스크롤 카드 리스트 */}
      <div className="-mx-5 overflow-x-auto pb-1">
        <div className="flex gap-12 px-5">
          {cards.map((i) => (
            <TrendPlaceCard key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== 개별 카드 ===== */

function TrendPlaceCard() {
  return (
    <article className="w-[300px] overflow-hidden flex-none rounded-[10px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      {/* 이미지 영역 */}
      <div className="relative h-[240px] w-full overflow-hidden">
        <Image
          src="/hot.png"
          alt="여행지 이미지"
          width={300}
          height={240}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full border border-[#0B3B75] bg-white px-3 py-1 text-[10px] font-semibold text-[#0B3B75]">
          NEW
        </span>
      </div>

      {/* 텍스트 영역 */}
      <div className="border-t border-gray-100 px-3 py-3">
        <p className="text-[11px] text-gray-500">이름</p>
        <p className="mt-1 text-[13px] font-semibold text-gray-900">소개글</p>
      </div>
    </article>
  );
}
