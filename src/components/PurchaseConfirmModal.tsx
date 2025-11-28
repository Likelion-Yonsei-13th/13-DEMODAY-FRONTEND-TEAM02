"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

interface PurchaseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  rootTitle?: string;
  points?: number;
}

export default function PurchaseConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  rootTitle,
  points = 1000,
}: PurchaseConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "구매 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="w-[280px] rounded-[16px] bg-white px-6 py-8 shadow-xl">
        {/* 체크 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFC727]">
            <Image src="/icon_check.svg" alt="확인" width={32} height={32} />
          </div>
        </div>

        {/* 제목 */}
        <h2 className="text-center text-[16px] font-bold text-[#111] mb-4">
          제안서 구매
        </h2>

        {/* 내용 */}
        <div className="text-center mb-6">
          <p className="text-[13px] text-[#666] mb-3">
            {rootTitle && (
              <>
                <span className="font-semibold text-[#111] block mb-2">
                  {rootTitle}
                </span>
              </>
            )}
            <span>
              {points.toLocaleString()}포인트를 지불하고
              <br />
              제안서를 구매하시겠습니까?
            </span>
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 rounded-[8px] bg-[#FFE7E7] p-3 text-center">
            <p className="text-[12px] text-[#C00] font-semibold">{error}</p>
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
            아니오
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 rounded-full bg-[#FFC727] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#FFB700] disabled:opacity-50"
          >
            {isLoading ? "처리 중..." : "예"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
