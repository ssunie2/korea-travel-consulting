import Image from "next/image";
import Link from "next/link";
import styles from "../landing.module.css";
import { dayOne, nav, planHref, samples, tipLabel, type Lang } from "../content";
import { photo } from "../photos";

const CARD_CLASS = [styles.s1, styles.s2, styles.s3, styles.s4];
const CARD_SIZES = [
  "(min-width: 1001px) 640px, 100vw",
  "(min-width: 1001px) 320px, (min-width: 641px) 33vw, 100vw",
  "(min-width: 1001px) 320px, (min-width: 641px) 33vw, 100vw",
  "(min-width: 1001px) 540px, (min-width: 641px) 33vw, 100vw",
];

/**
 * 두 번째 섹션 — "초안은 이렇게 생겼습니다" (시안 21-5 배치).
 * 위: 실제 샘플 초안 4개. 누르면 그 초안이 새 결과 화면(/mohallae/plan/[id])으로 열린다.
 * 아래 왼쪽: '1일차 · 안 4개' 예시 — 무료로 연 안 하나는 정거장·팁까지, 나머지 셋은 요약과 회색 줄만.
 * 아래 오른쪽: 네 번째 샘플 사진과 안내 칸.
 */
export default function Samples({ lang }: { lang: Lang }) {
  return (
    <section id="samples" aria-labelledby="samples-heading" className={styles.wrap}>
      <div className={styles.sh}>
        <h2 id="samples-heading" className={styles.h2}>
          {samples.heading[lang]}
        </h2>
      </div>
      <div className={styles.grid}>
        {samples.items.map((s, i) => {
          const card = photo(s.photo, lang);
          return (
          <Link
            key={s.id}
            href={`/mohallae/plan/${s.id}${lang === "en" ? "?lang=en" : ""}`}
            className={`${styles.t} ${styles.sample} ${CARD_CLASS[i]}`}
          >
            <Image
              src={card.src}
              alt={card.alt}
              fill
              placeholder="blur"
              sizes={CARD_SIZES[i]}
              style={card.position ? { objectPosition: card.position } : undefined}
            />
            <span className={styles.sampleTag}>
              {s.who[lang]}
              <span className="sr-only">
                {" — "}
                {s.title[lang]}. {samples.open[lang]}
              </span>
              <svg viewBox="0 0 18 18" aria-hidden="true">
                <path d="M6.5 3.5 12 9l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
          );
        })}

        <div className={`${styles.t} ${styles.tLead}`}>
          <div>
            <h3 className={styles.h3}>{samples.leadTitle[lang]}</h3>
            <p>{samples.lead[lang]}</p>
          </div>
          <Link href={planHref(lang)} className={`${styles.btn} ${styles.btnLg}`}>
            {nav.cta[lang]}
          </Link>
        </div>

        <DayExample lang={lang} />
      </div>
    </section>
  );
}

const Lock = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <rect x="2" y="5.2" width="8" height="5.8" rx="1.4" fill="currentColor" />
    <path d="M3.8 5.2V3.9a2.2 2.2 0 0 1 4.4 0v1.3" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const STOP_ICONS = {
  tree: (
    <svg viewBox="0 0 24 24">
      <path d="M12 3 6.5 11h3L6 16h12l-3.5-5h3z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 16v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  sunset: (
    <svg viewBox="0 0 24 24">
      <path d="M4 17h16M7 17a5 5 0 0 1 10 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 6v2.4M6.3 8.6l1.6 1.6M17.7 8.6l-1.6 1.6M7 21h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
};

/** 예시 칸의 작은 사진. 장식이라 alt 는 비운다 (안 제목이 바로 옆에 있다) */
function Thumb({ slot, lang, size }: { slot: (typeof dayOne.variants)[number]["photo"]; lang: Lang; size: string }) {
  const p = photo(slot, lang);
  return <Image src={p.src} alt="" fill sizes={size} style={p.position ? { objectPosition: p.position } : undefined} />;
}

/** 예시 칸 — 1일차 안 4개. 무료로 연 안(보통)은 정거장·팁까지, 잠긴 셋은 제목·예산과 회색 줄만 */
function DayExample({ lang }: { lang: Lang }) {
  const open = dayOne.variants.find((v) => v.open)!;
  const locked = dayOne.variants.filter((v) => !v.open);
  return (
    <figure className={`${styles.t} ${styles.tApp}`}>
      <figcaption className={styles.appHead}>
        <span>
          <span className={styles.chip}>{dayOne.sample[lang]}</span>
          <b>{dayOne.count[lang]}</b>
        </span>
      </figcaption>

      <div className={styles.ov}>
        <div className={styles.ovH}>
          <span className={styles.chip}>{open.tier[lang]}</span>
          <span className={styles.won2}>{open.cost[lang]}</span>
          <span className={`${styles.chip} ${styles.chipAcc}`}>{dayOne.opened[lang]}</span>
        </div>
        <p className={styles.ovt}>{open.title[lang]}</p>
        <ol className={styles.rows}>
          {dayOne.stops.map((stop) => (
            <li key={stop.time} className={styles.row}>
              {stop.icon === "photo" ? (
                <span className={styles.thumb}>
                  <Thumb slot={open.photo} lang={lang} size="52px" />
                </span>
              ) : (
                <span className={styles.ic} aria-hidden="true">
                  {STOP_ICONS[stop.icon]}
                </span>
              )}
              <div>
                <span className={styles.tm}>{stop.time}</span>
                <p className={styles.pl}>{stop.place[lang]}</p>
                {stop.plan && <s>{stop.plan[lang]}</s>}
                <div className={styles.tip}>
                  <header>
                    <span>{tipLabel[lang]}</span>
                  </header>
                  <p>{stop.tip[lang]}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <ul className={styles.lks}>
        {locked.map((v) => (
          <li key={v.title.ko} className={styles.lk}>
            <span className={styles.thumb}>
              <Thumb slot={v.photo} lang={lang} size="44px" />
            </span>
            <div>
              <p className={styles.lt}>
                <span className={styles.chip}>{v.tier[lang]}</span>
                <b>{v.title[lang]}</b>
              </p>
              <div className={styles.sk}>
                <Lock />
                <span className="sr-only">{dayOne.locked[lang]}</span>
                <i aria-hidden="true" />
                <i aria-hidden="true" />
              </div>
            </div>
            <span className={styles.w3}>{v.cost[lang]}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
