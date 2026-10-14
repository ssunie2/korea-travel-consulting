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
  CURRENCIES, INITIAL_STATE, LANGUAGES, STEP,
  autoAdvance, defaultCurrency, flowReducer, labelsOf, nights, optionsFor, postcardPhotos, stepError, stepOrder, toPlanRequest, visibleFields,
  type Action, type Answers, type Field, type Lang, type StepId, type Text,
} from "../flow";
import { flowCopy as c } from "./copy";

/**
 * 새 입력 흐름 (승인 시안 input-comp-3 "초안이 자라나는 판", 써니 2026-10-12. 질문은 2026-10-13 새로 짰다 — flow.ts).
 *
 * 왼쪽에 질문 하나, 오른쪽에 '지금까지의 여행' 판. 고른 것이 그 판에 한 줄씩 적히고,
 * 아직 묻지 않은 것은 회색으로 기다린다. 마지막에 지금 폼과 같은 모양의 값을 /api/plan 으로 보내고
 * 새 결과 화면(/mohallae/plan/[id])으로 넘어간다.
 *
 * - 언어 단추는 이 화면 안에서만 바꾼다 (주소만 고치고 답은 그대로 — 다시 불러오면 답이 사라진다)
 * - 화면이 바뀌면 질문(h1)으로 초점을 옮긴다. 화면 낭독기가 새 질문부터 읽는다 (베타와 같다)
 * - 하나만 고르는 질문은 고르면 바로 다음 질문으로 — '다음' 단추가 없다 (써니 2026-10-12, flow.ts autoAdvance).
 *   줄이 둘인 질문(도착·출발 시간 등)은 마지막 줄을 채우는 순간 넘어간다
 * - 기다리는 동안은 랜딩의 고쳐 쓰기 장면을 보여 준다
 */
/** 고른 표시(체크)가 보일 만큼만 기다렸다가 넘어간다 (.check 가 나타나는 데 0.25초) */
const ADVANCE_MS = 320;

export default function PlanFlow({ initialLang }: { initialLang: Lang }) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>(initialLang);
  const [state, dispatch] = useReducer(flowReducer, INITIAL_STATE);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<Text | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const pending = useRef<{ timer: ReturnType<typeof setTimeout>; step: StepId; field: string; id: string } | null>(null);

  const order = stepOrder(state.answers);
  const index = order.indexOf(state.step);
  const def = STEP[state.step];
  const error = stepError(state);
  const fields = visibleFields(state.step, state.answers);
  // 고르면 넘어가는 질문에는 '다음'이 없다. 줄이 여럿인 질문은 다 채워 둔 걸 고치러 왔을 때만 보인다
  const showNext = !autoAdvance(state.step, state.answers) || (fields.length > 1 && !error);
  const empty = fields.every((f) => !state.answers[f.key]?.some((v) => v.trim()) && state.answers[`${f.key}:other`] === undefined);
  const nextText = fields.length > 0 && fields.every((f) => f.optional) && empty ? c.skip : c.next;
  const t = (x: Text) => x[lang];

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    // 새 질문은 맨 위에서 시작한다 (앞 화면에서 내려가 있던 자리 그대로 두면 질문이 안 보인다)
    window.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
    setFailure(null);
  }, [state.step]);

  useEffect(() => () => { if (pending.current) clearTimeout(pending.current.timer); }, []);

  /** 보기를 눌렀을 때. 고르면 넘어가는 질문이면 잠깐 뒤 다음 질문으로 (확인 화면을 본 뒤라면 확인 화면으로) */
  function pick(field: string, id: string) {
    if (sending) return;
    const step = state.step;
    // 같은 보기를 빠르게 두 번 누르면 한 번으로 (두 번째 누름이 고른 것을 풀어 버리지 않게)
    const p = pending.current;
    if (p && p.step === step && p.field === field && p.id === id) return;
    const after = flowReducer(state, { type: "choose", field, value: id });
    dispatch({ type: "choose", field, value: id });
    if (!autoAdvance(step, after.answers) || stepError(after) || !after.answers[field]?.length) return;
    // 줄이 여럿이면 이번에 고른 것으로 다 채워졌을 때만 넘어간다 — 다 채운 걸 고치는 중이면 머문다
    if (visibleFields(step, after.answers).length > 1 && !stepError(state)) return;
    if (p) clearTimeout(p.timer);
    const reviewed = state.reviewed;
    const timer = setTimeout(() => {
      pending.current = null;
      dispatch(reviewed ? { type: "resume", from: step } : { type: "next", from: step });
    }, ADVANCE_MS);
    pending.current = { timer, step, field, id };
  }

  /** 오른쪽 판에서 이 줄을 눌러 고치러 갈 수 있는지 (확인 화면을 본 뒤에는 앞쪽 질문으로도) */
  const canGo = (to: StepId) => !sending && flowReducer(state, { type: "goto", to }).step === to;

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
                <h1 id="question" ref={heading} tabIndex={-1} className={s.question}>{t(def.q)}</h1>
                <p className={s.helper}>{t(def.help)}</p>

                <Body step={state.step} answers={state.answers} lang={lang} dispatch={dispatch} onPick={pick} />

                {/* 화면이 좁으면 판이 질문 아래(첫 화면 밖)로 밀린다 — 확인 화면에서는 고칠 목록을 여기에.
                    초안 언어(위)를 먼저 보이게 하고 그 아래에. CSS 가 화면 넓이에 따라 이것과 오른쪽 판 중 하나만 보여 준다 */}
                {state.step === "review" && (
                  <TripPanel variant="inline" answers={state.answers} step={state.step} order={order} lang={lang}
                    reviewed={!!state.reviewed} canGo={canGo} onEdit={(to) => dispatch({ type: "goto", to })} />
                )}

                {failure && <p role="alert" className={s.failure}>{t(failure)}</p>}
                {state.step === "review" && <p className={s.reviewNote}>{t(c.reviewNote)}</p>}

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
                      // 확인 화면을 본 뒤 고치러 왔다: 곧장 돌아가는 단추가 주인공, 한 칸씩 가는 건 옆에 작게.
                      // 고르면 넘어가는 질문은 고르면 알아서 돌아가므로 '다음 질문'이 없다
                      <>
                        {showNext && (
                          <button type="button" className={s.jump} disabled={!!error}
                            aria-describedby={error ? "step-error" : undefined}
                            onClick={() => dispatch({ type: "next", from: state.step })}>
                            {t(c.nextQuestion)}
                          </button>
                        )}
                        <button type="button" className={`${base.pillDark} ${s.next}`} disabled={!!error}
                          aria-describedby={error ? "step-error" : undefined}
                          onClick={() => dispatch({ type: "resume" })}>
                          {t(c.backToReview)} <span aria-hidden="true">→</span>
                        </button>
                      </>
                    ) : showNext ? (
                      <button
                        type="button"
                        className={`${base.pillDark} ${s.next}`}
                        disabled={!!error}
                        aria-describedby={error ? "step-error" : undefined}
                        onClick={() => dispatch({ type: "next", from: state.step })}
                      >
                        {t(nextText)} <span aria-hidden="true">→</span>
                      </button>
                    ) : null}
                  </div>
                </div>
                {error && <p id="step-error" className="sr-only">{t(error)}</p>}
              </>
            )}
          </section>

          <TripPanel answers={state.answers} step={state.step} order={order} lang={lang} reviewed={!!state.reviewed}
            canGo={canGo} onEdit={sending ? undefined : (to) => dispatch({ type: "goto", to })} />
        </div>
      </main>
    </div>
  );
}

/* ── 답하는 칸 ───────────────────────────────────────────────────── */

type Dispatch = (a: Action) => void;

function Body({ step, answers, lang, dispatch, onPick }: {
  step: StepId; answers: Answers; lang: Lang; dispatch: Dispatch; onPick: (field: string, id: string) => void;
}) {
  const t = (x: Text) => x[lang];
  const kind = STEP[step].kind;

  if (kind === "dates") {
    const [start = "", end = ""] = answers.dates ?? [];
    return <Calendar start={start} end={end} lang={lang} onChange={(a, b) => dispatch({ type: "input", field: "dates", values: [a, b] })} />;
  }

  if (kind === "travelers") {
    // 혼자·둘이가 아닐 때만 묻는다 — 본인 포함 2명부터
    const n = Number(answers.travelers?.[0] ?? 0);
    const set = (v: number) => dispatch({ type: "input", field: "travelers", values: [String(Math.min(20, Math.max(2, v)))] });
    return (
      <div className={s.stepper}>
        <button type="button" className={s.stepBtn} onClick={() => set(n - 1)} disabled={n <= 2} aria-label={t(c.minus)}>−</button>
        <p className={s.stepValue} aria-live="polite">{n ? c.travelersUnit[lang](n) : "–"}</p>
        <button type="button" className={s.stepBtn} onClick={() => set(n ? n + 1 : 2)} disabled={n >= 20} aria-label={t(c.plus)}>+</button>
      </div>
    );
  }

  if (kind === "review") {
    return (
      <label className={s.languagePick}>
        <span>{t(c.language)}</span>
        <select value={answers.language?.[0] ?? lang} onChange={(e) => dispatch({ type: "set", key: "language", value: e.target.value })}>
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </label>
    );
  }

  const fields = visibleFields(step, answers);
  // 줄이 하나인 질문만 '몇 개 골랐어요'를 적는다
  const only = fields.length === 1 && !fields[0].text ? fields[0] : null;
  const picked = only ? answers[only.key] ?? [] : [];

  return (
    <>
      {/* 통화는 예산을 고르기 전에 — 예산을 고르면 바로 다음 질문으로 넘어간다 */}
      {step === "budget" && (
        <div className={s.currency} role="group" aria-label={t(c.currency)}>
          <span>{t(c.currency)}</span>
          {CURRENCIES.map((cur) => {
            const on = (answers.currency?.[0] ?? defaultCurrency(lang)) === cur;
            return (
              <button key={cur} type="button" aria-pressed={on} className={`${s.cur} ${on ? s.curOn : ""}`}
                onClick={() => dispatch({ type: "set", key: "currency", value: cur })}>
                {cur}
              </button>
            );
          })}
        </div>
      )}

      <div className={s.fields}>
        {fields.map((f) => <FieldRow key={f.key} field={f} answers={answers} lang={lang} dispatch={dispatch} onPick={onPick} />)}
      </div>

      <p className={s.count} aria-live="polite">
        {only && picked.length ? (only.multiple ? c.picked[lang](picked.length) : t(c.pickedOne)) : " "}
      </p>
    </>
  );
}

const Check = () => (
  <span className={s.check} aria-hidden="true">
    <svg viewBox="0 0 16 16"><path d="M3.5 8.4l2.9 2.8 6.1-6.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);

/** 한 줄: 보기들(+ 그 외 — 직접 적기), 또는 직접 적는 칸 */
function FieldRow({ field, answers, lang, dispatch, onPick }: {
  field: Field; answers: Answers; lang: Lang; dispatch: Dispatch; onPick: (field: string, id: string) => void;
}) {
  const t = (x: Text) => x[lang];

  if (field.text) {
    return (
      <label className={s.field}>
        {field.label && <span className={s.fieldLabel}>{t(field.label)}</span>}
        <span className={s.textBox}>
          <input
            type="text"
            value={answers[field.key]?.[0] ?? ""}
            maxLength={field.text.max}
            placeholder={t(field.text.placeholder)}
            onChange={(e) => dispatch({ type: "text", field: field.key, text: e.target.value })}
          />
        </span>
      </label>
    );
  }

  const options = optionsFor(field, answers);
  const picked = answers[field.key] ?? [];
  const otherKey = `${field.key}:other`;
  const otherOpen = !!field.other && answers[otherKey] !== undefined;
  // 설명이 있는 보기는 카드, 이름뿐인 보기는 작은 칩. 카드가 많으면(서울 동네 12곳) 넓은 화면에서 세 칸으로
  const cards = options.some((o) => o.description);
  const grid = cards ? `${s.textGrid} ${options.length > 8 ? s.wideGrid : ""}` : s.chipGrid;
  const labelId = `label-${field.key}`;

  return (
    <div className={s.field} role={field.label ? "group" : undefined} aria-labelledby={field.label ? labelId : undefined}>
      {field.label && <p id={labelId} className={s.fieldLabel}>{t(field.label)}</p>}
      <ul className={`${s.choices} ${grid}`} role="list">
        {options.map((o) => {
          const on = picked.includes(o.id);
          return (
            <li key={o.id}>
              <button type="button" className={`${s.choice} ${on ? s.on : ""}`} aria-pressed={on} onClick={() => onPick(field.key, o.id)}>
                <span className={s.choiceText}>
                  <span className={s.choiceTitle}>{t(o.title)}</span>
                  {o.description && <span className={s.choiceDesc}>{t(o.description)}</span>}
                </span>
                <Check />
              </button>
            </li>
          );
        })}
        {field.other && (
          <li>
            <button
              type="button"
              className={`${s.choice} ${s.otherChoice} ${otherOpen ? s.on : ""}`}
              aria-pressed={otherOpen}
              onClick={() => dispatch({ type: "other", field: field.key, text: otherOpen ? null : "" })}
            >
              <span className={s.choiceText}><span className={s.choiceTitle}>{t(c.other)}</span></span>
              <Check />
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
            onChange={(e) => dispatch({ type: "other", field: field.key, text: e.target.value })}
          />
        </label>
      )}
    </div>
  );
}

/* ── 오른쪽 판: 지금까지의 여행 ─────────────────────────────────── */

/** 판의 한 줄 — 질문 한두 개를 모아 적는다. to: 눌렀을 때 고치러 가는 질문, steps: 이 줄에 적히는 질문들 */
type Line = { key: string; label: string; value: string | null; to: StepId; steps: StepId[] };

function panelLines(a: Answers, order: StepId[], step: StepId, reviewed: boolean, lang: Lang): Line[] {
  const t = (x: Text) => x[lang];
  const p = c.panel;
  const L = (key: string) => labelsOf(a, key).map(t);
  const id = (key: string) => a[key]?.[0];
  const join = (xs: (string | null | undefined | false | 0)[], sep = " · ") => xs.filter(Boolean).join(sep) || null;
  // 고르지 않아도 되는 질문을 지나왔으면 빈칸 대신 '—'
  const passed = (st: StepId) => reviewed || (order.includes(st) && order.indexOf(st) < order.indexOf(step));

  const must = L("must")[0];
  const [start, end] = a.dates ?? [];
  const known = (key: string) => (id(key) && id(key) !== "unknown" ? L(key)[0] : null);
  const n = Number(a.travelers?.[0] ?? 0);
  const spicy = L("spicy")[0];
  const needs = labelsOf({ ...a, needs: (a.needs ?? []).filter((x) => x !== "none") }, "needs").map(t);

  const lines: Line[] = [
    { key: "plan", label: t(p.plan), value: join([...L("mode"), ...L("vibe")]), to: "mode", steps: ["mode", "vibe"] },
    { key: "area", label: t(p.area), value: join([L("area").join(", "), ...L("famous"), ...L("era")]), to: "area", steps: ["area", "taste"] },
    {
      key: "interests", label: t(p.interests), to: "interests", steps: ["interests", "must"],
      value: join([must && `${must} (${t(p.top)})`, ...L("interests").filter((x) => x !== must)], ", "),
    },
    { key: "wish", label: t(p.wish), value: join([L("place")[0], L("foods").join(", ")]) ?? (passed("wish") ? "—" : null), to: "wish", steps: ["wish"] },
    {
      key: "dates", label: t(p.dates), to: "dates", steps: ["dates", "times"],
      value: start && end
        ? join([`${dayLabel(start, lang)} – ${dayLabel(end, lang)}`, p.days[lang](nights(start, end) + 1),
          known("arrive") && p.arrive[lang](known("arrive")!), known("leave") && p.leave[lang](known("leave")!)])
        : null,
    },
    {
      key: "who", label: t(p.who), to: "who", steps: ["who", "kids", "travelers"],
      value: join([L("who")[0], L("kids").join(", "), order.includes("travelers") && n ? c.travelersUnit[lang](n) : null]),
    },
    { key: "visited", label: t(p.visited), value: L("visited")[0] ?? null, to: "visited", steps: ["visited"] },
    { key: "stay", label: t(p.stay), value: join([L("stay")[0], L("stayArea")[0]]), to: "stay", steps: ["stay", "stayArea"] },
    { key: "budget", label: t(p.budget), value: L("budget")[0] ?? null, to: "budget", steps: ["budget"] },
    {
      key: "food", label: t(p.food), to: "food", steps: ["food", "needs", "allergy"],
      value: join([L("adventure")[0], spicy && `${t(p.spicy)}: ${lang === "en" ? spicy.toLowerCase() : spicy}`, ...needs, ...L("allergy")]),
    },
    { key: "pace", label: t(p.pace), value: L("pace")[0] ?? null, to: "pace", steps: ["pace"] },
    { key: "avoid", label: t(p.avoid), value: join(L("avoid"), ", ") ?? (passed("avoid") ? "—" : null), to: "avoid", steps: ["avoid"] },
  ];

  if (id("mode") === "detail") {
    const transport = L("transport")[0];
    lines.push({
      key: "detail", label: t(p.detail), to: "hours", steps: ["hours", "move", "airport", "hanbok", "buy"],
      value: join([
        L("start")[0] && L("end")[0] && `${L("start")[0]} → ${L("end")[0]}`,
        transport && (id("subway") === "new" ? `${transport} (${t(p.subwayNew)})` : transport),
        known("airport") && join([known("airport"), L("ride")[0]], " → "),
        id("hanbok") === "yes" && t(p.hanbok),
        L("buy").join(", "),
      ]),
    });
  }
  return lines;
}

function TripPanel({ variant = "aside", answers, step, order, lang, reviewed, canGo, onEdit }: {
  variant?: "aside" | "inline";
  answers: Answers; step: StepId; order: StepId[]; lang: Lang; reviewed: boolean;
  canGo: (to: StepId) => boolean; onEdit?: (to: StepId) => void;
}) {
  const t = (x: Text) => x[lang];
  const p = c.panel;
  const lines = panelLines(answers, order, step, reviewed, lang);
  const photos = postcardPhotos(answers);

  return (
    <Frame variant={variant} className={variant === "inline" ? s.reviewInline : `${s.panel} ${step === "review" ? s.panelOnReview : ""}`} label={t(p.title)}>
      <p className={s.panelTitle}>{t(p.title)}</p>
      {/* 고른 동네의 장면만 번갈아, 고르기 전에는 서울 12곳을 차례로 (flow.ts postcardPhotos).
          고른 동네가 바뀌면 첫 장부터 — key 로 새로 그린다 */}
      {variant === "aside" && <Postcard key={photos.join("|")} photos={photos} lang={lang} label={t(p.place)} />}
      <ol className={s.timeline}>
        {lines.map((l) => {
          const done = l.value !== null;
          const current = l.steps.includes(step);
          const editable = done && onEdit && l.to !== step && canGo(l.to);
          return (
            <li key={l.key} className={`${s.line} ${done ? s.done : ""} ${current ? s.current : ""}`} aria-current={current ? "step" : undefined}>
              <span className={s.lineLabel}>{l.label}</span>
              {done && (
                editable ? (
                  <button key={l.value} type="button" className={s.lineValue} onClick={() => onEdit!(l.to)}>
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
