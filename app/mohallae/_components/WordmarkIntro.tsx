"use client";

import { useLayoutEffect, useRef } from "react";
import styles from "../landing.module.css";
import { playWordmarkIntro } from "./wordmarkIntro";

/**
 * 첫 화면 머리줄 로고에 인트로를 한 번 입힌다 — 안에 넣은 <Wordmark /> 그림 위에서 움직인다 (wordmarkIntro.ts).
 *
 * - 자바스크립트가 돌기 전에는 글자를 숨겨 둔다(data-intro="pending"). 1.6초 안에 시작하지 못하면 CSS 가 글자를 그냥 보여준다.
 * - 기기에서 '동작 줄이기'를 켰으면 움직이지 않고 처음부터 완성된 로고를 보여준다.
 * - 끝나면 덧붙인 다람쥐를 모두 지워서, 남는 것은 원래 Wordmark 그대로다.
 */
export default function WordmarkIntro({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const box = ref.current;
    const svg = box?.querySelector("svg");
    if (!box || !svg) return;
    const done = () => box.setAttribute("data-intro", "done");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const firstGlyph = svg.querySelector(":scope > g");
    // 늦게 시작해서 CSS 가 이미 글자를 보여주기 시작했다면 다시 숨기지 않는다
    const alreadyShown = firstGlyph ? Number(getComputedStyle(firstGlyph).opacity) > 0.05 : true;
    if (reduce || alreadyShown) {
      done();
      return;
    }
    box.setAttribute("data-intro", "playing");
    const ground = getComputedStyle(box).getPropertyValue("--bg").trim() || "#f1f2f4";
    const stop = playWordmarkIntro(svg, ground, done);
    return () => {
      stop();
      // 중간에 멈췄으면 처음 상태로 — 다시 붙으면 처음부터 재생된다
      if (box.getAttribute("data-intro") === "playing") box.setAttribute("data-intro", "pending");
    };
  }, []);

  return (
    <span ref={ref} className={styles.intro} data-intro="pending">
      {children}
    </span>
  );
}
