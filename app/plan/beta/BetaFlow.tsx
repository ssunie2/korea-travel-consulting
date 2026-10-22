"use client";

import { useEffect, useReducer, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import DayPattern from "@/components/DayPattern";
import DateRangePicker from "@/components/DateRangePicker";
import { BUDGETS, CHILDREN, COMPANIONS, PACES, CITIES, choicesFor, flowReducer, INITIAL_STATE, isMultiple, selectedCities, stepContext, stepError, stepOrder } from "./flow";
import styles from "./beta.module.css";

export default function BetaFlow() {
  const [state, dispatch] = useReducer(flowReducer, INITIAL_STATE);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const trip = stepContext(state);
  const cities = selectedCities(state.answers);
  const values = state.answers[state.step] ?? [];
  const multiple = isMultiple(state.step);
  const error = stepError(state);
  const order = stepOrder(state.answers);
  const index = order.indexOf(state.step);
  const finished = state.step === "summary";
  const options = choicesFor(state);
  const photoChoices = trip.kind === "experience" && trip.city?.id === "seoul";
  const [start = "", end = ""] = state.answers.dates ?? [];
  const travelersTouched = Boolean(values[0]);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [state.step]);

  const title = {
    city: <>어떤 한국이<br /><em>끌리세요?</em></>,
    experience: <>{trip.city?.title}에서는<br /><em>뭘 해볼까요?</em></>,
    detail: trip.experience?.question,
    company: <>이 장면을<br /><em>누구와 나눌까요?</em></>,
    children: <>아이의 눈높이로<br /><em>한 번 더 골라볼까요?</em></>,
    pace: <>이번 여행은<br /><em>어떤 속도로?</em></>,
    dates: <>설레는 여행,<br /><em>언제 떠날까요?</em></>,
    travelers: <>이번 여행은<br /><em>모두 몇 명인가요?</em></>,
    budget: <>여행에 쓸 예산은<br /><em>어느 정도인가요?</em></>,
    summary: <>조금씩 보이네요.<br /><em>당신이 좋아할 여행.</em></>,
  }[trip.kind];
  const subtitle = {
    city: "마음이 가는 도시를 모두 골라보세요. 방문 순서는 나중에 정해도 돼요.",
    experience: "해보고 싶은 건 하나가 아니어도 좋아요. 끌리는 것들을 골라주세요.",
    detail: "같은 취향도 즐기는 방식은 다르니까요. 마음에 드는 장면을 모두 골라보세요.",
    company: "방금 고른 장면을 함께할 사람을 떠올려 보세요.",
    children: "아이와 함께를 고르셨네요. 편안하게 즐길 수 있도록요.",
    pace: "여행에도 나에게 맞는 리듬이 있어요.",
    dates: "가는 날과 오는 날을 골라주세요. 최대 30일의 여행을 그려볼 수 있어요.",
    travelers: "본인과 함께 여행하는 사람을 모두 포함해 주세요. 아이도 한 명으로 세어요.",
    budget: "한 사람의 여행 전체 예산이에요. 항공권은 빼고, 숙박·교통·식비·즐길 거리를 포함해 주세요.",
    summary: "방금 고른 장면들을 한곳에 모았어요.",
  }[trip.kind];

  const crumbs = trip.kind === "experience" || trip.kind === "detail" ? [trip.city?.title, trip.experience?.title].filter(Boolean).join(" · ") : cities.map((city) => city.title).join(" · ");
  const heroPhoto = !trip.city || trip.city.id === "seoul" ? (trip.experience?.image ?? "/landing/namsan.webp") : null;
  const summaryRows = [
    ...cities.map((city) => [
      city.title, city.experiences.filter((item) => state.answers[`experience:${city.id}`]?.includes(item.id)).map((experience) => `${experience.title}: ${experience.details.filter((detail) => state.answers[`detail:${city.id}:${experience.id}`]?.includes(detail.id)).map((detail) => detail.title).join(" · ")}`).join("\n"),
    ]),
    ["함께", COMPANIONS.find((item) => item.id === state.answers.company?.[0])?.title],
    ...(state.answers.company?.[0] === "children" ? [["아이의 눈높이", CHILDREN.find((item) => item.id === state.answers.children?.[0])?.title]] : []),
    ["여행의 속도", PACES.find((item) => item.id === state.answers.pace?.[0])?.title],
    ["여행 날짜", `${start} → ${end}`],
    ["인원", `${state.answers.travelers?.[0]}명`],
    ["1인 전체 예산", BUDGETS.find((item) => item.id === state.answers.budget?.[0])?.title],
  ];

  return (
    <div className={styles.shell} lang="ko">
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>mohallae</Link>
        <span className={styles.beta}>새로운 여행의 시작 <span>베타</span></span>
      </header>

      <main className={styles.main}>
        <div className={styles.topline}>
          <p className={styles.kicker}>{finished ? "나의 여행 취향" : "질문은 하나씩, 선택은 마음 가는 대로"}</p>
          <span className={styles.counter}>{finished ? "선택 완료" : `${String(index + 1).padStart(2, "0")} / ${String(order.length - 1).padStart(2, "0")}`}</span>
        </div>
        <div className={styles.progress} role="progressbar" aria-label="여행 취향 선택 진행" aria-valuemin={0} aria-valuemax={order.length - 1} aria-valuenow={index}>
          <span style={{ width: `${(index / (order.length - 1)) * 100}%` }} />
        </div>

        <div className={styles.layout}>
          <section key={state.step} className={styles.section} aria-labelledby="beta-question">
            {state.step !== "city" && crumbs && <p className={styles.breadcrumb}>{crumbs}</p>}
            <h1 id="beta-question" tabIndex={-1} ref={heading} className={`${styles.title} ${trip.kind === "detail" ? styles.detailTitle : ""}`}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>

            {finished ? (
              <div className={styles.summary}>
                <p className={styles.summaryLabel}>나만의 여행 조각</p>
                <dl>
                  {summaryRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
                </dl>
                <p className={styles.disclaimer}>선택 흐름을 체험하는 베타예요. 실제 일정 생성·예약·결제는 진행되지 않으며, 선택은 서버에 저장되지 않습니다.</p>
                <button type="button" className={styles.restart} onClick={() => dispatch({ type: "reset" })}>다른 여행도 골라볼래요 <span aria-hidden="true">↗</span></button>
              </div>
            ) : (
              <>
                <p className={styles.instruction} id="choice-hint">{state.step === "dates" || state.step === "travelers" ? "입력한 뒤 ‘다음’을 눌러주세요." : multiple ? "여러 개 골라도 좋아요. 고른 뒤 ‘다음’을 눌러주세요." : state.step === "budget" ? "하나를 고른 뒤 ‘선택 모아보기’를 눌러주세요." : "하나를 고른 뒤 ‘다음’을 눌러주세요."}</p>
                {state.step === "dates" ? (
                  <div className={styles.calendar}>
                    <DateRangePicker start={start || null} end={end || null} onChange={(value) => dispatch({ type: "input", values: [value.start ?? "", value.end ?? ""] })} />
                    {start && end && error && <p className={styles.inputError} role="alert">{error}</p>}
                  </div>
                ) : state.step === "travelers" ? (
                  <div className={styles.fields}>
                    <label>여행 인원<input type="number" min={1} max={20} step={1} inputMode="numeric" placeholder="예: 2" aria-invalid={travelersTouched && Boolean(error)} aria-describedby="input-status" value={values[0] ?? ""} onChange={(event) => dispatch({ type: "input", values: [event.target.value] })} /></label>
                    <p id="input-status" className={error && travelersTouched ? styles.inputError : styles.inputHint} aria-live="polite">{error && travelersTouched ? error : "본인 포함 · 1명부터 20명까지"}</p>
                  </div>
                ) : <div className={`${styles.choices} ${trip.kind === "detail" || state.step === "pace" || state.step === "children" ? styles.stacked : ""}`} role="group" aria-labelledby="beta-question" aria-describedby="choice-hint">
                  {options.map((option, i) => {
                    const photo = photoChoices ? trip.city?.experiences.find((item) => item.id === option.id)?.image : null;
                    const selected = values.includes(option.id);
                    return (
                      <button type="button" key={option.id} className={`${styles.choice} ${photo ? styles.photoChoice : ""} ${selected ? styles.selected : ""}`} aria-pressed={selected} onClick={() => dispatch({ type: "choose", value: option.id })}>
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
                </div>}
                {options.length > 0 && <p className={styles.selectionCount} aria-live="polite">{values.length ? (multiple ? `${values.length}개 골랐어요 · 다시 누르면 선택이 풀려요.` : "골랐어요. 다음 이야기로 가볼까요?") : "아직 고르지 않았어요."}</p>}
              </>
            )}

            <div className={styles.navigation}>
              {index > 0 ? <button type="button" onClick={() => dispatch({ type: "back" })}>← 이전 선택</button> : <span>베타에서는 네 도시를 먼저 만나볼 수 있어요.</span>}
              {!finished && <button type="button" className={styles.next} disabled={Boolean(error)} onClick={() => dispatch({ type: "next", from: state.step })}>{state.step === "budget" ? "선택 모아보기" : "다음"} <span aria-hidden="true">→</span></button>}
            </div>
          </section>

          <aside className={styles.aside} aria-label="여행 분위기 미리보기">
            <div className={styles.postcard}>
              {heroPhoto ? <Image key={heroPhoto} src={heroPhoto} alt={trip.experience ? `${trip.city?.title} · ${trip.experience.title} 분위기 사진` : "서울 남산에서 바라본 도시 풍경"} fill sizes="(max-width: 900px) 1px, 420px" unoptimized /> : <div className={styles.cityArt}><span className={styles.cityEnglish}>{trip.city?.english}</span><DayPattern day={CITIES.findIndex((city) => city.id === trip.city?.id) + 1} /><span className={styles.cityName}>{trip.city?.title}</span></div>}
              <div className={styles.postcardShade} />
              <span className={styles.postcardStamp}>모할래<br /><span>여행 조각 01</span></span>
              <div className={styles.postcardCaption}>
                <span>{trip.city?.english ?? "SEOUL"}</span>
                <p>{trip.experience?.title ?? (trip.city ? trip.city.description : <>계획보다 먼저,<br />설레는 장면 하나.</>)}</p>
              </div>
            </div>
            <div className={styles.asideNote}><span aria-hidden="true">✳</span><p>{finished ? "좋아하는 장면이 모이면, 나다운 여행의 방향이 보여요." : "정답은 없어요. 지금 마음이 가는 쪽을 골라주세요."}</p></div>
          </aside>
        </div>
      </main>
      <footer className={styles.footer}><span>mohallae · 취향으로 시작하는 한국 여행</span><span>체험용 베타 · 실제 일정 생성 없음</span></footer>
      <noscript><p className={styles.noScript}>이 베타는 자바스크립트를 켜야 선택할 수 있어요.</p></noscript>
    </div>
  );
}
