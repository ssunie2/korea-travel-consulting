"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Instrument_Serif } from "next/font/google";

// 표제용 서체. 랜딩·결과 화면과 같은 방식으로 이 화면에서만 불러온다.
const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

const DESTINATIONS = ["Seoul", "Busan", "Jeju", "Gyeongju", "Jeonju", "Gangneung", "Andong", "Sokcho"];
const STYLES = ["Food", "Culture & history", "Nature & hiking", "Shopping", "Nightlife", "Photo spots"];
const AUDIENCES = ["Solo", "Couple", "Friends", "Family with kids", "With parents"];
const CURRENCIES = ["KRW", "USD", "EUR", "JPY"];
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ko", label: "한국어" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

const label = "font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[#4A5D54]";
const field =
  "mt-2 w-full rounded-lg border border-[#CFC6B4] bg-white px-4 py-3 text-base text-[#1B211E] focus:border-[#3E6FB0] focus:outline-2 focus:outline-offset-0 focus:outline-[#3E6FB0]";

// 서버가 돌려주는 문장은 개발자용이라 손님에게 그대로 보이면 안 된다.
const MESSAGES: Record<number, string> = {
  400: "Something in the form doesn't look right. Please check the dates and numbers.",
  429: "You've made a few drafts already. Please try again in an hour.",
  502: "Our writer is having a moment. Please try again.",
};
const FALLBACK = "We couldn't create your draft. Please try again.";
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
      setError("Pick at least one place you want to visit.");
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
          ? "This is taking longer than usual. Please try again."
          : FALLBACK
      );
      setSubmitting(false); // 성공하면 화면이 넘어가므로 실패했을 때만 다시 열어준다
    } finally {
      clearTimeout(timer);
    }
  }

  return (
    <div
      className={`${display.variable} flex-1 bg-[#F2EDE3] text-[#1B211E] font-[family-name:var(--font-geist-sans)] selection:bg-[#D8503C] selection:text-[#F2EDE3]`}
    >
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="-my-2 py-2 font-[family-name:var(--font-display)] text-xl tracking-tight underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]"
        >
          mohallae
        </Link>
        <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#4A5D54]">
          Free draft
        </span>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-24">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight">
          Tell us about your trip
        </h1>
        <p className="mt-4 leading-relaxed text-[#3D4A44]">
          Two minutes. No account, no card. You&apos;ll get a day-by-day outline and one tip a
          guidebook won&apos;t give you.
        </p>

        <form onSubmit={onSubmit} className="mt-12 space-y-10">
          {/* 목적지 — 여러 도시를 도는 여행이 많다 */}
          <fieldset>
            <legend className={label}>Where are you going? *</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {DESTINATIONS.map((d) => {
                const on = destinations.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(d, setDestinations)}
                    className={`rounded-full border px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3E6FB0] ${
                      on
                        ? "border-[#12211C] bg-[#12211C] text-[#F2EDE3]"
                        : "border-[#CFC6B4] bg-white hover:border-[#12211C]"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-6 sm:grid-cols-3">
            <label className="block">
              <span className={label}>Start date *</span>
              {/* 지나간 날짜를 고르면 AI가 이미 끝난 여행의 일정을 만든다. 서버에서도 한 번 더 막는다 */}
              <input type="date" name="startDate" required min={today} className={field} />
            </label>
            <label className="block">
              <span className={label}>Days *</span>
              <input type="number" name="durationDays" required min={1} max={30} defaultValue={5} className={field} />
            </label>
            <label className="block">
              <span className={label}>Travelers *</span>
              <input type="number" name="travelers" required min={1} max={20} defaultValue={2} className={field} />
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
            <label className="block">
              <span className={label}>Budget per person</span>
              <input type="number" name="budgetPerPerson" min={0} placeholder="Optional" className={field} />
            </label>
            <label className="block">
              <span className={label}>Currency</span>
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
            <legend className={label}>What are you into?</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {STYLES.map((s) => {
                const on = styles.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(s, setStyles)}
                    className={`rounded-full border px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3E6FB0] ${
                      on
                        ? "border-[#12211C] bg-[#12211C] text-[#F2EDE3]"
                        : "border-[#CFC6B4] bg-white hover:border-[#12211C]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="block">
            <span className={label}>Who&apos;s coming</span>
            <select name="audience" defaultValue="" className={field}>
              <option value="">No preference</option>
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          {/* 제약사항 — 무슬림·채식 손님에게는 여행의 성패고, 이걸 챙기는 게 우리가 돈 받는 이유에 가깝다 */}
          <label className="block">
            <span className={label}>Anything we must work around?</span>
            <textarea
              name="dietaryNotes"
              rows={2}
              placeholder="Halal, vegetarian, allergies, wheelchair access…"
              className={field}
            />
          </label>

          <label className="block">
            <span className={label}>Anything you already want to do?</span>
            <textarea
              name="interests"
              rows={3}
              maxLength={500}
              placeholder="Traditional markets, coffee, night views…"
              className={field}
            />
          </label>

          <label className="block">
            <span className={label}>Language for your draft *</span>
            <select name="language" defaultValue="en" className={field}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p role="alert" className="rounded-lg border border-[#D8503C] bg-[#F8E7E3] px-4 py-3 text-[#8E2C1B]">
              {error}
            </p>
          )}

          {/* 누른 뒤 버튼을 잠근다. 반응이 없으면 손님이 여러 번 누르고 그때마다 AI 요금이 나간다 */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-full bg-[#12211C] px-8 py-3.5 text-base text-[#F2EDE3] transition-colors hover:bg-[#D8503C] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3E6FB0] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#12211C]"
            >
              {submitting ? "Writing your draft…" : "Get your free draft"}
            </button>
            <span aria-live="polite" className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#4A5D54]">
              {submitting ? "This takes a few seconds" : "No account needed"}
            </span>
          </div>
        </form>
      </main>
    </div>
  );
}
