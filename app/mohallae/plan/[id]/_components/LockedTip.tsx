import type { CSSProperties } from "react";
import styles from "../plan.module.css";
import { draftCopy } from "../copy";
import { tipLabel, type Lang } from "../../../content";

/**
 * 가려 둔 현지 팁 — 팁이 없는 날의 맨 아래 (써니 요청 2026-10-11: "모자이크 처리하고, 유료면 볼 수 있다는 느낌").
 *
 * 무료 초안의 팁은 **여행 전체에 하나**다 (이슈 #2 무료 1/3 규칙, 랜딩 가격표 '컨시어지 팁 하나').
 * 그래서 나머지 날에는 팁이 들어갈 자리만 모자이크로 보여 주고, 전체 일정에서 볼 수 있다고 적는다.
 *
 * - 모자이크 밑에 **글을 깔지 않는다.** 진짜 팁은 없고(AI 가 하나만 쓴다), 가짜 글을 깔면 지어낸 증거가 되며
 *   (PRODUCT.md 원칙 4) 흐리게 해도 페이지 소스와 화면 낭독기로 그대로 읽힌다. 그래서 네모 타일만 그린다.
 * - 정거장이 아니라 **그 날의 맨 끝**에 붙인다. 유료 전체 일정은 같은 입력으로 새로 만들어서 정거장이 다를 수 있다 —
 *   특정 장소 밑에 붙이면 '그 장소 팁이 있다'는 약속이 된다. '그 날 모든 정거장에 팁'은 유료 일정의 규칙이라 늘 맞다.
 * - 가격·버튼은 넣지 않는다. 파는 자리는 맨 아래 띠 하나다 (PRODUCT.md 원칙 2 '먼저 보여주고 나중에 판다').
 * - 진짜 팁과 같은 모양(중괄호·딱지·첫 줄)을 흐린 색으로 써서, 진짜 팁 하나가 여전히 가장 눈에 띈다.
 */
export default function LockedTip({ seed, lang, className = "" }: { seed: number; lang: Lang; className?: string }) {
  return (
    <div className={`${styles.tip} ${styles.tipLocked} ${className}`}>
      <svg className={styles.brace} viewBox="0 0 16 72" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M15 1.5C9.5 1.5 8.5 4.5 8.5 10V28C8.5 33 6.5 36 1 36C6.5 36 8.5 39 8.5 44V62C8.5 67.5 9.5 70.5 15 70.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className={styles.badge}>
        <svg className={styles.lockGlyph} viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3.6 5.4V4a2.4 2.4 0 0 1 4.8 0v1.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <rect x="2.2" y="5.2" width="7.6" height="5.6" rx="1.3" fill="currentColor" />
        </svg>
        {tipLabel[lang]}
      </p>
      <Mosaic seed={seed} />
      <p className={styles.lockedNote}>{draftCopy.lockedTip[lang]}</p>
    </div>
  );
}

/** 늘 같은 순서로 0~1 을 내는 작은 난수 (xorshift). 같은 날은 새로고침해도 같은 무늬다 */
function seeded(seed: number) {
  let s = (Math.imul(seed + 1, 2654435761) >>> 0) || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

const COLS = 40; // 한 줄 타일 수
const T = 8; // 타일 한 변 (viewBox 단위 — 실제 크기는 칸 폭에 맞춰 늘고 준다)
const GAP = 7; // 줄 사이

/**
 * 진짜 팁의 짜임을 흐리게 옮긴 것: 빨간 한 줄(꼭 할 것) + 회색 두 줄(피하실 것·현지인의 말).
 * 군데군데 아주 옅은 칸은 낱말 사이 띄어쓰기처럼 보이게 한다.
 * 나타날 때는 왼쪽부터 타일이 깜빡이며 채워진다 (--d: 타일마다 늦게 시작하는 시간).
 */
function Mosaic({ seed }: { seed: number }) {
  const rand = seeded(seed);
  const lines = [
    { length: 0.7 + rand() * 0.14, tone: styles.mosaicRed, min: 0.22, range: 0.42 },
    { length: 0.92 + rand() * 0.08, tone: styles.mosaicInk, min: 0.08, range: 0.18 },
    { length: 0.5 + rand() * 0.2, tone: styles.mosaicInk, min: 0.08, range: 0.18 },
  ];

  return (
    <svg
      className={styles.mosaic}
      viewBox={`0 0 ${COLS * T} ${lines.length * T + (lines.length - 1) * GAP}`}
      aria-hidden="true"
      focusable="false"
    >
      {lines.map((line, row) => {
        const count = Math.round(COLS * line.length);
        let lastGap = -3;
        return (
          <g key={row} className={line.tone}>
            {Array.from({ length: count }, (_, col) => {
              // 띄어쓰기 칸: 줄 처음과 끝은 비우지 않고, 바로 붙어서 두 번 나오지 않게
              const gap = col > 2 && col < count - 2 && col - lastGap > 3 && rand() < 0.16;
              if (gap) lastGap = col;
              const alpha = gap ? 0.03 : line.min + rand() * line.range;
              const delay = 0.5 + (col / COLS) * 0.55 + row * 0.12 + rand() * 0.12;
              return (
                <rect
                  key={col}
                  x={col * T}
                  y={row * (T + GAP)}
                  width={T}
                  height={T}
                  fill="currentColor"
                  fillOpacity={alpha.toFixed(2)}
                  style={{ "--d": `${delay.toFixed(2)}s` } as CSSProperties}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
