"use client";

import { useEffect, useState } from "react";
import type { Lang } from "../flow";
import { flowCopy as c } from "./copy";
import s from "./flow.module.css";

/**
 * 오른쪽 판의 엽서 — 고른 도시들의 사진을 번갈아 보여 준다 (써니 2026-10-12).
 *
 * 바뀌는 간격은 ROTATE_MS 하나. 써니가 1.5초·4초를 영상으로 비교해 보고 정한다.
 * 질문 바로 옆에서 움직이므로:
 * - 마우스를 올리면 멈추고, 멈춤 단추로 멈출 수도 있다 (WCAG 2.2.2 — 계속 움직이는 것은 멈출 수 있어야 한다)
 * - '움직임 줄이기' 설정이면 넘기지 않고 첫 장만
 * - 사진은 처음부터 다 받지 않는다: 지금 장과 다음 장만 미리 받는다
 * - 고른 도시가 바뀌면 첫 장부터: 부르는 쪽이 key 로 사진 목록을 넘겨 새로 그리게 한다
 */
export const ROTATE_MS = 4000;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);
  return reduced;
}

export default function Postcard({ photos, label, lang }: { photos: string[]; label: string; lang: Lang }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const reduced = useReducedMotion();

  const running = photos.length > 1 && !paused && !hover && !reduced;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
      setShown((n) => Math.min(photos.length, n + 1));
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [running, photos.length]);

  if (!photos.length) {
    return <div className={s.postcardBlank} aria-hidden="true">{label}</div>;
  }

  return (
    <div className={s.postcardFrame} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {photos.slice(0, Math.min(photos.length, shown + 1)).map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" decoding="async" className={`${s.postcard} ${i === index ? s.postcardOn : ""}`} />
      ))}
      {photos.length > 1 && !reduced && (
        <button
          type="button"
          className={s.postcardPause}
          aria-pressed={paused}
          aria-label={c.postcardPause[lang]}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? (
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor" /></svg>
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5h2v9H5zM9 3.5h2v9H9z" fill="currentColor" /></svg>
          )}
        </button>
      )}
    </div>
  );
}
