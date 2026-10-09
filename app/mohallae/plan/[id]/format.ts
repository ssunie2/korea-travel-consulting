import { DESTINATIONS } from "@/lib/places";
import type { Lang } from "../../content";

/**
 * 날짜와 여행지 이름을 **고른 언어로** 만든다.
 *
 * `lib/date.ts`, `lib/places.ts` 와 같은 계산이다. 그쪽은 사이트 전체 언어(LANG) 하나만 따르는데,
 * 새 화면은 주소 끝의 `?lang=` 으로 언어를 바꿀 수 있어서 언어를 직접 받는다.
 * `lib/` 는 공용 파일이라 이번에는 고치지 않았다 (이슈 #86 범위). 나중에 lib 함수가 언어를 받게 되면
 * 이 파일은 지우고 그쪽을 쓴다.
 *
 * lib/date.ts 와 똑같이 **UTC 로만 센다** — 현지 시간대로 세면 접속한 나라에 따라 하루가 밀린다.
 */

const KO_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 출발일에서 며칠째가 실제로 언제인지 */
function dateOf(startDate: string, dayNumber: number) {
  const d = new Date(`${startDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dayNumber - 1);
  return d;
}

const monthDay = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** "10월 14일 (수)" / "Wed, Oct 14". 요일이 있어야 일요일 휴무 같은 걸 피한다 (lib/date.ts 설명). */
export function dayDate(lang: Lang, startDate: string, dayNumber: number) {
  const d = dateOf(startDate, dayNumber);
  return lang === "ko"
    ? `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${KO_WEEKDAYS[d.getUTCDay()]})`
    : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

/**
 * 여행 전체 기간. 같은 달이면 달을 한 번만 쓴다 — "Oct 14 – 16, 2026" (시안 ③ 그대로).
 * 달이나 해가 바뀌면 그만큼 다시 적는다.
 */
export function tripDates(lang: Lang, startDate: string, days: number) {
  const s = dateOf(startDate, 1);
  const e = dateOf(startDate, days);
  const sameYear = s.getUTCFullYear() === e.getUTCFullYear();
  const sameMonth = sameYear && s.getUTCMonth() === e.getUTCMonth();

  if (lang === "ko") {
    const start = `${s.getUTCFullYear()}년 ${s.getUTCMonth() + 1}월 ${s.getUTCDate()}일`;
    if (days <= 1) return start;
    const end = sameMonth
      ? `${e.getUTCDate()}일`
      : `${sameYear ? "" : `${e.getUTCFullYear()}년 `}${e.getUTCMonth() + 1}월 ${e.getUTCDate()}일`;
    return `${start} – ${end}`;
  }

  if (days <= 1) return `${monthDay(s)}, ${s.getUTCFullYear()}`;
  if (sameMonth) return `${monthDay(s)} – ${e.getUTCDate()}, ${s.getUTCFullYear()}`;
  if (sameYear) return `${monthDay(s)} – ${monthDay(e)}, ${s.getUTCFullYear()}`;
  return `${monthDay(s)}, ${s.getUTCFullYear()} – ${monthDay(e)}, ${e.getUTCFullYear()}`;
}

/** 저장된 여행지 값(영어)을 고른 언어의 이름으로. 목록에 없으면 적힌 그대로. */
export function placeName(lang: Lang, value: string) {
  const hit = DESTINATIONS.find((d) => d.v === value);
  return hit ? (lang === "ko" ? hit.ko : hit.v) : value;
}
