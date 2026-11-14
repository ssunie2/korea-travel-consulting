import type { ReactNode } from "react";
import type { Metadata } from "next";
import styles from "../mohallae.module.css";
import { langFrom, type Lang, type Pair } from "../content";
import SubHeader from "../_components/SubHeader";
import { Footer } from "../_components/MoreSections";

/**
 * 개인정보 처리방침 — 새 디자인 (/mohallae/privacy).
 *
 * 예전 화면(app/privacy)의 글을 **한 글자도 바꾸지 않고** 옮겼다. 바꾼 것은 모양뿐이다.
 * 예전 화면의 t({ ko, en }) 자리가 여기서는 pick({ ko, en }) 이다 — 순서도 같아서 두 파일을 나란히 놓고 대조할 수 있다.
 * 법적 문장을 고칠 일이 생기면 예전 화면이 남아 있는 동안은 두 파일을 같이 고친다.
 *
 * 언어는 주소로 정한다 (?lang=en → 영어). t() 는 주소를 모르므로 쓰지 않는다.
 */

// TODO(출시 전): 사업자등록이 끝나면 상호·대표자·사업자등록번호·주소를 채운다.
// TODO(출시 전): CONTACT 를 실제 이메일로 바꾼다. 지금은 placeholder라 문의가 도착하지 않는다.
const CONTACT = "hello@example.com";
const UPDATED = "12 August 2026";

const TITLE: Pair<string> = { ko: "개인정보 처리방침", en: "Privacy Policy" };
const DESCRIPTION: Pair<string> = {
  ko: "무엇을 받는지, 왜 받는지, 얼마나 두는지, 어떻게 지우는지.",
  en: "What we collect, why, how long we keep it, and how to have it deleted.",
};

export async function generateMetadata({ searchParams }: PageProps<"/mohallae/privacy">): Promise<Metadata> {
  const lang = langFrom((await searchParams).lang);
  return { title: `${TITLE[lang]} — mohallae`, description: DESCRIPTION[lang] };
}

/** 아홉 절의 제목 — 목차와 본문이 같이 쓴다. 키는 주소의 # 자리 이름이라 언어가 바뀌어도 같다 */
const SECTIONS = {
  collect: { ko: "1. 무엇을 받는지", en: "1. What we collect" },
  sensitive: { ko: "2. 식이·접근성 메모", en: "2. Dietary and accessibility notes" },
  sharing: { ko: "3. 또 누가 보는지", en: "3. Who else sees it" },
  retention: { ko: "4. 얼마나 보관하는지", en: "4. How long we keep it" },
  rights: { ko: "5. 요청하실 수 있는 것", en: "5. What you can ask us to do" },
  security: { ko: "6. 안전하게 지키는 법", en: "6. Keeping it safe" },
  children: { ko: "7. 아동", en: "7. Children" },
  contact: { ko: "8. 연락처", en: "8. Who to contact" },
  changes: { ko: "9. 변경", en: "9. Changes" },
};
type SectionId = keyof typeof SECTIONS;

const collected: { when: Pair<string>; where: string; items: Pair<string[]>; note?: Pair<string> }[] = [
  {
    when: { ko: "무료 초안을 요청하실 때", en: "When you ask for a free draft" },
    where: "/plan",
    items: {
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
    },
    note: { ko: "이 단계에서는 이름도 연락처도 받지 않습니다. 초안은 특정인과 연결되지 않습니다.", en: "We do not ask for your name or contact details at this step. A draft is not linked to you." },
  },
  {
    when: { ko: "전체 일정을 신청하실 때", en: "When you request a consultation" },
    where: "/plan/[id]/consult",
    items: {
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
    },
  },
  {
    when: { ko: "문의를 보내실 때", en: "When you send us a question" },
    where: "/contact",
    items: { ko: ["이메일 주소", "내용란에 적으신 것"], en: ["Your email address", "Anything you write in the message box"] },
  },
];

const processors: { name: string; role: Pair<string>; where: Pair<string> }[] = [
  {
    name: "Supabase",
    role: { ko: "위 내용을 데이터베이스에 보관", en: "Stores everything above in a database" },
    where: { ko: "대한민국 서울", en: "Seoul, South Korea" },
  },
  {
    name: "Vercel",
    role: { ko: "이 웹사이트를 구동·제공", en: "Runs and serves this website" },
    where: { ko: "대한민국 서울 (서버 기능)", en: "Seoul, South Korea (server functions)" },
  },
  {
    name: "Google (Gemini API)",
    role: { ko: "보내주신 여행 정보로 초안 일정을 작성", en: "Writes your draft itinerary from the trip details you submit" },
    where: { ko: "국외", en: "Outside Korea" },
  },
];

export default async function PrivacyPage({ searchParams }: PageProps<"/mohallae/privacy">) {
  const lang = langFrom((await searchParams).lang);
  // 예전 화면의 t() 자리. 주소에서 고른 언어 쪽 글을 꺼낸다
  const pick = <T,>(pair: Pair<T>): T => pair[lang];
  const mail = (
    <a href={`mailto:${CONTACT}`} className={`${styles.textLink} text-[var(--m-ink)]`}>
      {CONTACT}
    </a>
  );

  return (
    <div lang={lang} className={`${styles.page} flex-1`}>
      <SubHeader lang={lang} path="/mohallae/privacy" />

      <main className={`${styles.wrap} pt-14 pb-20 md:pt-20 md:pb-28`}>
        <p className="w-fit rounded-full bg-[var(--m-band)] px-2.5 py-1 text-[11.5px] font-semibold tracking-[0.04em] text-[var(--m-ink-2)]">
          {pick({ ko: "최종 수정", en: "Last updated" })} {UPDATED}
        </p>
        <h1 className="mt-4 text-[clamp(34px,4.2vw,56px)] leading-[1.1] font-extrabold tracking-[-0.02em]">{TITLE[lang]}</h1>
        <p className="mt-5 max-w-[36rem] text-[17px] leading-relaxed text-[var(--m-ink-2)] md:text-[18px]">
          {pick({
            ko: "무엇을 받고, 왜 받고, 또 누가 보고, 얼마나 보관하고, 어떻게 지우는지를 적었습니다. 이해가 안 되는 부분이 있으면 이리로 메일 주세요:",
            en: "This page explains what we collect, why we collect it, who else sees it, how long we keep it, and how to have it deleted. If anything here is unclear, email us at",
          })}{" "}
          {mail}.
        </p>

        {/* 넓은 화면: 왼쪽 목차(따라 내려온다) · 오른쪽 본문. 폰: 목차가 본문 위에 목록으로 */}
        <div className="mt-12 md:mt-16 lg:grid lg:grid-cols-[15rem_minmax(0,780px)] lg:gap-x-16">
          <Contents lang={lang} />

          <div className="mt-12 flex flex-col gap-12 text-[16px] leading-relaxed text-[var(--m-ink-2)] lg:mt-0">
            <Section id="collect" lang={lang}>
              <div className="mt-6 flex flex-col gap-8">
                {collected.map((group) => (
                  <div key={group.where}>
                    <p className="font-semibold text-[var(--m-ink)]">{group.when[lang]}</p>
                    <p className="mt-0.5 text-[13px] text-[var(--m-ink-3)]">{group.where}</p>
                    <Bullets items={group.items[lang]} className="mt-3" />
                    {group.note ? <p className="mt-3 text-[15px] text-[var(--m-ink-3)]">{group.note[lang]}</p> : null}
                  </div>
                ))}
              </div>
              <p className="mt-6">
                {pick({ ko: "광고용 쿠키를 쓰지 않고, 분석·추적 스크립트를 돌리지 않으며, 마케팅 목적으로 정보를 팔거나 넘기지 않습니다.", en: "We do not use cookies for advertising, we do not run analytics or tracking scripts, and we do not sell or share your details with anyone for marketing." })}
              </p>
            </Section>

            {/* 2 — 민감정보 */}
            <Section id="sensitive" lang={lang}>
              <p className="mt-4">
                {pick({ ko: "여행 정보 폼에는 식이·접근성 사항을 적는 선택 칸이 있습니다. 여기 적으시는 내용은 종교(예: 할랄)나 건강(예: 견과류 알레르기, 휠체어 이용)을 드러낼 수 있습니다. 둘 다 한국과 유럽 법에서 민감정보로 따로 다루므로, 이 칸은 다르게 취급합니다:", en: "The trip form has an optional box for dietary or accessibility needs. What you write there may reveal your religion (for example halal) or your health (for example a nut allergy or using a wheelchair). Both are treated as sensitive information under Korean and European law, so we handle that box differently:" })}
              </p>
              <Bullets
                className="mt-4"
                items={pick({
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
                })}
              />
              <p className="mt-4">
                {pick({
                  ko: "적기가 꺼려지시면 칸을 비워두시고, 연락이 닿은 뒤에 이메일로 알려주셔도 됩니다.",
                  en: "If you would rather not write it down, leave the box empty and tell us over email once we are in touch.",
                })}
              </p>
            </Section>

            <Section id="sharing" lang={lang}>
              <p className="mt-4">
                {pick({ ko: "이 서비스를 운영하는 데 세 곳을 씁니다. 각자 맡은 부분을 제공하기 위해서만 정보를 다룹니다.", en: "We use three companies to run this service. They only handle your details in order to provide their part of it." })}
              </p>
              {/* 표가 자리보다 넓어지면(아주 좁은 폰, 글자 확대) 가로로 밀어 본다. 390 폭 폰에서는 세 칸이 다 들어간다 */}
              <div className="mt-5 overflow-x-auto">
                <table className="w-full border-collapse text-left text-[15px] leading-snug">
                  <thead>
                    <tr className="border-b border-[var(--m-line)]">
                      <th scope="col" className="py-2.5 pr-5 text-left text-[12px] font-semibold text-[var(--m-ink-3)]">
                        {pick({ ko: "회사", en: "Company" })}
                      </th>
                      <th scope="col" className="py-2.5 pr-5 text-left text-[12px] font-semibold text-[var(--m-ink-3)]">
                        {pick({ ko: "하는 일", en: "What it does" })}
                      </th>
                      <th scope="col" className="py-2.5 text-left text-[12px] font-semibold text-[var(--m-ink-3)]">
                        {pick({ ko: "위치", en: "Where" })}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {processors.map((p) => (
                      <tr key={p.name} className="border-b border-[var(--m-line)] align-top">
                        <th scope="row" className="py-3.5 pr-5 text-left font-semibold text-[var(--m-ink)]">
                          {p.name}
                        </th>
                        <td className="py-3.5 pr-5">{p.role[lang]}</td>
                        <td className="py-3.5">{p.where[lang]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-5">
                {pick({ ko: "구글이 초안을 쓰는 동안 여행 정보가 한국 밖으로 나갑니다. 이름·이메일·메신저 아이디는 구글로 보내지 않습니다 — 서울에 있는 저희 데이터베이스에만 저장됩니다.", en: "Your trip details leave Korea when Google writes your draft. Your name, email and messenger ID are never sent to Google — they are only stored in our database in Seoul." })}
              </p>
            </Section>

            <Section id="retention" lang={lang}>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full border-collapse border-t border-[var(--m-line)] text-left text-[15px] leading-snug">
                  <tbody>
                    {pick({
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
                    }).map(([what, how]) => (
                      <tr key={what} className="border-b border-[var(--m-line)] align-top">
                        <th scope="row" className="py-3.5 pr-5 text-left font-semibold text-[var(--m-ink)] md:w-2/5">
                          {what}
                        </th>
                        <td className="py-3.5">{how}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-5">
                {pick({ ko: "그 뒤에는 지웁니다. 결제 기록을 법이 더 오래 보관하도록 요구하면 그 기록만 남기고 나머지는 남기지 않습니다.", en: "After that we delete it. If the law requires us to keep a record of a paid transaction for longer, we keep only that record and nothing else." })}
              </p>
            </Section>

            <Section id="rights" lang={lang}>
              <p className="mt-4">
                {pick({ ko: "아래 주소로 메일 주시면", en: "Email" })} {mail}{" "}
                {pick({ ko: "다음 중 무엇이든 무료로, 30일 안에 처리해 드립니다:", en: "and we will do any of these, free, within 30 days:" })}
              </p>
              <Bullets
                className="mt-4"
                items={pick({
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
                })}
              />
              <p className="mt-4">
                {pick({ ko: "무료 초안은 메일을 주실 필요가 없습니다 — 링크를 그만 쓰시면 됩니다. 12개월 뒤 자동으로 지워지고 이름과 연결되어 있지도 않습니다.", en: "To delete a free draft you do not need to email us — just stop using the link. It is deleted automatically after 12 months and is not connected to your name." })}
              </p>
            </Section>

            <Section id="security" lang={lang}>
              <p className="mt-4">
                {pick({ ko: "데이터베이스는 저희 서버에서만 닿을 수 있고 손님 브라우저에서는 절대 닿지 않습니다. 관리자 화면은 비밀번호로 잠겨 있습니다. 모든 통신은 암호화된 연결을 지납니다. 문제가 생겨 정보가 노출되면 지체 없이 손님과 한국 당국에 알립니다.", en: "The database can only be reached by our own server, never from your browser. Our admin screen is behind a password. Everything travels over an encrypted connection. If something goes wrong and your details are exposed, we will tell you and the Korean authorities without delay." })}
              </p>
            </Section>

            <Section id="children" lang={lang}>
              <p className="mt-4">
                {pick({ ko: "이 서비스는 성인을 위한 것입니다. 만 14세 미만의 정보를 알면서 수집하지 않습니다. 아동이 정보를 보냈다고 생각되시면 메일 주시면 지우겠습니다.", en: "This service is for adults. We do not knowingly collect details from anyone under 14. If you believe a child has sent us their details, email us and we will delete them." })}
              </p>
            </Section>

            <Section id="contact" lang={lang}>
              {/* TODO(출시 전): 사업자등록 후 상호·대표자·등록번호·주소를 여기에 넣는다. */}
              <p className="mt-4">mohallae — {mail}</p>
              <p className="mt-4">
                {pick({ ko: "저희가 문제를 해결해 드리지 못하면 한국인터넷진흥원 개인정보 침해신고센터(privacy.go.kr, 118)에, 유럽이나 영국에 계시면 해당 국가의 개인정보 감독기구에 신고하실 수 있습니다.", en: "If we do not resolve your concern, you can complain to the Korea Internet & Security Agency Privacy Center (privacy.go.kr, 118) or, if you are in Europe or the UK, to your national data protection authority." })}
              </p>
            </Section>

            <Section id="changes" lang={lang}>
              <p className="mt-4">
                {pick({ ko: "정보를 다루는 방식이 바뀌면 이 페이지를 고치고 맨 위 날짜를 바꿉니다. 중요한 변경이고 이메일을 알고 있으면 따로 알려드립니다.", en: "If we change how we handle your details, we will update this page and change the date at the top. If the change is significant and we have your email, we will tell you." })}
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
      aria-labelledby="privacy-contents"
      className="rounded-[16px] bg-[var(--m-band)] px-5 py-4 lg:sticky lg:top-8 lg:self-start lg:rounded-none lg:bg-transparent lg:p-0"
    >
      <p id="privacy-contents" className="text-[12px] font-semibold text-[var(--m-ink-3)]">
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
function Bullets({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`flex flex-col gap-2 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3.5">
          <span aria-hidden="true" className="mt-[0.68em] size-[5px] flex-none rounded-full bg-[var(--m-ink-3)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
