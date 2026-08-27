"use client";

import { useEffect } from "react";

/**
 * 카드 묶음을 **한 장씩 딱딱 넘긴다.**
 *
 * 전에는 CSS 스크롤 애니메이션(`animation-timeline: view()`)으로 스크롤 위치에
 * 카드를 **실시간으로 붙여** 뒀다. 그래서 중간에 손을 멈추면 반쯤 넘어간 채로 서서
 * **두 장이 겹쳐 보였다.** 어느 위치든 그 위치만큼의 중간 상태가 있었다.
 *
 * 이제 스크롤은 **"지금 몇 장 넘어갔는지" 숫자만 정한다.** 넘어가는 모양은 CSS
 * transition 이 자기 시계로 그린다 — 그래서 손을 어디서 멈추든 카드는 늘
 * 제자리이거나 완전히 넘어간 상태다. 중간이 없다.
 *
 * 노선도(RouteScrollDays)와 같은 방식이다. 거기서도 CSS 는 라디오 하나만 보고,
 * 스크롤은 그 라디오를 옮기는 일만 한다.
 *
 * 스크롤할 때마다 계산하면 화면이 버벅인다. **한 프레임에 한 번만** 잰다.
 */
export default function DeckScrollCards() {
  useEffect(() => {
    const deck = document.querySelector<HTMLElement>(".ktc-deck");
    if (!deck) return;

    const cards = deck.querySelectorAll<HTMLElement>(".ktc-deck-card");
    if (cards.length === 0) return;

    // 움직임을 줄여 달라고 설정한 사람에게는 넘기지 않는다. 맨 위 한 장만 보인다.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let queued = 0;

    const apply = () => {
      queued = 0;
      if (reduce.matches) return;

      const box = deck.getBoundingClientRect();
      const span = box.height - window.innerHeight;
      if (span <= 0) return;
      const passed = Math.min(1, Math.max(0, -box.top / span));

      // 마지막 8% 는 남은 한 장을 보는 자리다. 앞의 92% 를 넘길 장수로 나눈다.
      // 이 값들은 전에 CSS 가 쓰던 구간(한 장에 23%)과 같다 — 스크롤 길이는 그대로 두고
      // 넘어가는 방식만 바꾸는 것이라, 여기를 건드리면 감각이 달라진다.
      const gone = Math.min(cards.length, Math.floor((passed / 0.92) * cards.length));

      cards.forEach((card, i) => {
        // 데이터 표시만 옮긴다. 어떻게 넘어갈지는 전부 CSS 가 정한다.
        if (i < gone) card.dataset.gone = "";
        else delete card.dataset.gone;
      });
    };

    const onScroll = () => {
      if (queued) return;
      queued = requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    apply();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (queued) cancelAnimationFrame(queued);
    };
  }, []);

  return null;
}
