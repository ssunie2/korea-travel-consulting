import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";
import styles from "../mohallae.module.css";
import { CONTACT_EMAIL, langFrom, plans, type Lang } from "../content";
import SubHeader from "../_components/SubHeader";
import { Footer } from "../_components/MoreSections";
import type { Block, RefundText } from "./text";
import ko from "./text-ko";
import en from "./text-en";

/**
 * 취소·환불 규정 — 새 디자인 (/mohallae/refund). 써니 2026-11-20 확정.
 *
 * **글은 text-ko.ts · text-en.ts 에 있다** — 써니가 직접 고칠 수 있게 화면 코드와 나눴다 (써니 2026-11-20).
 * 이 파일은 그 글을 읽어서 그리기만 한다.
 *
 * 예전 화면(app/refund, 뮤조 2026-09-19)은 '전체 일정 하나에 $25' 기준이라, 지금 상품(원하는 날만 열기)에 맞게 다시 썼다.
 * 예전 주소 /refund 는 next.config.ts 에서 이 화면으로 보낸다.
 *
 * 정한 것 (써니 2026-11-20)
 * - 결제하면 고른 날이 **바로 열린다** → 열린 날은 단순 변심 환불 없음.
 *   법이 이걸 인정해 주는 조건: 결제 전에 알리고(동의 체크) + 맛보기를 준다(무료 첫날) — 전자상거래법 제17조 2항 5호·6항.
 *   결제 기능을 만들 때 **동의 체크 · 동의한 시각 · 열린 시각**을 저장한다. 분쟁 때 우리가 증명해야 한다 (제17조 5항).
 * - 우리 잘못이면 다시 만들기나 전액 환불 중 손님이 고른다. 기한은 법 그대로(받은 날부터 3개월, 안 날부터 30일 — 제17조 3항).
 *   예전 '출발일까지'는 법보다 짧아서 뺐다. 법보다 손님에게 불리한 약속은 효력이 없다 (제35조).
 * - 환불은 요청한 날부터 3영업일 안에 결제 취소 (제18조). 예전 '3영업일 안에 답'은 고쳤다.
 * - 연락 메일은 새 도메인 메일 (content.ts 의 CONTACT_EMAIL). **가짜 주소인 동안은 실제 사이트에 올리지 않는다.**
 *
 * 규칙 3장 1번 — 우리가 받는 돈은 문서 이용료뿐이다. 여행 대금(숙소·교통 등)은 우리를 거치지 않으므로 여기서 다루지 않는다.
 */

const TEXT: Record<Lang, RefundText> = { ko, en };

export async function generateMetadata({ searchParams }: PageProps<"/mohallae/refund">): Promise<Metadata> {
  const t = TEXT[langFrom((await searchParams).lang)];
  return { title: `${t.title} — mohallae`, description: t.description };
}

export default async function RefundPage({ searchParams }: PageProps<"/mohallae/refund">) {
  const lang = langFrom((await searchParams).lang);
  const t = TEXT[lang];
  // 글 안의 {메일} · {가격} 자리에 들어갈 것
  const fill: Record<string, ReactNode> = {
    "{메일}": (
      <a href={`mailto:${CONTACT_EMAIL}`} className={`${styles.textLink} text-[var(--m-ink)]`}>
        {CONTACT_EMAIL}
      </a>
    ),
    // 한 줄에 하나씩 (써니 2026-11-20 "점 기준으로 밑줄로 내려줘").
    // 첫 줄은 값($…) 바로 앞에 priceNote 를 넣는다: '첫 번째 날 $25' → '첫 번째 날(하루 값) $25'
    "{가격}": plans.days.ladder[lang].map((line, i) => {
      const at = line.indexOf(" $");
      const text = i === 0 && t.priceNote && at > 0 ? `${line.slice(0, at)}${t.priceNote}${line.slice(at)}` : line;
      return (
        <Fragment key={i}>
          {i > 0 && <br />}
          {text}
        </Fragment>
      );
    }),
  };
  const say = (s: string) => <Inline text={s} fill={fill} />;

  return (
    <div lang={lang} className={`${styles.page} flex-1`}>
      <SubHeader lang={lang} path="/mohallae/refund" />

      <main className={`${styles.wrap} pt-14 pb-20 md:pt-20 md:pb-28`}>
        <p className="w-fit rounded-full bg-[var(--m-band)] px-2.5 py-1 text-[11.5px] font-semibold tracking-[0.04em] text-[var(--m-ink-2)]">
          {lang === "ko" ? "최종 수정" : "Last updated"} {t.updated}
        </p>
        <h1 className="mt-4 text-[clamp(34px,4.2vw,56px)] leading-[1.1] font-extrabold tracking-[-0.02em]">{t.title}</h1>
        <p className="mt-5 max-w-[36rem] text-[17px] leading-relaxed text-[var(--m-ink-2)] md:text-[18px]">{say(t.intro)}</p>

        {/* 넓은 화면: 왼쪽 목차(따라 내려온다) · 오른쪽 본문. 폰: 목차가 본문 위에 목록으로 (개인정보 처리방침과 같은 틀) */}
        <div className="mt-12 md:mt-16 lg:grid lg:grid-cols-[15rem_minmax(0,780px)] lg:gap-x-16">
          <Contents lang={lang} sections={t.sections} />

          <div className="mt-12 flex flex-col gap-12 text-[16px] leading-relaxed text-[var(--m-ink-2)] lg:mt-0">
            {t.sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-8 border-t border-[var(--m-line)] pt-10 first:border-t-0 first:pt-0 md:pt-12"
              >
                <h2 className="text-[22px] leading-snug font-bold tracking-[-0.01em] text-[var(--m-ink)] md:text-[24px]">{s.title}</h2>
                {s.body.map((b, i) => (
                  <BlockView key={i} block={b} say={say} />
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

/** 본문 한 덩어리 — 글자는 문단, 목록은 점 목록, note 는 회색 상자 */
function BlockView({ block, say }: { block: Block; say: (s: string) => ReactNode }) {
  if (typeof block === "string") return <p className="mt-4">{say(block)}</p>;
  if (Array.isArray(block)) {
    return (
      <ul className="mt-4 flex flex-col gap-2">
        {block.map((item, i) => (
          <li key={i} className="flex gap-3.5">
            {/* 점은 글 첫 줄의 가운데 높이에 맞춘다 */}
            <span aria-hidden="true" className="mt-[0.68em] size-[5px] flex-none rounded-full bg-[var(--m-ink-3)]" />
            <span>{say(item)}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="mt-6 rounded-[16px] border border-[var(--m-line)] bg-[var(--m-band)] px-5 py-4 text-[var(--m-ink)]">
      {say(block.note)}
    </p>
  );
}

/**
 * 글을 그린다. \n 은 줄 바꿈, **굵게** 는 굵은 글씨, {메일} · {가격} 은 fill 에 있는 것으로 바꾼다.
 * '.' 으로 끝난 문장 뒤는 저절로 줄을 바꾼다 (써니 2026-11-20 ". 으로 끝나는 문장도 내려줘") —
 * 마침표 뒤에 띄어쓰기가 있을 때만이라 $2.5 같은 숫자는 그대로다. 굵은 글씨가 마침표로 끝나도(…다.**) 같다.
 * 짝이 안 맞는 ** 나 모르는 {…} 는 글자 그대로 둔다 — 고치다 실수해도 화면이 깨지지 않게.
 */
function Inline({ text, fill }: { text: string; fill: Record<string, ReactNode> }) {
  const withFill = (s: string) =>
    s.split(/(\{[^{}]+\})/).map((part, i) => <Fragment key={i}>{part in fill ? fill[part] : part}</Fragment>);
  const line = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={i} className="font-semibold text-[var(--m-ink)]">
          {withFill(part.slice(2, -2))}
        </strong>
      ) : (
        <Fragment key={i}>{withFill(part)}</Fragment>
      ),
    );
  return (
    <>
      {text.replace(/\.(\*\*)? +(?=\S)/g, ".$1\n").split("\n").map((s, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line(s)}
        </Fragment>
      ))}
    </>
  );
}

/** 목차. 넓은 화면에서는 왼쪽 칸에 붙어 따라 내려오고(sticky), 폰에서는 본문 위에 놓인다 */
function Contents({ lang, sections }: { lang: Lang; sections: RefundText["sections"] }) {
  return (
    <nav
      aria-labelledby="refund-contents"
      className="rounded-[16px] bg-[var(--m-band)] px-5 py-4 lg:sticky lg:top-8 lg:self-start lg:rounded-none lg:bg-transparent lg:p-0"
    >
      <p id="refund-contents" className="text-[12px] font-semibold text-[var(--m-ink-3)]">
        {lang === "ko" ? "목차" : "Contents"}
      </p>
      <ol className="mt-2.5 flex flex-col gap-1.5 text-[14.5px] leading-snug">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className={`${styles.navLink} ${styles.navLinkDark} text-[var(--m-ink-2)] hover:text-[var(--m-ink)]`}>
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
