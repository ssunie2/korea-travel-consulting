import Link from "next/link";
import styles from "../mohallae.module.css";
import { footer, nav, planHref, withLang, type Lang } from "../content";
import { LangSwitch } from "./Hero";
import Wordmark from "./Wordmark";

/**
 * 작은 화면들(자주 묻는 것 · 개인정보 처리방침)의 위 막대.
 *
 * 랜딩 첫 화면의 내비를 흰 막대로 옮긴 것이다. 여기엔 사진이 없어서 글자를 잉크색으로 바꾸고
 * 아래에 얇은 줄을 긋는다. 글자 크기·간격·폰에서 숨기는 것은 랜딩 내비(Hero.tsx)와 같게 둔다.
 *
 * path — 지금 화면의 주소. 언어 단추는 이 주소에서 `?lang=` 만 바꾸고,
 * 자주 묻는 것 화면이면 그 메뉴에 '지금 여기' 표시(aria-current)를 단다.
 */
export default function SubHeader({ lang, path }: { lang: Lang; path: string }) {
  const link = `${styles.navLink} ${styles.navLinkDark}`;
  return (
    <header className="border-b border-[var(--m-line)] bg-white">
      <nav
        aria-label={lang === "ko" ? "주 메뉴" : "Main"}
        className={`${styles.wrap} flex items-center justify-between gap-4 py-4 md:py-5`}
      >
        {/* 로고는 <a> — 첫 화면을 새로 불러와 모션이 처음부터 돈다 (써니 2026-11-14, Hero.tsx 와 같음) */}
        <div className="flex items-baseline gap-[14px]">
          <a
            href={withLang("/mohallae", lang)}
            className={`${link} md:ml-[10px]`}
          >
            <Wordmark className="h-[24px] md:h-[30px]" />
          </a>
          {/* 로고 오른쪽 문구 — 랜딩 머리줄과 같게 PC 에서만 (써니 2026-11-14) */}
          <span className="hidden -translate-y-px text-[13.5px] font-medium text-[var(--m-ink-3)] min-[1001px]:inline-block">{footer.tagline}</span>
        </div>

        <div className="flex items-center text-[13.5px] font-medium">
          <Link href={withLang("/mohallae", lang) + "#how"} className={`${link} hidden md:inline`}>
            {nav.how[lang]}
          </Link>
          <Link href={withLang("/mohallae", lang) + "#samples"} className={`${link} ml-[21px] hidden md:inline`}>
            {nav.samples[lang]}
          </Link>
          <Link
            href={withLang("/mohallae/faq", lang)}
            aria-current={path === "/mohallae/faq" ? "page" : undefined}
            className={`${link} ml-[20px] hidden md:inline`}
          >
            {nav.faq[lang]}
          </Link>
          <span className="md:ml-[27px]">
            <LangSwitch lang={lang} path={path} tone="dark" />
          </span>
          <Link
            href={planHref(lang)}
            className={`${styles.pillDark} ml-3 hidden h-[35px] px-[10.5px] text-[12px] sm:inline-flex md:ml-[22px]`}
          >
            {nav.cta[lang]}
          </Link>
        </div>
      </nav>
    </header>
  );
}
