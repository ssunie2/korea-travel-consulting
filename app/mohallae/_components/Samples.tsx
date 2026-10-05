import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import styles from "../mohallae.module.css";
import { corrections, draftDay, nav, samples, tipLabel, type Lang } from "../content";
import PlayOnView from "./PlayOnView";

import cardSeoulSunset from "@/public/mohallae/card-seoul-sunset.jpg";
import cardBusan from "@/public/mohallae/card-busan.jpg";
import cardSeoulHanok from "@/public/mohallae/card-seoul-hanok.jpg";
import cardGyeongju from "@/public/mohallae/card-gyeongju.jpg";
// 초안 패널의 작은 사진은 기존 랜딩 사진을 같이 쓴다 (파일은 그대로, 읽기만 한다)
import bukchon from "@/public/landing/bukchon.webp";
import gwangjang from "@/public/landing/gwangjang-market.webp";
import namsan from "@/public/landing/namsan.webp";

const CARD_PHOTOS: StaticImageData[] = [cardSeoulSunset, cardBusan, cardSeoulHanok, cardGyeongju];
const STOP_PHOTOS = { bukchon, gwangjang, namsan };

/**
 * 두 번째 섹션 — "초안은 이렇게 생겼습니다".
 * 위: 실제 샘플 초안 4개 (시안 ② 아래쪽). 누르면 그 초안이 그대로 열린다.
 * 아래: 초안 속 하루 예시 (시안 ③의 패널) — 한 정거장의 흔한 계획에 줄이 그어지고 현지 팁이 붙는다.
 */
export default function Samples({ lang }: { lang: Lang }) {
  return (
    <section id="samples" aria-labelledby="samples-heading" className="scroll-mt-6 pt-[24px]">
      <div className={styles.wrap}>
        <h2
          id="samples-heading"
          className="text-[clamp(24px,2.16vw,30px)] leading-[1.18] font-bold tracking-[-0.015em]"
        >
          {samples.heading[lang]}
        </h2>

        <ul className={`${styles.cardRow} mt-[10px]`}>
          {samples.items.map((s, i) => (
            <li key={s.id}>
              <Link href={`/plan/${s.id}`} className={styles.card}>
                <div className={styles.cardPhoto}>
                  <Image
                    src={CARD_PHOTOS[i]}
                    alt={s.alt[lang]}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1024px) 300px, (min-width: 640px) 46vw, 300px"
                    className="object-cover"
                  />
                </div>
                <p className="px-[13px] pt-[11px] pb-[13px] text-[12.5px] leading-snug font-medium">
                  {s.who[lang]}
                  <span className="sr-only">
                    {" — "}
                    {s.title[lang]}. {samples.open[lang]}
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid items-center gap-8 md:mt-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-14">
          <div>
            <h3 className="text-[clamp(20px,1.7vw,24px)] leading-tight font-bold tracking-[-0.01em] [text-wrap:balance]">
              {samples.leadTitle[lang]}
            </h3>
            <p className="mt-3 max-w-[26rem] text-[17px] leading-relaxed text-[var(--m-ink-2)] md:text-[18px]">
              {samples.lead[lang]}
            </p>
            <Link href="/plan" className={`${styles.pillDark} mt-6 h-[48px] px-7 text-[16px]`}>
              {nav.cta[lang]}
            </Link>
          </div>
          <PlayOnView>
            <DraftPanel lang={lang} />
          </PlayOnView>
        </div>
      </div>
    </section>
  );
}

function DraftPanel({ lang }: { lang: Lang }) {
  return (
    <figure className={`${styles.panel} m-0 px-5 pt-5 pb-3 md:px-7 md:pt-6`}>
      <figcaption className="flex items-center justify-between gap-4 border-b border-[var(--m-line)] pb-4">
        <span className="flex items-center gap-2.5">
          <span className="rounded-full bg-[var(--m-band)] px-2.5 py-1 text-[11.5px] font-semibold tracking-[0.04em] text-[var(--m-ink-2)]">
            {draftDay.badge[lang]}
          </span>
          <span className="text-[18px] font-bold tracking-[-0.01em] md:text-[20px]">{draftDay.title[lang]}</span>
        </span>
        <span className="text-[13.5px] font-semibold text-[var(--m-ink-2)]">{draftDay.day[lang]}</span>
      </figcaption>

      {/* 폰: 작은 사진 · 점 · 글 세 칸. 팁은 아랫줄로 내려가고, 중괄호 끝이 시간표 선에 닿는다.
          PC: 사진 · 점 · 글 · 팁 네 칸 (시안 ③). */}
      <ol className={styles.timeline}>
        {draftDay.stops.map((stop) => {
          const fix = stop.fix !== undefined ? corrections[stop.fix] : undefined;
          return (
            <li
              key={stop.time}
              className="grid grid-cols-[64px_8px_minmax(0,1fr)] items-start gap-x-[14px] py-3.5 sm:grid-cols-[112px_8px_minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-[22px]"
            >
              <div className="relative h-[48px] w-[64px] overflow-hidden rounded-[9px] bg-[var(--m-band)] sm:h-[76px] sm:w-[112px] sm:rounded-[10px]">
                <Image src={STOP_PHOTOS[stop.image]} alt="" fill sizes="112px" className="object-cover" />
              </div>
              <span className={`${styles.dot} relative mt-[7px]`} aria-hidden="true" />
              <div className={fix ? "" : "sm:col-span-2"}>
                <p className="text-[13px] font-medium text-[var(--m-ink-3)] tabular-nums">{stop.time}</p>
                <p className="mt-0.5 text-[16px] leading-snug font-semibold">{stop.place[lang]}</p>
                {fix && (
                  <p className="mt-1.5 text-[14px] leading-snug text-[var(--m-gray-struck)]">
                    <del className={`${styles.struck} ${styles.panelStrike} no-underline`}>{fix.plan[lang]}</del>
                  </p>
                )}
              </div>
              {fix && (
                <div
                  className={`${styles.bracket} ${styles.panelTip} relative col-span-2 col-start-2 mt-3 ml-[3px] bg-white py-0.5 sm:col-span-1 sm:col-start-4 sm:row-start-1 sm:mt-0 sm:ml-0`}
                >
                  <svg className={styles.brace} viewBox="0 0 16 72" preserveAspectRatio="none" aria-hidden="true">
                    <path
                      d="M15 1.5C9.5 1.5 8.5 4.5 8.5 10V28C8.5 33 6.5 36 1 36C6.5 36 8.5 39 8.5 44V62C8.5 67.5 9.5 70.5 15 70.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <p className={styles.tipBadge}>{tipLabel[lang]}</p>
                  <p className="mt-1.5 text-[14px] leading-snug font-semibold text-[var(--m-red)]">
                    {draftDay.longTip[lang]}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
