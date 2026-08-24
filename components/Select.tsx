"use client";

import { useEffect, useId, useRef, useState } from "react";
import { t } from "@/lib/copy";

/**
 * 하나를 고르는 상자.
 *
 * 브라우저가 기본으로 주는 `<select>` 를 안 쓴다. **그 목록은 운영체제가 그리기 때문에**
 * 우리 색·글꼴·모서리가 하나도 적용되지 않는다 — 어두운 화면에 갑자기 흰 상자와
 * 파란 형광 줄이 뜬다. 손님이 제일 많이 만지는 폼이라 거기만 남의 화면처럼 보이면 안 된다.
 *
 * 대신 직접 그리면 **브라우저가 공짜로 해주던 것들을 우리가 해야 한다.** 그래서:
 * - 화면 낭독기가 "목록 상자" 로 읽도록 role 을 붙였다 (button + listbox + option)
 * - 위/아래 화살표, Enter, Esc, Home/End 로 키보드만으로 고를 수 있다
 * - 밖을 누르면 닫힌다
 * - 폼은 FormData 로 값을 읽으므로 **숨은 input** 에 고른 값을 담아 둔다
 */
export type Option = { value: string; label: string };

/** 목록 안에서 '기타' 를 가리키는 값. 화면에만 쓰고 서버로는 안 나간다 */
const OTHER = "__other__";

export default function Select({
  name,
  label,
  allowOther = false,
  options,
  defaultValue = "",
  placeholder,
  className = "",
}: {
  name: string;
  /**
   * 보기에 없는 답을 직접 적게 할지. 켜면 목록 맨 아래에 '기타' 가 붙고,
   * 그것을 고르면 적는 칸이 나온다. 적은 글이 그대로 답이 된다 —
   * 코드값('__other__')이 서버로 나가면 AI 가 그 말을 이해하지 못한다.
   */
  allowOther?: boolean;
  /**
   * 칸 위에 붙는 제목. **부품이 직접 그린다.**
   * 밖에서 `<label>` 로 감싸면 제목 글자를 눌렀을 때 label 이 버튼을 한 번 더 눌러
   * 목록이 열렸다 바로 닫힌다. 그래서 제목도 여기서 그리고 aria 로 이어 붙인다.
   */
  label?: string;
  options: Option[];
  defaultValue?: string;
  /** 아무것도 안 골랐을 때 보이는 글. 이것도 고를 수 있는 항목이 된다 */
  placeholder: string;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [otherText, setOtherText] = useState("");
  const [open, setOpen] = useState(false);
  // 키보드로 훑고 있는 자리. 고른 것(value)과 다르다 — 아직 정하지 않았을 뿐이다.
  const [cursor, setCursor] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const labelId = useId();

  /**
   * 목록에 올릴 것들.
   *
   * **기본값이 정해진 칸에는 '안 고름' 줄을 만들지 않는다.** 언어처럼 처음부터
   * English 가 골라져 있는 칸에 그 줄을 넣으면 English 가 두 번 나온다 —
   * 위는 "아직 안 골랐다" 는 뜻이고 아래는 실제 보기라 뜻은 다르지만, 손님에게는
   * 같은 글자가 두 줄 보일 뿐이다. 기본값이 있다는 건 답이 늘 있다는 뜻이므로
   * 안 고른 상태가 아예 없다.
   */
  const all: Option[] = [
    ...(defaultValue ? [] : [{ value: "", label: placeholder }]),
    ...options,
    ...(allowOther ? [{ value: OTHER, label: t({ ko: "기타", en: "Other" }) }] : []),
  ];
  const current = all.find((o) => o.value === value) ?? all[0];
  // 서버로 나가는 값. '기타' 를 골랐으면 적은 글이 답이다.
  const submitted = value === OTHER ? otherText.trim() : value;

  // 밖을 누르면 닫는다. 안 하면 목록이 켜진 채로 남아 다른 칸을 가린다.
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  function choose(v: string) {
    setValue(v);
    setOpen(false);
  }

  function onKey(e: React.KeyboardEvent) {
    if (!open) {
      // 닫혀 있을 때 아래 화살표나 Enter 를 누르면 연다. 기본 select 와 같은 감각이다.
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setCursor(Math.max(0, all.findIndex((o) => o.value === value)));
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(all.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setCursor(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setCursor(all.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(all[cursor].value);
    }
  }

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      {label && (
        <span
          id={labelId}
          className="mb-2 block font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[var(--c-text-3)]"
        >
          {label}
        </span>
      )}
      {/* 폼이 FormData 로 읽는 값. 화면에는 안 보인다 */}
      <input type="hidden" name={name} value={submitted} />

      <button
        type="button"
        role="combobox"
        aria-labelledby={label ? `${labelId} ${listId}-value` : undefined}
        aria-controls={listId}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          setCursor(Math.max(0, all.findIndex((o) => o.value === value)));
          setOpen((v) => !v);
        }}
        onKeyDown={onKey}
        className={`flex min-h-[3.25rem] w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)] ${
          open ? "border-[var(--c-text-3)]" : "border-[var(--c-line)]"
        } bg-[var(--c-surface)] ${value ? "text-[var(--c-text)]" : "text-[var(--c-text-3)]"}`}
      >
        <span id={`${listId}-value`} className="truncate">{current.label}</span>
        {/* 열리면 화살표가 돈다. 지금 열려 있다는 걸 글자 없이 알린다 */}
        <span
          aria-hidden
          className={`ml-3 flex-none text-[var(--c-text-3)] transition-transform ${open ? "rotate-180" : ""}`}
        >
          ⌄
        </span>
      </button>

      {value === OTHER && (
        <label className="mt-2 block">
          <span className="sr-only">{label ?? placeholder}</span>
          <input
            type="text"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            maxLength={40}
            autoFocus
            placeholder={t({ ko: "직접 적어주세요", en: "Type your answer" })}
            className="min-h-[3.25rem] w-full rounded-2xl border border-[var(--c-line)] bg-[var(--c-surface)] px-4 py-3 text-[var(--c-text)] placeholder:text-[var(--c-text-3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)]"
          />
        </label>
      )}

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={placeholder}
          tabIndex={-1}
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-[var(--c-line)] bg-[var(--c-surface-2)] p-1.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)]"
        >
          {all.map((o, i) => {
            const picked = o.value === value;
            const hovered = i === cursor;
            return (
              <li key={o.value || "__none__"} role="option" aria-selected={picked}>
                <button
                  type="button"
                  onClick={() => choose(o.value)}
                  onMouseEnter={() => setCursor(i)}
                  className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm transition-colors ${
                    hovered ? "bg-[var(--c-surface)]" : ""
                  } ${picked ? "text-[var(--c-accent)]" : o.value ? "text-[var(--c-text)]" : "text-[var(--c-text-3)]"}`}
                >
                  <span className="truncate">{o.label}</span>
                  {picked && <span aria-hidden className="ml-3 flex-none">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
