import Link from "next/link";
import styles from "../mohallae.module.css";
import { ask, footer, nav, planHref, plans, steps, withLang, type Lang } from "../content";

/** 무료 초안 vs 전체 일정 ($25). 시안 ③ 아래쪽의 두 카드 자리 — 글은 실제 문구로 바꿨다. */
export function Plans({ lang }: { lang: Lang }) {
  return (
    <section aria-labelledby="plans-heading" className="mt-20 bg-[var(--m-band)] py-16 md:mt-24 md:py-20">
      <div className={styles.wrap}>
        <h2 id="plans-heading" className="text-[clamp(26px,2.4vw,34px)] leading-tight font-bold tracking-[-0.015em]">
          {plans.heading[lang]}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-6">
          <article className={`${styles.panel} flex flex-col p-6 md:p-8`}>
            <h3 className="text-[22px] font-bold tracking-[-0.01em]">
              {plans.free.name[lang]} <span className="font-semibold text-[var(--m-ink-3)]">· {plans.free.price}</span>
            </h3>
            <CheckList items={plans.free.items[lang]} />
            <div className="mt-auto pt-7">
              <Link href={planHref(lang)} className={`${styles.pillDark} h-[48px] px-7 text-[16px]`}>
                {nav.cta[lang]}
              </Link>
            </div>
          </article>
          <article className={`${styles.panel} flex flex-col p-6 md:p-8`}>
            <h3 className="text-[22px] font-bold tracking-[-0.01em]">
              {plans.full.name[lang]} <span className="font-semibold text-[var(--m-ink-3)]">· {plans.full.price}</span>
            </h3>
            <p className="mt-1 text-[14.5px] text-[var(--m-ink-2)]">{plans.full.priceNote[lang]}</p>
            <CheckList items={plans.full.items[lang]} />
            <p className="mt-auto pt-7 text-[15px] leading-relaxed text-[var(--m-ink-2)]">{plans.full.how[lang]}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[15.5px] leading-snug">
          <svg viewBox="0 0 20 20" aria-hidden="true" className="mt-[2px] size-[18px] shrink-0 text-[var(--m-ink)]">
            <path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** 이용 방법 3단계. 기존 랜딩의 steps 글 그대로 — 두 도막으로 나눠 든 것도 그대로 따른다. */
export function HowItWorks({ lang }: { lang: Lang }) {
  return (
    <section id="how" aria-labelledby="how-heading" className="scroll-mt-6 py-16 md:py-24">
      <div className={styles.wrap}>
        <h2 id="how-heading" className="text-[clamp(26px,2.4vw,34px)] leading-tight font-bold tracking-[-0.015em]">
          {nav.how[lang]}
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((s, i) => (
            <li key={i} className="border-t border-[var(--m-line)] pt-6">
              <h3 className="text-[20px] leading-snug font-bold tracking-[-0.01em]">
                <span className="mr-2 text-[var(--m-ink-3)] tabular-nums">{i + 1}</span>
                {s.title[lang]}
              </h3>
              <p className="mt-2.5 text-[15.5px] leading-relaxed text-[var(--m-ink-2)]">
                {s.body[lang][0]} {s.body[lang][1]}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** 먼저 물어보고 싶은 사람에게 — 자주 묻는 것 / 문의 화면으로. 마지막 버튼. */
export function Ask({ lang }: { lang: Lang }) {
  return (
    <section aria-label={ask.question[lang]} className="pb-20 md:pb-28">
      <div className={`${styles.wrap} flex flex-col items-start gap-6 rounded-[var(--m-radius)] bg-[var(--m-band)] p-7 md:flex-row md:items-center md:justify-between md:p-10`}>
        <div>
          <p className="text-[20px] leading-snug font-bold tracking-[-0.01em]">{ask.question[lang]}</p>
          <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[15.5px] text-[var(--m-ink-2)]">
            <Link href={withLang("/mohallae/faq", lang)} className={styles.textLink}>
              {ask.faq[lang]}
            </Link>
            <Link href="/contact" className={styles.textLink}>
              {ask.contact[lang]}
            </Link>
          </p>
        </div>
        <Link href={planHref(lang)} className={`${styles.pillDark} h-[50px] shrink-0 px-8 text-[16.5px]`}>
          {ask.cta[lang]}
        </Link>
      </div>
    </section>
  );
}

export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t border-[var(--m-line)]">
      <div className={`${styles.wrap} flex flex-col gap-3 py-8 text-[13.5px] text-[var(--m-ink-3)] sm:flex-row sm:items-center sm:justify-between`}>
        <p className="flex items-baseline gap-3">
          <span className="text-[18px] font-bold tracking-[-0.03em] text-[var(--m-ink)] lowercase">mohallae</span>
          <span>{footer.tagline}</span>
        </p>
        <p className="flex items-center gap-5">
          <span>{footer.place[lang]}</span>
          <Link href={withLang("/mohallae/faq", lang)} className={styles.textLink}>
            {footer.faq[lang]}
          </Link>
          <Link href={withLang("/mohallae/privacy", lang)} className={styles.textLink}>
            {footer.privacy[lang]}
          </Link>
        </p>
      </div>
    </footer>
  );
}
