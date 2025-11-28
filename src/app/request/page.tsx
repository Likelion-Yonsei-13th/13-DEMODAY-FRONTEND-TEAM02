"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/nav/Navbar";
import { useCreateRequest, useThemeTags } from "@/lib/api/queries.document";
import { useSearchPlaces } from "@/lib/api/queries.place";

export default function RequestPage() {
  const router = useRouter();
  const createRequest = useCreateRequest();
  const { data: themeTags } = useThemeTags();
  const { data: places } = useSearchPlaces({});

  const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
  const [travelDate, setTravelDate] = useState<string>("");
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [experience, setExperience] = useState<string>("");
  const [guidance, setGuidance] = useState(true);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [detailFocused, setDetailFocused] = useState(false);

  // 백엔드에서 불러온 태그 목록 사용

  /** 날짜 클릭 로직 */
  const handleDateClick = (day: number) => {
    if (!startDate) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (day < startDate) {
        setEndDate(startDate);
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    } else {
      setStartDate(day);
      setEndDate(null);
    }
  };

  const isBetween = (day: number) => {
    if (!startDate || !endDate) return false;
    return day > startDate && day < endDate;
  };

  /** 태그 선택 */
  const toggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(prev => prev.filter(id => id !== tagId));
    } else {
      if (selectedTagIds.length >= 5) return;
      setSelectedTagIds(prev => [...prev, tagId]);
    }
  };

  /** 요청서 제출 */
  const handleSubmit = async () => {
    if (!selectedPlace) {
      alert("여행지를 선택해주세요.");
      return;
    }
    if (!travelDate) {
      alert("여행 날짜를 선택해주세요.");
      return;
    }
    if (numberOfPeople < 1) {
      alert("여행 인원을 입력해주세요.");
      return;
    }
    if (!experience.trim()) {
      alert("제안 세부 요청사항을 입력해주세요.");
      return;
    }

    try {
      await createRequest.mutateAsync({
        place: selectedPlace,
        date: travelDate,
        number_of_people: numberOfPeople,
        guidance,
        travel_type_ids: selectedTagIds,
        experience,
        is_public_profile: isPublicProfile,
      });
      alert("요청서가 성공적으로 제출되었습니다!");
      router.push("/");
    } catch (error: any) {
      console.error("요청서 제출 실패:", error);
      const errorMsg = 
        error?.response?.data?.detail || 
        error?.response?.data?.error || 
        "요청서 제출에 실패했습니다.";
      alert(errorMsg);
    }
  };

  const calendarDays = [
    "", "", "", "1", "2", "3", "4",
    "5","6","7","8","9","10","11",
    "12","13","14","15","16","17","18",
    "19","20","21","22","23","24","25",
    "26","27","28","29","30","31","1"
  ];

  return (
    <div className="w-full min-h-screen bg-[#F7F7F7] pb-28">

      {/* HEADER */}
      <div className="px-5 pt-12 pb-4">
        <h2 className="text-[22px] font-semibold">제안서요청</h2>
      </div>

      <p className="text-[14px] text-[#555] px-5 mb-4 leading-[20px]">
        제안서를 받아보길 원하시는 기간을 선택해주세요
      </p>

      {/* CALENDAR */}
      <div className="px-5">
        <div className="w-full bg-white border rounded-xl px-4 py-4 shadow-sm">

          <div className="flex justify-between items-center mb-3">
            <button className="text-xl text-gray-500">&lt;</button>
            <span className="font-medium text-[16px]">October 2025</span>
            <button className="text-xl text-gray-500">&gt;</button>
          </div>

          <div className="grid grid-cols-7 text-center text-[12px] text-gray-500 mb-2">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center text-[14px]">
            {calendarDays.map((d, idx) => {
              if (!d) return <div key={idx}></div>;
              const day = Number(d);

              const isStart = startDate === day;
              const isEnd = endDate === day;
              const between = isBetween(day);

              return (
                <button
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  className={`
                    w-9 h-9 flex items-center justify-center rounded-full
                    
                    ${isStart || isEnd ? "bg-black text-white font-semibold" : ""}
                    ${between ? "text-[#FFC600] font-semibold" : ""}
                    ${!isStart && !isEnd && !between ? "text-gray-700" : ""}
                  `}
                >
                  {d}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* CONTENT BOX */}
      <div className="px-5 mt-6">
        <div className="w-full py-5">

          {/* TIME */}
          <p className="text-[14px] font-medium mb-2">시간선택</p>

          <div className="flex gap-3 mb-6">
            {/* 시작 */}
            <div className="flex items-center gap-2">
              <select className="rounded-lg p-2 text-[14px] bg-white">
                {[...Array(12)].map((_, i) => <option key={i}>{i+1}</option>)}
              </select>
              <span className="text-[14px]">시</span>

              <select className="rounded-lg p-2 text-[14px] bg-white">
                <option>30</option>
              </select>
              <span className="text-[14px]">분 ~</span>
            </div>

            {/* 종료 */}
            <div className="flex items-center gap-2">
              <select className="rounded-lg p-2 text-[14px] bg-white">
                {[...Array(12)].map((_, i) => <option key={i}>{i+1}</option>)}
              </select>
              <span className="text-[14px]">시</span>

              <select className="rounded-lg p-2 text-[14px] bg-white">
                <option>30</option>
              </select>
              <span className="text-[14px]">분</span>
            </div>
          </div>

      {/* PLACE SELECTION */}
          <p className="text-[14px] font-medium mb-2">여행지 선택*</p>
          <select 
            className="w-full border border-[#E0A800] text-[#E0A800] rounded-lg py-3 mb-4 font-medium bg-white"
            value={selectedPlace || ""}
            onChange={(e) => setSelectedPlace(Number(e.target.value))}
          >
            <option value="">여행지를 선택해주세요</option>
            {places?.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name} ({place.city})
              </option>
            ))}
          </select>

          {/* DATE */}
          <p className="text-[14px] font-medium mb-1">여행 날짜*</p>
          <input 
            type="date"
            className="w-full input-field rounded-lg bg-[#F8F8F8]" 
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
          />

        </div>
      </div>

      {/* PEOPLE */}
      <div className="px-5 mt-8">
        <p className="text-[14px] font-medium mb-2">여행인원*</p>

        <div className="flex items-center gap-3 mb-6">
          <input 
            type="number"
            min="1"
            className="input-field w-[120px] rounded-lg bg-[#F8F8F8]" 
            placeholder="입력"
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(Number(e.target.value))}
          />
          <span className="text-[14px] text-gray-600">명</span>
        </div>
      </div>

      {/* TAGS */}
      <div className="px-5 mt-4">
        <p className="text-[14px] font-medium mb-1">여행스타일</p>
        <p className="text-[12px] text-gray-400 mb-3">최대 5개까지 선택 가능</p>

        <div className="flex flex-wrap gap-2">
          {themeTags?.map((tag) => {
            const selected = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`
                  px-4 py-1 text-[13px] rounded-full border border-[#FFC600]
                  ${selected ? "bg-[#FFC600] text-white" : "text-[#FFC600] bg-white"}
                `}
              >
                #{tag.name}
              </button>
            );
          })}
        </div>
      </div>


      {/* DETAIL */}
      <div className="px-5 mt-6">
        <p className="text-[14px] font-medium mb-1">제안세부 요청사항*</p>

        <textarea
          rows={5}
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          onFocus={() => setDetailFocused(true)}
          onBlur={() => setDetailFocused(false)}
          className="input-field rounded-lg text-[14px] leading-[20px] bg-white text-black"
          placeholder="ex. 알차게 여행하고 싶습니다! 여기 지역에 놀러갔을 때, 보통 보고 가는 유명한 곳 + 로컴님이 추천해주시는 독특한 장소들로 구성해주셨으면 좋겠어요. 맛집과 카페도 여러가지 추천해주시면 좋겠습니다."
        />
      </div>

      {/* GUIDE */}
      <div className="px-5 mt-6">
        <p className="text-[14px] font-medium mb-1">가이드 희망여부</p>

        <div className="flex gap-8 mt-1">
          <label className="flex items-center gap-2 text-[14px]">
            <input
              type="radio"
              checked={!guidance}
              onChange={() => setGuidance(false)}
              className="accent-[#FFC600]"
            />
            아니오
          </label>

          <label className="flex items-center gap-2 text-[14px]">
            <input
              type="radio"
              checked={guidance}
              onChange={() => setGuidance(true)}
              className="accent-[#FFC600]"
            />
            예
          </label>
        </div>
      </div>

      {/* CTA BUTTON */}
      <div className="px-5 mt-8 flex justify-center">
        <button 
          onClick={handleSubmit}
          disabled={createRequest.isPending}
          className="btn-yellow disabled:opacity-50"
        >
          {createRequest.isPending ? "제출 중..." : "제안서 요청하기"}
        </button>
      </div>

      <Navbar />
    </div>
  );
}
