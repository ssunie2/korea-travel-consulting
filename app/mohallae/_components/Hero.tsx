import Image from "next/image";
import Link from "next/link";
import base from "../mohallae.module.css";
import styles from "../landing.module.css";
import { commonPlan, dayOne, dayPrice, hero, nav, planHref, tipLabel, withLang, type Lang } from "../content";
import { photo } from "../photos";

/**
 * 첫 화면 — 시안 21-5 '결과 미리보기' + 날짜별 가격 막대 (2026-10-20 써니 결정).
 *
 * 벤토 세 칸: 왼쪽 위 제목 · 버튼, 왼쪽 아래 날짜별 가격 막대, 오른쪽에 초안 결과 화면을 잠금 화면처럼 보여준다.
 * 잠금 화면에는 1일차 안 4개가 알림으로 오고, 그중 '보통' 안 하나만 무료로 열려 팁이 보인다(예시).
 * 움직임은 전부 CSS(landing.module.css) — 넓은 화면에서 칸이 펼쳐지고, 알림이 떨어지고, 아일랜드가 알린 뒤 안이 열린다.
 */
export default function Hero({ lang }: { lang: Lang }) {
  return (
    <header className={styles.wrap}>
      <nav aria-label={lang === "ko" ? "주 메뉴" : "Main"} className={styles.nav}>
        <Link href={withLang("/mohallae", lang)} className={styles.brand}>
          <span className={styles.icon} aria-hidden="true">
            m
          </span>
          mohallae
        </Link>
        <div className={styles.links}>
          <a href="#how">{nav.how[lang]}</a>
          <a href="#samples">{nav.samples[lang]}</a>
          <Link href={withLang("/mohallae/faq", lang)}>{nav.faq[lang]}</Link>
          <span className={styles.lang}>
            <LangSwitch lang={lang} path="/mohallae" tone="dark" />
          </span>
          <Link href={planHref(lang)} className={`${styles.btn} ${styles.btnSm}`}>
            {nav.cta[lang]}
          </Link>
        </div>
      </nav>

      <div className={`${styles.grid} ${styles.hero}`}>
        <div className={`${styles.t} ${styles.tHl}`}>
          <h1 className={styles.hl}>
            {hero.headline[lang].map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line.map((part, j) => (part.em ? <em key={j}>{part.text}</em> : <span key={j}>{part.text}</span>))}
              </span>
            ))}
          </h1>
          <div className={styles.cta}>
            <Link href={planHref(lang)} className={`${styles.btn} ${styles.btnAcc} ${styles.btnLg}`}>
              {nav.cta[lang]}
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <p className={styles.note}>{hero.note[lang]}</p>
          </div>
        </div>

        <ResultPreview lang={lang} />
        <DayPrice lang={lang} />
      </div>
    </header>
  );
}

const Lock = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <rect x="2" y="5.2" width="8" height="5.8" rx="1.4" fill="currentColor" />
    <path d="M3.8 5.2V3.9a2.2 2.2 0 0 1 4.4 0v1.3" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

/** 초안 결과 화면을 잠금 화면처럼 — 예시. 화면 낭독기에는 칸 전체를 한 문장(screenLabel)으로 읽어 준다 */
function ResultPreview({ lang }: { lang: Lang }) {
  const first = dayOne.stops[0];
  // 잠금화면 배경 — 사진 대장에서 이 자리에 정한 사진 (칸 전체를 한 문장으로 읽어 주므로 사진 alt 는 비운다)
  const wall = photo("hero.lock", lang);
  return (
    <div className={`${styles.t} ${styles.tLock}`} role="img" aria-label={dayOne.screenLabel[lang]}>
      <Image
        src={wall.src}
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        placeholder="blur"
        sizes="(min-width: 1001px) 40vw, 100vw"
        className={styles.lockImg}
        style={wall.position ? { objectPosition: wall.position } : undefined}
      />
      <span className={styles.sbar} aria-hidden="true">
        <svg viewBox="0 0 18 12">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 16 12">
          <path d="M8 11.6 5.6 9.2a3.4 3.4 0 0 1 4.8 0zM3.5 7.1a6.4 6.4 0 0 1 9 0l1.5-1.5a8.5 8.5 0 0 0-12 0zM.6 4.2a10.5 10.5 0 0 1 14.8 0L16 3.6A11.4 11.4 0 0 0 0 3.6z" />
        </svg>
        <svg viewBox="0 0 27 12">
          <rect x=".5" y=".5" width="22" height="11" rx="3.2" fill="none" stroke="#fff" strokeOpacity=".5" />
          <rect x="2" y="2" width="16" height="8" rx="2" />
          <rect x="24" y="4" width="2" height="4" rx="1" fillOpacity=".5" />
        </svg>
      </span>
      <span className={styles.island} aria-hidden="true">
        <span className={styles.act}>
          <span className={styles.icon}>m</span>
          <span>
            <b>{dayOne.opened[lang]}</b>
            <em>{dayOne.variants.find((v) => v.open)?.title[lang]}</em>
          </span>
          <span className={styles.now}>{dayOne.now[lang]}</span>
        </span>
      </span>
      <div className={styles.clock} aria-hidden="true">
        <small>{dayOne.date[lang]}</small>
        <b>{dayOne.day[lang]}</b>
      </div>
      <div className={styles.stack} aria-hidden="true">
        <span className={styles.pill}>
          <span className={styles.icon}>m</span>
          {dayOne.pill[lang]}
        </span>
        {dayOne.variants.map((v) => (
          <div key={v.title.ko} className={`${styles.vn} ${v.open ? styles.vnOpen : ""}`}>
            <header>
              <span className={styles.icon}>m</span>
              <span className={styles.bud}>{v.tier[lang]}</span>
              <b>{v.title[lang]}</b>
              <span className={styles.won}>{v.cost[lang]}</span>
            </header>
            <div className={styles.hidW}>
              <div>
                <div className={styles.hid}>
                  <Lock />
                  <i />
                  <i />
                </div>
              </div>
            </div>
            {v.open && first.plan && (
              <div className={styles.opnW}>
                <div>
                  <div className={styles.opn}>
                    <p className={styles.row1}>
                      <em>{dayOne.opened[lang]}</em>
                      <time>{first.time}</time>
                      {first.place[lang]}
                    </p>
                    <s>
                      {commonPlan[lang]}: {first.plan[lang]}
                    </s>
                    <div className={styles.tipb}>
                      <span>
                        <i className={styles.icon}>m</i>
                        {tipLabel[lang]}
                      </span>
                      <p>{(first.tipShort ?? first.tip)[lang]}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <span className={styles.lab} aria-hidden="true">
        <svg viewBox="0 0 12 12">
          <path d="M6 1.2 7.3 4.6 11 4.8 8.1 7.1 9.1 10.7 6 8.7 2.9 10.7 3.9 7.1 1 4.8 4.7 4.6z" fill="currentColor" />
        </svg>
        {dayOne.caption[lang]}
      </span>
      <div className={styles.lockBtns} aria-hidden="true">
        <span>
          <svg viewBox="0 0 20 20">
            <path d="M5.6 2.2h8.8v2.2L12.6 7H7.4L5.6 4.4z" fill="#fff" />
            <rect x="7.4" y="7.8" width="5.2" height="10" rx="1.4" fill="none" stroke="#fff" strokeWidth="1.5" />
            <circle cx="10" cy="11.6" r="1" fill="#fff" />
          </svg>
        </span>
        <span>
          <svg viewBox="0 0 20 20">
            <path
              d="M3 6.5A1.5 1.5 0 0 1 4.5 5h2l1.2-1.8h4.6L13.5 5h2A1.5 1.5 0 0 1 17 6.5v8A1.5 1.5 0 0 1 15.5 16h-11A1.5 1.5 0 0 1 3 14.5z"
              fill="none"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="10.5" r="3" fill="none" stroke="#fff" strokeWidth="1.6" />
          </svg>
        </span>
      </div>
      <span className={styles.homeBar} aria-hidden="true" />
    </div>
  );
}

/** 날짜별 가격 막대 — 같이 열수록 하루 값이 내려간다 */
function DayPrice({ lang }: { lang: Lang }) {
  return (
    <div className={`${styles.t} ${styles.tPrice}`}>
      <div>
        <p className={styles.pt}>{dayPrice.title[lang]}</p>
        <p className={styles.ps}>
          <span className={styles.nw}>{dayPrice.sub[lang][0]}</span> <span className={styles.nw}>{dayPrice.sub[lang][1]}</span>
        </p>
      </div>
      <ol className={styles.bars} aria-label={dayPrice.label[lang]}>
        {dayPrice.bars.map((bar) => (
          <li key={bar.label.ko}>
            <em>{bar.price}</em>
            <i style={{ height: bar.height }} />
            <small>{bar.label[lang]}</small>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * EN | 한국어. 지금 보는 주소(path)에서 끝의 `?lang=` 만 바꾼다. 지금 고른 쪽은 굵게, 다른 쪽은 흐리게.
 * tone — "light": 사진 위, 흰 글자. "dark": 흰 바탕 위(랜딩 내비의 흰 알약, 자주 묻는 것 등의 SubHeader), 잉크색 글자.
 */
export function LangSwitch({ lang, path, tone }: { lang: Lang; path: string; tone: "light" | "dark" }) {
  const look =
    tone === "light"
      ? { on: "font-semibold text-white", off: "text-white/70", bar: "text-white/60" }
      : {
          on: `${base.navLinkDark} font-semibold text-[var(--m-ink)]`,
          off: `${base.navLinkDark} text-[var(--m-ink-3)]`,
          bar: "text-[var(--m-ink-3)]/60",
        };
  const item = (code: Lang, label: string, hrefLang: string) => (
    <Link
      href={`${path}?lang=${code}`}
      hrefLang={hrefLang}
      lang={hrefLang}
      aria-current={lang === code ? "true" : undefined}
      className={`${base.navLink} ${lang === code ? look.on : look.off}`}
    >
      {label}
    </Link>
  );
  return (
    <span className="flex items-center gap-1.5" role="group" aria-label={nav.langLabel[lang]}>
      {item("en", "EN", "en")}
      <span aria-hidden="true" className={look.bar}>
        |
      </span>
      {item("ko", "한국어", "ko")}
    </span>
  );
}
