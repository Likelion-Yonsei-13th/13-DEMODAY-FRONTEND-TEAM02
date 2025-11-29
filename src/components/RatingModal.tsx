"use client";

import { useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rating: number) => Promise<void>;
  rootId: number;
  rootTitle?: string;
}

export default function RatingModal({
  isOpen,
  onClose,
  onConfirm,
  rootId,
  rootTitle,
}: RatingModalProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(true);

  if (!mounted || !isOpen) return null;

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleConfirm = async () => {
    if (rating === null) return;

    try {
      setIsLoading(true);
      await onConfirm(rating);
      
      // localStorage에 평점 저장 (임시)
      const ratings = JSON.parse(localStorage.getItem("root_ratings") || "{}");
      ratings[rootId] = rating;
      localStorage.setItem("root_ratings", JSON.stringify(ratings));
      
      setRating(null);
      onClose();
    } catch (error) {
      console.error("평점 저장 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 overflow-hidden">
      <div className="w-[320px] rounded-[16px] bg-white px-6 py-8 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* 제목 */}
        <h2 className="text-center text-[18px] font-bold text-[#111] mb-6">
          평점을 남겨주세요
        </h2>

        {/* 제안서 제목 */}
        {rootTitle && (
          <p className="text-center text-[13px] text-[#666] mb-6 line-clamp-2">
            {rootTitle}
          </p>
        )}

        {/* 별 5개 선택 */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              className="transition-transform hover:scale-110 flex items-center justify-center border-2 border-black w-12 h-12"
              type="button"
              style={{ padding: 0 }}
            >
              <span
                className={`text-[32px] leading-none ${
                  rating && star <= rating ? "text-[#FFC727]" : "text-[#E5E5E5]"
                }`}
              >
                ★
              </span>
            </button>
          ))}
        </div>

        {/* 선택된 점수 표시 */}
        {rating !== null && (
          <div className="text-center mb-8">
            <p className="text-[16px] font-bold text-[#111]">
              {rating}점 선택되었습니다
            </p>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-full bg-[#F0F0F0] px-4 py-2.5 text-[13px] font-semibold text-[#333] hover:bg-[#E5E5E5] disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || rating === null}
            className="flex-1 rounded-full bg-[#FFC727] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#FFB700] disabled:opacity-50"
          >
            {isLoading ? "저장 중..." : "완료"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
