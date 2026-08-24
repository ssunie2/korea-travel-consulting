"use client";

import { useState } from "react";
import { t } from "@/lib/copy";

/**
 * 가는 날·오는 날을 달력에서 고른다.
 *
 * 전에는 `출발일` 과 `기간(일)` 두 칸이었다. 손님은 **달력을 보고 날짜를 고르지**
 * 며칠짜리인지를 먼저 세지 않는다. 숙소 예약 사이트가 전부 이 방식인 이유다.
 *
 * 라이브러리를 쓰지 않았다. 날짜 고르는 화면은 손님이 제일 많이 만지는 곳이라
 * 남의 코드에 맡기면 색·글자·말투를 우리 것에 맞추기가 더 번거롭다.
 *
 * **PC 는 두 달, 폰은 한 달**을 보여준다. 폰에서 두 달을 넣으면 칸이 좁아져
 * 숫자를 누르기 어렵다.
 */

/** 그 달 1일이 무슨 요일인지, 며칠까지 있는지 */
function monthInfo(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return { startWeekday: first.getUTCDay(), days };
}

/** 'YYYY-MM-DD'. 시간대에 따라 하루가 밀리지 않도록 UTC 로만 계산한다 */
function key(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** 두 날짜 사이의 밤 수 */
export function nightsBetween(from: string, to: string) {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86400000);
}

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];
const WEEKDAYS_EN = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * 한 달치 달력. **바깥으로 빼 둔 이유가 있다** — 그리는 중에 만들면
 * 다시 그릴 때마다 새 부품으로 취급돼 눌러 둔 상태가 사라진다.
 */
function Month({
  year,
  month,
  start,
  end,
  todayKey,
  onPick,
}: {
  year: number;
  month: number;
  start: string | null;
  end: string | null;
  todayKey: string;
  onPick: (dayKey: string) => void;
}) {
  const { startWeekday, days } = monthInfo(year, month);
  return (
    <div className="flex-1">
      <p className="mb-3 text-center text-sm font-semibold text-[var(--c-text)]">
        {t({ ko: `${year}년 ${month + 1}월`, en: `${year}. ${month + 1}` })}
      </p>
      <div className="grid grid-cols-7 gap-y-1">
        {(t({ ko: WEEKDAYS_KO, en: WEEKDAYS_EN }) as string[]).map((w, i) => (
          <span key={i} className="pb-1 text-center text-[0.7rem] text-[var(--c-text-3)]">
            {w}
          </span>
        ))}
        {/* 1일이 시작하는 요일까지 빈칸을 깐다 */}
        {Array.from({ length: startWeekday }, (_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const day = i + 1;
          const k = key(year, month, day);
          const past = k < todayKey;
          const isStart = k === start;
          const isEnd = k === end;
          const between = !!start && !!end && k > start && k < end;
          return (
            <button
              key={k}
              type="button"
              disabled={past}
              onClick={() => onPick(k)}
              aria-label={k}
              aria-pressed={isStart || isEnd}
              className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)] ${
                past
                  ? "cursor-not-allowed text-[var(--c-text-4)] line-through opacity-40"
                  : isStart || isEnd
                    ? "bg-[var(--c-accent)] font-semibold text-white"
                    : between
                      ? "bg-[var(--c-surface-2)] text-[var(--c-text)]"
                      : "text-[var(--c-text)] hover:bg-[var(--c-surface-2)]"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePicker({
  start,
  end,
  onChange,
  maxNights = 29,
}: {
  start: string | null;
  end: string | null;
  onChange: (next: { start: string | null; end: string | null }) => void;
  /** 일정은 최대 30일까지 만든다. 30일 = 29박 */
  maxNights?: number;
}) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const [open, setOpen] = useState(false);
  /**
   * 지금 어느 칸을 고르는 중인지. **이게 없으면 눌러도 아무 표시가 없어서**
   * 손님이 "안 눌렸나" 하고 몇 번씩 누르게 된다 (선경이 실제로 겪었다).
   * 누른 칸에 테두리를 둘러 지금 이 칸을 고르는 중임을 보여준다.
   */
  const [picking, setPicking] = useState<"start" | "end">("start");
  // 왼쪽에 보이는 달. 고른 날이 있으면 그 달부터 연다.
  const [cursor, setCursor] = useState(() => {
    const base = start ? new Date(`${start}T00:00:00Z`) : new Date();
    return { year: base.getUTCFullYear(), month: base.getUTCMonth() };
  });

  const nights = start && end ? nightsBetween(start, end) : null;

  function pick(dayKey: string) {
    // 지나간 날은 못 고른다
    if (dayKey < todayKey) return;

    // '가는 날' 을 고르는 중 → 가는 날을 놓고 곧바로 '오는 날' 차례로 넘긴다.
    // 넘겨 주지 않으면 손님이 오는 날 칸을 따로 눌러야 하는데, 그걸 모른다.
    if (picking === "start") {
      // 이미 있던 오는 날보다 뒤를 고르면 그 오는 날은 말이 안 되므로 비운다
      const keepEnd = end && dayKey < end && nightsBetween(dayKey, end) <= maxNights ? end : null;
      onChange({ start: dayKey, end: keepEnd });
      setPicking("end");
      return;
    }

    // '오는 날' 을 고르는 중인데 가는 날보다 앞이면, 그것을 새 가는 날로 본다.
    // "잘못 골랐다" 고 막는 것보다 자연스럽다.
    if (!start || dayKey <= start || nightsBetween(start, dayKey) > maxNights) {
      onChange({ start: dayKey, end: null });
      setPicking("end");
      return;
    }

    onChange({ start, end: dayKey });
    setOpen(false);
  }

  function shift(by: number) {
    setCursor((c) => {
      const m = c.month + by;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }

  /**
   * 두 칸의 생김새. **지금 고르는 중인 칸은 주황 테두리를 두 겹으로 둘러 눈에 띄게 한다.**
   * 값이 들어간 칸은 테두리만 밝게, 아직 빈 칸은 흐리게.
   */
  const summary = (mine: "start" | "end", filled: boolean) => {
    const active = open && picking === mine;
    return [
      "flex-1 rounded-2xl border px-4 py-3 text-left transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)]",
      active
        ? "border-[var(--c-accent)] ring-2 ring-[var(--c-accent)]/35 bg-[var(--c-surface-2)]"
        : filled
          ? "border-[var(--c-text-3)] bg-[var(--c-surface)]"
          : "border-[var(--c-line)] bg-[var(--c-surface)]",
    ].join(" ");
  };

  return (
    <div>
      {/* 고른 날짜 두 칸. 누르면 달력이 열린다 */}
      <div className="flex gap-3">
        <button
          type="button"
          aria-pressed={open && picking === "start"}
          onClick={() => { setPicking("start"); setOpen(true); }}
          className={summary("start", !!start)}
        >
          <span className="block text-[0.7rem] text-[var(--c-text-3)]">{t({ ko: "가는 날", en: "Check-in" })}</span>
          <span className="block text-[var(--c-text)]">{start ?? t({ ko: "날짜 선택", en: "Pick a date" })}</span>
        </button>
        <button
          type="button"
          aria-pressed={open && picking === "end"}
          onClick={() => { setPicking("end"); setOpen(true); }}
          className={summary("end", !!end)}
        >
          <span className="block text-[0.7rem] text-[var(--c-text-3)]">{t({ ko: "오는 날", en: "Check-out" })}</span>
          <span className="block text-[var(--c-text)]">{end ?? t({ ko: "날짜 선택", en: "Pick a date" })}</span>
        </button>
      </div>

      {/* 며칠짜리인지. 손님이 스스로 세지 않아도 되게 */}
      <p aria-live="polite" className="mt-2 text-sm text-[var(--c-text-2)]">
        {nights !== null
          ? t({ ko: `${nights}박 ${nights + 1}일`, en: `${nights} ${nights === 1 ? "night" : "nights"}` })
          : t({ ko: "가는 날과 오는 날을 골라주세요", en: "Pick your dates" })}
      </p>

      {open && (
        <div className="mt-3 rounded-2xl border border-[var(--c-line)] bg-[var(--c-surface)] p-4 sm:p-5">
          {/* 지금 무엇을 고르는 중인지 글로도 알린다. 테두리만으로는 못 보는 사람이 있다 */}
          <p aria-live="polite" className="mb-1 text-center text-sm text-[var(--c-accent)]">
            {picking === "start"
              ? t({ ko: "가는 날을 고르세요", en: "Pick your check-in date" })
              : t({ ko: "오는 날을 고르세요", en: "Pick your check-out date" })}
          </p>
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shift(-1)}
              aria-label={t({ ko: "이전 달", en: "Previous month" })}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--c-text)] hover:bg-[var(--c-surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)]"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => shift(1)}
              aria-label={t({ ko: "다음 달", en: "Next month" })}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--c-text)] hover:bg-[var(--c-surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)]"
            >
              ›
            </button>
          </div>

          <div className="flex gap-8">
            <Month year={cursor.year} month={cursor.month} start={start} end={end} todayKey={todayKey} onPick={pick} />
            {/* 둘째 달은 PC 에서만. 폰에서는 칸이 좁아져 누르기 어렵다 */}
            <div className="hidden flex-1 md:block">
              <Month
                year={cursor.month === 11 ? cursor.year + 1 : cursor.year}
                month={(cursor.month + 1) % 12}
                start={start}
                end={end}
                todayKey={todayKey}
                onPick={pick}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[var(--c-line-2)] pt-3">
            <button
              type="button"
              onClick={() => { onChange({ start: null, end: null }); setPicking("start"); }}
              className="min-h-11 px-2 text-sm text-[var(--c-text-3)] underline underline-offset-4 hover:text-[var(--c-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)]"
            >
              {t({ ko: "날짜 지우기", en: "Clear dates" })}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-11 rounded-full bg-[var(--c-text)] px-6 text-sm font-semibold text-[var(--c-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)]"
            >
              {t({ ko: "닫기", en: "Close" })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
