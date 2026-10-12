import Image from "next/image";
import Link from "next/link";
import styles from "../mohallae.module.css";
import { hero, nav, planHref, type Lang } from "../content";
import heroPhoto from "@/public/mohallae/hero-bukchon.jpg";
import CorrectionStrip from "./CorrectionStrip";

/**
 * 첫 화면 (승인한 시안 ②).
 *
 * 화면 높이의 약 70%를 북촌 사진이 채우고, 그 위에 투명 내비 · 가운데 두 줄 제목 ·
 * 고쳐 쓰기 띠 · 흰 알약 버튼 · 작은 안내가 차례로 놓인다. 아래로 샘플 카드가 살짝 보인다.
 *
 * 사진은 Higgsfield 로 시안을 참고해 새로 만든 것이다 (AI 이미지 — 파일 안에 만든 방법이 적혀 있다).
 */
export default function Hero({ lang }: { lang: Lang }) {
  return (
    <header className={styles.hero}>
      <Image
        src={heroPhoto}
        alt={hero.imageAlt[lang]}
        fill
        preload
        placeholder="blur"
        sizes="100vw"
        className={styles.heroImg}
      />
      <div className={styles.heroScrim} aria-hidden="true" />

      <nav
        aria-label={lang === "ko" ? "주 메뉴" : "Main"}
        className={`${styles.wrap} ${styles.heroNav} flex items-center justify-between gap-4 pt-4 md:pt-5`}
      >
        <Link
          href={`/mohallae${lang === "en" ? "?lang=en" : ""}`}
          className={`${styles.navLink} text-[27px] leading-none font-bold tracking-[-0.035em] lowercase md:ml-[10px] md:text-[34px]`}
        >
          mohallae
        </Link>

        {/* 간격은 시안 그대로: 링크 사이 21·20, 언어 앞 27, 버튼 앞 22 (화면 폭 1344 기준) */}
        <div className="flex items-center text-[13.5px] font-medium">
          <a href="#how" className={`${styles.navLink} hidden md:inline`}>
            {nav.how[lang]}
          </a>
          <a href="#samples" className={`${styles.navLink} ml-[21px] hidden md:inline`}>
            {nav.samples[lang]}
          </a>
          <Link href="/faq" className={`${styles.navLink} ml-[20px] hidden md:inline`}>
            {nav.faq[lang]}
          </Link>
          <span className="md:ml-[27px]">
            <LangSwitch lang={lang} />
          </span>
          <Link
            href={planHref(lang)}
            className={`${styles.pillLight} ml-3 hidden h-[35px] px-[10.5px] text-[12px] sm:inline-flex md:ml-[22px]`}
          >
            {nav.cta[lang]}
          </Link>
        </div>
      </nav>

      <div className={`${styles.wrap} flex flex-1 flex-col items-center justify-center pt-10 pb-14 text-center md:pt-[9.45svh] md:pb-[6svh]`}>
        {/* 한국어는 폰에서도 "한국에 아는 사람 / 있는 것처럼 여행하세요." 에서 끊는다. 영어는 폰에서 자연스럽게 감긴다 */}
        <h1
          className={`${styles.headline} text-[clamp(28px,7.7vw,36px)] leading-[1.1] font-extrabold tracking-[-0.02em] [text-wrap:balance] sm:text-[clamp(36px,4.02vw,62px)] sm:leading-[1.07]`}
        >
          {hero.headline[lang][0]}
          <br className={lang === "ko" ? undefined : "hidden sm:inline"} /> {hero.headline[lang][1]}
        </h1>

        <div className="mt-6 flex w-full justify-center md:mt-[29px]">
          <CorrectionStrip lang={lang} />
        </div>

        <Link
          href={planHref(lang)}
          className={`${styles.pillLight} ${styles.pillHero} mt-[22px] h-[50px] px-8 text-[17px]`}
        >
          {nav.cta[lang]}
        </Link>
        <p className={`${styles.heroNote} mt-2.5 text-[12px] font-medium text-white/95`}>
          {hero.note[lang][0]}
          <span aria-hidden="true" className="mx-1">
            ·
          </span>
          {hero.note[lang][1]}
        </p>
      </div>
    </header>
  );
}

/** EN | 한국어. 주소 끝 `?lang=` 만 바꾼다. 지금 고른 쪽은 굵게, 다른 쪽은 흐리게. */
function LangSwitch({ lang }: { lang: Lang }) {
  const item = (code: Lang, label: string, hrefLang: string) => (
    <Link
      href={code === "en" ? "/mohallae?lang=en" : "/mohallae?lang=ko"}
      hrefLang={hrefLang}
      lang={hrefLang}
      aria-current={lang === code ? "true" : undefined}
      className={`${styles.navLink} ${lang === code ? "font-semibold text-white" : "text-white/70"}`}
    >
      {label}
    </Link>
  );
  return (
    <span className="flex items-center gap-1.5" role="group" aria-label={nav.langLabel[lang]}>
      {item("en", "EN", "en")}
      <span aria-hidden="true" className="text-white/60">
        |
      </span>
      {item("ko", "한국어", "ko")}
    </span>
  );
}
