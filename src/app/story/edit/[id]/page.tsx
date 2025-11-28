"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios-instance";
import { endpoints } from "@/lib/api/endpoints";
import { useUpdateStory, useUploadImage } from "@/lib/api/mutations";

export default function EditStoryPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = Number(params.id);
  const updateStory = useUpdateStory(storyId);
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

  // 기존 스토리 데이터 불러오기
  const { data: story, isLoading } = useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      const { data } = await api.get(endpoints.story.detail(storyId));
      return data;
    },
    enabled: !!storyId,
  });

  // 스토리 데이터가 로드되면 폼에 채우기
  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title || "",
        content: story.content || "",
        country: story.country || "KR",
        state: story.state || "",
        city: story.city || "",
        district: story.district || "",
        photo_url: story.photo_url || "",
        is_public: story.is_public ?? true,
      });
      if (story.photo_url) {
        setPreviewImage(story.photo_url);
      }
    }
  }, [story]);

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

    if (!formData.title || !formData.content || !formData.country) {
      alert("제목, 내용, 국가는 필수입니다.");
      return;
    }

    try {
      // 새 파일이 선택되었으면 업로드
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
          return;
        }
      }

      const storyData = {
        ...formData,
        photo_url: photoUrl,
      };
      console.log("[스토리 수정] 전송 데이터:", storyData);
      const result = await updateStory.mutateAsync(storyData);
      console.log("[스토리 수정] 응답:", result);
      alert("스토리가 수정되었습니다.");
      router.push(`/story/${storyId}`);
    } catch (error: any) {
      console.error("스토리 수정 실패:", error);
      console.error("에러 상세:", error.response?.data);
      alert(error.response?.data?.error || error.response?.data?.detail || "스토리 수정에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[14px] text-[#666]">로딩 중...</p>
      </div>
    );
  }

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
        <h1 className="text-[16px] font-semibold text-[#111]">여행 이야기 수정</h1>
        <button
          onClick={handleSubmit}
          disabled={updateStory.isPending || uploadImage.isPending}
          className="text-[14px] font-semibold text-[#FFC727] disabled:opacity-50"
        >
          {uploadImage.isPending ? "업로드 중..." : updateStory.isPending ? "수정 중..." : "완료"}
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
            시/도
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            placeholder="예: 서울특별시"
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            시/구
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) =>
              setFormData({ ...formData, city: e.target.value })
            }
            placeholder="예: 강남구"
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none"
          />
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
