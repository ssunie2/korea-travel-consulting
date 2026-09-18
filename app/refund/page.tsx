import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { t } from "@/lib/copy";

const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

// TODO(출시 전): CONTACT 를 실제 이메일로 바꾼다. 지금은 placeholder라 요청이 도착하지 않는다.
const CONTACT = "hello@example.com";
const UPDATED = "19 September 2026";

export const metadata = {
  title: t({ ko: "취소·환불 규정 — mohallae", en: "Cancellations & Refunds — mohallae" }),
  description: t({
    ko: "언제 환불되고, 언제 안 되는지. 우리 잘못이면 우리가 책임집니다.",
    en: "When you get your money back, and when you don't. If we got it wrong, we make it right.",
  }),
};

const h2 = "font-[family-name:var(--font-display)] text-2xl leading-snug";
const section = "mt-12 border-t border-[var(--c-line-2)] pt-8";
const body = "mt-4 leading-relaxed text-[var(--c-text-2)]";
const link =
  "underline underline-offset-4 hover:text-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]";

/** 목록 한 줄. 여러 곳에서 같은 모양을 쓴다 */
function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 leading-relaxed text-[var(--c-text-2)]">
      <span aria-hidden className="flex-none text-[var(--c-accent)]">
        —
      </span>
      <span>{children}</span>
    </li>
  );
}

export default function RefundPolicy() {
  return (
    <div
      className={`${display.variable} flex-1 bg-[var(--c-bg)] text-[var(--c-text)] font-[family-name:var(--font-geist-sans)] selection:bg-[var(--c-accent)] selection:text-[var(--c-bg)]`}
    >
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="-my-2 py-2 font-[family-name:var(--font-geist-sans)] text-xl font-semibold tracking-[-0.02em] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]"
        >
          mohallae
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-24">
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[var(--c-text-3)]">
          {t({ ko: "최종 수정", en: "Last updated" })} {UPDATED}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight">
          {t({ ko: "취소·환불 규정", en: "Cancellations & Refunds" })}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--c-text-2)]">
          {t({
            ko: "한 줄로 하면 이렇습니다 — 아직 안 여셨으면 전액 돌려드립니다. 여신 뒤라도 저희가 틀렸으면 저희가 책임집니다.",
            en: "In one line: if you haven't opened it, you get all of it back. If you have opened it and we got it wrong, we make it right.",
          })}
        </p>

        {/* 1 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "1. 무엇을 사시는 건가요", en: "1. What you're buying" })}</h2>
          <p className={body}>
            {t({
              ko: "전체 일정은 프로그램이 손님의 답을 바탕으로 자동 생성한 문서입니다. 물건이 배송되지 않고, 링크로 열어보시는 형태입니다. 값은 $25이고 여행이 며칠이든 같습니다.",
              en: "The full plan is a document our program writes from your answers. Nothing ships to you — you open it at a link. It costs $25 however long your trip is.",
            })}
          </p>
          <p className={body}>
            {t({
              ko: "결제하시기 전에 무료 초안으로 저희가 어떤 문서를 만드는지 먼저 보실 수 있습니다. 그게 이 규정이 짧은 이유입니다 — 사기 전에 이미 보셨으니까요.",
              en: "Before you pay, the free draft already shows you the kind of document we write. That is why this page is short — you have seen it before you buy.",
            })}
          </p>
        </section>

        {/* 2 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "2. 전액 돌려드리는 경우", en: "2. When you get all of it back" })}</h2>
          <ul className="mt-4 space-y-3">
            <Item>
              <strong>{t({ ko: "전체 일정을 아직 열어보지 않으셨을 때", en: "You have not opened the full plan yet" })}</strong>
              {t({
                ko: " — 결제 후 7일 안에 말씀해 주시면 전액 돌려드립니다. 이유는 묻지 않습니다.",
                en: " — tell us within 7 days of paying and you get all of it back. We will not ask why.",
              })}
            </Item>
            <Item>
              <strong>{t({ ko: "저희가 만들지 못했을 때", en: "We could not make it" })}</strong>
              {t({
                ko: " — 문서가 끝내 만들어지지 않았거나 열리지 않으면 전액 돌려드립니다.",
                en: " — if the document never got made, or will not open, you get all of it back.",
              })}
            </Item>
          </ul>
        </section>

        {/* 3 */}
        <section className={section}>
          <h2 className={h2}>
            {t({ ko: "3. 여신 뒤라도 저희가 틀렸으면", en: "3. If you opened it and we got it wrong" })}
          </h2>
          <p className={body}>
            {t({
              ko: "아래 중 하나라도 해당하면 다시 만들어 드리거나, 원하시면 전액 돌려드립니다. 고르시는 쪽으로 합니다.",
              en: "If any of these happened, we write it again — or give you all of it back, whichever you prefer.",
            })}
          </p>
          <ul className="mt-4 space-y-3">
            <Item>{t({ ko: "요청하지 않은 도시가 일정에 들어간 경우", en: "The plan goes to a city you did not ask for" })}</Item>
            <Item>{t({ ko: "날짜나 기간이 알려주신 것과 다른 경우", en: "The dates or the length do not match what you told us" })}</Item>
            <Item>
              {t({
                ko: "못 드시거나 가실 수 없는 것을 알려주셨는데 그대로 추천된 경우 — 할랄, 알레르기, 휠체어 접근 같은 것",
                en: "We recommended something you told us you cannot eat or cannot reach — halal, an allergy, wheelchair access",
              })}
            </Item>
            <Item>{t({ ko: "문서 내용이 비어 있거나 알아볼 수 없는 경우", en: "The document is empty or unreadable" })}</Item>
          </ul>
          <p className={body}>
            {t({
              ko: "이 경우에는 7일이 지났더라도 여행 출발일까지는 말씀해 주시면 됩니다.",
              en: "For these you can tell us any time up to the day your trip starts, even after 7 days.",
            })}
          </p>
        </section>

        {/* 4 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "4. 돌려드리지 못하는 경우", en: "4. When we cannot refund" })}</h2>
          <p className={body}>
            {t({
              ko: "전체 일정은 열어보시는 순간 전부 전달됩니다. 되돌려 받을 수 있는 물건이 아니라서, 아래는 어렵습니다.",
              en: "Once you open the full plan, you have all of it. There is nothing to hand back, so these are not refundable.",
            })}
          </p>
          <ul className="mt-4 space-y-3">
            <Item>{t({ ko: "문서를 열어보신 뒤 마음이 바뀌신 경우", en: "You opened it and changed your mind" })}</Item>
            <Item>
              {t({
                ko: "여행 계획이 바뀌어 한국에 오지 않게 된 경우 — 문서는 이미 만들어졌습니다",
                en: "Your trip changed and you are not coming — the document was already written",
              })}
            </Item>
            <Item>
              {t({
                ko: "추천한 곳이 문을 닫았거나, 값이 달라졌거나, 교통편이 바뀐 경우 — 저희가 바꿀 수 없는 일입니다",
                en: "A place we named has closed, changed its price, or moved — that is not something we control",
              })}
            </Item>
          </ul>
          <p className="mt-5 rounded-xl border border-[var(--c-accent)] bg-[var(--c-error-bg)] px-5 py-4 leading-relaxed text-[var(--c-error-text)]">
            {t({
              ko: "⚠️ 결제하시기 전에 이 점을 알려드립니다 — 전체 일정을 여시면 단순 변심으로는 청약철회가 어렵습니다. 결제 화면에서 이 내용에 동의하신 뒤 진행됩니다.",
              en: "⚠️ We tell you this before you pay — once you open the full plan, you cannot withdraw simply because you changed your mind. You agree to this at checkout before paying.",
            })}
          </p>
        </section>

        {/* 5 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "5. 어떻게 말씀하시면 되나요", en: "5. How to ask" })}</h2>
          <p className={body}>
            {t({ ko: "이리로 메일 주세요:", en: "Email us at" })}{" "}
            <a href={`mailto:${CONTACT}`} className={link}>
              {CONTACT}
            </a>
            {t({
              ko: " 결제하신 이메일 주소와 무엇이 문제였는지만 적어주시면 됩니다. 양식도, 통화도 필요 없습니다.",
              en: ". Tell us the email you paid with and what went wrong. No form, no phone call.",
            })}
          </p>
          <p className={body}>
            {t({
              ko: "3영업일 안에 답을 드립니다. 환불로 정해지면 결제하신 수단으로 돌려드리고, 카드사에서 실제로 처리되기까지는 보통 3~5영업일이 더 걸립니다.",
              en: "We reply within 3 business days. If it is a refund, it goes back to the card you paid with — your bank usually takes another 3–5 business days to show it.",
            })}
          </p>
        </section>

        {/* 6 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "6. 무료 초안은", en: "6. About the free draft" })}</h2>
          <p className={body}>
            {t({
              ko: "무료 초안은 값을 치르지 않으시므로 환불이라는 것이 없습니다. 마음에 안 드시면 그냥 닫으시면 됩니다. 다시 만드시려면 폼을 다시 채워주세요.",
              en: "The free draft costs nothing, so there is nothing to refund. If you do not like it, just close it. Fill in the form again if you want another one.",
            })}
          </p>
        </section>

        <p className="mt-12 border-t border-[var(--c-line-2)] pt-8">
          <Link
            href="/"
            className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]"
          >
            {t({ ko: "← 첫 화면으로", en: "← Back to home" })}
          </Link>
        </p>
      </main>
    </div>
  );
}
