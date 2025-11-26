"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetUserProfile, useUpdateUserProfile } from "@/lib/api/mutations";

export default function EditUserProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading } = useGetUserProfile();
  const updateProfile = useUpdateUserProfile();

  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    languages: [] as string[],
    mbti: "",
    travel_style: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        languages: profile.languages || [],
        mbti: profile.mbti || "",
        travel_style: profile.travel_style || "",
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
            placeholder="자기소개를 입력하세요"
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

        {/* MBTI */}
        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            MBTI
          </label>
          <select
            value={formData.mbti}
            onChange={(e) =>
              setFormData({ ...formData, mbti: e.target.value })
            }
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] focus:border-[#FFC727] focus:outline-none"
          >
            <option value="">선택하세요</option>
            <option value="ISTJ">ISTJ</option>
            <option value="ISFJ">ISFJ</option>
            <option value="INFJ">INFJ</option>
            <option value="INTJ">INTJ</option>
            <option value="ISTP">ISTP</option>
            <option value="ISFP">ISFP</option>
            <option value="INFP">INFP</option>
            <option value="INTP">INTP</option>
            <option value="ESTP">ESTP</option>
            <option value="ESFP">ESFP</option>
            <option value="ENFP">ENFP</option>
            <option value="ENTP">ENTP</option>
            <option value="ESTJ">ESTJ</option>
            <option value="ESFJ">ESFJ</option>
            <option value="ENFJ">ENFJ</option>
            <option value="ENTJ">ENTJ</option>
          </select>
        </div>

        {/* 여행 스타일 */}
        <div className="mb-6">
          <label className="mb-2 block text-[14px] font-semibold text-[#111]">
            여행 스타일
          </label>
          <input
            type="text"
            value={formData.travel_style}
            onChange={(e) =>
              setFormData({ ...formData, travel_style: e.target.value })
            }
            placeholder="예: 힐링 여행, 액티비티 중심, 맛집 탐방"
            className="w-full rounded-[8px] border border-[#E5E5E5] px-4 py-3 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none"
          />
        </div>
      </form>
    </div>
  );
}
