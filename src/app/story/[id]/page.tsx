"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios-instance";
import { endpoints } from "@/lib/api/endpoints";
import Image from "next/image";

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id;

  // 스토리 상세 조회
  const { data: story, isLoading } = useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      const { data } = await api.get(endpoints.story.detail(Number(storyId)));
      return data;
    },
    enabled: !!storyId,
  });

  // 댓글 목록 조회
  const { data: commentsData } = useQuery({
    queryKey: ["comments", storyId],
    queryFn: async () => {
      try {
        const { data } = await api.get(endpoints.story.comments(Number(storyId)));
        console.log("[StoryDetail] 댓글 데이터:", data);
        // data가 배열이면 그대로, 아니면 빈 배열
        return Array.isArray(data) ? data : (data?.results || []);
      } catch (error) {
        console.error("[StoryDetail] 댓글 조회 실패:", error);
        return [];
      }
    },
    enabled: !!storyId,
  });

  const comments = Array.isArray(commentsData) ? commentsData : [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[14px] text-[#666]">로딩 중...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[14px] text-[#666]">스토리를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[420px] bg-white pb-10">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E5E5] bg-white px-5 py-4">
        <button
          onClick={() => router.back()}
          className="text-[14px] text-[#666]"
        >
          ← 뒤로
        </button>
        <h1 className="text-[16px] font-semibold text-[#111]">여행 이야기</h1>
        <div className="w-12" /> {/* 균형 맞추기 */}
      </header>

      {/* 본문 */}
      <div className="px-5 py-6">
        {/* 제목 */}
        <h2 className="text-[22px] font-bold text-[#111]">{story.title}</h2>

        {/* 작성자 정보 */}
        <div className="mt-3 flex items-center gap-2 text-[12px] text-[#666]">
          <span>{story.author_name}</span>
          <span>·</span>
          <span>{new Date(story.created_at).toLocaleDateString()}</span>
        </div>

        {/* 지역 정보 */}
        {(story.city || story.district) && (
          <div className="mt-2 text-[12px] text-[#999]">
            📍 {story.city} {story.district}
          </div>
        )}

        {/* 조회수, 좋아요 */}
        <div className="mt-3 flex gap-4 text-[12px] text-[#999]">
          <span>조회 {story.view_count || 0}</span>
          <span>좋아요 {story.liked_count || 0}</span>
        </div>

        {/* 사진 */}
        {story.photo_url && (
          <div className="mt-6 overflow-hidden rounded-[8px]">
            <img
              src={story.photo_url}
              alt={story.title}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* 내용 */}
        <div className="mt-6 whitespace-pre-wrap text-[14px] leading-[1.6] text-[#333]">
          {story.content}
        </div>

        {/* 구분선 */}
        <div className="my-8 border-t border-[#E5E5E5]" />

        {/* 댓글 섹션 */}
        <div>
          <h3 className="mb-4 text-[16px] font-semibold text-[#111]">
            댓글 {comments.length}
          </h3>

          {comments.length === 0 ? (
            <p className="py-6 text-center text-[14px] text-[#999]">
              첫 댓글을 작성해보세요!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="border-b border-[#F5F5F5] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#333]">
                      {comment.user_name}
                    </span>
                    <span className="text-[11px] text-[#999]">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-[#555]">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
