import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { t } from "@/lib/copy";

const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

// TODO(출시 전): 사업자등록이 끝나면 상호·대표자·사업자등록번호·주소를 채운다.
// TODO(출시 전): CONTACT 를 실제 이메일로 바꾼다. 지금은 placeholder라 문의가 도착하지 않는다.
const CONTACT = "hello@example.com";
const UPDATED = "19 September 2026";

export const metadata = {
  title: t({ ko: "이용약관 — mohallae", en: "Terms of Service — mohallae" }),
  description: t({
    ko: "저희가 무엇을 팔고, 무엇을 하지 않는지.",
    en: "What we sell, and what we do not do.",
  }),
};

const h2 = "font-[family-name:var(--font-display)] text-2xl leading-snug";
const section = "mt-12 border-t border-[var(--c-line-2)] pt-8";
const body = "mt-4 leading-relaxed text-[var(--c-text-2)]";
const link =
  "underline underline-offset-4 hover:text-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]";

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

export default function Terms() {
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
          {t({ ko: "이용약관", en: "Terms of Service" })}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--c-text-2)]">
          {t({
            ko: "저희가 무엇을 팔고 무엇을 하지 않는지를 적었습니다. 특히 2장과 3장은 저희가 여행사와 어떻게 다른지에 관한 것이라, 한 번 읽어보시면 좋겠습니다.",
            en: "This page says what we sell and what we do not do. Sections 2 and 3 are about how we differ from a travel agency — those are worth a read.",
          })}
        </p>

        {/* 1 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "1. 저희가 파는 것", en: "1. What we sell" })}</h2>
          <p className={body}>
            {t({
              ko: "손님이 알려주신 답을 바탕으로 프로그램이 자동 생성한 여행 정보 문서입니다. 무료 초안은 값이 없고, 전체 일정은 $25입니다. 문서는 링크로 받아보십니다.",
              en: "A travel information document our program writes from the answers you give us. The free draft costs nothing; the full plan is $25. You receive it as a link.",
            })}
          </p>
          <p className={body}>
            {t({
              ko: "여행 가이드북이나 지도 앱을 사시는 것과 같은 성격입니다. 손님이 직접 쓰시는 자료입니다.",
              en: "It is the same kind of thing as buying a guidebook or a map app. It is material for you to use yourself.",
            })}
          </p>
        </section>

        {/* 2 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "2. 저희는 여행사가 아닙니다", en: "2. We are not a travel agency" })}</h2>
          <p className={body}>
            {t({
              ko: "저희는 정보를 만들어 드릴 뿐, 손님을 대신해 무언가를 처리하지 않습니다. 이 차이가 이 서비스의 전부라고 해도 지나치지 않습니다.",
              en: "We make information. We do not act on your behalf in any way. That difference is close to the whole of what this service is.",
            })}
          </p>
          <p className={body}>
            {t({
              ko: "문화체육관광부 국제관광서비스과에 직접 문의해 서면으로 회신을 받았습니다 — 단순히 여행 관련 정보만 제공하는 사업은 여행업 등록 대상이 아니라는 답이었습니다.",
              en: "We asked the Korean Ministry of Culture, Sports and Tourism directly and have their written answer: a business that only provides travel information is not required to register as a travel agency.",
            })}
          </p>
        </section>

        {/* 3 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "3. 저희가 하지 않는 일", en: "3. What we do not do" })}</h2>
          <ul className="mt-4 space-y-3">
            <Item>
              {t({
                ko: "숙소·교통·식당·입장권을 손님 대신 잡아드리지 않습니다. 무엇을 언제 어떻게 잡으시면 되는지 알려드릴 뿐입니다",
                en: "We do not take a place to stay, a seat, a table or a ticket for you. We tell you what to get, when, and how",
              })}
            </Item>
            <Item>{t({ ko: "손님을 대신해 어떤 계약도 맺지 않습니다", en: "We do not enter into any contract for you" })}</Item>
            <Item>
              {t({
                ko: "여행 대금을 받지 않습니다. 저희가 받는 돈은 문서 이용료뿐입니다",
                en: "We never take money for your trip. The only money we take is for the document",
              })}
            </Item>
            <Item>
              {t({
                ko: "관광업체로부터 수수료나 광고비를 받지 않습니다. 그래서 추천이 손님 쪽만 보고 만들어집니다",
                en: "We take no commission or advertising money from anyone we name. That is why the recommendations answer to you only",
              })}
            </Item>
            <Item>
              {t({
                ko: "현지에서 사람이 동행하거나 말을 옮겨드리는 일은 하지 않습니다",
                en: "Nobody from us travels with you or speaks for you on the ground",
              })}
            </Item>
            <Item>
              {t({
                ko: "병원이나 의료기관을 특정해 알려드리지 않습니다",
                en: "We do not name hospitals or medical providers",
              })}
            </Item>
          </ul>
        </section>

        {/* 4 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "4. 손님이 하셔야 하는 것", en: "4. What is yours to do" })}</h2>
          <ul className="mt-4 space-y-3">
            <Item>{t({ ko: "숙소·교통·식당·입장권을 직접 잡으시는 것", en: "Getting the stays, seats, tables and tickets yourself" })}</Item>
            <Item>
              {t({
                ko: "여권·비자·입국 요건을 확인하시는 것 — 나라마다 다르고 자주 바뀝니다. 저희는 이 부분에 답을 드릴 수 없습니다",
                en: "Checking your passport, visa and entry requirements — they differ by country and change often. We cannot answer on this",
              })}
            </Item>
            <Item>{t({ ko: "여행자 보험", en: "Travel insurance" })}</Item>
            <Item>
              {t({
                ko: "알려주신 정보가 맞는지 — 날짜나 못 드시는 음식이 틀리면 문서도 틀립니다",
                en: "That what you told us is right — wrong dates or a missed allergy make the document wrong too",
              })}
            </Item>
          </ul>
        </section>

        {/* 5 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "5. 정보는 바뀝니다", en: "5. Things change" })}</h2>
          <p className={body}>
            {t({
              ko: "영업시간·가격·휴무일·교통편은 저희가 문서를 만든 뒤에도 바뀝니다. 저희는 문서를 만든 시점을 기준으로 최선을 다하지만, 가시기 전에 중요한 것은 한 번 확인해 주시기를 권합니다.",
              en: "Opening hours, prices, closing days and transport change after we write your document. We do our best as of the day we write it, but please check the important ones before you go.",
            })}
          </p>
          <p className={body}>
            {t({
              ko: "문서는 프로그램이 만듭니다. 사람이 한 줄씩 확인하지 않습니다 — 그래서 값이 이 정도이고, 그래서 위 3장의 환불 규정이 있습니다.",
              en: "A program writes the document. No person checks it line by line — that is why it costs what it costs, and why the refund rules exist.",
            })}{" "}
            <Link href="/refund" className={link}>
              {t({ ko: "취소·환불 규정", en: "Cancellations & Refunds" })}
            </Link>
          </p>
        </section>

        {/* 6 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "6. 문서를 어떻게 쓰실 수 있나", en: "6. What you can do with it" })}</h2>
          <p className={body}>
            {t({
              ko: "손님과 함께 가시는 분들이 쓰시는 것은 얼마든지 좋습니다. 다만 문서를 팔거나, 다시 만들어 배포하거나, 저희 이름을 떼고 자기 것처럼 내놓는 것은 안 됩니다.",
              en: "Use it freely with the people you are travelling with. Do not sell it, republish it, or pass it off as your own.",
            })}
          </p>
        </section>

        {/* 7 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "7. 서비스가 멈출 수 있습니다", en: "7. The service can stop" })}</h2>
          <p className={body}>
            {t({
              ko: "점검이나 저희가 쓰는 다른 서비스의 사정으로 잠시 멈출 수 있습니다. 결제하신 문서가 끝내 만들어지지 않으면 전액 돌려드립니다.",
              en: "We may pause for maintenance or because a service we rely on is down. If a document you paid for never gets made, you get all of it back.",
            })}
          </p>
        </section>

        {/* 8 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "8. 책임의 한계", en: "8. Limits" })}</h2>
          <p className={body}>
            {t({
              ko: "저희 책임은 손님이 저희에게 치르신 금액을 넘지 않습니다. 여행 중에 일어나는 일 — 문 닫은 가게, 놓친 차편, 날씨 — 에 대해서는 책임지지 않습니다. 저희가 만든 문서의 잘못으로 생긴 일은 위 환불 규정에 따릅니다.",
              en: "Our liability does not exceed what you paid us. We are not responsible for what happens on your trip — a closed shop, a missed train, the weather. Where our document itself was wrong, the refund rules apply.",
            })}
          </p>
          <p className={body}>
            {t({
              ko: "법이 정한 소비자의 권리를 줄이려는 뜻은 아닙니다. 이 약관과 법이 다르면 법이 우선합니다.",
              en: "None of this is meant to reduce the rights consumer law gives you. Where this page and the law differ, the law wins.",
            })}
          </p>
        </section>

        {/* 9 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "9. 어느 나라 법을 따르나", en: "9. Which law applies" })}</h2>
          <p className={body}>
            {t({
              ko: "대한민국 법을 따르고, 분쟁은 대한민국 법원에서 다룹니다. 다만 손님이 사시는 나라의 소비자 보호법이 손님에게 더 유리하다면 그쪽이 우선합니다.",
              en: "Korean law applies and Korean courts have jurisdiction. If the consumer protection law where you live gives you more, that takes precedence.",
            })}
          </p>
          <p className={body}>
            {t({
              ko: "무엇이든 먼저 메일로 말씀해 주세요. 대부분은 거기서 끝납니다:",
              en: "Please email us first — most things end there:",
            })}{" "}
            <a href={`mailto:${CONTACT}`} className={link}>
              {CONTACT}
            </a>
          </p>
        </section>

        {/* 10 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "10. 사업자 정보", en: "10. Who we are" })}</h2>
          {/* TODO(출시 전): 사업자등록 후 상호·대표자·등록번호·통신판매업 신고번호·주소를 여기에 넣는다. */}
          <p className={body}>
            {t({
              ko: "사업자등록이 완료되면 상호·대표자·사업자등록번호·통신판매업 신고번호·주소를 이 자리에 적습니다.",
              en: "Once our business registration is complete, our registered name, representative, registration number and address will appear here.",
            })}
          </p>
        </section>

        {/* 11 */}
        <section className={section}>
          <h2 className={h2}>{t({ ko: "11. 변경", en: "11. Changes" })}</h2>
          <p className={body}>
            {t({
              ko: "이 약관이 바뀌면 이 페이지를 고치고 맨 위 날짜를 바꿉니다. 이미 결제하신 건에는 결제 시점의 약관이 적용됩니다.",
              en: "If these terms change we update this page and the date at the top. What you already paid for is covered by the terms as they were when you paid.",
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
