"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1);

  if (step === 1) {
    return (
      <main
        role="button"
        tabIndex={0}
        onClick={() => setStep(2)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setStep(2)}
        className="min-h-screen bg-brand flex flex-col items-center justify-between text-white cursor-pointer select-none"
        aria-label="화면을 터치하여 다음으로 이동"
      >
        <div />
        <h1 className="text-[40px] font-bold leading-tight text-center">D-tour</h1>
        <p className="text-[18px] opacity-90 pb-8">버전정보</p>
      </main>
    );
  }

  // ✅ 2, 3, 4번째 온보딩 슬라이드
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={24}
          className="h-full onboarding-swiper"
        >
          <SwiperSlide>
            <Slide
              titleTop="로컬들이 짜주는"
              titleBottom="내 맞춤 여행 코스!"
              img="/onboarding1.png"
              alt="맞춤 여행 코스 화면"
            />
          </SwiperSlide>

          <SwiperSlide>
            <Slide
              titleTop="우리 지역 명소를"
              titleBottom="여행객에게 알려주고 싶다!"
              img="/onboarding2.png"
              alt="지역 명소 소개 화면"
            />
          </SwiperSlide>

          <SwiperSlide>
            <Slide
              titleTop="시간도 남는데,"
              titleBottom="우리 지역 여행 제안을 해볼까?"
              img="/onboarding3.png"
              alt="여행 가이드 화면"
            />
          </SwiperSlide>
        </Swiper>
      </div>

      {/* ✅ 하단 CTA */}
      <div className="sticky bottom-0 z-10 w-full bg-white/70 backdrop-blur px-4 pb-6 pt-0">
        <div className="mx-auto max-w-md flex flex-col items-center gap-[13px]">
          <Link href="/auth?role=traveler" className="btn-yellow">
            여행자로 시작하기
          </Link>
          <Link href="/auth?role=local" className="btn-yellow">
            로컬로 시작하기
          </Link>
        </div>
      </div>

      {/* ✅ Swiper 페이지 점 (상단 위치, 회색/검정, 여백 조정) */}
      <style jsx global>{`
        .onboarding-swiper {
          padding-top: 60px; /* 상단 여백 (점 위쪽) */
        }
        .onboarding-swiper
          .swiper-horizontal
          > .swiper-pagination-bullets,
        .onboarding-swiper
          .swiper-pagination-bullets.swiper-pagination-horizontal {
          top: 18px; /* 점 표시 간격 */
          bottom: auto;
          width: 100%;
        }
        .onboarding-swiper .swiper-pagination-bullet {
          background: #6c6c6c !important;
          opacity: 1 !important;
          box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
        }
        .onboarding-swiper .swiper-pagination-bullet-active {
          background: #000 !important;
        }
      `}</style>
    </main>
  );
}

/* =========================== 슬라이드 컴포넌트 =========================== */
function Slide({
  titleTop,
  titleBottom,
  img,
  alt,
}: {
  titleTop: string;
  titleBottom: string;
  img: string;
  alt: string;
}) {
  return (
    <section className="flex h-full flex-col items-center">
      {/* 1️⃣ 점 밑 간격  →  타이틀 (24px) */}
      <h2 className="mt-[42px] text-center leading-tight text-[24px] font-semibold text-gray-900">
        {titleTop}
        <br />
        {titleBottom}
      </h2>

      {/* 2️⃣ 타이틀 밑 간격 → 이미지 */}
      <div className="relative mt-[24px] w-full max-w-sm h-[400px]">
        <Image
          src={img}
          alt={alt}
          fill
          priority
          sizes="(max-width:768px) 90vw, 400px"
          className="object-contain"
        />
      </div>
      {/* 이미지와 버튼 사이 간격 최소화 */}
    </section>
  );
}
