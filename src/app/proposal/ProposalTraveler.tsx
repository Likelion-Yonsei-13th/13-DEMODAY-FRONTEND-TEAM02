"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { useRequests, useRoots, Root, useAcceptProposal } from "@/lib/api/queries.document";

// 상태 배지 컴포넌트
function StatusBadge({ status }: { status: "waiting" | "accepted" | "rejected" }) {
  const statusConfig = {
    waiting: { label: "대기중", color: "bg-green-100 text-green-700" },
    accepted: { label: "수락됨", color: "bg-blue-100 text-blue-700" },
    rejected: { label: "거절됨", color: "bg-gray-100 text-gray-700" },
  };
  
  const config = statusConfig[status];
  return (
    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
}

type TabKey = "recent" | "category" | "saved" | "confirmed" | "myRequests";

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("recent");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { data: allRequests, isLoading: requestsLoading, refetch: refetchRequests } = useRequests();
  
  // 페이지 진입 시마다 데이터 리페치 (로컬의 응답 상태를 최신으로 유지)
  useEffect(() => {
    refetchRequests();
  }, [refetchRequests]);
  
  // 주기적으로 데이터 리페치 (5초마다 - 로컬의 제안 응답 확인)
  useEffect(() => {
    const interval = setInterval(() => {
      refetchRequests();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetchRequests]);

  // localStorage에서 현재 로그인한 사용자 ID 가져오기
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    setCurrentUserId(userId);
  }, []);

  // 현재 사용자가 작성한 요청서만 필터링
  const myRequests = useMemo(() => {
    if (!allRequests || !currentUserId) return [];
    return allRequests.filter(request => String(request.user.uuid) === currentUserId);
  }, [allRequests, currentUserId]);

  // 분류 탭 상태
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // 최근 받은 제안서 폈친 / 날짜 선택 상태
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<number>(4); // 11월 4일 기본 선택
  
  // 수락 핸들러: 제안 수락 시 "확정" 탭으로 이동
  const handleAcceptProposal = (requestId: number) => {
    alert("제안을 수락했습니다!");
    // "확정" 탭으로 이동
    setActiveTab("confirmed");
  };

  return (
    <div className="mx-auto w-full max-w-[420px] bg-white pb-24">
      {/* 상단 헤더 */}
      <header className="border-b border-[#E5E5E5] px-5 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-bold text-[#111]">제안서</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/request')}
              className="flex items-center gap-1 text-[13px] font-semibold text-[#FFC727]"
              aria-label="제안서 요청하기"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 5V15M5 10H15" stroke="#FFC727" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              요청
            </button>
            <button aria-label="알림" className="p-1">
              <Image src="/bell.svg" alt="알림" width={20} height={20} />
            </button>
          </div>
        </div>

        {/* 탭 바 */}
        <nav className="mt-4 flex text-[13px] font-semibold overflow-x-auto">
          {[
            { key: "recent", label: "최근 받은 제안서" },
            { key: "category", label: "분류" },
            { key: "saved", label: "저장" },
            { key: "confirmed", label: "확정" },
            { key: "myRequests", label: "내가 제안한 제안서" },
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

      {/* 탭별 콘테츠 */}
      <main className="px-5 pt-4">
        {activeTab === "recent" && (
          <LocalProposalsTab
            requests={allRequests || []}
            isLoading={requestsLoading}
            onAcceptProposal={handleAcceptProposal}
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

        {activeTab === "myRequests" && (
          <MyRequestsTab 
            requests={myRequests || []} 
            isLoading={requestsLoading}
          />
        )}
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

/* =================== 로컬의 제안(응답) 받은 제안서 탭 =================== */

function LocalProposalsTab({
  requests,
  isLoading,
  onAcceptProposal,
}: {
  requests: any[];
  isLoading: boolean;
  onAcceptProposal?: (requestId: number) => void;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const router = useRouter();
  const acceptProposal = useAcceptProposal();
  const qc = useQueryClient();
  
  // 로컬의 제안(응답)을 받은 요청서만 추림
  const proposalsWithResponses = (requests || []).filter((req: any) => {
    const hasProposals = Array.isArray(req.proposals) && req.proposals.length > 0;
    return hasProposals;
  });
  
  const handleAcceptProposal = async (requestId: number, rootId: number) => {
    try {
      await acceptProposal.mutateAsync({ requestId, rootId });
      // 수락 완료 후 데이터 재요청
      await qc.invalidateQueries({ queryKey: ["requests"] });
      onAcceptProposal?.(requestId);
    } catch (error: any) {
      console.error("수락 실패:", error);
      alert("수락에 실패했습니다. " + (error?.response?.data?.error || ""));
    }
  };
  
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <section className="pt-16 text-center">
        <p className="text-[14px] text-[#555]">로딩 중...</p>
      </section>
    );
  }

  if (proposalsWithResponses.length === 0) {
    return (
      <section className="pt-16">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFC727]">
            <Image src="/icon_check.svg" alt="체크" width={32} height={32} />
          </div>
          <p className="text-[14px] text-[#555]">로컬의 제안을 기다리는 중입니다</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-4">
      {proposalsWithResponses.map((request: any) => {
        const isExpanded = expandedId === request.id;

        return (
          <article
            key={request.id}
            className="border-b border-[#E5E5E5] py-4 last:border-b-0 cursor-pointer hover:bg-[#F9F9F9]"
            onClick={() => setExpandedId(isExpanded ? null : request.id)}
          >
            {/* 기본 욕맽 - 직접 제안으로 만든 요청서 정보 표시 */}
            <div className="flex items-center gap-3">
              <div className="h-[44px] w-[44px] rounded-full bg-[#E5E5E5] flex items-center justify-center text-white font-bold">
                {request.user?.display_name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#111] truncate">
                  {request.title || (typeof request.place === 'object' ? (request.place?.name || request.place?.city) : '여행지')}
                </p>
                <p className="text-[12px] text-[#666] mt-1">
                  {request.date}{request.end_date && ` ~ ${request.end_date}`} · {request.number_of_people}명
                </p>
                <p className="text-[11px] text-[#999] mt-1">
                  {request.user?.display_name || '여행자'}
                </p>
              </div>
              <button className="text-[18px] text-gray-400">
                {isExpanded ? '▲' : '▼'}
              </button>
            </div>

            {/* 폈춠진 상세 영역 - 로컬의 제안 내용 표시 */}
            {isExpanded && request.proposals && request.proposals.length > 0 && (
              <div className="mt-4 border-t border-[#E5E5E5] pt-4">
                {request.proposals[0] && (
                  <div className="p-3 bg-[#FFFBF0] rounded-lg">
                    <p className="text-[13px] font-semibold text-[#333] mb-2">로컬의 제안</p>
                    <p className="text-[12px] text-[#666] mb-2">
                      로컬: {request.proposals[0].founder?.display_name || "로컬"}
                    </p>
                    <p className="text-[12px] text-[#666] mb-3">
                      제안서: {request.proposals[0].title || "제목 없음"}
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 rounded-lg border-2 border-[#FFC727] bg-white py-2 text-[13px] font-semibold text-[#FFC727] hover:bg-[#FFFAF0]"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/chat?rootId=${request.proposals[0].id}&requestId=${request.id}`);
                        }}
                      >
                        채팅하기
                      </button>
                      <button
                        className="flex-1 rounded-lg bg-[#FFC727] py-2 text-[13px] font-semibold text-white hover:bg-[#FFB700]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptProposal(request.id, request.proposals[0].id);
                        }}
                      >
                        수락하기
                      </button>
                    </div>
                  </div>
                )}
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

type PurchasedProposal = {
  id: number;
  title: string;
  founder: {
    uuid: string;
    display_name: string;
    photo_url: string;
  };
  place?: {
    name: string;
    city?: string;
    state?: string;
    country?: string;
  };
  photo?: string;
};

function ConfirmedTab() {
  const router = useRouter();
  const { data: allRequests, isLoading } = useRequests();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // localStorage에서 현재 사용자 ID 가져오기
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    setCurrentUserId(userId);
  }, []);
  
  // 수락된 제안서 필터링 (acceptance=true인 RequestRootMap)
  const confirmedProposals = useMemo(() => {
    if (!allRequests || !currentUserId) return [];
    
    const confirmed: any[] = [];
    allRequests.forEach((request: any) => {
      // 현재 사용자의 요청서만
      if (String(request.user.uuid) !== currentUserId) return;
      
      // 이 요청서에 대해 수락된 제안이 있는지 확인
      if (Array.isArray(request.proposals) && request.proposals.length > 0) {
        request.proposals.forEach((proposal: any) => {
          // 백엔드에서 acceptance 필드가 온다면 사용
          if (proposal.acceptance === true) {
            confirmed.push(proposal);
          }
        });
      }
    });
    
    return confirmed;
  }, [allRequests, currentUserId]);
  
  if (isLoading) {
    return (
      <section className="pt-16 text-center">
        <p className="text-[14px] text-[#555]">로드 중...</p>
      </section>
    );
  }
  
  if (confirmedProposals.length === 0) {
    return (
      <section className="pt-16">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFC727]">
            <Image src="/icon_check.svg" alt="체크" width={32} height={32} />
          </div>
          <p className="text-[14px] text-[#555]">확정된 제안서가 없습니다</p>
          <button 
            onClick={() => router.push('/proposal')}
            className="mt-2 h-11 w-full rounded-[4px] bg-gradient-to-r from-[#FFC727] to-[#FFB42B] text-[14px] font-semibold text-white"
          >
            제안서 둘러보기
          </button>
        </div>
      </section>
    );
  }
  
  return (
    <section className="pb-4">
      {confirmedProposals.map((proposal: any) => (
        <article
          key={proposal.id}
          className="border-b border-[#E5E5E5] py-4 last:border-b-0"
          onClick={() => router.push(`/proposal/${proposal.id}`)}
        >
          <div className="cursor-pointer">
            <div className="flex items-center gap-3">
              {/* 로컬 단상 */}
              <div className="h-[44px] w-[44px] rounded-full bg-[#E5E5E5] flex items-center justify-center text-[18px] font-bold text-white">
                {proposal.founder?.display_name?.charAt(0)?.toUpperCase() || '✢'}
              </div>
              
              <div className="flex-1">
                <p className="text-[11px] text-[#888]">
                  {typeof proposal.place === 'object'
                    ? proposal.place?.name || proposal.place?.city || '여행지'
                    : '여행지'}
                </p>
                <p className="mt-[2px] text-[14px] font-semibold text-[#111]">
                  {proposal.title || '제목 없음'}
                </p>
                <p className="mt-[2px] text-[12px] text-[#666]">
                  {proposal.founder?.display_name || '로컬'}
                </p>
              </div>
              
              {/* 오른쪽 화살표 */}
              <Image src="/expand_left.svg" alt="" width={14} height={14} className="rotate-180" />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

/* =================== 내가 제안한 제안서 탭 =================== */

function MyRequestsTab({ 
  requests, 
  isLoading 
}: { 
  requests: any[]; 
  isLoading: boolean;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [directIds, setDirectIds] = useState<number[]>([]);

  // 직제 제안으로 생성된 요청서 ID 목록 로드
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("direct_requests") || "[]");
      setDirectIds(Array.isArray(data) ? data : []);
    } catch {
      setDirectIds([]);
    }
  }, []);

  if (isLoading) {
    return (
      <section className="pt-16 text-center">
        <p className="text-[14px] text-[#555]">로딩 중...</p>
      </section>
    );
  }

  // '내가 제안한 제안서' 탭에는 직제 제안(로컬 제안서에서 직접 제안하기로 만든 요청) + 아직 로컬 제안(응답)이 없는 것만 노출
  const waitingDirect = (requests || []).filter((req: any) => {
    const isDirect = directIds.includes(req.id) || !!req.root_id;
    const hasProposals = Array.isArray(req.proposals) && req.proposals.length > 0;
    return isDirect && !hasProposals;
  });

  if (waitingDirect.length === 0) {
    return (
      <section className="pt-16">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFC727]">
            <Image src="/icon_check.svg" alt="체크" width={32} height={32} />
          </div>
          <p className="text-[14px] text-[#555]">대기중인 직접 제안이 없습니다</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-4">
      {waitingDirect.map((request) => {
        const isExpanded = expandedId === request.id;
        
        return (
          <article
            key={request.id}
            className="border-b border-[#E5E5E5] py-4 last:border-b-0"
          >
            {/* 기본 요약 카드 부분 */}
            <div
              className="cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : request.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                  <p className="text-[14px] font-semibold text-[#111]">
                    {request.title || (typeof request.place === 'object' ? (request.place?.name || request.place?.city || request.place?.state || '여행지') : `여행지 ID: ${request.place}`)}
                  </p>
                    {/* 상태 배지: 직제 제안 + 아직 로컬 응답 없음만 대기중 */}
                    <StatusBadge status="waiting" />
                  </div>
                  <p className="mt-1 text-[12px] text-[#666]">
                    {request.date}{request.end_date && ` ~ ${request.end_date}`} · {request.number_of_people}명
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {request.travel_type.slice(0, 3).map((tag: any) => (
                      <span
                        key={tag.id}
                        className="text-[11px] text-[#999]"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="text-[18px] text-gray-400">
                  {isExpanded ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {/* 펼쳐진 상세 영역 */}
            {isExpanded && (
              <div className="mt-4 space-y-3 border-t border-[#E5E5E5] pt-4">
                <div>
                  <p className="text-[13px] font-semibold text-[#333]">선택한 지역</p>
                  <div className="mt-2">
                    {/* 국가 > 시도 > 시 한 줄로 */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {request.place?.country && (
                        <label className="flex items-center gap-1">
                          <input type="checkbox" checked disabled className="accent-[#FFC600] w-3 h-3" />
                          <span className="text-[12px] text-[#666]">{request.place.country}</span>
                        </label>
                      )}
                      {request.place?.state && (
                        <label className="flex items-center gap-1">
                          <input type="checkbox" checked disabled className="accent-[#FFC600] w-3 h-3" />
                          <span className="text-[12px] text-[#666]">{request.place.state}</span>
                        </label>
                      )}
                      {request.place?.city && (
                        <label className="flex items-center gap-1">
                          <input type="checkbox" checked disabled className="accent-[#FFC600] w-3 h-3" />
                          <span className="text-[12px] text-[#666]">{request.place.city}</span>
                        </label>
                      )}
                    </div>
                    
                    {/* 구/동 및 여행지명은 아래에 */}
                    {(request.place?.district || request.place?.name) && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap pl-4">
                        {request.place?.district && (
                          <label className="flex items-center gap-1">
                            <input type="checkbox" checked disabled className="accent-[#FFC600] w-3 h-3" />
                            <span className="text-[12px] text-[#666]">{request.place.district}</span>
                          </label>
                        )}
                        {request.place?.name && (
                          <label className="flex items-center gap-1">
                            <input type="checkbox" checked disabled className="accent-[#FFC600] w-3 h-3" />
                            <span className="text-[12px] text-[#666]">{request.place.name}</span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-[#333]">여행 기간</p>
                  <p className="mt-1 text-[12px] text-[#666]">
                    {request.date}{request.end_date && ` ~ ${request.end_date}`}
                  </p>
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-[#333]">가이드 희망여부</p>
                  <p className="mt-1 text-[12px] text-[#666]">
                    {request.guidance ? "예" : "아니오"}
                  </p>
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-[#333]">여행 스타일</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {request.travel_type.map((tag: any) => (
                      <span
                        key={tag.id}
                        className="text-[11px] px-2 py-1 rounded-full bg-[#FFF3B8] text-[#333]"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-[#333]">세부 요청사항</p>
                  <p className="mt-1 text-[12px] text-[#666] whitespace-pre-wrap">
                    {request.experience || "없음"}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {/* 채팅하기 버튼 */}
                  <button
                    className="flex-1 rounded-lg border-2 border-[#FFC727] bg-white py-2 text-[13px] font-semibold text-[#FFC727] hover:bg-[#FFFAF0]"
                    onClick={() => window.location.href = `/chat?requestId=${request.id}`}
                  >
                    채팅하기
                  </button>
                  {/* 수락하기 버튼 */}
                  <button
                    className="flex-1 rounded-lg bg-[#FFC727] py-2 text-[13px] font-semibold text-white hover:bg-[#FFB700]"
                    onClick={() => {
                      // TODO: 수락 API 연동 - RequestRootMap을 업데이트하기
                      alert("수락 API 연동 예정입니다.");
                    }}
                  >
                    수락하기
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
