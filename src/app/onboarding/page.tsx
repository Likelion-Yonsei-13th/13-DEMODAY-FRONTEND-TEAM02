'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/**
 * 요구사항
 * 1) 진입 시 Splash가 먼저 보이고, 화면을 터치/클릭하면 다음(온보딩)으로 전환
 * 2) 온보딩 3장은 이미지 영역을 좌/우 슬라이드로 이동(스와이프 지원)
 */

const SLIDES = [
  {
    title: '로컬들이 짜주는\n내 맞춤 여행 코스!',
    img: '/onboarding1.png',
  },
  {
    title: '우리 지역 명소를\n여행객에게 알려주고 싶다!',
    img: '/onboarding2.png',
  },
  {
    title: '시간도 남는데,\n우리 지역 여행 가이드를 해볼까?',
    img: '/onboarding3.png',
  },
];

export default function OnboardingPage() {
  const [phase, setPhase] = useState<'splash' | 'onboarding'>('splash');
  const [index, setIndex] = useState(0);

  // === Splash: 첫 화면에서 아무 곳이나 터치/클릭 시 온보딩으로 ===
  const handleSplashProceed = () => setPhase('onboarding');

  // === 슬라이더 터치/드래그 구현 ===
  const startX = useRef<number | null>(null);
  const currentX = useRef<number>(0);
  const dragging = useRef(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || startX.current === null) return;
    currentX.current = e.clientX - startX.current;
    const px = -index * window.innerWidth + currentX.current;
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = `translateX(${px}px)`;
    }
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;

    const dx = currentX.current;
    const threshold = Math.min(120, window.innerWidth * 0.2); // 스와이프 임계값
    let next = index;

    if (dx > threshold) next = Math.max(0, index - 1);
    else if (dx < -threshold) next = Math.min(SLIDES.length - 1, index + 1);

    setIndex(next);

    // 원위치/스냅
    requestAnimationFrame(() => {
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform .35s ease';
        trackRef.current.style.transform = `translateX(-${next * 100}vw)`;
      }
    });

    // 값 초기화
    startX.current = null;
    currentX.current = 0;
  };

  // 인덱스 변경 시 스냅 보장
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform .35s ease';
      trackRef.current.style.transform = `translateX(-${index * 100}vw)`;
    }
  }, [index]);

  if (phase === 'splash') {
    return (
      <section className="splash" onClick={handleSplashProceed} onTouchEnd={handleSplashProceed}>
        <h1 className="splash-title">D tour</h1>
        <div className="splash-footer">버전정보</div>
      </section>
    );
  }

  // === Onboarding (3장 슬라이드) ===
  return (
    <section className="ob-wrap">
      {/* 슬라이더 영역 */}
      <div
        className="ob-viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={trackRef} className="ob-track" style={{ transform: `translateX(-${index * 100}vw)` }}>
          {SLIDES.map((s, i) => (
            <div key={i} className="ob-slide">
              {/* 상단 도트 */}
              <div className="ob-dots" aria-hidden>
                <span className={i === 0 ? 'is-active' : ''} />
                <span className={i === 1 ? 'is-active' : ''} />
                <span className={i === 2 ? 'is-active' : ''} />
              </div>

              {/* 타이틀 */}
              <p className="ob-title whitespace-pre-line">{s.title}</p>

              {/* 이미지 박스 (슬라이드의 핵심 영역) */}
              <div style={{ width: 260, display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={s.img}
                  alt="onboarding preview"
                  width={260}
                  height={520}
                  priority={i === 0}
                  style={{ height: 'auto' }}
                />
              </div>

              {/* CTA 버튼 2개 (고정) */}
              <div style={{ display: 'grid', gap: 12, placeItems: 'center', marginTop: 8 }}>
                <button className="btn-cta">여행자로 시작하기</button>
                <button className="btn-cta">로컬로 시작하기</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      
    </section>
  );
}
