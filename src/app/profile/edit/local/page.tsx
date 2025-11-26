"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetLocalProfile, useUpdateLocalProfile } from "@/lib/api/mutations";

export default function EditLocalProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading } = useGetLocalProfile();
  const updateProfile = useUpdateLocalProfile();

  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    languages: [] as string[],
    regions: [] as string[],
    strengths: [] as string[],
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        languages: profile.languages || [],
        regions: profile.regions || [],
        strengths: profile.strengths || [],
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile.mutateAsync(formData);
      alert("프로필이 수정되었습니다.");
      router.push("/profile");
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert("프로필 수정에 실패했습니다.");
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
        <h1 className="text-[16px] font-semibold text-[#111]">프로필 수정</h1>
        <button
          onClick={handleSubmit}
          disabled={updateProfile.isPending}
          className="text-[14px] font-semibold text-[#FFC727] disabled:opacity-50"
        >
          {updateProfile.isPending ? "저장 중..." : "완료"}
        </button>
      </header>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="px-5 py-6">
        {/* 닉네임 */}
        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            닉네임
          </label>
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) =>
              setFormData({ ...formData, display_name: e.target.value })
            }
            placeholder="닉네임을 입력하세요"
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none"
          />
        </div>

        {/* 한줄 소개 */}
        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            한줄 소개
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) =>
              setFormData({ ...formData, bio: e.target.value })
            }
            placeholder="제안서 한줄 정리를 입력하세요"
            rows={3}
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none resize-none"
          />
        </div>

        {/* 사용 가능한 언어 */}
        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            사용 가능한 언어
          </label>
          <input
            type="text"
            value={formData.languages.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                languages: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="예: 한국어, English, 日本語 (쉼표로 구분)"
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none"
          />
          <p className="mt-1 text-[12px] text-[#999]">
            쉼표(,)로 구분하여 입력하세요
          </p>
        </div>

        {/* 활동 지역 */}
        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            활동 지역
          </label>
          <input
            type="text"
            value={formData.regions.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                regions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="예: 서울, 강남구, 종로구 (쉼표로 구분)"
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none"
          />
          <p className="mt-1 text-[12px] text-[#999]">
            쉼표(,)로 구분하여 입력하세요
          </p>
        </div>

        {/* 강점 */}
        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            강점
          </label>
          <input
            type="text"
            value={formData.strengths.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                strengths: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="예: 맛집 추천, 힙한 카페, 역사 해설 (쉼표로 구분)"
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none"
          />
          <p className="mt-1 text-[12px] text-[#999]">
            쉼표(,)로 구분하여 입력하세요
          </p>
        </div>
      </form>
    </div>
  );
}
