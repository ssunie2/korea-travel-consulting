"use client";

import { useEffect } from "react";
import styles from "../landing.module.css";

/**
 * '초안은 이렇게 생겼습니다' 구역의 스크롤 모션 (써니 2026-11-14 — 모션 시안 비교에서 고름)
 *
 * - 사진 카드 넷: 2번 '사진 속 깊이'.
 *   카드는 조용히 떠오르고, 스크롤하는 동안 사진이 액자 안에서 반대로 흐른다.
 *   카드마다 흐르는 빠르기(data-depth)가 달라 서로 다른 거리에 떠 있는 것처럼 보인다.
 *   나란히 있는 카드는 왼쪽부터 차례로 들어온다 — 한 덩어리로 같이 움직이지 않게.
 * - 1일차 예시 칸: 3번 '초안이 써지듯'.
 *   테두리가 그려지고 '무료로 연 안' 표가 튀어나온 뒤, 정거장 → 흔한 계획에 빨간 줄 → 현지 팁 순서로 한 줄씩 적힌다.
 *   잠긴 안 셋은 옆에서 미끄러져 들어온다.
 *
 * 내릴 때도 올릴 때도 같은 규칙이고, 화면 가운데에서는 모두 제 모습이다.
 * 이 스크립트가 .mvOn 을 붙여야 규칙이 켜진다 — 스크립트가 돌기 전 · '동작 줄이기' 를 켠 기기에서는 아무것도 안 움직이고 그대로 보인다.
 * 값을 넣는 쪽은 여기, 모양을 바꾸는 쪽은 landing.module.css 의 '샘플 구역 스크롤 모션'.
 */
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const backOut = (t: number) => {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
const set = (el: HTMLElement, k: string, v: number) => el.style.setProperty(k, v.toFixed(4));
const VARS = ["--e", "--d", "--o", "--c", "--depth", "--draw", "--box", "--pop", "--strike", "--tipE"];

export default function SamplesMotion() {
  useEffect(() => {
    const section = document.getElementById("samples");
    const grid = section?.querySelector<HTMLElement>("[data-motion-grid]");
    if (!section || !grid) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    const q = (sel: string) => [...section.querySelectorAll<HTMLElement>(sel)];
    const cards = q("[data-depth]");
    const ov = section.querySelector<HTMLElement>('[data-w="ov"]');
    const rect = ov?.querySelector("rect") ?? null;
    const texts = q('[data-w="text"]');
    const rows = q('[data-w="row"]');
    const lks = q('[data-w="lk"]');
    const all = [...cards, ...texts, ...rows, ...lks, ...(ov ? [ov] : [])];

    // 원래 자리(움직임이 더해지기 전)의 위치. offsetTop 은 translate/scale 을 무시한다 —
    // 움직이는 중의 위치로 재면 움직임이 다시 진행 정도를 바꿔 떨린다
    const lay = new Map<HTMLElement, { top: number; height: number }>();
    const lag = new Map<HTMLElement, number>();
    const measure = () => {
      for (const el of all) {
        let top = 0;
        let n: HTMLElement | null = el;
        while (n) {
          top += n.offsetTop;
          n = n.offsetParent as HTMLElement | null;
        }
        lay.set(el, { top, height: el.offsetHeight });
      }
      // 같은 줄에 나란히 있으면 왼쪽에서 오른쪽으로 갈수록 늦게 들어온다. 한 줄을 다 쓰는 카드는 바로
      const g = grid.getBoundingClientRect();
      for (const c of cards) {
        const r = c.getBoundingClientRect();
        lag.set(c, r.width > g.width * 0.9 ? 0 : clamp((r.left - g.left) / g.width) * 0.42);
        c.style.setProperty("--depth", c.dataset.depth ?? "1");
      }
      if (ov && rect) {
        rect.setAttribute("width", String(Math.max(0, ov.offsetWidth - 1.5)));
        rect.setAttribute("height", String(Math.max(0, ov.offsetHeight - 1.5)));
      }
    };

    // 화면 아래(또는 위) 가장자리에서 들어온 정도. 가운데 쪽은 1. d: 1 = 아래에서, -1 = 위에서
    const edge = (el: HTMLElement, inFrac: number, outFrac: number) => {
      const l = lay.get(el)!;
      const vh = innerHeight;
      const top = l.top - scrollY;
      const bottom = top + l.height;
      const pin = clamp((vh - top) / (vh * inFrac));
      const pout = clamp(bottom / (vh * outFrac));
      return pin <= pout ? { p: pin, d: 1, top, height: l.height } : { p: pout, d: -1, top, height: l.height };
    };

    const frame = () => {
      ticking = false;
      const vh = innerHeight;
      for (const c of cards) {
        const { p, d, top, height } = edge(c, 0.42, 0.26);
        const lg = lag.get(c) ?? 0;
        const k = clamp(p * (1 + lg) - lg);
        set(c, "--e", outCubic(k));
        set(c, "--d", d);
        set(c, "--o", clamp(k * 1.6));
        set(c, "--c", clamp((top + height / 2 - vh / 2) / vh, -1, 1));
      }
      if (ov) {
        const { p } = edge(ov, 0.5, 0.2);
        set(ov, "--draw", outCubic(clamp(p / 0.7)));
        set(ov, "--box", clamp((p - 0.7) / 0.3));
        set(ov, "--pop", backOut(clamp((p - 0.62) / 0.38)));
      }
      if (texts[0]) {
        const { p, d } = edge(texts[0], 0.36, 0.14);
        for (const t of texts) {
          set(t, "--e", outCubic(p));
          set(t, "--o", p);
          set(t, "--d", d);
        }
      }
      for (const row of rows) {
        const { p, d } = edge(row, 0.34, 0.18);
        const a = outCubic(clamp(p / 0.45));
        set(row, "--e", a);
        set(row, "--o", a);
        set(row, "--d", d);
        set(row, "--strike", outCubic(clamp((p - 0.3) / 0.35)));
        set(row, "--tipE", backOut(clamp((p - 0.55) / 0.45)));
      }
      for (const l of lks) {
        const { p, d } = edge(l, 0.3, 0.16);
        set(l, "--e", outCubic(p));
        set(l, "--o", clamp(p * 1.6));
        set(l, "--d", d);
      }
    };

    let ticking = false;
    const req = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    };
    const remeasure = () => {
      measure();
      req();
    };
    const ro = new ResizeObserver(remeasure);

    let on = false;
    const start = () => {
      if (on) return;
      on = true;
      measure();
      frame(); // 값을 먼저 넣고 나서 규칙을 켠다 — 켜는 순간 깜빡이지 않게
      section.classList.add(styles.mvOn);
      addEventListener("scroll", req, { passive: true });
      ro.observe(section);
      document.fonts?.ready.then(remeasure);
    };
    const stop = () => {
      if (!on) return;
      on = false;
      removeEventListener("scroll", req);
      ro.disconnect();
      section.classList.remove(styles.mvOn);
      for (const el of all) for (const v of VARS) el.style.removeProperty(v);
    };
    const onReduce = () => (reduce.matches ? stop() : start());

    onReduce();
    reduce.addEventListener("change", onReduce);
    return () => {
      reduce.removeEventListener("change", onReduce);
      stop();
    };
  }, []);

  return null;
}
