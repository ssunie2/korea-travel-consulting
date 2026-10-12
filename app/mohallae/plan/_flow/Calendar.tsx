"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { localToday, nights, type Lang } from "../flow";
import { flowCopy as c } from "./copy";
import s from "./calendar.module.css";

/**
 * 날짜 화면의 달력 — 이 흐름 전용.
 *
 * 공용 DateRangePicker(components/)는 한국어로 고정돼 있어서(LANG) 영어 손님에게도 '가는 날'·'2026-10-22'가 보였다.
 * 공용 파일은 옛 폼도 쓰므로 고치지 않고(이슈 #86 범위), 여기 새로 만들었다. 고르는 규칙은 공용 것과 같다:
 * - 지나간 날은 못 고른다 · 최대 29박(30일)
 * - 가는 날을 고르면 곧바로 오는 날 차례 · 오는 날을 가는 날보다 앞에 누르면 그 날이 새 가는 날
 * 다른 점: 한 화면에 질문 하나라 달력을 접지 않는다. 다 고른 뒤 다른 날을 누르면 처음부터 다시 고른다.
 * 키보드: 화살표로 하루·한 주, PageUp/PageDown 으로 한 달, Home/End 로 주의 처음·끝.
 */

const MAX_NIGHTS = 29;

type Picking = "start" | "end" | "again";

const WEEK = {
  ko: ["일", "월", "화", "수", "목", "금", "토"],
  en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
};
const WEEK_LONG = {
  ko: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};
const WEEK_SHORT_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* 날짜는 'YYYY-MM-DD' 글자로만 다룬다. 시간대에 따라 하루가 밀리지 않게 계산은 UTC 로 */
const toDate = (key: string) => new Date(`${key}T00:00:00Z`);
const keyOf = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const weekday = (key: string) => toDate(key).getUTCDay();
const ym = (key: string) => ({ y: Number(key.slice(0, 4)), m: Number(key.slice(5, 7)) - 1 });
const monthsApart = (a: { y: number; m: number }, b: { y: number; m: number }) => (b.y - a.y) * 12 + (b.m - a.m);
const shiftMonth = ({ y, m }: { y: number; m: number }, by: number) => ({ y: y + Math.floor((m + by) / 12), m: (((m + by) % 12) + 12) % 12 });

function addDays(key: string, n: number) {
  const d = toDate(key);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function addMonths(key: string, n: number) {
  const { y, m } = shiftMonth(ym(key), n);
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return keyOf(y, m, Math.min(Number(key.slice(8)), last));
}

/** 화면 낭독기가 읽는 날짜: "2026년 10월 22일 목요일" / "Thursday, October 22, 2026" */
function longDate(key: string, lang: Lang) {
  const { y, m } = ym(key);
  const d = Number(key.slice(8));
  const w = WEEK_LONG[lang][weekday(key)];
  return lang === "ko" ? `${y}년 ${m + 1}월 ${d}일 ${w}` : `${w}, ${MONTHS[m]} ${d}, ${y}`;
}

/** 칸에 보이는 날짜: "10월 22일 (목)" / "Thu, Oct 22" */
export function shortDate(key: string, lang: Lang) {
  const { m } = ym(key);
  const d = Number(key.slice(8));
  return lang === "ko" ? `${m + 1}월 ${d}일 (${WEEK.ko[weekday(key)]})` : `${WEEK_SHORT_EN[weekday(key)]}, ${MONTHS[m].slice(0, 3)} ${d}`;
}

export default function Calendar({ start, end, lang, onChange }: {
  start: string;
  end: string;
  lang: Lang;
  onChange: (start: string, end: string) => void;
}) {
  const t = (x: { ko: string; en: string }) => x[lang];
  const today = localToday();
  const [picking, setPicking] = useState<Picking>(start && end ? "again" : start ? "end" : "start");
  const [cursor, setCursor] = useState(() => ym(start || today));
  const [focusKey, setFocusKey] = useState(start || today);
  const moved = useRef(false);
  const board = useRef<HTMLDivElement>(null);

  // 키보드로 옮겼을 때만 그 날로 초점을 옮긴다 (누를 때마다 초점이 튀면 안 된다)
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    board.current?.querySelector<HTMLButtonElement>(`[data-day="${focusKey}"]`)?.focus();
  }, [focusKey, cursor]);

  const thisMonth = ym(today);

  function pick(day: string) {
    if (day < today) return;
    setFocusKey(day);
    if (picking === "again" || !start) {
      onChange(day, "");
      setPicking("end");
      return;
    }
    if (picking === "start") {
      // 가는 날만 고치는 중: 오는 날이 여전히 말이 되면 그대로 둔다
      const keep = end && day < end && nights(day, end) <= MAX_NIGHTS ? end : "";
      onChange(day, keep);
      setPicking(keep ? "again" : "end");
      return;
    }
    if (day <= start || nights(start, day) > MAX_NIGHTS) {
      onChange(day, "");
      setPicking("end");
      return;
    }
    onChange(start, day);
    setPicking("again");
  }

  function show(by: number) {
    const next = shiftMonth(cursor, by);
    if (monthsApart(thisMonth, next) < 0) return;
    setCursor(next);
    const first = keyOf(next.y, next.m, 1);
    setFocusKey(first < today ? today : first);
  }

  /** 둘째 달은 칸이 넓을 때만 보인다 (CSS). 보이는지는 그려진 뒤에야 안다 */
  const secondVisible = () => !!board.current?.querySelector('[data-month="1"]')?.getClientRects().length;

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const from = (e.target as HTMLElement).dataset.day;
    if (!from) return;
    const by: Record<string, () => string> = {
      ArrowLeft: () => addDays(from, -1),
      ArrowRight: () => addDays(from, 1),
      ArrowUp: () => addDays(from, -7),
      ArrowDown: () => addDays(from, 7),
      Home: () => addDays(from, -weekday(from)),
      End: () => addDays(from, 6 - weekday(from)),
      PageUp: () => addMonths(from, -1),
      PageDown: () => addMonths(from, 1),
    };
    if (!by[e.key]) return;
    e.preventDefault();
    let next = by[e.key]();
    if (next < today) next = today;
    const apart = monthsApart(cursor, ym(next));
    const shown = secondVisible() ? 2 : 1;
    if (apart < 0) setCursor(ym(next));
    else if (apart >= shown) setCursor(shiftMonth(ym(next), -(shown - 1)));
    moved.current = true;
    setFocusKey(next);
  }

  const status = !start || picking === "start"
    ? t(c.calendar.pickArrive)
    : picking === "end" || !end ? t(c.calendar.pickLeave) : c.calendar.chosen[lang](nights(start, end));

  // Tab 으로 들어왔을 때 초점 받을 날 하나 (나머지는 화살표로) — 보이는 두 달 밖이면 첫 달의 첫 고를 수 있는 날
  const apart = monthsApart(cursor, ym(focusKey));
  const firstOfCursor = keyOf(cursor.y, cursor.m, 1);
  const tabKey = apart === 0 || apart === 1 ? focusKey : firstOfCursor < today ? today : firstOfCursor;

  const field = (which: "start" | "end") => {
    const value = which === "start" ? start : end;
    const active = which === "start" ? !start || picking === "start" : !!start && picking === "end";
    return (
      <button
        type="button"
        className={s.field}
        aria-pressed={active}
        onClick={() => setPicking(which === "end" && !start ? "start" : which)}
      >
        <span className={s.fieldLabel}>{t(which === "start" ? c.calendar.arrive : c.calendar.leave)}</span>
        <span className={`${s.fieldValue} ${value ? "" : s.fieldEmpty}`}>{value ? shortDate(value, lang) : t(c.calendar.pickDate)}</span>
      </button>
    );
  };

  return (
    <div className={s.calendar}>
      <div className={s.fields}>
        {field("start")}
        {field("end")}
      </div>
      <p className={s.status} aria-live="polite">{status}</p>

      <div className={s.board} ref={board} onKeyDown={onKey}>
        <button type="button" className={`${s.navBtn} ${s.prev}`} onClick={() => show(-1)}
          disabled={monthsApart(thisMonth, cursor) <= 0} aria-label={t(c.calendar.prev)}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5L5.5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button type="button" className={`${s.navBtn} ${s.next}`} onClick={() => show(1)} aria-label={t(c.calendar.next)}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className={s.months}>
          {[0, 1].map((i) => {
            const { y, m } = shiftMonth(cursor, i);
            return (
              <Month key={`${y}-${m}`} index={i} y={y} m={m} lang={lang} today={today}
                start={start} end={end} tabKey={tabKey} onPick={pick} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Month({ index, y, m, lang, today, start, end, tabKey, onPick }: {
  index: number; y: number; m: number; lang: Lang; today: string;
  start: string; end: string; tabKey: string; onPick: (day: string) => void;
}) {
  const lead = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const title = lang === "ko" ? `${y}년 ${m + 1}월` : `${MONTHS[m]} ${y}`;
  const id = `cal-${y}-${m}`;

  return (
    <div className={s.month} data-month={index}>
      <p className={s.monthTitle} id={id}>{title}</p>
      <div className={s.weekdays} aria-hidden="true">
        {WEEK[lang].map((w, i) => <span key={i}>{w}</span>)}
      </div>
      <div className={s.days} role="group" aria-labelledby={id}>
        {Array.from({ length: lead }, (_, i) => <span key={`pad-${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const k = keyOf(y, m, i + 1);
          const past = k < today;
          const isStart = k === start;
          const isEnd = k === end;
          const range = !!start && !!end;
          const cls = [
            s.day,
            range && k > start && k < end ? s.between : "",
            range && isStart ? s.rangeStart : "",
            range && isEnd ? s.rangeEnd : "",
            isStart || isEnd ? s.picked : "",
            k === today ? s.today : "",
          ].join(" ");
          const mark = isStart ? ` — ${c.calendar.arrive[lang]}` : isEnd ? ` — ${c.calendar.leave[lang]}` : "";
          return (
            <button
              key={k}
              type="button"
              data-day={k}
              className={cls}
              disabled={past}
              tabIndex={k === tabKey ? 0 : -1}
              aria-label={`${longDate(k, lang)}${mark}`}
              aria-pressed={isStart || isEnd}
              onClick={() => onPick(k)}
            >
              <span>{i + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
