"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import base from "../../mohallae.module.css";
import s from "./flow.module.css";
import CorrectionStrip from "../../_components/CorrectionStrip";
import Calendar from "./Calendar";
import Postcard from "./Postcard";
import {
  CURATED, CURRENCIES, INITIAL_STATE, LANGUAGES, OPTIONAL, OTHER_STEPS,
  choicesFor, defaultCurrency, flowReducer, isMultiple, nights, panelPhotos, pickedPlaces, stepError, stepOrder, toPlanRequest,
  type Answers, type Choice, type Destination, type Lang, type Step, type Text,
} from "../flow";
import { flowCopy as c } from "./copy";

/**
 * 새 입력 흐름 (승인 시안 input-comp-3 "초안이 자라나는 판", 써니 2026-10-12).
 *
 * 왼쪽에 질문 하나, 오른쪽에 '지금까지의 여행' 판. 고른 것이 그 판에 한 줄씩 적히고,
 * 아직 묻지 않은 것은 회색으로 기다린다. 마지막에 지금 폼과 똑같은 값을 /api/plan 으로 보내고
 * 새 결과 화면(/mohallae/plan/[id])으로 넘어간다.
 *
 * - 언어 단추는 이 화면 안에서만 바꾼다 (주소만 고치고 답은 그대로 — 다시 불러오면 답이 사라진다)
 * - 화면이 바뀌면 질문(h1)으로 초점을 옮긴다. 화면 낭독기가 새 질문부터 읽는다 (베타와 같다)
 * - 기다리는 동안은 랜딩의 고쳐 쓰기 장면을 보여 준다
 */
export default function PlanFlow({ initialLang, destinations }: { initialLang: Lang; destinations: Destination[] }) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>(initialLang);
  const [state, dispatch] = useReducer(flowReducer, INITIAL_STATE);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<Text | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  const order = stepOrder(state.answers);
  const index = order.indexOf(state.step);
  const error = stepError(state);
  const t = (x: Text) => x[lang];

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    // 새 질문은 맨 위에서 시작한다 (앞 화면에서 내려가 있던 자리 그대로 두면 질문이 안 보인다)
    window.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
    setFailure(null);
  }, [state.step]);

  function switchLang(next: Lang) {
    setLang(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(null, "", url);
  }

  async function submit() {
    if (sending) return;
    setSending(true);
    setFailure(null);
    // 시간 제한이 없으면 서버가 답을 안 줄 때 영원히 기다린다.
    // 서버(app/api/plan)는 60초까지 일한다. 화면도 60초에 포기하면, 서버가 59초에 다 써서 저장까지 했는데
    // 서버가 깨어나는 시간·오가는 시간 때문에 화면이 먼저 포기할 수 있다 (손님은 실패를 보고, 초안은 저장돼 있다).
    // 그래서 화면은 서버보다 넉넉히 기다린다. 서버가 시간을 넘기면 Vercel 이 504 를 먼저 돌려준다.
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 75_000);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        signal: abort.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPlanRequest(state.answers, lang)),
      });
      if (!res.ok) {
        console.error("plan request failed:", res.status, await res.text());
        // 504: 서버가 60초 안에 못 끝냈다 — 화면이 포기한 것과 같은 안내
        setFailure(res.status === 504 ? c.errors.timeout : c.errors[res.status as 400 | 429 | 502] ?? c.errors.fallback);
        setSending(false);
        return;
      }
      const { id } = await res.json();
      router.push(`/mohallae/plan/${id}${lang === "en" ? "?lang=en" : ""}`);
    } catch (e) {
      setFailure(e instanceof DOMException && e.name === "AbortError" ? c.errors.timeout : c.errors.fallback);
      setSending(false);
    } finally {
      clearTimeout(timer);
    }
  }

  const placeName = (value: string) => {
    const hit = destinations.find((d) => d.v === value);
    return hit ? (lang === "ko" ? hit.ko : hit.v) : value;
  };

  return (
    <div lang={lang} className={`${base.page} ${s.shell}`}>
      <header className={s.topbar}>
        <div className={`${s.wrap} ${s.topbarInner}`}>
          <Link href={`/mohallae${lang === "en" ? "?lang=en" : ""}`} className={s.wordmark} aria-label={t(c.home)}>
            mohallae
          </Link>
          <div className={s.topbarRight}>
            <span className={s.lang} role="group" aria-label={t(c.langLabel)}>
              {(["en", "ko"] as const).map((code, i) => (
                <span key={code} className={s.langItem}>
                  {i > 0 && <span aria-hidden="true" className={s.langBar} />}
                  <button type="button" lang={code} aria-pressed={lang === code} className={s.langBtn} onClick={() => switchLang(code)}>
                    {code === "en" ? "EN" : "한국어"}
                  </button>
                </span>
              ))}
            </span>
            <p className={s.freeDraft}>{t(c.freeDraft)}</p>
          </div>
        </div>
      </header>

      <main className={`${s.wrap} ${s.main}`}>
        <div className={s.progress}>
          <p className={s.stepCount}>{c.step[lang](index + 1, order.length)}</p>
          <div
            className={s.bar}
            role="progressbar"
            aria-label={t(c.progressLabel)}
            aria-valuemin={1}
            aria-valuemax={order.length}
            aria-valuenow={index + 1}
          >
            <span style={{ width: `${((index + 1) / order.length) * 100}%` }} />
          </div>
        </div>

        <div className={s.grid}>
          <section className={s.ask} aria-labelledby="question">
            {sending ? (
              <Waiting lang={lang} />
            ) : (
              <>
                <h1 id="question" ref={heading} tabIndex={-1} className={s.question}>
                  {question(state.step, state.answers, lang, placeName)}
                </h1>
                <p className={s.helper}>{helper(state.step, lang)}</p>

                <Body step={state.step} answers={state.answers} lang={lang} destinations={destinations} dispatch={dispatch} />

                {/* 화면이 좁으면 판이 질문 아래(첫 화면 밖)로 밀린다 — 확인 화면에서는 고칠 목록을 여기에.
                    초안 언어(위)를 먼저 보이게 하고 그 아래에. CSS 가 화면 넓이에 따라 이것과 오른쪽 판 중 하나만 보여 준다 */}
                {state.step === "review" && (
                  <TripPanel variant="inline" answers={state.answers} step={state.step} order={order} lang={lang} placeName={placeName}
                    reviewed={!!state.reviewed} onEdit={(to) => dispatch({ type: "goto", to })} />
                )}

                {failure && <p role="alert" className={s.failure}>{t(failure)}</p>}
                {state.step === "review" && <p className={s.reviewNote}>{t(c.review.note)}</p>}

                {/* 단추 줄은 어느 질문에서나 같은 자리 — 칸 아래 끝 (써니: "다음 다음 다음 누르니까 번거로워") */}
                <div className={s.push} aria-hidden="true" />
                <div className={s.nav}>
                  {index > 0 ? (
                    <button type="button" className={s.back} onClick={() => dispatch({ type: "back" })}>
                      <span aria-hidden="true">←</span> {t(c.back)}
                    </button>
                  ) : <span />}
                  <div className={s.navRight}>
                    {state.step === "review" ? (
                      <button type="button" className={`${base.pillDark} ${s.next}`} onClick={submit}>
                        {t(c.submit)}
                      </button>
                    ) : state.reviewed ? (
                      // 확인 화면을 본 뒤 고치러 왔다: 곧장 돌아가는 단추가 주인공, 한 칸씩 가는 건 옆에 작게
                      <>
                        <button type="button" className={s.jump} disabled={!!error}
                          aria-describedby={error ? "step-error" : undefined}
                          onClick={() => dispatch({ type: "next", from: state.step })}>
                          {t(c.nextQuestion)}
                        </button>
                        <button type="button" className={`${base.pillDark} ${s.next}`} disabled={!!error}
                          aria-describedby={error ? "step-error" : undefined}
                          onClick={() => dispatch({ type: "resume" })}>
                          {t(c.backToReview)} <span aria-hidden="true">→</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {OPTIONAL.includes(state.step) && (
                          <button type="button" className={s.jump} onClick={() => dispatch({ type: "goto", to: "review" })} disabled={!!error}>
                            {t(c.toReview)}
                          </button>
                        )}
                        <button
                          type="button"
                          className={`${base.pillDark} ${s.next}`}
                          disabled={!!error}
                          aria-describedby={error ? "step-error" : undefined}
                          onClick={() => dispatch({ type: "next", from: state.step })}
                        >
                          {nextLabel(state.step, state.answers, lang)} <span aria-hidden="true">→</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {error && <p id="step-error" className="sr-only">{t(error)}</p>}
              </>
            )}
          </section>

          <TripPanel answers={state.answers} step={state.step} order={order} lang={lang} placeName={placeName} reviewed={!!state.reviewed}
            onEdit={sending ? undefined : (to) => dispatch({ type: "goto", to })} />
        </div>
      </main>
    </div>
  );
}

/* ── 질문 글 ─────────────────────────────────────────────────────── */

function question(step: Step, answers: Answers, lang: Lang, placeName: (v: string) => string): string {
  if (step.startsWith("do:")) return c.todo.q[lang](placeName(step.slice(3)));
  if (step === "interests") {
    const places = pickedPlaces(answers).filter((p) => !CURATED[p]).map(placeName);
    return c.interests.q[lang](places.join(lang === "ko" ? "·" : " & "));
  }
  const simple = c[step as "where" | "who" | "kids" | "pace" | "dates" | "travelers" | "budget" | "visited" | "transport" | "stay" | "rhythm" | "occasion" | "avoid" | "diet" | "review"];
  return simple.q[lang];
}

function helper(step: Step, lang: Lang): string {
  if (step.startsWith("do:")) return c.todo.help[lang];
  if (step === "interests") return c.interests.help[lang];
  if (step === "diet") return c.diet.help[lang];
  if (OPTIONAL.includes(step)) return c.optionalNote[lang];
  const entry = c[step as "where" | "who" | "kids" | "pace" | "dates" | "travelers" | "budget" | "review"];
  return "help" in entry ? entry.help[lang] : "";
}

function nextLabel(step: Step, answers: Answers, lang: Lang) {
  const empty = !(answers[step]?.length) && !(answers[`${step}:other` as keyof Answers]?.[0]?.trim());
  return (OPTIONAL.includes(step) || step === "interests") && empty ? c.skip[lang] : c.next[lang];
}

/* ── 답하는 칸 ───────────────────────────────────────────────────── */

type Dispatch = (a: Parameters<typeof flowReducer>[1]) => void;

function Body({ step, answers, lang, destinations, dispatch }: {
  step: Step; answers: Answers; lang: Lang; destinations: Destination[]; dispatch: Dispatch;
}) {
  const t = (x: Text) => x[lang];
  const picked = answers[step] ?? [];

  if (step === "dates") {
    const [start = "", end = ""] = answers.dates ?? [];
    return <Calendar start={start} end={end} lang={lang} onChange={(a, b) => dispatch({ type: "input", values: [a, b] })} />;
  }

  if (step === "travelers") {
    const n = Number(answers.travelers?.[0] ?? 0);
    const set = (v: number) => dispatch({ type: "input", values: [String(Math.min(20, Math.max(1, v)))] });
    return (
      <div className={s.stepper}>
        <button type="button" className={s.stepBtn} onClick={() => set((n || 1) - 1)} disabled={n <= 1} aria-label={t(c.minus)}>−</button>
        <p className={s.stepValue} aria-live="polite">{n ? c.travelersUnit[lang](n) : "–"}</p>
        <button type="button" className={s.stepBtn} onClick={() => set((n || 0) + 1)} disabled={n >= 20} aria-label={t(c.plus)}>+</button>
      </div>
    );
  }

  if (step === "review") {
    return (
      <label className={s.languagePick}>
        <span>{t(c.review.language)}</span>
        <select
          value={answers["review:language"]?.[0] ?? lang}
          onChange={(e) => dispatch({ type: "set", key: "review:language", value: e.target.value })}
        >
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </label>
    );
  }

  const options: Choice[] = step === "where"
    ? destinations.map((d) => ({ id: d.v, value: d.v, title: { ko: d.ko, en: d.v } }))
    : choicesFor(step);
  const photos = options.some((o) => o.image) && step !== "where";
  const compact = step === "where" || step === "interests" || step === "avoid" || step === "diet";
  const otherKey = `${step}:other` as keyof Answers;
  const otherOpen = (OTHER_STEPS as readonly string[]).includes(step) && answers[otherKey] !== undefined;
  const multiple = isMultiple(step);

  return (
    <>
      <ul className={`${s.choices} ${photos ? s.photoGrid : compact ? s.chipGrid : s.textGrid}`} role="list">
        {options.map((o) => {
          const on = picked.includes(o.id);
          return (
            <li key={o.id}>
              <button
                type="button"
                className={`${s.choice} ${photos ? s.photoChoice : ""} ${on ? s.on : ""}`}
                aria-pressed={on}
                onClick={() => dispatch({ type: "choose", value: o.id })}
              >
                {photos && o.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.image} alt="" className={s.photo} decoding="async" />
                )}
                <span className={s.choiceText}>
                  <span className={s.choiceTitle}>{t(o.title)}</span>
                  {o.description && <span className={s.choiceDesc}>{t(o.description)}</span>}
                </span>
                <span className={s.check} aria-hidden="true">
                  <svg viewBox="0 0 16 16"><path d="M3.5 8.4l2.9 2.8 6.1-6.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </button>
            </li>
          );
        })}
        {(OTHER_STEPS as readonly string[]).includes(step) && (
          <li>
            <button
              type="button"
              className={`${s.choice} ${s.otherChoice} ${otherOpen ? s.on : ""}`}
              aria-pressed={otherOpen}
              onClick={() => dispatch({ type: "other", text: otherOpen ? null : "" })}
            >
              <span className={s.choiceText}><span className={s.choiceTitle}>{t(step === "where" ? c.otherPlace : c.other)}</span></span>
            </button>
          </li>
        )}
      </ul>

      {otherOpen && (
        <label className={s.otherField}>
          <span className="sr-only">{t(c.other)}</span>
          <input
            type="text"
            value={answers[otherKey]?.[0] ?? ""}
            maxLength={40}
            autoFocus
            placeholder={t(c.otherPlaceholder)}
            onChange={(e) => dispatch({ type: "other", text: e.target.value })}
          />
        </label>
      )}

      {step === "budget" && (
        <div className={s.currency} role="group" aria-label={t(c.budget.currency)}>
          <span>{t(c.budget.currency)}</span>
          {CURRENCIES.map((cur) => {
            const on = (answers["budget:currency"]?.[0] ?? defaultCurrency(lang)) === cur;
            return (
              <button key={cur} type="button" aria-pressed={on} className={`${s.cur} ${on ? s.curOn : ""}`}
                onClick={() => dispatch({ type: "set", key: "budget:currency", value: cur })}>
                {cur}
              </button>
            );
          })}
        </div>
      )}

      <p className={s.count} aria-live="polite">
        {multiple && picked.length > 0 ? c.picked[lang](picked.length) : !multiple && picked.length ? t(c.pickedOne) : " "}
      </p>
    </>
  );
}

/* ── 오른쪽 판: 지금까지의 여행 ─────────────────────────────────── */

type Line = { key: string; label: string; value: string | null; to: Step | null };

function TripPanel({ variant = "aside", answers, step, order, lang, placeName, reviewed, onEdit }: {
  variant?: "aside" | "inline";
  answers: Answers; step: Step; order: Step[]; lang: Lang; placeName: (v: string) => string; reviewed: boolean; onEdit?: (to: Step) => void;
}) {
  const t = (x: Text) => x[lang];
  const p = c.panel;
  const places = pickedPlaces(answers);
  const sep = lang === "ko" ? ", " : ", ";
  const title = (st: Step, id: string) => choicesFor(st).find((o) => o.id === id)?.title[lang] ?? id;
  const valueOf = (st: Step) => (answers[st] ?? []).map((id) => title(st, id)).join(sep) || null;
  // 확인 화면을 본 뒤에는 앞 질문을 고치는 중이어도 뒤쪽 답(인원 등)을 그대로 보여 준다
  const reached = (st: Step) => reviewed || order.indexOf(st) < order.indexOf(step) || (st === step && !!answers[st]?.length);

  const lines: Line[] = [{ key: "where", label: t(p.where), value: places.length ? places.map(placeName).join(" · ") : null, to: "where" }];
  for (const place of places) {
    const city = CURATED[place];
    if (!city) continue;
    const picks = city.experiences.filter((e) => answers[`do:${place}`]?.includes(e.id)).map((e) => e.title[lang]);
    lines.push({ key: `do:${place}`, label: `${placeName(place)} — ${t(p.todo)}`, value: picks.join(sep) || null, to: `do:${place}` });
  }
  if (order.includes("interests")) {
    const other = answers["interests:other"]?.[0]?.trim();
    const v = [valueOf("interests"), other].filter(Boolean).join(sep);
    lines.push({ key: "interests", label: t(p.interests), value: v || (reached("interests") ? "—" : null), to: "interests" });
  }
  const who = valueOf("who");
  const kids = valueOf("kids");
  lines.push({ key: "who", label: t(p.who), value: who ? (kids ? `${who} · ${kids}` : who) : null, to: "who" });
  lines.push({ key: "pace", label: t(p.pace), value: valueOf("pace"), to: "pace" });
  const [start, end] = answers.dates ?? [];
  lines.push({ key: "dates", label: t(p.dates), value: start && end ? `${dayLabel(start, lang)} – ${dayLabel(end, lang)} · ${p.days[lang](nights(start, end) + 1)}` : null, to: "dates" });
  const n = Number(answers.travelers?.[0] ?? 0);
  lines.push({ key: "travelers", label: t(p.travelers), value: n && reached("travelers") ? c.travelersUnit[lang](n) : null, to: "travelers" });
  lines.push({ key: "budget", label: t(p.budget), value: valueOf("budget"), to: "budget" });
  const details = OPTIONAL.flatMap((st) => {
    const v = valueOf(st);
    const other = answers[`${st}:other` as keyof Answers]?.[0]?.trim();
    return [v, other].filter(Boolean) as string[];
  });
  const detailsReached = OPTIONAL.some((st) => reached(st)) || step === "review";
  lines.push({ key: "details", label: t(p.details), value: details.length ? details.join(sep) : detailsReached ? "—" : null, to: "visited" });

  const photos = panelPhotos(places);

  return (
    <Frame variant={variant} className={variant === "inline" ? s.reviewInline : `${s.panel} ${step === "review" ? s.panelOnReview : ""}`} label={t(p.title)}>
      <p className={s.panelTitle}>{t(p.title)}</p>
      {variant === "aside" && (
        <Postcard key={photos.join("|")} photos={photos} lang={lang} label={places.length ? places.map(placeName).join(" · ") : "mohallae"} />
      )}
      <ol className={s.timeline}>
        {lines.map((l) => {
          const done = l.value !== null;
          const editable = done && onEdit && l.to && order.includes(l.to) && order.indexOf(l.to) <= order.indexOf(step) && l.to !== step;
          // 지금 묻고 있는 줄 (세부 질문들은 세부 줄, 아이 나이는 누구와 줄)
          const current =
            l.to === step ||
            (l.key === "details" && OPTIONAL.includes(step)) ||
            (l.key === "who" && step === "kids");
          return (
            <li key={l.key} className={`${s.line} ${done ? s.done : ""} ${current ? s.current : ""}`} aria-current={current ? "step" : undefined}>
              <span className={s.lineLabel}>{l.label}</span>
              {done && (
                editable ? (
                  <button key={l.value} type="button" className={s.lineValue} onClick={() => onEdit!(l.to!)}>
                    {l.value} <span className="sr-only">— {t(p.edit)}</span>
                  </button>
                ) : (
                  <span key={l.value} className={s.lineValue}>{l.value}</span>
                )
              )}
            </li>
          );
        })}
      </ol>
    </Frame>
  );
}

/** 오른쪽 판은 aside(쪽 영역), 확인 화면 안의 목록은 그냥 묶음 — 같은 내용을 두 번 영역으로 알리지 않는다 */
function Frame({ variant, className, label, children }: { variant: "aside" | "inline"; className: string; label: string; children: React.ReactNode }) {
  return variant === "aside"
    ? <aside className={className} aria-label={label}>{children}</aside>
    : <div className={className} role="group" aria-label={label}>{children}</div>;
}

function dayLabel(key: string, lang: Lang) {
  const [, m, d] = key.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return lang === "ko" ? `${m}월 ${d}일` : `${months[m - 1]} ${d}`;
}

/* ── 기다림 ──────────────────────────────────────────────────────── */

function Waiting({ lang }: { lang: Lang }) {
  // 20초가 넘으면 "보통 15초" 가 거짓말이 된다 — 긴 여행은 더 걸린다고 바꿔 말한다
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSlow(true), 20_000);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className={s.waiting} role="status" aria-live="polite">
      <h1 className={s.question}>{c.waiting.title[lang]}<span className={s.dots} aria-hidden="true" /></h1>
      <p className={s.helper}>{(slow ? c.waiting.slow : c.waiting.body)[lang]}</p>
      <div className={`${s.waitStrip} ${base.stripFit}`}>
        <CorrectionStrip lang={lang} />
      </div>
    </div>
  );
}
