"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { t } from "@/lib/copy";

// 표제용 서체. 랜딩·결과 화면과 같은 방식으로 이 화면에서만 불러온다.
const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

/** 값은 영어로 보낸다 — AI 가 읽는 건 이 값이다. 화면에 보이는 이름만 언어를 따른다. */
const DESTINATIONS = [
  { v: "Seoul", ko: "서울" }, { v: "Busan", ko: "부산" }, { v: "Jeju", ko: "제주" },
  { v: "Gyeongju", ko: "경주" }, { v: "Jeonju", ko: "전주" }, { v: "Gangneung", ko: "강릉" },
  { v: "Andong", ko: "안동" }, { v: "Sokcho", ko: "속초" },
];
const STYLES = [
  { v: "Food", ko: "먹거리" }, { v: "Culture & history", ko: "문화·역사" },
  { v: "Nature & hiking", ko: "자연·등산" }, { v: "Shopping", ko: "쇼핑" },
  { v: "Nightlife", ko: "밤 문화" }, { v: "Photo spots", ko: "사진 명소" },
];
const AUDIENCES = [
  { v: "Solo", ko: "혼자" }, { v: "Couple", ko: "커플" }, { v: "Friends", ko: "친구" },
  { v: "Family with kids", ko: "아이와 함께" }, { v: "With parents", ko: "부모님과" },
];
const CURRENCIES = ["KRW", "USD", "EUR", "JPY"];
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ko", label: "한국어" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

const label = "font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[var(--c-text-3)]";
const field =
  "mt-2 w-full rounded-lg border border-[var(--c-line)] bg-[var(--c-surface)] px-4 py-3 text-base text-[var(--c-text)] focus:border-[var(--c-focus)] focus:outline-2 focus:outline-offset-0 focus:outline-[var(--c-focus)]";

// 서버가 돌려주는 문장은 개발자용이라 손님에게 그대로 보이면 안 된다.
const MESSAGES: Record<number, string> = {
  400: t({ ko: "적어주신 값 중에 이상한 게 있습니다. 날짜와 숫자를 확인해 주세요.", en: "Something in the form doesn't look right. Please check the dates and numbers." }),
  429: t({ ko: "초안을 이미 여러 번 만드셨습니다. 한 시간 뒤에 다시 시도해 주세요.", en: "You've made a few drafts already. Please try again in an hour." }),
  502: t({ ko: "지금 초안을 못 쓰고 있습니다. 다시 시도해 주세요.", en: "Our writer is having a moment. Please try again." }),
};
const FALLBACK = t({ ko: "초안을 만들지 못했습니다. 다시 시도해 주세요.", en: "We couldn't create your draft. Please try again." });
const TIMEOUT_MS = 60_000;

export default function PlanForm() {
  const router = useRouter();
  // 오늘보다 이전 날짜를 못 고르게 막는 값
  const today = new Date().toISOString().slice(0, 10);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 반드시 이전 값을 받아서 계산한다.
  // `list` 를 그대로 쓰면 빠르게 두 번 연속 누를 때 두 번째가 첫 번째를 지운다 (실제로 겪었다).
  function toggle(value: string, set: React.Dispatch<React.SetStateAction<string[]>>) {
    set((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (destinations.length === 0) {
      setError(t({ ko: "가고 싶은 곳을 하나 이상 골라주세요.", en: "Pick at least one place you want to visit." }));
      return;
    }

    setError(null);
    setSubmitting(true);

    const f = new FormData(e.currentTarget);

    // 시간 제한이 없으면 서버가 응답을 안 줄 때 버튼이 잠긴 채로 영원히 멈춘다.
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        signal: abort.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinations,
          styles,
          startDate: f.get("startDate"),
          durationDays: Number(f.get("durationDays")),
          travelers: Number(f.get("travelers")),
          budgetPerPerson: f.get("budgetPerPerson") ? Number(f.get("budgetPerPerson")) : undefined,
          budgetCurrency: f.get("budgetCurrency"),
          audience: f.get("audience") || undefined,
          dietaryNotes: f.get("dietaryNotes") || undefined,
          interests: f.get("interests") || undefined,
          language: f.get("language"),
        }),
      });

      if (!res.ok) {
        // 서버가 왜 거절했는지는 로그에만 남기고, 손님에게는 우리 문장을 보여준다
        console.error("plan request failed:", res.status, await res.text());
        setError(MESSAGES[res.status] ?? FALLBACK);
        setSubmitting(false);
        return;
      }

      const body = await res.json();
      router.push(`/plan/${body.id}`);
    } catch (err) {
      setError(
        err instanceof DOMException && err.name === "AbortError"
          ? t({ ko: "평소보다 오래 걸리고 있습니다. 다시 시도해 주세요.", en: "This is taking longer than usual. Please try again." })
          : FALLBACK
      );
      setSubmitting(false); // 성공하면 화면이 넘어가므로 실패했을 때만 다시 열어준다
    } finally {
      clearTimeout(timer);
    }
  }

  return (
    <div
      className={`${display.variable} flex-1 bg-[var(--c-bg)] text-[var(--c-text)] font-[family-name:var(--font-geist-sans)] selection:bg-[var(--c-accent)] selection:text-[var(--c-bg)]`}
    >
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="-my-2 py-2 font-[family-name:var(--font-geist-sans)] text-xl font-semibold tracking-[-0.02em] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]"
        >
          mohallae
        </Link>
        <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[var(--c-text-3)]">
          {t({ ko: "무료 초안", en: "Free draft" })}
        </span>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-24">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight">
          {t({ ko: "여행에 대해 알려주세요", en: "Tell us about your trip" })}
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--c-text-2)]">
          {t({
            ko: "2분이면 됩니다. 가입도 카드도 필요 없습니다. 일자별 개요와 가이드북에 없는 팁 하나를 받으십니다.",
            en: "Two minutes. No account, no card. You'll get a day-by-day outline and one tip a guidebook won't give you.",
          })}
        </p>

        <form onSubmit={onSubmit} className="mt-12 space-y-10">
          {/* 목적지 — 여러 도시를 도는 여행이 많다 */}
          <fieldset>
            <legend className={label}>{t({ ko: "어디로 가시나요? *", en: "Where are you going? *" })}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {DESTINATIONS.map((d) => {
                const on = destinations.includes(d.v);
                return (
                  <button
                    key={d.v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(d.v, setDestinations)}
                    className={`rounded-full border px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)] ${
                      on
                        ? "border-[var(--c-deep)] bg-[var(--c-text)] text-[var(--c-bg)]"
                        : "border-[var(--c-line)] bg-[var(--c-surface)] hover:border-[var(--c-text-3)]"
                    }`}
                  >
                    {t({ ko: d.ko, en: d.v })}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-6 sm:grid-cols-3">
            <label className="block">
              <span className={label}>{t({ ko: "출발일 *", en: "Start date *" })}</span>
              {/* 지나간 날짜를 고르면 AI가 이미 끝난 여행의 일정을 만든다. 서버에서도 한 번 더 막는다 */}
              <input type="date" name="startDate" required min={today} className={field} />
            </label>
            <label className="block">
              <span className={label}>{t({ ko: "기간(일) *", en: "Days *" })}</span>
              <input type="number" name="durationDays" required min={1} max={30} defaultValue={5} className={field} />
            </label>
            <label className="block">
              <span className={label}>{t({ ko: "인원 *", en: "Travelers *" })}</span>
              <input type="number" name="travelers" required min={1} max={20} defaultValue={2} className={field} />
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
            <label className="block">
              <span className={label}>{t({ ko: "1인 예산", en: "Budget per person" })}</span>
              <input type="number" name="budgetPerPerson" min={0} placeholder="Optional" className={field} />
            </label>
            <label className="block">
              <span className={label}>{t({ ko: "통화", en: "Currency" })}</span>
              <select name="budgetCurrency" defaultValue="USD" className={field}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset>
            <legend className={label}>{t({ ko: "무엇에 관심 있으세요?", en: "What are you into?" })}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {STYLES.map((st) => {
                const on = styles.includes(st.v);
                return (
                  <button
                    key={st.v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(st.v, setStyles)}
                    className={`rounded-full border px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)] ${
                      on
                        ? "border-[var(--c-deep)] bg-[var(--c-text)] text-[var(--c-bg)]"
                        : "border-[var(--c-line)] bg-[var(--c-surface)] hover:border-[var(--c-text-3)]"
                    }`}
                  >
                    {t({ ko: st.ko, en: st.v })}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="block">
            <span className={label}>{t({ ko: "누구와 가시나요", en: "Who\u2019s coming" })}</span>
            <select name="audience" defaultValue="" className={field}>
              <option value="">{t({ ko: "상관없음", en: "No preference" })}</option>
              {AUDIENCES.map((a) => (
                <option key={a.v} value={a.v}>
                  {t({ ko: a.ko, en: a.v })}
                </option>
              ))}
            </select>
          </label>

          {/* 제약사항 — 무슬림·채식 손님에게는 여행의 성패고, 이걸 챙기는 게 우리가 돈 받는 이유에 가깝다 */}
          <label className="block">
            <span className={label}>{t({ ko: "꼭 맞춰야 할 것이 있나요?", en: "Anything we must work around?" })}</span>
            <textarea
              name="dietaryNotes"
              rows={2}
              placeholder={t({ ko: "할랄, 채식, 알레르기, 휠체어 접근…", en: "Halal, vegetarian, allergies, wheelchair access…" })}
              className={field}
            />
          </label>

          <label className="block">
            <span className={label}>{t({ ko: "이미 하고 싶은 것이 있나요?", en: "Anything you already want to do?" })}</span>
            <textarea
              name="interests"
              rows={3}
              maxLength={500}
              placeholder={t({ ko: "전통시장, 커피, 야경…", en: "Traditional markets, coffee, night views…" })}
              className={field}
            />
          </label>

          <label className="block">
            <span className={label}>{t({ ko: "초안을 받을 언어 *", en: "Language for your draft *" })}</span>
            <select name="language" defaultValue="en" className={field}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p role="alert" className="rounded-lg border border-[var(--c-accent)] bg-[var(--c-error-bg)] px-4 py-3 text-[var(--c-error-text)]">
              {error}
            </p>
          )}

          {/* 누른 뒤 버튼을 잠근다. 반응이 없으면 손님이 여러 번 누르고 그때마다 AI 요금이 나간다 */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-full bg-[var(--c-text)] px-8 py-3.5 text-base text-[var(--c-bg)] transition-colors hover:bg-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--c-focus)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--c-text)]"
            >
              {submitting ? t({ ko: "초안을 쓰는 중…", en: "Writing your draft…" }) : t({ ko: "무료 초안 받기", en: "Get your free draft" })}
            </button>
            <span aria-live="polite" className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[var(--c-text-3)]">
              {submitting ? t({ ko: "몇 초 걸립니다", en: "This takes a few seconds" }) : t({ ko: "가입 필요 없음", en: "No account needed" })}
            </span>
          </div>
        </form>
      </main>
    </div>
  );
}
