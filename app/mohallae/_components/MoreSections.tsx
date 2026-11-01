import Link from "next/link";
import base from "../mohallae.module.css";
import styles from "../landing.module.css";
import { ask, footer, nav, planHref, plans, steps, withLang, type Lang } from "../content";

const Check = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 무료 vs 원하는 날만 열기 (시안 21-5). 값은 기획 문서 그대로 — 첫 번째 날 $25 · 2–4번째 $15 · 5번째부터 $10 */
export function Plans({ lang }: { lang: Lang }) {
  const { free, days } = plans;
  return (
    <section aria-labelledby="plans-heading" className={styles.wrap}>
      <div className={styles.sh}>
        <h2 id="plans-heading" className={styles.h2}>
          {plans.heading[lang]}
        </h2>
      </div>
      <div className={styles.grid}>
        <article className={`${styles.t} ${styles.tPlan}`}>
          <h3>
            {free.name[lang]} <span className={styles.price}>{free.price}</span>
          </h3>
          <ul className={styles.checks}>
            {free.items[lang].map((item) => (
              <li key={item}>
                <Check />
                {item}
              </li>
            ))}
          </ul>
          <div className={styles.pfoot}>
            <Link href={planHref(lang)} className={`${styles.btn} ${styles.btnAcc} ${styles.btnLg}`}>
              {nav.cta[lang]}
            </Link>
          </div>
        </article>
        <article className={`${styles.t} ${styles.tInk} ${styles.tPlan}`}>
          <LaunchHead lang={lang} />
          <ul className={styles.ladder}>
            {days.ladder[lang].map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
          <p className={styles.pnote}>{days.example[lang]}</p>
          <ul className={styles.checks}>
            {days.items[lang].map((item) => (
              <li key={item}>
                <Check />
                {item}
              </li>
            ))}
          </ul>
          <div className={styles.pfoot}>
            <p>{days.how[lang]}</p>
          </div>
        </article>
      </div>
    </section>
  );
}

/** 출시 기념가 끝나는 날까지 남은 날 (서울 0시 기준, 올림). 그날이 지났으면 null */
function launchDaysLeft(ends: string): number | null {
  const ms = Date.parse(`${ends}T00:00:00+09:00`) - Date.now();
  return ms > 0 ? Math.ceil(ms / 86_400_000) : null;
}

/**
 * '원하는 날만 열기' 칸 머리 — 출시 기념가 (써니 2026-11-01 "더 임팩트 있게").
 * 위: 주황 '출시 기념가' 표 + 남은 날(D-30). 아래: 지금 $25부터 → 12월 1일부터 첫날 $40.
 * 지금 값에 줄을 긋지 않는다 — 받은 적 없는 값을 지운 값처럼 보이게 하지 않는다(표시광고법).
 * 끝나는 날이 지나면 기념가 표시는 사라지고 값만 남는다.
 * 움직임(CSS 스크롤 연동): $40 이 먼저 → 화살표 → 지금 $25 가 떠오르고 → 표와 D-day 가 톡.
 */
function LaunchHead({ lang }: { lang: Lang }) {
  const { days } = plans;
  const { launch } = days;
  const left = launchDaysLeft(launch.ends);
  const price = (
    <span className={styles.price}>
      {lang === "en" && <small className={styles.before}>{days.from.en}</small>}
      {days.price}
      {lang === "ko" && <small className={styles.after}>{days.from.ko}</small>}
    </span>
  );
  if (left === null) {
    return (
      <h3>
        {days.name[lang]} {price}
      </h3>
    );
  }
  return (
    <div className={styles.planHead}>
      <p className={styles.launchBar}>
        <span className={styles.launchBadge}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 1.2 9.6 6.4 14.8 8 9.6 9.6 8 14.8 6.4 9.6 1.2 8 6.4 6.4z" fill="currentColor" />
          </svg>
          {launch.badge[lang]}
        </span>
        <span className={styles.launchCount}>{lang === "ko" ? `D-${left}` : `${left} days left`}</span>
      </p>
      <h3>{days.name[lang]}</h3>
      <div className={styles.launchPrices}>
        <p className={styles.launchNow}>
          <small>{launch.now[lang]}</small>
          {/* 영어는 'from' 을 위 작은 글씨(Now, from)로 올려 값 줄을 짧게 한다 */}
          <span className={styles.price}>
            {days.price}
            {lang === "ko" && <small className={styles.after}>{days.from.ko}</small>}
          </span>
        </p>
        <span className={styles.launchArrow} aria-hidden="true">
          <svg viewBox="0 0 40 16">
            <path d="M2 8h33M29 2.5 35.5 8 29 13.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className={styles.launchLater}>
          <small>{launch.later[lang]}</small>
          <b>{launch.laterPrice}</b>
        </p>
      </div>
    </div>
  );
}

/** 이용 방법 세 칸 + 먼저 물어보고 싶은 사람에게 (자주 묻는 것 / 문의) */
export function HowItWorks({ lang }: { lang: Lang }) {
  return (
    <section id="how" aria-labelledby="how-heading" className={styles.wrap}>
      <div className={styles.sh}>
        <h2 id="how-heading" className={styles.h2}>
          {nav.how[lang]}
        </h2>
      </div>
      <div className={styles.grid}>
        {steps.map((s, i) => (
          <div key={i} className={`${styles.t} ${styles.step}`}>
            <header>
              <span className={styles.icon} aria-hidden="true">
                {i + 1}
              </span>
              <span>MOHALLAE</span>
              <span>{s.tag[lang]}</span>
            </header>
            <h3>{s.title[lang]}</h3>
            <p>{s.body[lang]}</p>
          </div>
        ))}
        <Ask lang={lang} />
      </div>
    </section>
  );
}

function Ask({ lang }: { lang: Lang }) {
  return (
    <div className={`${styles.t} ${styles.tInk} ${styles.tAsk}`}>
      <div>
        <b>{ask.question[lang]}</b>
        <p className={styles.l2}>
          <Link href={withLang("/mohallae/faq", lang)}>{ask.faq[lang]}</Link>
          <Link href="/contact">{ask.contact[lang]}</Link>
        </p>
      </div>
      <Link href={planHref(lang)} className={`${styles.btn} ${styles.btnAcc} ${styles.btnLg}`}>
        {ask.cta[lang]}
      </Link>
    </div>
  );
}

/** 랜딩 꼬리말 (시안 21-5) */
export function LandingFooter({ lang }: { lang: Lang }) {
  return (
    <footer className={`${styles.wrap} ${styles.foot}`}>
      <p>
        <span className={styles.icon} aria-hidden="true">
          m
        </span>
        <b>mohallae</b>
        <span>{footer.tagline}</span>
      </p>
      <nav aria-label={lang === "ko" ? "꼬리말" : "Footer"}>
        <span>{footer.place[lang]}</span>
        <Link href={withLang("/mohallae/faq", lang)}>{footer.faq[lang]}</Link>
        <Link href={withLang("/mohallae/privacy", lang)}>{footer.privacy[lang]}</Link>
      </nav>
    </footer>
  );
}

/** 자주 묻는 것 · 개인정보 처리방침 화면의 꼬리말 (그 화면들은 아직 이전 모양) */
export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t border-[var(--m-line)]">
      <div className={`${base.wrap} flex flex-col gap-3 py-8 text-[13.5px] text-[var(--m-ink-3)] sm:flex-row sm:items-center sm:justify-between`}>
        <p className="flex items-baseline gap-3">
          <span className="text-[18px] font-bold tracking-[-0.03em] text-[var(--m-ink)] lowercase">mohallae</span>
          <span>{footer.tagline}</span>
        </p>
        <p className="flex items-center gap-5">
          <span>{footer.place[lang]}</span>
          <Link href={withLang("/mohallae/faq", lang)} className={base.textLink}>
            {footer.faq[lang]}
          </Link>
          <Link href={withLang("/mohallae/privacy", lang)} className={base.textLink}>
            {footer.privacy[lang]}
          </Link>
        </p>
      </div>
    </footer>
  );
}
