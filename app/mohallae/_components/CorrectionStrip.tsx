import styles from "../mohallae.module.css";
import { commonPlan, corrections, tipLabel, type Lang } from "../content";

/**
 * 고쳐 쓰기 띠 — 이 화면의 서명 장면 (시안 ②).
 *
 * 흔한 계획 한 줄(회색)에 빨간 줄이 왼쪽에서 오른쪽으로 그어지고 → 화살표 → 현지 팁이 덮어쓴다.
 * 팁 4개가 차례로 돈다. 움직임은 전부 CSS(mohallae.module.css 의 strip-*)에 있다.
 *
 * - 넷을 같은 칸에 겹쳐 둔다. 그래야 띠 높이가 제일 긴 팁에 맞춰 고정되고, 팁이 바뀔 때
 *   아래 버튼이 들썩이지 않는다.
 * - 띠에 마우스를 올리거나 탭·터치로 초점을 주면 멈춘다.
 * - 화면 낭독기는 돌아가는 띠 대신 숨긴 목록으로 넷을 다 읽는다.
 */
export default function CorrectionStrip({ lang }: { lang: Lang }) {
  return (
    <div
      className={styles.strip}
      tabIndex={0}
      role="group"
      aria-label={lang === "ko" ? "흔한 계획을 현지인이 고쳐 쓴 예" : "Common plans, corrected by a local"}
    >
      <div className={styles.stripTrack} aria-hidden="true">
        {corrections.map((c, i) => (
          <div key={i} className={styles.stripItem} style={{ ["--i" as string]: i }}>
            <p className={styles.stripPlan}>
              <span className={styles.struck}>{c.plan[lang]}</span>
            </p>
            <svg className={styles.stripArrow} viewBox="0 0 26 18" aria-hidden="true">
              <path
                d="M1.5 9h21M15 2l7.5 7-7.5 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className={styles.stripTipBox}>
              <p className={styles.tipLabel}>{tipLabel[lang]}</p>
              <p className={styles.stripTip}>{c.tip[lang]}</p>
            </div>
          </div>
        ))}
      </div>
      <ul className="sr-only">
        {corrections.map((c, i) => (
          <li key={i}>
            {c.place[lang]}. {commonPlan[lang]}: {c.plan[lang]} {tipLabel[lang]}: {c.tip[lang]}
          </li>
        ))}
      </ul>
    </div>
  );
}
