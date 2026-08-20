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
const UPDATED = "12 August 2026";

export const metadata = {
  title: "Privacy Policy — mohallae",
  description: "What we collect, why, how long we keep it, and how to have it deleted.",
};

const collected = [
  {
    when: t({ ko: "무료 초안을 요청하실 때", en: "When you ask for a free draft" }),
    where: "/plan",
    items: t({
      ko: [
        "한국 어디를 가시는지, 출발일, 기간, 인원",
        "1인 예산과 통화, 여행 스타일, 동행, 관심사",
        "적어주신 경우에 한해 식이·접근성 메모",
        "초안을 받으실 언어",
        "생성된 초안 자체",
      ],
      en: [
        "Where in Korea you want to go, your start date, how many days, how many travellers",
        "Budget per person and currency, travel styles, who you're travelling with, interests",
        "Dietary or accessibility notes, if you give them",
        "The language you want the draft written in",
        "The draft itself, once it is generated",
      ],
    }),
    note: t({ ko: "이 단계에서는 이름도 연락처도 받지 않습니다. 초안은 특정인과 연결되지 않습니다.", en: "We do not ask for your name or contact details at this step. A draft is not linked to you." }),
  },
  {
    when: t({ ko: "전체 일정을 신청하실 때", en: "When you request a consultation" }),
    where: "/plan/[id]/consult",
    items: t({
      ko: [
        "이름과 이메일 주소",
        "적어주신 경우에 한해 메신저 아이디(카카오톡·왓츠앱·라인)",
        "내용란에 적으신 것",
        "보고 계시던 초안에 대한 참조",
      ],
      en: [
        "Your name and email address",
        "A messenger ID (KakaoTalk, WhatsApp or LINE), if you give one",
        "Anything you write in the message box",
        "A reference to the draft you were looking at",
      ],
    }),
  },
  {
    when: t({ ko: "문의를 보내실 때", en: "When you send us a question" }),
    where: "/contact",
    items: t({ ko: ["이메일 주소", "내용란에 적으신 것"], en: ["Your email address", "Anything you write in the message box"] }),
  },
];

const processors = [
  {
    name: "Supabase",
    role: t({ ko: "위 내용을 데이터베이스에 보관", en: "Stores everything above in a database" }),
    where: t({ ko: "대한민국 서울", en: "Seoul, South Korea" }),
  },
  {
    name: "Vercel",
    role: t({ ko: "이 웹사이트를 구동·제공", en: "Runs and serves this website" }),
    where: t({ ko: "대한민국 서울 (서버 기능)", en: "Seoul, South Korea (server functions)" }),
  },
  {
    name: "Google (Gemini API)",
    role: t({ ko: "보내주신 여행 정보로 초안 일정을 작성", en: "Writes your draft itinerary from the trip details you submit" }),
    where: t({ ko: "국외", en: "Outside Korea" }),
  },
];

export default function PrivacyPolicy() {
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
          {t({ ko: "개인정보 처리방침", en: "Privacy Policy" })}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--c-text-2)]">
          {t({
            ko: "무엇을 받고, 왜 받고, 또 누가 보고, 얼마나 보관하고, 어떻게 지우는지를 적었습니다. 이해가 안 되는 부분이 있으면 이리로 메일 주세요:",
            en: "This page explains what we collect, why we collect it, who else sees it, how long we keep it, and how to have it deleted. If anything here is unclear, email us at",
          })}{" "}
          <a
            href={`mailto:${CONTACT}`}
            className="underline underline-offset-4 hover:text-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]"
          >
            {CONTACT}
          </a>
          .
        </p>

        {/* 1 */}
        <section className="mt-12 border-t border-[var(--c-line-2)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            {t({ ko: "1. 무엇을 받는지", en: "1. What we collect" })}
          </h2>
          <div className="mt-6 flex flex-col gap-8">
            {collected.map((group) => (
              <div key={group.when}>
                <p className="font-semibold">{group.when}</p>
                <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-xs text-[var(--c-text-3)]">
                  {group.where}
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-3 leading-relaxed text-[var(--c-text-2)]">
                      <span aria-hidden className="text-[var(--c-text-3)]">
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {group.note ? (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--c-text-3)]">{group.note}</p>
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-6 leading-relaxed text-[var(--c-text-2)]">
            {t({ ko: "광고용 쿠키를 쓰지 않고, 분석·추적 스크립트를 돌리지 않으며, 마케팅 목적으로 정보를 팔거나 넘기지 않습니다.", en: "We do not use cookies for advertising, we do not run analytics or tracking scripts, and we do not sell or share your details with anyone for marketing." })}</p>
        </section>

        {/* 2 — 민감정보 */}
        <section className="mt-12 border-t border-[var(--c-line-2)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            {t({ ko: "2. 식이·접근성 메모", en: "2. Dietary and accessibility notes" })}
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--c-text-2)]">
            {t({ ko: "여행 정보 폼에는 식이·접근성 사항을 적는 선택 칸이 있습니다. 여기 적으시는 내용은 종교(예: 할랄)나 건강(예: 견과류 알레르기, 휠체어 이용)을 드러낼 수 있습니다. 둘 다 한국과 유럽 법에서 민감정보로 따로 다루므로, 이 칸은 다르게 취급합니다:", en: "The trip form has an optional box for dietary or accessibility needs. What you write there may reveal your religion (for example halal) or your health (for example a nut allergy or using a wheelchair). Both are treated as sensitive information under Korean and European law, so we handle that box differently:" })}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {[
              ...t({
                ko: [
                  "선택 항목입니다. 비워두셔도 초안은 나옵니다.",
                  "적으신다는 것은 그 내용을 반영해 달라는 뜻이고, 저희가 보관하는 이유도 그것뿐입니다.",
                  "초안이 그 조건을 피해 가도록 구글 Gemini API 로 보냅니다. 그 외에는 아무 데도 가지 않습니다.",
                  "일정을 쓰는 것 말고 다른 용도로는 절대 쓰지 않습니다.",
                ],
                en: [
                  "It is optional. You can leave it empty and still get a draft.",
                  "By filling it in, you are asking us to use it — that is the only reason we hold it.",
                  "It is sent to Google's Gemini API so your draft can work around it. Nothing else receives it.",
                  "It is never used for anything other than writing your itinerary.",
                ],
              }),
            ].map((item) => (
              <li key={item} className="flex gap-3 leading-relaxed text-[var(--c-text-2)]">
                <span aria-hidden className="text-[var(--c-accent)]">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-[var(--c-text-2)]">
            {t({
              ko: "적기가 꺼려지시면 칸을 비워두시고, 연락이 닿은 뒤에 이메일로 알려주셔도 됩니다.",
              en: "If you would rather not write it down, leave the box empty and tell us over email once we are in touch.",
            })}
          </p>
        </section>

        {/* 3 */}
        <section className="mt-12 border-t border-[var(--c-line-2)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            {t({ ko: "3. 또 누가 보는지", en: "3. Who else sees it" })}
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--c-text-2)]">
            {t({ ko: "이 서비스를 운영하는 데 세 곳을 씁니다. 각자 맡은 부분을 제공하기 위해서만 정보를 다룹니다.", en: "We use three companies to run this service. They only handle your details in order to provide their part of it." })}</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--c-line-2)]">
                  <th className="py-2 pr-4 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[var(--c-text-3)]">
                    {t({ ko: "회사", en: "Company" })}
                  </th>
                  <th className="py-2 pr-4 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[var(--c-text-3)]">
                    {t({ ko: "하는 일", en: "What it does" })}
                  </th>
                  <th className="py-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[var(--c-text-3)]">
                    {t({ ko: "위치", en: "Where" })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {processors.map((p) => (
                  <tr key={p.name} className="border-b border-[var(--c-surface)] align-top">
                    <td className="py-3 pr-4 font-semibold">{p.name}</td>
                    <td className="py-3 pr-4 text-[var(--c-text-2)]">{p.role}</td>
                    <td className="py-3 text-[var(--c-text-2)]">{p.where}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 leading-relaxed text-[var(--c-text-2)]">
            {t({ ko: "구글이 초안을 쓰는 동안 여행 정보가 한국 밖으로 나갑니다. 이름·이메일·메신저 아이디는 구글로 보내지 않습니다 — 서울에 있는 저희 데이터베이스에만 저장됩니다.", en: "Your trip details leave Korea when Google writes your draft. Your name, email and messenger ID are never sent to Google — they are only stored in our database in Seoul." })}</p>
        </section>

        {/* 4 */}
        <section className="mt-12 border-t border-[var(--c-line-2)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            {t({ ko: "4. 얼마나 보관하는지", en: "4. How long we keep it" })}
          </h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <tbody>
                {[
                  ...t({
                    ko: [
                      ["무료 초안", "만들어진 날로부터 12개월"],
                      ["전체 일정 신청", "마지막으로 연락한 뒤 3년"],
                      ["문의 폼으로 보낸 질문", "1년"],
                    ],
                    en: [
                      ["Free drafts", "12 months from the day it was created"],
                      ["Consultation requests", "3 years after we last spoke"],
                      ["Questions sent through the contact form", "1 year"],
                    ],
                  }),
                ].map(([what, how]) => (
                  <tr key={what} className="border-b border-[var(--c-surface)] align-top">
                    <td className="py-3 pr-4 font-semibold">{what}</td>
                    <td className="py-3 text-[var(--c-text-2)]">{how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 leading-relaxed text-[var(--c-text-2)]">
            {t({ ko: "그 뒤에는 지웁니다. 결제 기록을 법이 더 오래 보관하도록 요구하면 그 기록만 남기고 나머지는 남기지 않습니다.", en: "After that we delete it. If the law requires us to keep a record of a paid transaction for longer, we keep only that record and nothing else." })}</p>
        </section>

        {/* 5 */}
        <section className="mt-12 border-t border-[var(--c-line-2)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            {t({ ko: "5. 요청하실 수 있는 것", en: "5. What you can ask us to do" })}
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--c-text-2)]">
            {t({ ko: "아래 주소로 메일 주시면", en: "Email" })}{" "}
            <a
              href={`mailto:${CONTACT}`}
              className="underline underline-offset-4 hover:text-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]"
            >
              {CONTACT}
            </a>{" "}
            {t({ ko: "다음 중 무엇이든 무료로, 30일 안에 처리해 드립니다:", en: "and we will do any of these, free, within 30 days:" })}
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {[
              ...t({
                ko: [
                  "보관 중인 손님 정보 전부를 사본으로 보내드립니다",
                  "잘못된 내용을 바로잡습니다",
                  "보관 중인 손님 정보를 전부 지웁니다",
                  "정보 사용을 멈추고, 법이 남기라고 한 것만 남깁니다",
                ],
                en: [
                  "Send you a copy of everything we hold about you",
                  "Correct anything that is wrong",
                  "Delete everything we hold about you",
                  "Stop using your details and keep them only where the law says we must",
                ],
              }),
            ].map((item) => (
              <li key={item} className="flex gap-3 leading-relaxed text-[var(--c-text-2)]">
                <span aria-hidden className="text-[var(--c-text-3)]">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-[var(--c-text-2)]">
            {t({ ko: "무료 초안은 메일을 주실 필요가 없습니다 — 링크를 그만 쓰시면 됩니다. 12개월 뒤 자동으로 지워지고 이름과 연결되어 있지도 않습니다.", en: "To delete a free draft you do not need to email us — just stop using the link. It is deleted automatically after 12 months and is not connected to your name." })}</p>
        </section>

        {/* 6 */}
        <section className="mt-12 border-t border-[var(--c-line-2)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            {t({ ko: "6. 안전하게 지키는 법", en: "6. Keeping it safe" })}
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--c-text-2)]">
            {t({ ko: "데이터베이스는 저희 서버에서만 닿을 수 있고 손님 브라우저에서는 절대 닿지 않습니다. 관리자 화면은 비밀번호로 잠겨 있습니다. 모든 통신은 암호화된 연결을 지납니다. 문제가 생겨 정보가 노출되면 지체 없이 손님과 한국 당국에 알립니다.", en: "The database can only be reached by our own server, never from your browser. Our admin screen is behind a password. Everything travels over an encrypted connection. If something goes wrong and your details are exposed, we will tell you and the Korean authorities without delay." })}</p>
        </section>

        {/* 7 */}
        <section className="mt-12 border-t border-[var(--c-line-2)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            {t({ ko: "7. 아동", en: "7. Children" })}
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--c-text-2)]">
            {t({ ko: "이 서비스는 성인을 위한 것입니다. 만 14세 미만의 정보를 알면서 수집하지 않습니다. 아동이 정보를 보냈다고 생각되시면 메일 주시면 지우겠습니다.", en: "This service is for adults. We do not knowingly collect details from anyone under 14. If you believe a child has sent us their details, email us and we will delete them." })}</p>
        </section>

        {/* 8 */}
        <section className="mt-12 border-t border-[var(--c-line-2)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            {t({ ko: "8. 연락처", en: "8. Who to contact" })}
          </h2>
          {/* TODO(출시 전): 사업자등록 후 상호·대표자·등록번호·주소를 여기에 넣는다. */}
          <p className="mt-4 leading-relaxed text-[var(--c-text-2)]">
            mohallae —{" "}
            <a
              href={`mailto:${CONTACT}`}
              className="underline underline-offset-4 hover:text-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]"
            >
              {CONTACT}
            </a>
          </p>
          <p className="mt-4 leading-relaxed text-[var(--c-text-2)]">
            {t({ ko: "저희가 문제를 해결해 드리지 못하면 한국인터넷진흥원 개인정보 침해신고센터(privacy.go.kr, 118)에, 유럽이나 영국에 계시면 해당 국가의 개인정보 감독기구에 신고하실 수 있습니다.", en: "If we do not resolve your concern, you can complain to the Korea Internet & Security Agency Privacy Center (privacy.go.kr, 118) or, if you are in Europe or the UK, to your national data protection authority." })}</p>
        </section>

        <section className="mt-12 border-t border-[var(--c-line-2)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            {t({ ko: "9. 변경", en: "9. Changes" })}
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--c-text-2)]">
            {t({ ko: "정보를 다루는 방식이 바뀌면 이 페이지를 고치고 맨 위 날짜를 바꿉니다. 중요한 변경이고 이메일을 알고 있으면 따로 알려드립니다.", en: "If we change how we handle your details, we will update this page and change the date at the top. If the change is significant and we have your email, we will tell you." })}</p>
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
