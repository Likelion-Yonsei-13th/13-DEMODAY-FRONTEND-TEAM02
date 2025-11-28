"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/nav/Navbar";
import { useCreateRoot, useThemeTags, useUploadRootImage } from "@/lib/api/queries.document";
import { useSearchPlaces } from "@/lib/api/queries.place";
import api from "@/lib/api/axios-instance";

type ScheduleItem = {
  startTime: string;
  endTime: string;
  placeId?: number;
  placeName: string;
  description: string;
};

export default function ProposalSendPage() {
  const router = useRouter();
  const createRoot = useCreateRoot();
  const uploadImage = useUploadRootImage();
  const { data: themeTags } = useThemeTags();

  // 제목
  const [title, setTitle] = useState<string>("");
  
  // 이미지
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // 일정 기간 선택 (1~5일)
  const [selectedDays, setSelectedDays] = useState<number>(1);
  
  // 지역 선택
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  
  // 직접 추가하기
  const [isCustomPlace, setIsCustomPlace] = useState(false);
  const [customPlaceName, setCustomPlaceName] = useState<string>("");
  const [customPlacePhoto, setCustomPlacePhoto] = useState<File | null>(null);
  const [customPlacePhotoPreview, setCustomPlacePhotoPreview] = useState<string | null>(null);

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
  
  // 선택된 지역구로 필터링 (클라이언트 측)
  const filteredPlaces = useMemo(() => {
    if (!allCityPlaces) return [];
    if (selectedDistricts.length === 0) return allCityPlaces;
    
    // district가 선택되었으면 city 필드로 필터링
    return allCityPlaces.filter(place => 
      selectedDistricts.some(district => 
        place.city === district || place.district === district
      )
    );
  }, [allCityPlaces, selectedDistricts]);
  
  // 일정표 (각 날짜별 스케줄 아이템)
  const [schedules, setSchedules] = useState<Record<number, ScheduleItem[]>>({
    1: [{ startTime: "09:00", endTime: "10:00", placeName: "", description: "" }],
  });
  
  // 기타
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [travelDescription, setTravelDescription] = useState<string>("");
  const [guidance, setGuidance] = useState(true);

  // 태그 선택
  const toggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(prev => prev.filter(id => id !== tagId));
    } else {
      if (selectedTagIds.length >= 5) return;
      setSelectedTagIds(prev => [...prev, tagId]);
    }
  };
  
  // 스케줄 아이템 추가
  const addScheduleItem = (day: number) => {
    setSchedules(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), { startTime: "09:00", endTime: "10:00", placeName: "", description: "" }],
    }));
  };
  
  // 스케줄 아이템 삭제
  const removeScheduleItem = (day: number, index: number) => {
    setSchedules(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };
  
  // 스케줄 아이템 수정
  const updateScheduleItem = (day: number, index: number, field: keyof ScheduleItem, value: string | number) => {
    setSchedules(prev => ({
      ...prev,
      [day]: prev[day].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };
  
  // 이미지 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 커스텀 여행지 이미지 선택
  const handleCustomPlaceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomPlacePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPlacePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 제출
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    
    // 커스텀 여행지인 경우 추가 검증
    if (isCustomPlace) {
      if (!customPlaceName.trim()) {
        alert("여행지 이름을 입력해주세요.");
        return;
      }
      if (!selectedCountry || !selectedCity) {
        alert("국가와 도시를 선택해주세요.");
        return;
      }
    } else if (!selectedPlaceId) {
      alert("지역을 선택해주세요.");
      return;
    }
    if (numberOfPeople < 1) {
      alert("추천 여행 인원을 입력해주세요.");
      return;
    }
    if (!travelDescription.trim()) {
      alert("여행 설명을 입력해주세요.");
      return;
    }

    try {
      let actualPlaceId = selectedPlaceId;
      
      // 커스텀 여행지인 경우 먼저 TravelPlace 생성
      if (isCustomPlace) {
        let customPlacePhotoUrl = "";
        
        // 커스텀 여행지 이미지 업로드
        if (customPlacePhoto) {
          const uploadResult = await uploadImage.mutateAsync(customPlacePhoto);
          customPlacePhotoUrl = uploadResult.url;
        }
        
        // TravelPlace 생성
        const placePayload: any = {
          name: customPlaceName.trim(),
          country: selectedCountry,
          state: selectedCity,
          city: selectedDistricts.length > 0 ? selectedDistricts[0] : "",
          district: "",
        };
        
        if (customPlacePhotoUrl) {
          placePayload.photo_url = customPlacePhotoUrl;
        }
        
        const { data: newPlace } = await api.post("/place/places/create-by-local/", placePayload);
        actualPlaceId = newPlace.id;
      }
      
      let photoUrl = "";
      
      // 대표 이미지가 있으면 먼저 업로드
      if (photoFile) {
        console.log("Uploading image...", photoFile);
        const uploadResult = await uploadImage.mutateAsync(photoFile);
        photoUrl = uploadResult.url;
        console.log("Image uploaded:", photoUrl);
      } else if (!isCustomPlace && selectedPlaceId) {
        // 기존 여행지 선택 시 대표 이미지를 업로드하지 않았으면 해당 여행지의 이미지 사용
        const selectedPlace = filteredPlaces.find(p => p.id === selectedPlaceId);
        if (selectedPlace?.photo) {
          photoUrl = selectedPlace.photo;
          console.log("Using existing place photo:", photoUrl);
        }
      }

      const payload: any = {
        place_id: actualPlaceId,
        title: title.trim(),
        number_of_people: numberOfPeople,
        guidance,
        travel_type_ids: selectedTagIds,
        experience: travelDescription,
        schedule: schedules,  // 일정 데이터 포함
      };
      
      // photo가 있을 때만 추가
      if (photoUrl) {
        payload.photo = photoUrl;
      }
      
      console.log("Submitting root payload:", payload);
      await createRoot.mutateAsync(payload);
      alert("제안서가 성공적으로 작성되었습니다!");
      router.push("/proposal");
    } catch (error: any) {
      console.error("제안서 작성 실패:", error);
      console.error("에러 상세:", error.response?.data);
      console.error("상태 코드:", error.response?.status);
      
      const errorData = error?.response?.data;
      let errorMsg = "제안서 작성에 실패했습니다.";
      
      if (typeof errorData === 'object') {
        // 필드별 에러 메시지 추출
        const errors = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        errorMsg = errors || errorMsg;
      } else if (errorData) {
        errorMsg = String(errorData);
      }
      
      alert(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-[calc(80px+env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-[420px]">
        {/* HEADER */}
        <div className="px-5 pt-12 pb-4">
          <button onClick={() => router.back()} className="mb-3">
            <Image src="/back.svg" alt="뒤로" width={24} height={24} />
          </button>
          <h2 className="text-[22px] font-semibold">제안서 만들기</h2>
        </div>

        <p className="text-[14px] text-[#555] px-5 mb-4 leading-[20px]">
          로컬 가이드로서 여행 제안서를 작성해주세요
        </p>

        {/* TITLE */}
        <div className="px-5 mb-4">
          <p className="text-[14px] font-medium mb-2">제안서 제목*</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 종로 한국 전통 체험 1일 코스"
            className="w-full border border-gray-300 rounded-lg py-3 px-4 bg-white text-[14px]"
          />
        </div>

        {/* DAY SELECTION */}
        <div className="px-5 mb-6">
          <p className="text-[14px] font-medium mb-2">일정 기간*</p>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((day) => (
              <button
                key={day}
                onClick={() => {
                  setSelectedDays(day);
                  // 선택된 날짜까지만 스케줄 유지
                  const newSchedules: Record<number, ScheduleItem[]> = {};
                  for (let i = 1; i <= day; i++) {
                    newSchedules[i] = schedules[i] || [{ startTime: "09:00", endTime: "10:00", placeName: "", description: "" }];
                  }
                  setSchedules(newSchedules);
                }}
                className={`
                  flex-1 py-3 rounded-lg text-[14px] font-medium border-2
                  ${selectedDays === day 
                    ? "bg-[#FFC600] border-[#FFC600] text-white" 
                    : "bg-white border-gray-300 text-gray-700"}
                `}
              >
                {day}일
              </button>
            ))}
          </div>
        </div>

        {/* REGION SELECTION */}
        <div className="px-5 mb-6">
          <p className="text-[14px] font-medium mb-2">지역 선택*</p>
          
          {/* 국가 선택 */}
          <select 
            className="w-full border border-gray-300 rounded-lg py-3 mb-3 bg-white text-[14px]"
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedCity("");
              setSelectedDistricts([]);
              setSelectedPlaceId(null);
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
                setSelectedPlaceId(null);
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

          {/* 지역구 선택 */}
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
                        setSelectedPlaceId(null);
                      }}
                      className="accent-[#FFC600]"
                    />
                    <span className="text-[13px]">{district}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 여행지 선택 (단일) */}
          {selectedCountry && selectedCity && (
            <div className="mt-4">
              <p className="text-[14px] font-medium mb-2">대표 여행지 선택*</p>
              
              {isCustomPlace ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={customPlaceName}
                    onChange={(e) => setCustomPlaceName(e.target.value)}
                    placeholder="여행지 이름을 입력하세요"
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 bg-white text-[14px]"
                  />
                  
                  {/* 지역(State) 선택 */}
                  <select
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 bg-white text-[14px]"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="">시/도를 선택하세요*</option>
                    <option value="서울특별시">서울특별시</option>
                    <option value="부산광역시">부산광역시</option>
                    <option value="대구광역시">대구광역시</option>
                    <option value="인천광역시">인천광역시</option>
                    <option value="광주광역시">광주광역시</option>
                    <option value="대전광역시">대전광역시</option>
                    <option value="울산광역시">울산광역시</option>
                    <option value="제주특별자치도">제주특별자치도</option>
                  </select>
                  
                  {/* 시/구 (City) 선택 - 선택사항 */}
                  {selectedCity && districtsByCity[selectedCity] && (
                    <select
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 bg-white text-[14px]"
                      value={selectedDistricts[0] || ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedDistricts([e.target.value]);
                        } else {
                          setSelectedDistricts([]);
                        }
                      }}
                    >
                      <option value="">구/군 (선택사항)</option>
                      {districtsByCity[selectedCity].map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {/* 커스텀 여행지 이미지 */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                    {customPlacePhotoPreview ? (
                      <div className="relative">
                        <img
                          src={customPlacePhotoPreview}
                          alt="여행지 이미지"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setCustomPlacePhoto(null);
                            setCustomPlacePhotoPreview(null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer py-2">
                        <p className="text-[13px] text-gray-500">여행지 이미지 (선택사항)</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCustomPlaceImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomPlace(false);
                      setCustomPlaceName("");
                      setCustomPlacePhoto(null);
                      setCustomPlacePhotoPreview(null);
                    }}
                    className="text-[13px] text-gray-500 underline"
                  >
                    여행지 목록에서 선택하기
                  </button>
                </div>
              ) : filteredPlaces && filteredPlaces.length > 0 ? (
                <>
                  <select
                    className="w-full border border-gray-300 rounded-lg py-3 bg-white text-[14px] mb-2"
                    value={selectedPlaceId || ""}
                    onChange={(e) => setSelectedPlaceId(Number(e.target.value))}
                  >
                    <option value="">여행지를 선택해주세요</option>
                    {filteredPlaces.map((place) => (
                      <option key={place.id} value={place.id}>
                        {place.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsCustomPlace(true)}
                    className="text-[13px] text-[#FFC727] underline"
                  >
                    + 직접 추가하기
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCustomPlace(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-[13px] text-[#FFC727]"
                >
                  + 직접 추가하기
                </button>
              )}
            </div>
          )}
        </div>

        {/* IMAGE UPLOAD - 기존 여행지 선택 시에만 표시 */}
        {!isCustomPlace && selectedPlaceId && (
          <div className="px-5 mb-6">
            <p className="text-[14px] font-medium mb-2">
              대표 이미지
              <span className="text-[12px] text-gray-500 ml-2">(기존 여행지 이미지 대신 사용 - 선택사항)</span>
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="미리보기"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                  <div className="text-gray-400 text-center">
                    <p className="text-[14px]">이미지 선택</p>
                    <p className="text-[12px] mt-1">클릭하여 이미지를 업로드하세요</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {/* SCHEDULE BUILDER */}
        {selectedDays > 0 && (
          <div className="px-5 mb-6">
            <p className="text-[14px] font-medium mb-3">일정 시간표</p>
            
            {Array.from({ length: selectedDays }, (_, i) => i + 1).map((day) => (
              <div key={day} className="mb-6 border border-gray-300 rounded-lg p-4 bg-white">
                <h3 className="text-[15px] font-semibold mb-3">{day}일차</h3>
                
                {schedules[day]?.map((item, index) => (
                  <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                    {/* 시작/종료 시간 선택 */}
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px] text-gray-600 w-20">시작 시간:</span>
                        <select
                          className="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-[14px]"
                          value={item.startTime}
                          onChange={(e) => updateScheduleItem(day, index, "startTime", e.target.value)}
                        >
                          {[...Array(24)].map((_, h) => (
                            <option key={h} value={`${String(h).padStart(2, '0')}:00`}>
                              {String(h).padStart(2, '0')}:00
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-gray-600 w-20">종료 시간:</span>
                        <select
                          className="flex-1 border border-gray-300 rounded-lg py-2 px-3 text-[14px]"
                          value={item.endTime}
                          onChange={(e) => updateScheduleItem(day, index, "endTime", e.target.value)}
                        >
                          {[...Array(24)].map((_, h) => (
                            <option key={h} value={`${String(h).padStart(2, '0')}:00`}>
                              {String(h).padStart(2, '0')}:00
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeScheduleItem(day, index)}
                          className="text-red-500 text-[12px] px-2 whitespace-nowrap"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    
                    {/* 장소 선택 */}
                    <div className="mb-2">
                      <select
                        className="w-full border border-gray-300 rounded-lg py-2 px-3 text-[14px]"
                        value={item.placeId || ""}
                        onChange={(e) => {
                          const placeId = Number(e.target.value);
                          const place = filteredPlaces.find(p => p.id === placeId);
                          updateScheduleItem(day, index, "placeId", placeId);
                          updateScheduleItem(day, index, "placeName", place?.name || "");
                        }}
                      >
                        <option value="">장소를 선택해주세요</option>
                        {filteredPlaces.map((place) => (
                          <option key={place.id} value={place.id}>
                            {place.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* 설명 */}
                    <textarea
                      value={item.description}
                      onChange={(e) => updateScheduleItem(day, index, "description", e.target.value)}
                      placeholder="이 시간대 활동 설명"
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 text-[13px] resize-none"
                      rows={2}
                    />
                  </div>
                ))}
                
                <button
                  onClick={() => addScheduleItem(day)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-[13px] text-gray-600"
                >
                  + 시간대 추가
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PEOPLE */}
        <div className="px-5 mb-6">
          <p className="text-[14px] font-medium mb-2">추천 여행인원*</p>
          <div className="flex items-center gap-3">
            <input 
              type="number"
              min="1"
              className="w-[120px] border border-gray-300 rounded-lg py-3 px-4 bg-white text-[14px]"
              placeholder="입력"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(Number(e.target.value))}
            />
            <span className="text-[14px] text-gray-600">명</span>
          </div>
        </div>

        {/* TAGS */}
        <div className="px-5 mb-6">
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

        {/* TRAVEL DESCRIPTION */}
        <div className="px-5 mb-6">
          <p className="text-[14px] font-medium mb-1">여행 설명*</p>
          <textarea
            rows={5}
            value={travelDescription}
            onChange={(e) => setTravelDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg py-3 px-4 text-[14px] leading-[20px] bg-white resize-none"
            placeholder="이 제안서의 특징과 매력을 설명해주세요. 예: 한국 전통 문화를 체험할 수 있는 코스입니다. 경복궁과 북촌 한옥마을을 거쳐 전통 찻집에서 휴식을 취하는 일정입니다."
          />
        </div>

        {/* CTA BUTTON */}
        <div className="px-5 mb-8 flex justify-center">
          <button 
            onClick={handleSubmit}
            disabled={createRoot.isPending}
            className="w-full h-12 rounded-lg bg-[#FFC600] text-white text-[15px] font-semibold disabled:opacity-50"
          >
            {createRoot.isPending ? "작성 중..." : "제안서 작성하기"}
          </button>
        </div>
      </div>

      <Navbar />
    </div>
  );
}
