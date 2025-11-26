"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateStory } from "@/lib/api/mutations";

export default function CreateStoryPage() {
  const router = useRouter();
  const createStory = useCreateStory();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.country) {
      alert("제목, 내용, 국가는 필수입니다.");
      return;
    }

    try {
      const result = await createStory.mutateAsync(formData);
      console.log("스토리 생성 결과:", result);
      alert("스토리가 작성되었습니다.");
      // 페이지 이동 전 약간 대기
      setTimeout(() => {
        router.push("/profile");
        window.location.reload(); // 강제 새로고침
      }, 500);
    } catch (error: any) {
      console.error("스토리 작성 실패:", error);
      console.error("에러 상세:", error.response?.data);
      alert(error.response?.data?.detail || "스토리 작성에 실패했습니다.");
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
          disabled={createStory.isPending}
          className="text-[14px] font-semibold text-[#FFC727] disabled:opacity-50"
        >
          {createStory.isPending ? "작성 중..." : "완료"}
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

        {/* 사진 URL */}
        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            사진 URL
          </label>
          <input
            type="text"
            value={formData.photo_url}
            onChange={(e) =>
              setFormData({ ...formData, photo_url: e.target.value })
            }
            placeholder="사진 URL을 입력하세요"
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none"
          />
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
