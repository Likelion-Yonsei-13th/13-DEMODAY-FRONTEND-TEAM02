"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRootDetail } from "@/lib/api/queries.document";
import { absUrl } from "@/lib/api/queries.place";
import PurchaseConfirmModal from "@/components/PurchaseConfirmModal";

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const rootId = parseInt(resolvedParams.id);
  const router = useRouter();
  
  const { data: root, isLoading } = useRootDetail(rootId);
  const [selectedDay, setSelectedDay] = useState(1);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  // 현재 로그인한 사용자 ID 가져오기 및 구매 여부 확인
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    setCurrentUserId(userId);
    
    // 이미 구매한 제안서인지 확인
    const purchased = JSON.parse(localStorage.getItem("purchased_roots") || "[]");
    if (purchased.includes(rootId)) {
      setIsPurchased(true);
    }
  }, [rootId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!root) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">제안서를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 대표 이미지
  const photoUrl = root.photo ? absUrl(root.photo) : null;

  // 여행지 정보
  const place = typeof root.place === 'object' ? root.place : null;
  const placeName = place?.name || place?.city || '여행지';
  const placeAddress = place ? `${place.country}, ${place.state}, ${place.city}${place.district ? ', ' + place.district : ''}` : '';
  
  // 현재 사용자가 제안서 작성자인지 확인 (항상 boolean)
  const isOwner = !!(currentUserId && root.founder && String(root.founder.uuid) === currentUserId);

  // 실제 일정 데이터
  const scheduleData = root.schedule || {};
  const daysCount = Object.keys(scheduleData).length;
  
  // 날짜 버튼 데이터 생성 (1일차, 2일차, 3일차...)
  const daysData = daysCount > 0 
    ? Array.from({ length: daysCount }, (_, i) => ({
        day: i + 1,
        label: `${i + 1}일차`
      }))
    : [{ day: 1, label: "1일차" }];
  
  // 구매 처리 함수
  const handlePurchaseConfirm = async () => {
    try {
      // TODO: 백엔드 API 연동 시연동
      // const { data } = await api.post(`/document/roots/${rootId}/purchase/`);
      // 임시로 구매 완료 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsPurchased(true);
      // 로컬 스토리지에 구매 내역 저장 (Confirmed 탭에서 사용)
      const purchased = JSON.parse(localStorage.getItem("purchased_roots") || "[]");
      if (!purchased.includes(rootId)) {
        purchased.push(rootId);
        localStorage.setItem("purchased_roots", JSON.stringify(purchased));
      }
    } catch (error) {
      console.error("구매 실패:", error);
      throw new Error("구매에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="mx-auto w-full max-w-[420px]">
        {/* HEADER */}
        <header className="border-b border-[#E5E5E5] px-5 pt-10 pb-4">
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()}>
              <Image src="/back.svg" alt="뒤로" width={24} height={24} />
            </button>
            <h1 className="text-[18px] font-bold text-[#111]">
              {root.title || placeName}
            </h1>
            <button aria-label="알림">
              <Image src="/bell.svg" alt="알림" width={20} height={20} />
            </button>
          </div>
        </header>

        {/* 대표 이미지 */}
        {photoUrl && (
          <div className="w-full h-[200px] relative">
            <img
              src={photoUrl}
              alt={root.title || placeName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 제목 및 기본 정보 */}
        <section className="px-5 pt-4">
          <h2 className="text-[18px] font-bold text-[#111]">
            {root.title || placeName}
          </h2>
          <p className="mt-2 text-[13px] text-[#555]">
            #{placeName}
          </p>
        </section>

        {/* 요약 정보 */}
        <section className="px-5 mt-4">
          <div className="rounded-[10px] border border-[#FFC727] bg-[#FFFBF0] px-4 py-3">
            <p className="text-[13px] text-[#333]">
              추천 인원: {root.number_of_people}명
            </p>
            {place && (
              <p className="text-[13px] text-[#333] mt-1">
                지역: {placeAddress}
              </p>
            )}
            {root.travel_type && root.travel_type.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {root.travel_type.map((tag) => (
                  <span key={tag.id} className="text-[11px] text-[#999]">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 지도 */}
        <div className="px-5 mt-5">
          <div className="h-[220px] w-full overflow-hidden rounded-[8px] bg-[#E5E5E5] flex items-center justify-center">
            {place ? (
              <div className="text-center text-gray-500">
                <p className="text-[14px] font-medium">{placeName}</p>
                <p className="text-[12px] mt-1">{placeAddress}</p>
                <p className="text-[11px] mt-2 text-gray-400">
                  * 지도 기능은 곧 추가됩니다
                </p>
              </div>
            ) : (
              <Image
                src="/map.png"
                alt="지도"
                width={800}
                height={600}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        {/* 날짜 선택 */}
        <div className="px-5 mt-4 flex gap-3">
          {daysData.map((d) => {
            const active = selectedDay === d.day;
            return (
              <button
                key={d.day}
                onClick={() => setSelectedDay(d.day)}
                className={`
                  flex flex-col items-center justify-center
                  w-[56px] h-[56px] rounded-full 
                  ${active ? "bg-[#FFC727] text-[#111]" : "bg-[#E5E5E5] text-[#111]"}
                `}
              >
                <span className="text-[12px] font-semibold">{d.label}</span>
              </button>
            );
          })}
        </div>

        {/* 일정표 */}
        <section className="px-5 mt-6 text-[12px] text-[#333] space-y-6">
          {scheduleData[selectedDay] && scheduleData[selectedDay].length > 0 ? (
            <>
              {/* 시작 시간 */}
              <div className="flex items-start gap-4">
                <div className="w-[40px] text-right text-[#555]">
                  {scheduleData[selectedDay][0].startTime || "06:00"}
                </div>
                <div className="mt-[10px] h-[1px] flex-1 bg-[#E5E5E5]" />
              </div>

              {/* 일정 아이템들 */}
              {scheduleData[selectedDay].map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-[40px] text-right text-[#555]">{item.startTime}</div>
                  <div className="flex-1">
                    <div className="-translate-y-1 mr-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFC727] text-[11px] font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="rounded-[4px] px-4 py-3 min-h-[72px] bg-[#FFF3B8]">
                      {item.placeName && (
                        <p className="text-[13px] font-semibold text-[#333]">
                          {item.placeName}
                        </p>
                      )}
                      <p className="mt-1 text-[#555]">
                        {item.startTime} - {item.endTime}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-[#555]">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* 종료 시간 */}
              <div className="flex items-start gap-4">
                <div className="w-[40px] text-right text-[#555]">
                  {scheduleData[selectedDay][scheduleData[selectedDay].length - 1].endTime || "13:00"}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              이 날짜에 대한 일정이 없습니다.
            </div>
          )}
        </section>

        {/* 여행 설명 */}
        {root.experience && (
          <section className="px-5 mt-6">
            <h3 className="text-[15px] font-semibold text-[#111] mb-2">
              여행 설명
            </h3>
            <p className="text-[13px] text-[#666] leading-relaxed whitespace-pre-wrap">
              {root.experience}
            </p>
          </section>
        )}

        {/* 제안서 구매 버튼 (작성자가 아닐 때만 표시) */}
        {!isOwner && (
          <section className="px-5 mt-8 mb-10">
            {isPurchased ? (
              <button 
                disabled 
                className="w-full h-12 rounded-[6px] bg-[#E5E5E5] text-[#999] text-[15px] font-semibold cursor-not-allowed"
              >
                구매 완료
              </button>
            ) : (
              <button 
                onClick={() => setIsPurchaseModalOpen(true)}
                className="w-full h-12 rounded-[6px] bg-[#FFC727] text-white text-[15px] font-semibold hover:bg-[#FFB700] transition-colors"
              >
                제안서 구매하기 (1000 포인트)
              </button>
            )}
          </section>
        )}
      </div>
      
      {/* 구매 확인 모달 (최상단 레이어) */}
      <PurchaseConfirmModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onConfirm={handlePurchaseConfirm}
        rootTitle={root?.title || placeName}
        points={1000}
      />
    </div>
  );
}
