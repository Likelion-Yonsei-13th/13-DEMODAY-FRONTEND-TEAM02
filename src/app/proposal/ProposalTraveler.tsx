"use client";

import { useState } from "react";
import Image from "next/image";

type TabKey = "recent" | "category" | "saved" | "confirmed";

type Proposal = {
  id: number;
  title: string;
  category: string;
  summary: string;
  localName: string;
};

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 1,
    category: "종로구 한국체험",
    title: "종로구 A to Z 체험!",
    summary: "로컬이 적는 제안서 한줄 정리입니다",
    localName: "로컬이름(닉네임)",
  },
  {
    id: 2,
    category: "종로구 한국체험",
    title: "종로구 A to Z 체험!",
    summary: "로컬이 적는 제안서 한줄 정리입니다",
    localName: "로컬이름(닉네임)",
  },
];

export default function ProposalTraveler() {
  const [activeTab, setActiveTab] = useState<TabKey>("recent");

  // 분류 탭 상태
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // 최근 받은 제안서 펼침 / 날짜 선택 상태
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<number>(4); // 11월 4일 기본 선택

  return (
    <div className="mx-auto w-full max-w-[420px] bg-white pb-24">
      {/* 상단 헤더 */}
      <header className="border-b border-[#E5E5E5] px-5 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-bold text-[#111]">제안서</h1>
          <button aria-label="알림" className="p-1">
            <Image src="/bell.svg" alt="알림" width={20} height={20} />
          </button>
        </div>

        {/* 탭 바 */}
        <nav className="mt-4 flex text-[13px] font-semibold">
          {[
            { key: "recent", label: "최근 받은 제안서" },
            { key: "category", label: "분류" },
            { key: "saved", label: "저장" },
            { key: "confirmed", label: "확정" },
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`flex-1 pb-2 ${
                  active
                    ? "border-b-2 border-[#FFC727] text-[#FFC727]"
                    : "border-b border-transparent text-[#777]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* 탭별 컨텐츠 */}
      <main className="px-5 pt-4">
        {activeTab === "recent" && (
          <RecentTab
            proposals={MOCK_PROPOSALS}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        )}

        {activeTab === "category" && (
          <CategoryTab
            proposals={MOCK_PROPOSALS}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
            setConfirmDeleteId={setConfirmDeleteId}
          />
        )}

        {activeTab === "saved" && <SavedTab proposals={MOCK_PROPOSALS} />}

        {activeTab === "confirmed" && <ConfirmedTab />}
      </main>

      {/* 삭제 확인 모달 (분류 탭용) */}
      {confirmDeleteId !== null && (
        <DeleteConfirmModal
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => {
            // 실제 삭제 로직은 이후 API 연동 시에 처리
            setConfirmDeleteId(null);
          }}
        />
      )}
    </div>
  );
}

/* =================== 최근 받은 제안서 탭 =================== */

function RecentTab({
  proposals,
  expandedId,
  setExpandedId,
  selectedDate,
  setSelectedDate,
}: {
  proposals: Proposal[];
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
  selectedDate: number;
  setSelectedDate: (d: number) => void;
}) {
  // 일정 데이터 (지금은 11월 4일만 내용 있음)
  const schedule = {
    "04": [
      {
        timeLabel: "07:00",
        order: 1,
        title: "한식아침밥",
        desc: "소개글",
        bg: "#FFF3B8",
      },
      {
        timeLabel: "10:00",
        order: 2,
        title: "국중박구경",
        desc: "소개글",
        bg: "#FFF3B8",
      },
      {
        timeLabel: "12:00",
        order: 3,
        title: "",
        desc: "해당 내용을 보려면 포인트가 필요합니다.",
        bg: "#FFE7E7",
      },
    ],
  } as Record<
    string,
    { timeLabel: string; order: number; title: string; desc: string; bg: string }[]
  >;

  const dateItems = [
    { day: 4, label: "04" },
    { day: 5, label: "05" },
    { day: 6, label: "06" },
    { day: 7, label: "07" },
  ];

  if (proposals.length === 0) {
    return (
      <section className="pt-16">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFC727]">
            <Image src="/check.svg" alt="체크" width={32} height={32} />
          </div>
          <p className="text-[14px] text-[#555]">받은 제안서가 없습니다</p>
          <button className="mt-2 h-11 w-full rounded-[4px] bg-gradient-to-r from-[#FFC727] to-[#FFB42B] text-[14px] font-semibold text-white">
            제안서 요청하기
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-4">
      {proposals.map((p) => {
        const isExpanded = expandedId === p.id;
        const scheduleKey = selectedDate.toString().padStart(2, "0");

        return (
          <article
            key={p.id}
            className="border-b border-[#E5E5E5] py-4 last:border-b-0"
          >
            {/* 기본 요약 카드 부분 (클릭해서 펼치기) */}
            <div
              className="flex w-full cursor-pointer items-center gap-3"
              onClick={() =>
                setExpandedId(isExpanded ? null : p.id)
              }
            >
              <div className="h-[44px] w-[44px] rounded-full bg-[#E5E5E5]" />
              <div className="flex-1">
                <p className="text-[11px] text-[#888]">{p.category}</p>
                <p className="mt-[2px] text-[14px] font-semibold text-[#111]">
                  {p.title}
                </p>
                <p className="mt-[2px] text-[12px] text-[#666]">{p.summary}</p>
                <p className="mt-[4px] text-[11px] text-[#999]">
                  {p.localName}
                </p>
              </div>

              {/* 장바구니 버튼 (button 중첩 방지 위해 div로 처리) */}
              <div className="flex h-9 w-9 items-center justify-center">
                <Image src="/cart.svg" alt="담기" width={36} height={36} />
              </div>
            </div>

            {/* 펼쳐진 상세 영역 */}
            {isExpanded && (
              <div className="mt-4 space-y-4">
                {/* 채팅 상담하기 버튼 */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-[#333]"
                    style={{
                      display: "flex",
                      width: 131,
                      height: 24,
                      padding: "14px 15px",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 10,
                      flexShrink: 0,
                      borderRadius: 6,
                      border: "1px solid rgba(0, 0, 0, 0.10)",
                      background:
                        "radial-gradient(631.95% 162.81% at -13.94% 100%, #F9D040 0%, #F6BB33 100%)",
                    }}
                  >
                    채팅상담하기
                  </button>
                </div>

                {/* 상단 이미지 2개 (매거진 + 지도) */}
                <div className="space-y-3 border-t border-[#E5E5E5] ">
                  <div className="mt-4 h-[150px] w-full overflow-hidden rounded-[6px] bg-[#E5E5E5]">
                    <Image
                      src="/megazine.png"
                      alt="제안서 요약 이미지"
                      width={800}
                      height={400}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-[240px] w-full overflow-hidden rounded-[6px] bg-[#E5E5E5]">
                    <Image
                      src="/map.png"
                      alt="지도"
                      width={800}
                      height={600}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* 날짜 동그라미 (슬라이드 가능) */}
                <div className="-mx-5 overflow-x-auto pb-2">
                  <div className="flex gap-4 px-5">
                    {dateItems.map((d) => {
                      const active = selectedDate === d.day;
                      return (
                        <button
                          key={d.day}
                          type="button"
                          onClick={() => setSelectedDate(d.day)}
                          className={`flex h-[64px] w-[64px] flex-col items-center justify-center rounded-full text-[12px] ${
                            active
                              ? "bg-[#FFC727] text-black"
                              : "bg-[#E5E5E5] text-black"
                          }`}
                        >
                          <span>11월</span>
                          <span className="text-[14px] font-bold">
                            {d.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 타임라인 구분선 */}
                <div className="mt-1 border-t border-[#E5E5E5]" />

                {/* 일정표 */}
                <div className="mt-3 space-y-6 text-[12px] text-[#333]">
                  {/* 06:00 라인만 구분선 */}
                  <div className="flex items-start gap-4">
                    <div className="w-[40px] text-right text-[12px] text-[#555]">
                      06:00
                    </div>
                    <div className="mt-[10px] h-[1px] flex-1 bg-[#E5E5E5]" />
                  </div>

                  {schedule[scheduleKey]?.map((item) => (
                    <div
                      key={item.order}
                      className="flex items-start gap-4"
                    >
                      {/* 시간 레이블 */}
                      <div className="w-[40px] text-right text-[12px] text-[#555]">
                        {item.timeLabel}
                      </div>

                      {/* 순번 + 내용 박스 */}
                      <div className="flex-1">
                        <div className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFC727] text-[11px] font-bold text-white">
                          {item.order}
                        </div>
                        <div
                          className="min-h-[72px] rounded-[4px] px-4 py-3"
                          style={{ backgroundColor: item.bg }}
                        >
                          {item.title && (
                            <p className="text-[13px] font-semibold text-[#333]">
                              {item.title}
                            </p>
                          )}
                          <p className="mt-1 text-[12px] text-[#555]">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* 마지막 13:00 끝시간 표기 */}
                  <div className="flex items-start gap-4">
                    <div className="w-[40px] text-right text-[12px] text-[#555]">
                      13:00
                    </div>
                  </div>
                </div>

                {/* 제안서 구매 버튼 */}
                <div className="mt-6">
                  <button className="h-11 w-full rounded-[4px] bg-gradient-to-r from-[#FFC727] to-[#FFB42B] text-[14px] font-semibold text-white">
                    제안서 구매하기 (1000 포인트)
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}

/* =================== 분류 탭 =================== */

function CategoryTab({
  proposals,
  hoveredId,
  setHoveredId,
  setConfirmDeleteId,
}: {
  proposals: Proposal[];
  hoveredId: number | null;
  setHoveredId: (id: number | null) => void;
  setConfirmDeleteId: (id: number) => void;
}) {
  return (
    <section className="pb-4">
      {proposals.map((p) => (
        <article
          key={p.id}
          className="relative border-b border-[#E5E5E5] py-4 last:border-b-0"
          onMouseEnter={() => setHoveredId(p.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div className="flex items-center gap-3">
            <div className="h-[44px] w-[44px] bg-[#E5E5E5]" />
            <div className="flex-1">
              <p className="text-[11px] text-[#888]">{p.category}</p>
              <p className="mt-[2px] text-[14px] font-semibold text-[#111]">
                {p.title}
              </p>
              <p className="mt-[2px] text-[12px] text-[#666]">{p.summary}</p>
              <p className="mt-[4px] text-[11px] text-[#999]">
                {p.localName}
              </p>
            </div>
          </div>

          {/* hover 시 삭제 / … 버튼 */}
          {hoveredId === p.id && (
            <div className="absolute right-5 top-1/2 flex -translate-y-1/2 items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(p.id)}
                className="rounded-[4px] bg-[#FFC727] px-3 py-1 text-[11px] font-semibold text-white"
              >
                삭제
              </button>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#DDD] bg-white"
              >
                <span className="text-[18px] leading-none text-[#777]">
                  ⋯
                </span>
              </button>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}

/* =================== 저장 탭 =================== */

function SavedTab({ proposals }: { proposals: Proposal[] }) {
  return (
    <section className="pb-6">
      {/* 검색 + 정렬 */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1 border-b border-[#D9D9D9] pb-[2px]">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="w-full border-none bg-transparent text-[12px] text-[#555] outline-none placeholder:text-[#B5B5B5]"
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-[12px] text-[#666]"
        >
          <span>정렬</span>
          <Image
            src="/expand_left.svg"
            alt="정렬 아이콘"
            width={14}
            height={14}
            className="rotate-90"
          />
        </button>
      </div>

      {/* 저장된 제안서 리스트 */}
      {proposals.map((p) => (
        <article
          key={p.id}
          className="border-b border-[#E5E5E5] py-4 last:border-b-0"
        >
          <div className="flex items-center gap-3">
            <div className="h-[44px] w-[44px] rounded-full bg-[#E5E5E5]" />
            <div className="flex-1">
              <p className="text-[11px] text-[#888]">{p.category}</p>
              <p className="mt-[2px] text-[14px] font-semibold text-[#111]">
                {p.title}
              </p>
              <p className="mt-[2px] text-[12px] text-[#666]">
                {p.summary}
              </p>
              <p className="mt-[4px] text-[11px] text-[#999]">
                {p.localName}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center">
              <Image src="/cart.svg" alt="담기" width={36} height={36} />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

/* =================== 확정 탭 =================== */

function ConfirmedTab() {
  return (
    <section className="flex flex-col items-center gap-4 pt-20 text-center">
      <p className="text-[14px] text-[#555]">
        확정된 제안서가 아직 없습니다.
      </p>
    </section>
  );
}

/* =================== 삭제 확인 모달 =================== */

function DeleteConfirmModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-[260px] rounded-[10px] bg-[#FFC727] px-5 py-4 text-center shadow-lg">
        <p className="text-[12px] leading-relaxed text-[#333]">
          요청했던 제안서를 지우면
          <br />
          모두 삭제됩니다.
          <br />
          그래도 삭제하시겠습니까?
        </p>
        <div className="mt-4 flex justify-center gap-4 text-[13px] font-semibold">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-white px-4 py-1 text-[#333]"
          >
            예
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-white px-4 py-1 text-[#333]"
          >
            아니오
          </button>
        </div>
      </div>
    </div>
  );
}
