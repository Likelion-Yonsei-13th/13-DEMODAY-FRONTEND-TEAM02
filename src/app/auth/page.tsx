"use client";

import Link from "next/link";

export default function AuthIntroPage() {
  return (
    <main className="relative min-h-screen">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 bg-[url('/sign.png')] bg-cover bg-center" />
      {/* 하단 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/50" />

      {/* 콘텐츠 */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-end px-4 pb-8">
        {/* 멘트 */}
        <h2 className="text-[24px] leading-snug text-center text-white mb-6">
          로컬들처럼 하는<br />나만의 여행, 같이 해볼까요?
        </h2>

        {/* 버튼 스택 */}
        <div className="flex flex-col items-center gap-[13px]">
          {[
            { text: "가입하기", href: "/auth/join" },
            { text: "인스타 계정으로 가입하기" },
            { text: "인스타 계정으로 가입하기" },
          ].map((btn, idx) =>
            btn.href ? (
              <Link
                key={idx}
                href={btn.href}
                className="w-[335px] h-[55px] rounded-[6px] flex justify-center items-center
                           font-semibold text-[16px] border border-[#FFC800] text-[#FFC800] bg-transparent
                           transition-all duration-200 hover:bg-[#FFC800] hover:!text-white active:scale-[0.98]
                           no-underline"
              >
                {btn.text}
              </Link>
            ) : (
              <button
                key={idx}
                className="w-[335px] h-[55px] rounded-[6px] flex justify-center items-center
                           font-semibold text-[16px] border border-[#FFC800] text-[#FFC800] bg-transparent
                           transition-all duration-200 hover:bg-[#FFC800] hover:!text-white active:scale-[0.98]"
              >
                {btn.text}
              </button>
            )
          )}
        </div>
      </section>
    </main>
  );
}
