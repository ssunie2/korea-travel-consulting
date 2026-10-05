"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 안에 든 것이 화면에 처음 들어올 때 한 번만 움직임을 틀어 준다.
 *
 * 기본은 **움직임이 끝난 상태**로 그려진다. 스크립트가 아직 화면 밖이라는 걸 확인했을 때만
 * `data-motion="armed"`(처음 상태)로 되돌려 두고, 들어오면 `"play"` 로 바꾼다.
 * 그래서 스크립트가 꺼져 있거나 움직임 줄이기 설정이면 처음부터 다 보인다.
 * 실제 모양은 mohallae.module.css 의 [data-motion] 규칙이 정한다.
 */
export default function PlayOnView({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.8) return; // 이미 보이는 중이면 그대로

    el.dataset.motion = "armed";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.motion = "play";
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
