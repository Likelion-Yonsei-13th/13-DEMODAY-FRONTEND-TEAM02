"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/nav/Navbar";
import { useCreateRequest, useThemeTags, useRootDetail } from "@/lib/api/queries.document";
import { useSearchPlaces } from "@/lib/api/queries.place";

function RequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rootId = searchParams.get("rootId");
  const createRequest = useCreateRequest();
  const { data: themeTags } = useThemeTags();
  const { data: rootDetail } = useRootDetail(rootId ? parseInt(rootId) : undefined);

  // 날짜 관련
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // rootId가 있을 때 로컬 제안서 정보 기반으로 자동 설정
  useEffect(() => {
    if (rootId && rootDetail) {
      // 로컬의 제안서 정보에서 장소 설정
      if (rootDetail.place && typeof rootDetail.place === 'object') {
        setSelectedCountry("KR");
        setSelectedCity(rootDetail.place.state || "");
        if (rootDetail.place.city) {
          setSelectedDistricts([rootDetail.place.city]);
        }
      }
      // 제목 미리 설정 (로컬 제안서 제목 기반)
      const localName = rootDetail.founder?.display_name || "로컬";
      setTitle(`${localName}의 제안서에 맞춤형 요청`);
    }
  }, [rootId, rootDetail]);
  
  // 제목
  const [title, setTitle] = useState<string>("");
  
  // 지역 선택
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<number[]>([]);
  
  // 도시별 지역구 목록
  const districtsByCity: Record<string, string[]> = {
    "서울특별시": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
    "부산광역시": ["강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구"],
    "대구광역시": ["남구", "달서구", "동구", "북구", "서구", "수성구", "중구", "달성군"],
    "인천광역시": ["강화구", "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "옵진구", "중구"],
    "광주광역시": ["광산구", "남구", "동구", "북구", "서구"],
    "대전광역시": ["대덕구", "동구", "서구", "유성구", "중구"],
    "울산광역시": ["남구", "동구", "북구", "중구", "울주군"],
    "제주특별자치도": ["제주시", "서귀포시"],
  };
  
  // 전체 도시 여행지 조회
  const { data: allCityPlaces } = useSearchPlaces({
    country: selectedCountry,
    state: selectedCity,
    enabled: !!selectedCountry && !!selectedCity,
  });
  
  // 선택된 지역구로 필터링
  const filteredPlaces = useMemo(() => {
    if (!allCityPlaces) return [];
    if (selectedDistricts.length === 0) return allCityPlaces;
    
    return allCityPlaces.filter(place => 
      selectedDistricts.includes(place.city)
    );
  }, [allCityPlaces, selectedDistricts]);
  
  // 기타
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [experience, setExperience] = useState<string>("");
  const [guidance, setGuidance] = useState(true);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [detailFocused, setDetailFocused] = useState(false);

  // 달력 내비게이션
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // 날짜 클릭 로직
  const handleDateClick = (date: Date) => {
    if (!startDate) {
      setStartDate(date);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    } else {
      setStartDate(date);
      setEndDate(null);
    }
  };

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return d1.toDateString() === d2.toDateString();
  };

  const isBetweenDates = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  // 여행 일수 계산
  const getTravelDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const maxPlaces = getTravelDays() * 4;

  // Place 선택 토글
  const togglePlace = (placeId: number) => {
    if (selectedPlaceIds.includes(placeId)) {
      setSelectedPlaceIds(prev => prev.filter(id => id !== placeId));
    } else {
      if (selectedPlaceIds.length >= maxPlaces) {
        alert(`여행 기간에 따라 최대 ${maxPlaces}개까지 선택 가능합니다.`);
        return;
      }
      setSelectedPlaceIds(prev => [...prev, placeId]);
    }
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
    if (!title.trim()) {
      alert("제안서 제목을 입력해주세요.");
      return;
    }
    if (selectedPlaceIds.length === 0) {
      alert("여행지를 선택해주세요.");
      return;
    }
    if (!startDate) {
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
      // 첫 번째 place로 제출 (백엔드가 단일 place만 받음)
      const payload: any = {
        title: title.trim(),
        place_id: selectedPlaceIds[0],
        date: startDate.toISOString().split('T')[0],
        end_date: endDate?.toISOString().split('T')[0],
        number_of_people: numberOfPeople,
        guidance,
        travel_type_ids: selectedTagIds,
        experience,
        is_public_profile: isPublicProfile,
      };
      
      // rootId가 있으면 포함 (로컬 제안서에 대한 맞춤형 요청)
      if (rootId) {
        payload.root_id = parseInt(rootId);
      }
      
      const created = await createRequest.mutateAsync(payload);
      // 직제 제안하기로 생성된 경우, localStorage에 표시하여 여행자 탭에서 '대기중'으로만 노출
      if (rootId && created?.id) {
        const direct = JSON.parse(localStorage.getItem("direct_requests") || "[]");
        if (!direct.includes(created.id)) {
          direct.push(created.id);
          localStorage.setItem("direct_requests", JSON.stringify(direct));
        }
      }
      alert("요청서가 성공적으로 제출되었습니다!");
      router.push("/proposal");
    } catch (error: any) {
      console.error("요청서 제출 실패:", error);
      const errorMsg = 
        error?.response?.data?.detail || 
        error?.response?.data?.error || 
        "요청서 제출에 실패했습니다.";
      alert(errorMsg);
    }
  };

  // 달력 날짜 생성
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // 빈 칸 추가
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // 날짜 추가
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-[calc(80px+env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-[420px]">
        {/* HEADER */}
        <div className="px-5 pt-12 pb-4">
          <h2 className="text-[22px] font-semibold">제안서요청</h2>
        </div>

        <p className="text-[14px] text-[#555] px-5 mb-4 leading-[20px]">
          제안서를 받아보길 원하시는 기간을 선택해주세요
        </p>

        {/* TITLE */}
        <div className="px-5 mb-4">
          <p className="text-[14px] font-medium mb-2">제안서 제목*</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 종로구 한국 체험"
            className="w-full border border-gray-300 rounded-lg py-3 px-4 bg-white text-[14px]"
          />
        </div>

        {/* CALENDAR */}
        <div className="px-5">
        <div className="w-full bg-white border rounded-xl px-4 py-4 shadow-sm">

          <div className="flex justify-between items-center mb-3">
            <button onClick={prevMonth} className="text-xl text-gray-500">&lt;</button>
            <span className="font-medium text-[16px]">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button onClick={nextMonth} className="text-xl text-gray-500">&gt;</button>
          </div>

          <div className="grid grid-cols-7 text-center text-[12px] text-gray-500 mb-2">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center text-[14px]">
            {calendarDays.map((d, idx) => {
              if (!d) return <div key={idx}></div>;

              const isStart = isSameDay(d, startDate);
              const isEnd = isSameDay(d, endDate);
              const between = isBetweenDates(d);

              return (
                <button
                  key={idx}
                  onClick={() => handleDateClick(d)}
                  className={`
                    w-9 h-9 flex items-center justify-center rounded-full
                    
                    ${isStart || isEnd ? "bg-black text-white font-semibold" : ""}
                    ${between ? "text-[#FFC600] font-semibold" : ""}
                    ${!isStart && !isEnd && !between ? "text-gray-700" : ""}
                  `}
                >
                  {d.getDate()}
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
                {[...Array(24)].map((_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                ))}
              </select>
              <span className="text-[14px]">시</span>

              <select className="rounded-lg p-2 text-[14px] bg-white">
                <option value="0">00</option>
                <option value="30">30</option>
              </select>
              <span className="text-[14px]">분 ~</span>
            </div>

            {/* 종료 */}
            <div className="flex items-center gap-2">
              <select className="rounded-lg p-2 text-[14px] bg-white">
                {[...Array(24)].map((_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                ))}
              </select>
              <span className="text-[14px]">시</span>

              <select className="rounded-lg p-2 text-[14px] bg-white">
                <option value="0">00</option>
                <option value="30">30</option>
              </select>
              <span className="text-[14px]">분</span>
            </div>
          </div>

      {/* REGION SELECTION */}
          <p className="text-[14px] font-medium mb-2">지역 선택*</p>
          
          {/* 국가 선택 */}
          <select 
            className="w-full border border-gray-300 rounded-lg py-3 mb-3 bg-white text-[14px]"
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedCity("");
              setSelectedDistricts([]);
              setSelectedPlaceIds([]);
            }}
          >
            <option value="">국가를 선택해주세요</option>
            <option value="KR">대한민국</option>
          </select>

          {/* 도시 선택 */}
          {selectedCountry && (
            <select 
              className="w-full border border-gray-300 rounded-lg py-3 mb-3 bg-white text-[14px]"
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedDistricts([]);
                setSelectedPlaceIds([]);
              }}
            >
              <option value="">도시를 선택해주세요</option>
              <option value="서울특별시">서울특별시</option>
              <option value="부산광역시">부산광역시</option>
              <option value="대구광역시">대구광역시</option>
              <option value="인천광역시">인천광역시</option>
              <option value="광주광역시">광주광역시</option>
              <option value="대전광역시">대전광역시</option>
              <option value="울산광역시">울산광역시</option>
              <option value="제주특별자치도">제주특별자치도</option>
            </select>
          )}

          {/* 지역구 선택 (선택사항) */}
          {selectedCity && districtsByCity[selectedCity] && (
            <div className="mb-3">
              <p className="text-[13px] text-gray-600 mb-2">지역구 (선택사항)</p>
              <div className="max-h-[150px] overflow-y-auto border rounded-lg p-3 bg-white">
                {districtsByCity[selectedCity].map((district) => (
                  <label
                    key={district}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDistricts.includes(district)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDistricts(prev => [...prev, district]);
                        } else {
                          setSelectedDistricts(prev => prev.filter(d => d !== district));
                        }
                        setSelectedPlaceIds([]);
                      }}
                      className="accent-[#FFC600]"
                    />
                    <span className="text-[13px]">{district}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 여행지 목록 */}
          {selectedCountry && selectedCity && filteredPlaces && filteredPlaces.length > 0 && (
            <div className="mt-4">
              <p className="text-[14px] font-medium mb-2">
                여행지 선택 {getTravelDays() > 0 && `(최대 ${maxPlaces}개)`}
              </p>
              <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-lg p-3">
                {filteredPlaces.map((place) => (
                  <label
                    key={place.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlaceIds.includes(place.id)}
                      onChange={() => togglePlace(place.id)}
                      className="accent-[#FFC600]"
                    />
                    <span className="text-[13px]">{place.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

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
                  ${selected ? "bg-[#FFC600] text-white" : "text-black bg-white"}
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
      </div>

      <Navbar />
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
      <RequestContent />
    </Suspense>
  );
}
