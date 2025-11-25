"use client";

import { useState } from "react";
import Image from "next/image";
import SummarySection from "./SummarySection";
import DayDetailSection from "./DayDetailSection";

export default function ProposalSendPage() {
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [selectedDay, setSelectedDay] = useState(4);
  const [openDayModal, setOpenDayModal] = useState<number | null>(null);

  const days = [
    { day: 4, label: "04" },
    { day: 5, label: "05" },
    { day: 6, label: "06" },
    { day: 7, label: "07" }
  ];

  type ScheduleItem = {
    time: string;
    order: number;
    title: string;
    desc: string;
    bg: string;
    };

    const schedule: Record<string, ScheduleItem[]> = {
    "04": [
        {
        time: "07:00",
        order: 1,
        title: "한식아침밥",
        desc: "소개글",
        bg: "#FFF3B8",
        },
        {
        time: "10:00",
        order: 2,
        title: "국중박구경",
        desc: "소개글",
        bg: "#FFF3B8",
        },
        {
        time: "12:00",
        order: 3,
        title: "",
        desc: "해당 내용을 보려면 포인트가 필요합니다.",
        bg: "#FFE7E7",
        },
    ],
    };

  const scheduleKey = selectedDay.toString().padStart(2, "0");

  return (
    <>
      <div className="mx-auto w-full max-w-[420px] bg-white pb-24">

        {/* HEADER */}
        <header className="border-b border-[#E5E5E5] px-5 pt-10 pb-4">
          <div className="flex items-center justify-between">
            <button onClick={() => history.back()}>
              <Image src="/back.svg" alt="뒤로" width={24} height={24} />
            </button>
            <h1 className="text-[18px] font-bold text-[#111]">
              최근 받은 제안서
            </h1>
            <button aria-label="알림">
              <Image src="/bell.svg" alt="알림" width={20} height={20} />
            </button>
          </div>

          {/* TAB BAR */}
          <nav className="mt-4 flex text-[13px] font-semibold">
            <button className="flex-1 pb-2 border-b-2 border-[#FFC727] text-[#FFC727]">
              최근 받은 제안서
            </button>
            <button className="flex-1 pb-2 text-[#777]">분류</button>
            <button className="flex-1 pb-2 text-[#777]">저장</button>
            <button className="flex-1 pb-2 text-[#777]">확정</button>
          </nav>
        </header>

        {/* TITLE */}
        <section className="px-5 pt-4">
          <h2 className="text-[16px] font-bold text-[#111]">제안서 보내기</h2>
          <p className="mt-[2px] text-[13px] text-[#555]">
            종로구 한국체험 · 종로구, 중구
          </p>
        </section>

        {/* 요약 펼치기 */}
        <section className="px-5 mt-5 flex items-center justify-between">
          <button
            onClick={() => setExpandedSummary(!expandedSummary)}
            className="flex items-center gap-2 text-[13px] text-[#111] font-medium"
          >
            {expandedSummary ? (
              <Image src="/arrow-down.svg" alt="up" width={14} height={14} className="rotate-180"/>
            ) : (
              <Image src="/arrow-down.svg" alt="down" width={14} height={14} />
            )}
            요청서 요약보기
          </button>

          <button>
            <Image src="/plus-circle.png" alt="추가" width={24} height={24} />
          </button>
        </section>

        {/* SUMMARY SECTION */}
        {expandedSummary && (
          <SummarySection />
        )}

        {/* 지도 */}
        <div className="px-5 mt-5">
          <div className="h-[220px] w-full overflow-hidden rounded-[8px] bg-[#E5E5E5]">
            <Image
              src="/map.png"
              alt="지도"
              width={800}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* 날짜 동그라미 */}
        <div className="px-5 mt-4 flex gap-3">
        {days.map((d) => {
            const active = selectedDay === d.day;

            return (
            <button
                key={d.day}
                onClick={() => {
                setSelectedDay(d.day);
                setOpenDayModal(d.day);   // 🔥 날짜 클릭하면 바로 열림
                }}
                className={`
                flex flex-col items-center justify-center
                w-[56px] h-[56px] rounded-full 
                ${active ? "bg-[#FFC727] text-[#111]" : "bg-[#E5E5E5] text-[#111]"}
                `}
            >
                <span className="text-[11px]">11월</span>
                <span className="text-[14px] font-bold">{d.label}</span>
            </button>
            );
        })}
        </div>

        {/* 날짜 아래 입력창 */}
        {openDayModal === selectedDay && (
        <DayDetailSection 
            day={selectedDay} 
            onClose={() => setOpenDayModal(null)} 
        />
        )}

        {/* 시간표 */}
        <section className="px-5 mt-6 text-[12px] text-[#333] space-y-6">
          {/* 06:00 구분선 */}
          <div className="flex items-start gap-4">
            <div className="w-[40px] text-right text-[#555]">06:00</div>
            <div className="mt-[10px] h-[1px] flex-1 bg-[#E5E5E5]" />
          </div>

          {schedule[scheduleKey]?.map((item) => (
            <div
              key={item.order}
              className="flex items-start gap-4"
              onClick={() => setOpenDayModal(selectedDay)}
            >
              <div className="w-[40px] text-right text-[#555]">{item.time}</div>

              <div className="flex-1">
                <div className="-translate-y-1 mr-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFC727] text-[11px] font-bold text-white">
                  {item.order}
                </div>
                <div
                  className="rounded-[4px] px-4 py-3 min-h-[72px]"
                  style={{ backgroundColor: item.bg }}
                >
                  {item.title && (
                    <p className="text-[13px] font-semibold text-[#333]">
                      {item.title}
                    </p>
                  )}
                  <p className="mt-1 text-[#555]">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}

          {/* 마지막 13:00 */}
          <div className="flex items-start gap-4">
            <div className="w-[40px] text-right text-[#555]">13:00</div>
          </div>
        </section>

        {/* 제안서 마지막 입력란 */}
        <section className="px-5 mt-6">
          <textarea
            placeholder="내 제안서를 어필할 수 있는 내용을 적어주세요."
            className="w-full min-h-[120px] rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[13px] text-[#333] outline-none"
          />
        </section>

        {/* 구매 포인트 & 버튼 */}
        <section className="px-5 mt-6 mb-10">
          <div className="mt-8 flex items-center justify-between px-1">
            <p className="text-[14px] font-semibold text-[#111]">
                제안서구매포인트설정
            </p>

            <div className="flex h-10 items-center rounded-[6px] border border-[#333] px-2">
                <input
                type="number"
                className="w-20 bg-transparent text-right text-[14px] outline-none"
                placeholder=""
                />
                <button
                type="button"
                className="ml-2 rounded-full bg-[#FFC727] px-4 py-1 text-[12px] font-semibold text-white"
                >
                포인트
                </button>
            </div>
          </div>

          <button className="mt-5 h-11 w-full rounded-[6px] bg-[#FFC727] text-white text-[14px] font-semibold">
            제안서 보내기
          </button>
        </section>
      </div>

      
    </>
  );
}
