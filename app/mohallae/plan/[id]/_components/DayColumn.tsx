import type { FreeItinerary } from "@/lib/types";
import styles from "../plan.module.css";
import { draftCopy } from "../copy";
import { dayDate } from "../format";
import type { Lang } from "../../../content";
import LocalTip from "./LocalTip";
import LockedTip from "./LockedTip";
import TipReveal from "./TipReveal";
import { keepNumberWithWord } from "../format";

type Day = FreeItinerary["days"][number];

/**
 * 하루 한 기둥 (시안 ③). 위에서부터 날짜, 그날의 주제, 정거장 셋.
 *
 * - 도시는 **도시를 도는 여행에서만** 적는다 (`showCity`). 서울만 가는 여행에 매일 "서울"을 찍으면
 *   읽을 게 하나 늘 뿐이다 — 예전 결과 화면과 같은 규칙.
 * - 이동 시간(`travel`)은 그 정거장까지 오는 길이라, **앞 정거장 아래**에 적어 두 점 사이에 오게 한다.
 *   그날 첫 정거장에는 없다(앞이 없다). 옛 초안에는 아예 없어서 있을 때만 그린다.
 * - 팁(`tipAt`)은 이름이 같은 정거장 바로 아래 붙인다. 이름이 안 맞으면 그날 마지막 정거장 아래.
 * - 팁이 없는 날(`locked`)은 기둥 맨 아래에 가려 둔 팁 자리를 둔다 (LockedTip 설명 참고).
 */
export default function DayColumn({
  day,
  startDate,
  showCity,
  lang,
  tip,
  locked = false,
}: {
  day: Day;
  startDate: string;
  showCity: boolean;
  lang: Lang;
  tip?: FreeItinerary["sampleTip"];
  locked?: boolean;
}) {
  const acts = day.activities;
  const named = tip ? acts.findIndex((a) => a.name === tip.activityName) : -1;
  const tipAt = tip ? (named >= 0 ? named : acts.length - 1) : -1;

  return (
    <li className={styles.day}>
      <h2 className={styles.dayHeading}>
        <span className={styles.dayLabel}>
          <b>{draftCopy.dayNumber[lang](day.dayNumber)}</b>
          <span aria-hidden="true" className={styles.sep}>
            ·
          </span>
          <span className="sr-only">, </span>
          {dayDate(lang, startDate, day.dayNumber)}
          {showCity && day.city && (
            <>
              <span aria-hidden="true" className={styles.sep}>
                ·
              </span>
              <span className="sr-only">, </span>
              {day.city}
            </>
          )}
        </span>
        <span className={styles.dayTheme}>{keepNumberWithWord(day.theme)}</span>
      </h2>

      <ol className={styles.stops}>
        {acts.map((a, i) => {
          const next = acts[i + 1];
          return (
            <li key={i} className={styles.stop}>
              <p className={styles.time}>{a.time}</p>
              <h3 className={styles.name}>{a.name}</h3>
              {a.note && <p className={styles.note}>{a.note}</p>}
              {tip && i === tipAt && (
                // 처음엔 비어 있다가 스크롤로 이 자리에 오면 써지듯 나타난다 (써니 요청)
                <TipReveal>
                  <LocalTip tip={tip} lang={lang} className={styles.tipReveal} />
                </TipReveal>
              )}
              {next?.travel && (
                <p className={styles.travel}>
                  <span className="sr-only">{draftCopy.toNext[lang]}</span>
                  {next.travel}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {locked && !tip && acts.length > 0 && (
        <TipReveal>
          <LockedTip seed={day.dayNumber} lang={lang} className={`${styles.tipReveal} ${styles.lockedSpot}`} />
        </TipReveal>
      )}
    </li>
  );
}
