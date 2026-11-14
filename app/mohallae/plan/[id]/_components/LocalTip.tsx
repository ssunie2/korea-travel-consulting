import type { FreeItinerary } from "@/lib/types";
import styles from "../plan.module.css";
import { draftCopy } from "../copy";
import { tipLabel, type Lang } from "../../../content";

/**
 * 맛보기 팁 하나 — **이 화면에서 제일 중요한 부분이다** (예전 결과 화면 설명 그대로).
 *
 * 랜딩의 "초안은 이렇게 생겼습니다" 패널과 같은 표시를 쓴다: 빨간 중괄호, 빨간 '현지 팁' 딱지, 빨간 한 줄.
 * 피하실 것(pitfall)에는 줄을 긋지 않는다 — AI 가 '틀린 계획'이 아니라 '맞는 경고'로 적어 오는 경우가 많아서
 * ("화요일은 휴관이라는 점을 놓치기 쉽습니다"), 줄을 그으면 맞는 말을 틀렸다고 보여 주게 된다.
 *
 * `place` 를 주면 어느 장소 이야기인지 맨 위에 적는다 — 걸릴 날을 못 찾아 맨 아래로 간 팁에만 쓴다.
 */
export default function LocalTip({
  tip,
  lang,
  place,
  className = "",
}: {
  tip: FreeItinerary["sampleTip"];
  lang: Lang;
  place?: string;
  className?: string;
}) {
  return (
    <aside className={`${styles.tip} ${className}`} aria-label={`${tipLabel[lang]}${place ? ` · ${place}` : ""}`}>
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
      {place && <p className={styles.tipPlace}>{place}</p>}
      <p className={styles.badge}>{tipLabel[lang]}</p>
      <p className={styles.tipLine}>{tip.highlight}</p>
      <p className={styles.tipText}>
        <b>{draftCopy.avoid[lang]}:</b> {tip.pitfall}
      </p>
      <p className={styles.tipText}>
        <b>{draftCopy.insider[lang]}:</b> {tip.insiderSecret}
      </p>
    </aside>
  );
}
