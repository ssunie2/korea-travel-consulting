"use client";

import { useEffect } from "react";

/**
 * 노선도를 **스크롤로도 넘긴다.** 누르는 것은 그대로 두고 스크롤을 하나 더 얹는 것이다.
 *
 * 화면에 보이는 것(문양·DAY 색·아래 팁)은 전부 라디오 하나에 달려 있다 —
 * `.ktc-route:has(#ktc-day-N:checked)` 로 CSS 가 알아서 바꾼다.
 * 그래서 여기서는 **라디오만 옮긴다.** 셋을 따로 건드리지 않는다.
 *
 * CSS 만으로는 못 한다. 스크롤 애니메이션은 색·위치는 바꿔도 라디오를 누르지는 못한다.
 * 그래서 이 파일 하나만 브라우저에서 도는 코드다.
 *
 * 스크롤할 때마다 계산하면 화면이 버벅인다. 그래서 **한 프레임에 한 번만** 계산한다
 * (requestAnimationFrame). passive: true 는 "이 코드가 스크롤을 막지 않는다"고
 * 브라우저에 알려주는 것이라, 손가락을 따라 부드럽게 내려간다.
 */
export default function RouteScrollDays({ days }: { days: number }) {
  useEffect(() => {
    const route = document.querySelector<HTMLElement>(".ktc-route");
    if (!route) return;

    // 움직임을 줄여 달라고 설정한 사람에게는 스크롤 전환을 걸지 않는다. 눌러서 고르면 된다.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let queued = 0;

    const apply = () => {
      queued = 0;
      if (reduce.matches) return;

      const box = route.getBoundingClientRect();
      const view = window.innerHeight;

      // 노선도가 화면에 붙어 있는 동안 흐르는 스크롤(구간 높이 − 화면 높이)을 넷으로 나눈다.
      // 붙어 있으니 그림은 그대로 있고 날짜만 바뀐다. PC 와 폰이 같은 방식이다.
      const span = box.height - view;
      if (span <= 0) return;
      const passed = Math.min(1, Math.max(0, -box.top / span));

      // 1 → 2 → 3 → 4. 끝에서 passed 가 딱 1 이 되면 5 가 나오므로 잘라 준다.
      const day = Math.min(days, Math.floor(passed * days) + 1);

      const input = document.getElementById(`ktc-day-${day}`);
      // checked 를 직접 넣으면 change 는 안 울리지만 CSS 의 :checked 는 바로 따라온다.
      if (input instanceof HTMLInputElement && !input.checked) input.checked = true;
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
  }, [days]);

  return null;
}
