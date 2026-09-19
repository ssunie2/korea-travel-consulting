"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DayPattern from "@/components/DayPattern";
import { CITIES, choicesFor, flowReducer, INITIAL_STATE, selectedTrip, stepOrder } from "./flow";
import styles from "./beta.module.css";

export default function BetaFlow() {
  const [state, dispatch] = useReducer(flowReducer, INITIAL_STATE);
  const [pending, setPending] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locked = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const trip = selectedTrip(state.answers);
  const order = stepOrder(state.answers);
  const index = order.indexOf(state.step);
  const finished = state.step === "summary";
  const options = choicesFor(state);
  const photoChoices = state.step === "experience" && trip.city?.id === "seoul";

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [state.step]);

  function choose(value: string) {
    if (locked.current) return;
    locked.current = true;
    setPending(value);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => {
      dispatch({ type: "choose", value });
      setPending(null);
      locked.current = false;
    }, reducedMotion ? 0 : 320);
  }

  const title = {
    city: <>어떤 한국이<br /><em>끌리세요?</em></>,
    experience: <>{trip.city?.title}에서는<br /><em>뭘 해볼까요?</em></>,
    detail: trip.experience?.question,
    company: <>이 장면을<br /><em>누구와 나눌까요?</em></>,
    children: <>아이의 눈높이로<br /><em>한 번 더 골라볼까요?</em></>,
    pace: <>이번 여행은<br /><em>어떤 속도로?</em></>,
    summary: <>조금씩 보이네요.<br /><em>당신이 좋아할 여행.</em></>,
  }[state.step];
  const subtitle = {
    city: "우선, 가장 마음이 가는 도시 하나부터 골라보세요.",
    experience: "다 하고 싶어도 괜찮아요. 지금 가장 끌리는 것 하나만.",
    detail: "같은 취향도 즐기는 방식은 다르니까요.",
    company: `${trip.detail?.title ?? "마음에 드는 장면"}, 함께할 사람을 떠올려 보세요.`,
    children: "아이와 함께를 고르셨네요. 편안하게 즐길 수 있도록요.",
    pace: "여행에도 나에게 맞는 리듬이 있어요.",
    summary: "방금 고른 장면들을 한곳에 모았어요.",
  }[state.step];

  const crumbs = [trip.city, trip.experience, trip.detail].filter((item) => item !== undefined);
  const heroPhoto = !trip.city || trip.city.id === "seoul" ? (trip.experience?.image ?? "/landing/namsan.webp") : null;

  return (
    <div className={styles.shell} lang="ko">
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>mohallae</Link>
        <span className={styles.beta}>새로운 여행의 시작 <span>베타</span></span>
        <Link href="/plan" target="_blank" rel="noopener noreferrer" className={styles.original}>
          기존 입력 화면 <span aria-hidden="true">↗</span><span className={styles.srOnly}> (새 창)</span>
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.topline}>
          <p className={styles.kicker}>{finished ? "나의 여행 취향" : "한 번에 하나, 마음 가는 대로"}</p>
          <span className={styles.counter}>{finished ? "선택 완료" : `${String(index + 1).padStart(2, "0")} / ${String(order.length - 1).padStart(2, "0")}`}</span>
        </div>
        <div className={styles.progress} role="progressbar" aria-label="여행 취향 선택 진행" aria-valuemin={0} aria-valuemax={order.length - 1} aria-valuenow={index}>
          <span style={{ width: `${(index / (order.length - 1)) * 100}%` }} />
        </div>

        <div className={styles.layout}>
          <section key={state.step} className={styles.section} aria-labelledby="beta-question">
            {crumbs.length > 0 && <p className={styles.breadcrumb}>{crumbs.slice(0, state.step === "experience" ? 1 : 2).map((item) => item.title).join(" · ")}</p>}
            <h1 id="beta-question" tabIndex={-1} ref={heading} className={`${styles.title} ${state.step === "detail" ? styles.detailTitle : ""}`}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>

            {finished ? (
              <div className={styles.summary}>
                <p className={styles.summaryLabel}>나만의 여행 조각</p>
                <dl>
                  {[
                    ["도시", trip.city?.title], ["즐길 거리", trip.experience?.title],
                    ["끌리는 장면", trip.detail?.title], ["함께", trip.company?.title],
                    ...(trip.children ? [["아이의 눈높이", trip.children.title]] : []),
                    ["여행의 속도", trip.pace?.title],
                  ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
                </dl>
                <p className={styles.disclaimer}>선택 흐름을 체험하는 베타예요. 실제 일정 생성·예약·결제는 진행되지 않으며, 선택은 서버에 저장되지 않습니다.</p>
                <button type="button" className={styles.restart} onClick={() => dispatch({ type: "reset" })}>다른 여행도 골라볼래요 <span aria-hidden="true">↗</span></button>
              </div>
            ) : (
              <>
                <p className={styles.instruction} id="choice-hint">하나를 고르면 다음 이야기로 넘어가요.</p>
                <div className={`${styles.choices} ${photoChoices ? styles.photoChoices : ""} ${state.step === "detail" || state.step === "pace" || state.step === "children" ? styles.stacked : ""}`} role="group" aria-labelledby="beta-question" aria-describedby="choice-hint" aria-busy={pending !== null}>
                  {options.map((option, i) => {
                    const photo = photoChoices ? trip.city?.experiences.find((item) => item.id === option.id)?.image : null;
                    const selected = pending === option.id || (pending === null && state.step !== "summary" && state.answers[state.step] === option.id);
                    return (
                      <button type="button" key={option.id} className={`${styles.choice} ${photo ? styles.photoChoice : ""} ${selected ? styles.selected : ""}`} aria-pressed={selected} aria-disabled={pending !== null} onClick={() => choose(option.id)}>
                        {photo && <span className={styles.cardPhoto}><Image src={photo} alt="" fill sizes="(max-width: 600px) 45vw, 320px" unoptimized /></span>}
                        <span className={styles.choiceContent}>
                          <span className={styles.choiceTop}>
                            <span className={styles.number}>{state.step === "city" ? CITIES[i].english : String(i + 1).padStart(2, "0")}</span>
                            <span className={styles.arrow} aria-hidden="true">{selected ? "✓" : "↗"}</span>
                          </span>
                          <span className={styles.choiceTitle}>{option.title}</span>
                          <span className={styles.choiceDescription}>{option.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className={styles.navigation}>
              {index > 0 ? <button type="button" disabled={pending !== null} onClick={() => dispatch({ type: "back" })}>← 이전 선택</button> : <span>베타에서는 네 도시를 먼저 만나볼 수 있어요.</span>}
              {index > 0 && <span>마음이 바뀌어도 괜찮아요.</span>}
            </div>
          </section>

          <aside className={styles.aside} aria-label="여행 분위기 미리보기">
            <div className={styles.postcard}>
              {heroPhoto ? <Image key={heroPhoto} src={heroPhoto} alt={trip.experience ? `${trip.city?.title} · ${trip.experience.title} 분위기 사진` : "서울 남산에서 바라본 도시 풍경"} fill sizes="(max-width: 900px) 1px, 420px" unoptimized /> : <div className={styles.cityArt}><span className={styles.cityEnglish}>{trip.city?.english}</span><DayPattern day={CITIES.findIndex((city) => city.id === trip.city?.id) + 1} /><span className={styles.cityName}>{trip.city?.title}</span></div>}
              <div className={styles.postcardShade} />
              <span className={styles.postcardStamp}>모할래<br /><span>여행 조각 01</span></span>
              <div className={styles.postcardCaption}>
                <span>{trip.city?.english ?? "SEOUL"}</span>
                <p>{trip.detail?.title ?? trip.experience?.title ?? (trip.city ? trip.city.description : <>계획보다 먼저,<br />설레는 장면 하나.</>)}</p>
              </div>
            </div>
            <div className={styles.asideNote}><span aria-hidden="true">✳</span><p>{finished ? "좋아하는 장면이 모이면, 나다운 여행의 방향이 보여요." : "정답은 없어요. 지금 마음이 가는 쪽을 골라주세요."}</p></div>
          </aside>
        </div>
      </main>
      <footer className={styles.footer}><span>mohallae · 취향으로 시작하는 한국 여행</span><span>체험용 베타 · 실제 일정 생성 없음</span></footer>
      <noscript><p className={styles.noScript}>이 베타는 자바스크립트를 켜야 선택할 수 있어요. <Link href="/plan">기존 입력 화면 보기</Link></p></noscript>
    </div>
  );
}
