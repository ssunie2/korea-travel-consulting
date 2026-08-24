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
    // 폰에서 기준으로 삼는 것. 노선 그림이 화면에 있는 동안 날짜가 다 넘어가야
    // 바뀔 때마다 그 위 문양이 보인다.
    const scene = route.querySelector<HTMLElement>(".ktc-route-scene") ?? route;

    // 움직임을 줄여 달라고 설정한 사람에게는 스크롤 전환을 걸지 않는다. 눌러서 고르면 된다.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let queued = 0;

    const apply = () => {
      queued = 0;
      if (reduce.matches) return;

      const box = route.getBoundingClientRect();
      const view = window.innerHeight;

      /*
        재는 방법이 화면 크기마다 다르다.

        **PC** 는 노선도가 화면에 붙어 있다. 붙어 있는 동안 흐르는 스크롤(구간 높이 − 화면 높이)을
        넷으로 나눈다. 이때는 그림이 그대로 있고 날짜만 바뀐다.

        **폰** 은 붙이지 않는다(노선 그림과 팁을 합치면 화면보다 커서 아래가 잘린다).
        그래서 **구간이 화면을 지나가는 동안** 으로 잰다 — 아래에서 올라와 위로 빠져나갈 때까지.

        가르는 기준을 화면 높이의 절반으로 뒀다. 붙여 둔 구간은 이보다 훨씬 길고,
        안 붙인 구간은 훨씬 짧아서 애매한 중간이 없다.
      */
      const pinned = box.height - view;
      let passed: number;
      if (pinned > view / 2) {
        // 붙여 둔 구간(PC) — 붙어 있는 동안 흐르는 스크롤을 넷으로 나눈다
        passed = -box.top / pinned;
      } else {
        // 안 붙인 구간(폰) — **노선 그림** 이 화면을 지나가는 동안으로 잰다.
        // 구간 전체로 재면 마지막 날짜가 올 때쯤 그림이 이미 화면 밖이라 문양이 안 보인다.
        const sb = scene.getBoundingClientRect();
        passed = (view - sb.top) / (sb.height + view);
      }
      passed = Math.min(1, Math.max(0, passed));

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
