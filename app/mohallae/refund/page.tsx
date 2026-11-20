import type { ReactNode } from "react";
import type { Metadata } from "next";
import styles from "../mohallae.module.css";
import { CONTACT_EMAIL, langFrom, plans, type Lang, type Pair } from "../content";
import SubHeader from "../_components/SubHeader";
import { Footer } from "../_components/MoreSections";

/**
 * 취소·환불 규정 — 새 디자인 (/mohallae/refund). 써니 2026-11-20 확정.
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
 * 하루 값은 첫 화면과 같은 곳(content.ts 의 plans.days.ladder)에서 가져온다 — 값이 바뀌면 여기도 같이 바뀐다.
 */

const UPDATED: Pair<string> = { ko: "2026년 11월 20일", en: "20 November 2026" };

const TITLE: Pair<string> = { ko: "취소·환불 규정", en: "Cancellations & Refunds" };
const DESCRIPTION: Pair<string> = {
  ko: "언제 돌려드리고, 언제 못 돌려드리는지. 저희가 틀렸으면 저희가 책임집니다.",
  en: "When you get your money back, and when you don't. If we got it wrong, we make it right.",
};

export async function generateMetadata({ searchParams }: PageProps<"/mohallae/refund">): Promise<Metadata> {
  const lang = langFrom((await searchParams).lang);
  return { title: `${TITLE[lang]} — mohallae`, description: DESCRIPTION[lang] };
}

/** 여섯 절의 제목 — 목차와 본문이 같이 쓴다. 키는 주소의 # 자리 이름이라 언어가 바뀌어도 같다 */
const SECTIONS = {
  what: { ko: "1. 무엇을 사시는 건가요", en: "1. What you're buying" },
  full: { ko: "2. 전액 돌려드리는 경우", en: "2. When you get all of it back" },
  wrong: { ko: "3. 저희가 틀렸을 때", en: "3. If we got it wrong" },
  none: { ko: "4. 돌려드리지 못하는 경우", en: "4. When we can't refund" },
  how: { ko: "5. 요청하는 법", en: "5. How to ask" },
  free: { ko: "6. 무료 초안은", en: "6. About the free draft" },
};
type SectionId = keyof typeof SECTIONS;

export default async function RefundPage({ searchParams }: PageProps<"/mohallae/refund">) {
  const lang = langFrom((await searchParams).lang);
  const pick = <T,>(pair: Pair<T>): T => pair[lang];
  const mail = (
    <a href={`mailto:${CONTACT_EMAIL}`} className={`${styles.textLink} text-[var(--m-ink)]`}>
      {CONTACT_EMAIL}
    </a>
  );

  return (
    <div lang={lang} className={`${styles.page} flex-1`}>
      <SubHeader lang={lang} path="/mohallae/refund" />

      <main className={`${styles.wrap} pt-14 pb-20 md:pt-20 md:pb-28`}>
        <p className="w-fit rounded-full bg-[var(--m-band)] px-2.5 py-1 text-[11.5px] font-semibold tracking-[0.04em] text-[var(--m-ink-2)]">
          {pick({ ko: "최종 수정", en: "Last updated" })} {UPDATED[lang]}
        </p>
        <h1 className="mt-4 text-[clamp(34px,4.2vw,56px)] leading-[1.1] font-extrabold tracking-[-0.02em]">{TITLE[lang]}</h1>
        <p className="mt-5 max-w-[36rem] text-[17px] leading-relaxed text-[var(--m-ink-2)] md:text-[18px]">
          {pick({
            ko: "한 줄로 하면 이렇습니다 — 결제 전에 무료 첫날로 먼저 보시고, 열린 날은 마음이 바뀌셔도 환불되지 않습니다. 저희가 틀렸으면 저희가 책임집니다.",
            en: "In one line: look at the free first day before you pay. Once a day is open, changing your mind is not a reason for a refund. If we got it wrong, we make it right.",
          })}
        </p>

        {/* 넓은 화면: 왼쪽 목차(따라 내려온다) · 오른쪽 본문. 폰: 목차가 본문 위에 목록으로 (개인정보 처리방침과 같은 틀) */}
        <div className="mt-12 md:mt-16 lg:grid lg:grid-cols-[15rem_minmax(0,780px)] lg:gap-x-16">
          <Contents lang={lang} />

          <div className="mt-12 flex flex-col gap-12 text-[16px] leading-relaxed text-[var(--m-ink-2)] lg:mt-0">
            <Section id="what" lang={lang}>
              <p className="mt-4">
                {pick({
                  ko: "프로그램이 손님의 답을 바탕으로 자동으로 만든 여행 정보 문서입니다. 물건이 배송되지 않고, 링크로 열어 보시는 형태입니다. 날마다 여러 개의 안이 있고, 원하는 날만 골라 엽니다.",
                  en: "A travel information document our program writes from your answers. Nothing ships to you — you open it at a link. Each day has several plans, and you open only the days you choose.",
                })}
              </p>
              <p className="mt-4 font-semibold text-[var(--m-ink)]">
                {pick({ ko: "하루 값", en: "Price per day" })}: {plans.days.ladder[lang].join(" · ")}
              </p>
              <Bullets
                className="mt-4"
                items={pick({
                  ko: [
                    "결제가 끝나면 고르신 날이 바로 열립니다.",
                    "결제하시기 전에 첫날 안 하나를 무료로 전부 보실 수 있습니다. 어떤 문서를 받으시는지 먼저 보시라는 뜻입니다.",
                    "하루만 먼저 사 보셔도 됩니다.",
                  ],
                  en: [
                    "As soon as your payment goes through, the days you chose open.",
                    "Before you pay, you can see one Day 1 plan in full, free — so you know what you are getting first.",
                    "You can also buy just one day first.",
                  ],
                })}
              />
            </Section>

            <Section id="full" lang={lang}>
              <Bullets
                className="mt-4"
                items={[
                  <>
                    <strong className="font-semibold text-[var(--m-ink)]">
                      {pick({ ko: "결제는 됐는데 고르신 날이 열리지 않을 때", en: "Your payment went through but your days did not open" })}
                    </strong>
                    {pick({
                      ko: " — 문서가 끝내 만들어지지 않았거나 열리지 않으면 전액 돌려드립니다.",
                      en: " — if the document never got made, or will not open, you get all of it back.",
                    })}
                  </>,
                  <>
                    <strong className="font-semibold text-[var(--m-ink)]">
                      {pick({ ko: "같은 주문이 두 번 결제됐을 때", en: "You were charged twice for the same order" })}
                    </strong>
                    {pick({
                      ko: " — 겹친 결제는 전액 돌려드립니다.",
                      en: " — we refund the extra charge in full.",
                    })}
                  </>,
                ]}
              />
            </Section>

            <Section id="wrong" lang={lang}>
              <p className="mt-4">
                {pick({
                  ko: "아래 중 하나라도 해당하면 다시 만들어 드리거나, 원하시면 전액 돌려드립니다. 고르시는 쪽으로 합니다.",
                  en: "If any of these happened, we write it again — or give you all of it back, whichever you prefer.",
                })}
              </p>
              <Bullets
                className="mt-4"
                items={pick({
                  ko: [
                    "요청하지 않은 도시가 일정에 들어간 경우",
                    "날짜나 기간이 알려 주신 것과 다른 경우",
                    "못 드시거나 가실 수 없다고 알려 주신 것을 그대로 추천한 경우 — 할랄, 알레르기, 휠체어 접근 같은 것",
                    "문서 내용이 비어 있거나 알아볼 수 없는 경우",
                  ],
                  en: [
                    "The plan goes to a city you did not ask for",
                    "The dates or the length do not match what you told us",
                    "We recommended something you told us you cannot eat or cannot reach — halal, an allergy, wheelchair access",
                    "The document is empty or unreadable",
                  ],
                })}
              />
              <p className="mt-4">
                {pick({
                  ko: "이 경우에는 문서를 받으신 날부터 3개월 안, 그리고 문제를 아셨거나 아실 수 있었던 날부터 30일 안에 말씀해 주시면 됩니다. 여행 중에 아셨어도 됩니다.",
                  en: "For these, tell us within 3 months of getting the document, and within 30 days of when you found out — or could have found out — about the problem. Finding out during your trip is fine.",
                })}
              </p>
            </Section>

            <Section id="none" lang={lang}>
              <p className="mt-4">
                {pick({
                  ko: "열린 날은 열리는 순간 전부 전달됩니다. 되돌려 받을 수 있는 물건이 아니라서, 아래는 환불되지 않습니다.",
                  en: "An open day is delivered in full the moment it opens. There is nothing to hand back, so these are not refundable.",
                })}
              </p>
              <Bullets
                className="mt-4"
                items={pick({
                  ko: [
                    "열린 날을 보신 뒤 마음이 바뀌신 경우",
                    "여행 계획이 바뀌어 한국에 오지 않게 된 경우 — 문서는 이미 만들어졌습니다",
                    "추천한 곳이 문을 닫았거나, 값이 달라졌거나, 교통편이 바뀐 경우 — 저희가 바꿀 수 없는 일입니다",
                  ],
                  en: [
                    "You saw an open day and changed your mind",
                    "Your trip changed and you are not coming — the document was already written",
                    "A place we named has closed, changed its price, or its transport changed — that is not something we control",
                  ],
                })}
              />
              {/* 결제 전 고지 — 이 고지와 동의가 있어야 '열면 환불 불가'가 인정된다 (제17조 6항) */}
              <p className="mt-6 rounded-[16px] border border-[var(--m-line)] bg-[var(--m-band)] px-5 py-4 text-[var(--m-ink)]">
                <strong className="font-semibold">{pick({ ko: "결제하시기 전에 알려 드립니다.", en: "We tell you this before you pay." })}</strong>{" "}
                {pick({
                  ko: "날이 열리면 단순 변심으로는 청약철회(구매 취소)가 어렵습니다. 결제 버튼 바로 위에 이 내용이 나오고, 동의에 체크하셔야 결제하실 수 있습니다.",
                  en: "Once a day is open, you cannot cancel the purchase just because you changed your mind. This appears right above the pay button, and you tick a box to agree before you can pay.",
                })}
              </p>
            </Section>

            <Section id="how" lang={lang}>
              <p className="mt-4">
                {pick({ ko: "이리로 메일 주세요:", en: "Email us at" })} {mail}
                {pick({
                  ko: ". 결제하신 이메일 주소와 무엇이 문제였는지만 적어 주시면 됩니다. 양식도, 통화도 필요 없습니다.",
                  en: ". Tell us the email you paid with and what went wrong. No form, no phone call.",
                })}
              </p>
              <p className="mt-4">
                {pick({
                  ko: "환불해 드릴 경우에는 요청하신 날부터 3영업일 안에 결제를 취소합니다. 결제하신 수단으로 돌아가며, 카드사에 따라 실제로 보이기까지 며칠 더 걸릴 수 있습니다.",
                  en: "If a refund is due, we cancel the payment within 3 business days of your request. It goes back the way you paid; depending on your bank, it can take a few more days to show.",
                })}
              </p>
            </Section>

            <Section id="free" lang={lang}>
              <p className="mt-4">
                {pick({
                  ko: "무료 초안은 값을 치르지 않으시므로 환불이라는 것이 없습니다. 마음에 안 드시면 그냥 닫으시면 됩니다. 다시 만드시려면 폼을 다시 채워 주세요.",
                  en: "The free draft costs nothing, so there is nothing to refund. If you do not like it, just close it. Fill in the form again if you want another one.",
                })}
              </p>
            </Section>
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

/** 한 절. 위에 얇은 줄을 긋고 번호 붙은 제목을 단다 (첫 절은 줄 없이 목차와 나란히 시작한다) */
function Section({ id, lang, children }: { id: SectionId; lang: Lang; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-[var(--m-line)] pt-10 first:border-t-0 first:pt-0 md:pt-12">
      <h2 className="text-[22px] leading-snug font-bold tracking-[-0.01em] text-[var(--m-ink)] md:text-[24px]">
        {SECTIONS[id][lang]}
      </h2>
      {children}
    </section>
  );
}

/** 목차. 넓은 화면에서는 왼쪽 칸에 붙어 따라 내려오고(sticky), 폰에서는 본문 위에 놓인다 */
function Contents({ lang }: { lang: Lang }) {
  return (
    <nav
      aria-labelledby="refund-contents"
      className="rounded-[16px] bg-[var(--m-band)] px-5 py-4 lg:sticky lg:top-8 lg:self-start lg:rounded-none lg:bg-transparent lg:p-0"
    >
      <p id="refund-contents" className="text-[12px] font-semibold text-[var(--m-ink-3)]">
        {lang === "ko" ? "목차" : "Contents"}
      </p>
      <ol className="mt-2.5 flex flex-col gap-1.5 text-[14.5px] leading-snug">
        {(Object.keys(SECTIONS) as SectionId[]).map((id) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`${styles.navLink} ${styles.navLinkDark} text-[var(--m-ink-2)] hover:text-[var(--m-ink)]`}
            >
              {SECTIONS[id][lang]}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** 점 목록. 점은 글 첫 줄의 가운데 높이에 맞춘다 */
function Bullets({ items, className = "" }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={`flex flex-col gap-2 ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-3.5">
          <span aria-hidden="true" className="mt-[0.68em] size-[5px] flex-none rounded-full bg-[var(--m-ink-3)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
