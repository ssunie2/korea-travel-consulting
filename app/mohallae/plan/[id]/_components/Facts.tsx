import styles from "../plan.module.css";
import type { Lang } from "../../../content";

/**
 * 작은 회색 이름표 + 굵은 값, 사이에 가는 세로줄 (아래 띠의 숙소·식당·예산 모양).
 * 써니 요청 (2026-10-11): 여행 날짜·인원·여행지도 제목 위에 붙여 쓰지 말고 이 모양으로 따로 보여 준다.
 * 영어 이름표에는 시안처럼 쌍점을 붙이고, 한국어에는 붙이지 않는다.
 */
export default function Facts({
  items,
  lang,
  className = "",
}: {
  items: { label: string; value: string }[];
  lang: Lang;
  className?: string;
}) {
  return (
    <dl className={`${styles.facts} ${className}`}>
      {items.map((f) => (
        <div key={f.label} className={styles.fact}>
          <dt className={styles.factLabel}>
            {f.label}
            {lang === "en" && ":"}
          </dt>
          <dd className={styles.factValue}>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
