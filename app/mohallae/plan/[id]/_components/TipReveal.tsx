"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "../plan.module.css";

/**
 * 현지 팁이 **처음엔 비어 있다가, 스크롤로 그 자리에 오면 써지듯 나타난다** (써니 요청 2026-10-11).
 * 아는 사람이 일정표를 보다가 옆에 메모를 적어 주는 느낌 — 중괄호가 그려지고, 딱지가 뜨고,
 * 빨간 한 줄이 왼쪽부터 써지고, 아래 두 문단이 올라온다. 실제 모양은 plan.module.css 의 [data-reveal] 규칙.
 *
 * - 자리는 처음부터 잡아 둔다(투명할 뿐). 나타날 때 아래 글이 밀려 움직이지 않는다.
 * - 팁이 화면 높이의 62% 선(가운데보다 조금 아래)을 넘어 올라오면 나타난다. 처음부터 그 위에 있으면(PC 에서 1일차 팁) 일정을 먼저
 *   보도록 0.7초 뒤에 나타난다. 이미 지나쳐 위에 있으면 바로 보인다 — 어떤 경우에도 숨은 채로 남지 않는다.
 * - 페이지 끝 가까이에 있어 62% 선까지 올라올 수 없는 팁(기둥 맨 아래의 가려 둔 팁, 짧은 여행)은
 *   **끝까지 내렸을 때 화면 안에 있으면** 나타난다. 이 규칙이 없으면 넓은 화면에서 영영 숨어 있었다.
 * - 스크립트가 없거나 '움직임 줄이기' 설정이면 처음부터 다 보인다. 화면 낭독기는 늘 읽는다(투명도만 바뀐다).
 * - 숨김은 CSS 가 첫 화면부터 건다(깜빡임 방지). 여기서는 언제 나타날지만 정한다: data-reveal = armed → play.
 */
export default function TipReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // 나타날 때가 됐는지: 62% 선을 넘었거나, 더 내릴 수 없는데 화면 안에 들어와 있거나
    const due = () => {
      const top = el.getBoundingClientRect().top;
      if (top < window.innerHeight * 0.62) return true;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      return atBottom && top < window.innerHeight - 40;
    };

    el.dataset.reveal = "armed";
    if (el.getBoundingClientRect().top < 0) {
      el.dataset.reveal = "play"; // 이미 지나친 자리(뒤로 가기 등)는 바로 보여 준다
      return;
    }

    let timer: number | undefined;
    const play = () => {
      el.dataset.reveal = "play";
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
    function check() {
      if (due()) play();
    }

    if (due()) {
      timer = window.setTimeout(play, 700);
    } else {
      window.addEventListener("scroll", check, { passive: true });
      window.addEventListener("resize", check);
    }
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <div ref={ref} className={styles.tipWrap}>
      {children}
    </div>
  );
}
