"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios-instance";
import { endpoints } from "@/lib/api/endpoints";
import { useToggleStoryLike, useCreateComment, useDeleteStory } from "@/lib/api/mutations";
import Image from "next/image";

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const storyId = params.id;
  const [commentText, setCommentText] = useState("");
  
  // 현재 로그인한 사용자 ID
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem("user_id") : null;

  // 스토리 상세 조회
  const { data: story, isLoading } = useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      const { data } = await api.get(endpoints.story.detail(Number(storyId)));
      return data;
    },
    enabled: !!storyId,
  });

  // 조회수 증가 (페이지 로드시 한번만)
  useEffect(() => {
    if (!storyId) return;
    const incrementView = async () => {
      try {
        await api.post(endpoints.story.view(Number(storyId)));
        // 조회수 증가 후 스토리 정보 새로고침
        queryClient.invalidateQueries({ queryKey: ["story", storyId] });
      } catch (error) {
        console.error("조회수 증가 실패:", error);
      }
    };
    incrementView();
  }, [storyId, queryClient]);

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

  // 좋아요 토글
  const toggleLike = useToggleStoryLike();
  const handleLike = async () => {
    try {
      await toggleLike.mutateAsync(Number(storyId));
      // 스토리 상세 정보 새로고침
      queryClient.invalidateQueries({ queryKey: ["story", storyId] });
    } catch (error) {
      console.error("좋아요 실패:", error);
    }
  };

  // 댓글 작성
  const createComment = useCreateComment(Number(storyId));
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      alert("댓글을 입력하세요.");
      return;
    }

    try {
      await createComment.mutateAsync({ content: commentText });
      setCommentText("");
      // 댓글 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ["comments", storyId] });
      alert("댓글이 작성되었습니다.");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  // 삭제
  const deleteStory = useDeleteStory();
  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteStory.mutateAsync(Number(storyId));
      alert("삭제되었습니다.");
      router.push("/profile");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  // 작성자인지 확인
  const isAuthor = story && currentUserId && String(story.author) === String(currentUserId);

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
        {isAuthor ? (
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/story/edit/${storyId}`)}
              className="text-[13px] text-[#FFC727] font-medium"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteStory.isPending}
              className="text-[13px] text-[#FF3B30] font-medium disabled:opacity-50"
            >
              {deleteStory.isPending ? "삭제중" : "삭제"}
            </button>
          </div>
        ) : (
          <div className="w-12" />
        )}
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
        <div className="mt-3 flex items-center gap-4">
          <span className="text-[12px] text-[#999]">조회 {story.view_count || 0}</span>
          <button
            onClick={handleLike}
            disabled={toggleLike.isPending}
            className="flex items-center gap-1 text-[12px] text-[#FF3B30] disabled:opacity-50"
          >
            <span>❤️</span>
            <span>좋아요 {story.liked_count || 0}</span>
          </button>
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

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요"
                className="flex-1 rounded-[8px] border border-[#E5E5E5] px-4 py-2 text-[14px] text-[#111] placeholder:text-[#999] focus:border-[#FFC727] focus:outline-none"
              />
              <button
                type="submit"
                disabled={createComment.isPending || !commentText.trim()}
                className="rounded-[8px] bg-gradient-to-r from-[#FFC727] to-[#FFB42B] px-4 py-2 text-[14px] font-semibold text-white disabled:opacity-50"
              >
                {createComment.isPending ? "작성 중..." : "작성"}
              </button>
            </div>
          </form>

          {/* 댓글 목록 */}
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
