"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCreateStory, useUploadImage, useCreatePlace } from "@/lib/api/mutations";
import { STATE_CITIES } from "@/lib/locationData";

const STATES = Object.keys(STATE_CITIES);

export default function CreateStoryPage() {
  const router = useRouter();
  const createStory = useCreateStory();
  const createPlace = useCreatePlace();
  const uploadImage = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    country: "KR",
    state: "",
    city: "",
    district: "",
    photo_url: "",
    is_public: true,
  });

  const [previewImage, setPreviewImage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 시/도가 변경되면 시/구 데이터 갱신
  const availableCities = useMemo(() => {
    if (!formData.state) return [];
    return STATE_CITIES[formData.state] || [];
  }, [formData.state]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WEBP만 가능)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewImage("");
    setFormData({ ...formData, photo_url: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.country || !formData.state || !formData.city) {
      alert("제목, 내용, 국가, 시/도, 시/구는 멋식입니다.");
      return;
    }

    try {
      // 1. 이미지 업로드 (먼저 업로드 후 장소 생성)
      let photoUrl = formData.photo_url;
      if (selectedFile) {
        console.log("[업로드] 파일 업로드 시작:", selectedFile.name);
        try {
          const upload = await uploadImage.mutateAsync(selectedFile);
          if (!upload || !upload.url) {
            throw new Error("업로드 응답에 URL이 없습니다.");
          }
          photoUrl = upload.url;
          console.log("[업로드] 받은 URL:", photoUrl);
        } catch (uploadError: any) {
          console.error("[업로드 실패]", uploadError);
          alert("이미지 업로드에 실패했습니다: " + (uploadError.response?.data?.error || uploadError.message));
          return; // 업로드 실패 시 스토리 생성을 중단
        }
      }

      // 2. 장소 생성 (업로드된 이미지 URL 사용)
      let placeId: number | undefined = undefined;
      try {
        console.log("[장소 생성] 시작:", formData);
        const placeData = {
          name: formData.title,
          photo_url: photoUrl || "", // 업로드된 URL 또는 비링른 을른 마
          country: formData.country,
          state: formData.state,
          city: formData.city,
          district: formData.district || "",
        };
        console.log("[장소 데이터]", placeData);
        const place = await createPlace.mutateAsync(placeData);
        placeId = place.id;
        console.log("[장소 생성 성공]", placeId);
      } catch (placeError: any) {
        console.error("[장소 생성 실패]", placeError.response?.data || placeError.message);
        alert("장소 생성 실패: " + (placeError.response?.data?.detail || placeError.message));
        return;
      }

      // 3. 스토리 생성
      const storyData = {
        ...formData,
        photo_url: photoUrl,
        place: placeId,
      };
      console.log("[스토리 생성] 전송 데이터:", storyData);
      const result = await createStory.mutateAsync(storyData);
      console.log("[스토리 생성] 응답:", result);
      alert("스토리가 작성되었습니다.");
      setTimeout(() => {
        router.push("/profile");
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error("스토리 작성 실패:", error);
      console.error("에러 상세:", error.response?.data);
      alert(error.response?.data?.error || error.response?.data?.detail || "스토리 작성에 실패했습니다.");
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-[420px] bg-white">
      {/* 헤더 */}
      <header className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-4">
        <button
          onClick={() => router.back()}
          className="text-[14px] text-[#666]"
        >
          취소
        </button>
        <h1 className="text-[16px] font-semibold text-[#111]">여행 이야기 작성</h1>
        <button
          onClick={handleSubmit}
          disabled={createStory.isPending || uploadImage.isPending || createPlace.isPending}
          className="text-[14px] font-semibold text-[#FFC727] disabled:opacity-50"
        >
          {createPlace.isPending ? "장소 생성 중..." : uploadImage.isPending ? "업로드 중..." : createStory.isPending ? "작성 중..." : "완료"}
        </button>
      </header>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="px-5 py-6">
        {/* 제목 */}
        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            제목 <span className="text-[#FF3B30]">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="제목을 입력하세요"
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none"
          />
        </div>

        {/* 내용 */}
        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            내용 <span className="text-[#FF3B30]">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="여행 이야기를 작성하세요"
            rows={8}
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none resize-none"
          />
        </div>

        {/* 지역 정보 */}
        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            국가 <span className="text-[#FF3B30]">*</span>
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            placeholder="예: KR"
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            시/도 <span className="text-[#FF3B30]">*</span>
          </label>
          <select
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value, city: "" }) // state 변경 시 city 초기화
            }
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] focus:border-[#FFC727] focus:outline-none"
          >
            <option value="">선택하세요</option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            시/구 <span className="text-[#FF3B30]">*</span>
          </label>
          <select
            value={formData.city}
            onChange={(e) =>
              setFormData({ ...formData, city: e.target.value })
            }
            disabled={!formData.state}
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] focus:border-[#FFC727] focus:outline-none disabled:bg-[#F5F5F5] disabled:text-[#999]"
          >
            <option value="">선택하세요</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            동/면
          </label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) =>
              setFormData({ ...formData, district: e.target.value })
            }
            placeholder="예: 역삼동"
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none"
          />
        </div>

        {/* 사진 업로드 */}
        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            사진
          </label>

          {!previewImage && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-[8px] border-2 border-dashed border-[#E5E5E5] px-4 py-8 text-center text-[14px] text-[#999] hover:border-[#FFC727] hover:text-[#FFC727] transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>사진을 선택하세요</span>
                  <span className="text-[12px] text-[#999]">JPG, PNG, GIF, WEBP (10MB 이하)</span>
                </div>
              </button>
            </div>
          )}

          {previewImage && (
            <div className="relative">
              <img
                src={previewImage}
                alt="미리보기"
                className="w-full h-[200px] object-cover rounded-[8px]"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-[#FF3B30] text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-[#E5342E] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 공개 여부 */}
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) =>
                setFormData({ ...formData, is_public: e.target.checked })
              }
              className="h-4 w-4"
            />
            <span className="text-[14px] text-[#111]">공개로 작성</span>
          </label>
        </div>
      </form>
    </div>
  );
}
