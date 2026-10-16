import type { Metadata } from "next";
import Link from "next/link";
import styles from "../mohallae.module.css";
import { ask, langFrom, planHref, type Pair } from "../content";
import SubHeader from "../_components/SubHeader";
import { Footer } from "../_components/MoreSections";

/**
 * 자주 묻는 것 — 새 디자인 (/mohallae/faq). 예전 화면(app/faq)은 그대로 두고 글을 옮겨 왔다.
 *
 * **이건 상담이 아니라 안내문이다** — 규칙 6장(사람이 상담하지 않는다)에 걸리지 않는다.
 * 가이드북에 적힌 글과 같은 성격이고, 미리 써서 붙여 두는 것이다.
 *
 * 첫 화면에 두지 않고 따로 페이지로 뺐다. **찾아보는 글이지 설득하는 글이 아니다** —
 * 랜딩 한가운데에 여덟 개를 늘어놓으면 사려는 사람의 발을 붙든다.
 * 개인정보 처리방침과 같은 자리(꼬리말)에 링크로 둔다. 새 랜딩에서는 위 내비와 '먼저 물어보고 싶으신가요?' 칸에도 있다.
 *
 * 답을 지어내지 않는다. 환불·수정 요청처럼 **아직 정해지지 않은 것은 아예 넣지 않았다** —
 * 반쯤 아는 것을 적어 두면 그게 약속이 된다.
 *
 * 언어는 주소로 정한다 (?lang=en → 영어). t() 는 주소를 모르므로 { ko, en } 짝에서 직접 고른다.
 */
const TITLE: Pair<string> = { ko: "자주 묻는 것", en: "Questions people ask" };
const DESCRIPTION: Pair<string> = {
  ko: "무료 초안에 무엇이 들어 있는지, 언제 받는지, 저희가 하는 것과 안 하는 것.",
  en: "What the free draft includes, when you get it, and what we do and don't do.",
};
const MORE: Pair<string> = { ko: "그 외 궁금하신가요?", en: "Anything else?" };

export async function generateMetadata({ searchParams }: PageProps<"/mohallae/faq">): Promise<Metadata> {
  const lang = langFrom((await searchParams).lang);
  return { title: `${TITLE[lang]} — mohallae`, description: DESCRIPTION[lang] };
}

// 여덟 개 모두 예전 화면의 글 그대로다. '여러 도시' 답 하나만 바꿨다 (아래 '바꾼 답' 표시).
const FAQ: Pair<[string, string][]> = {
  ko: [
    ["무료 초안은 정말 무료인가요?",
     "네. 가입도 카드도 필요 없습니다. 폼을 내시면 그 자리에서 초안이 나옵니다."],
    ["초안은 언제 받나요?",
     "기다리실 필요 없습니다. 폼을 내신 화면에서 바로 만들어져 나옵니다. 1분이 채 걸리지 않습니다."],
    ["예약도 대신 해주시나요?",
     "아니요. 저희는 계획을 세우고 예약은 손님이 하십니다. 대신 무엇을 언제 어떻게 예약하면 되는지 알려드립니다 — 한국 전화로만 받는 곳까지."],
    ["전체 일정에는 무엇이 더 들어가나요?",
     "모든 정거장마다 팁이 하나씩 붙고, 숙소 다섯 곳과 식당 다섯 곳을 고른 이유까지 적습니다. 비용을 항목별로 나누고, 동선과 시간을 계산해 드립니다."],
    ["한국어를 못해도 괜찮나요?",
     "문서는 고르신 언어로 나갑니다. 한국어만 통하는 곳은 미리 알려드리고, 그런 곳에서 무엇을 어떻게 하면 되는지도 함께 적습니다."],
    // 바꾼 답 (2026-10): 새 입력 흐름은 서울만 연다. 예전 답은 '열다섯 곳 중 여러 곳'
    ["여러 도시를 도는 여행도 되나요?",
     "지금은 서울만 고르실 수 있습니다. 서울 안에서는 동네를 여러 곳 고르실 수 있습니다."],
    ["몇 명까지 되나요?", "한 명부터 스무 명까지 됩니다."],
    ["비자가 필요한가요?",
     "국적마다 달라서 저희가 답할 수 없습니다. 반드시 대한민국 대사관이나 하이코리아(hikorea.go.kr)에서 확인해 주세요."],
  ],
  en: [
    ["Is the free draft really free?",
     "Yes. No account, no card. Submit the form and your draft appears right there."],
    ["When do I get the draft?",
     "No waiting. It is written on the same screen you submitted from, in under a minute."],
    ["Will you book things for me?",
     "No. We plan; you book. We tell you exactly what to book and when — including the places that only take Korean phone reservations."],
    ["What else is in the full plan?",
     "A tip at every stop, five places to stay and five to eat with the reasons we picked them, costs broken down, and the route and timing worked out."],
    ["Do I need to speak Korean?",
     "Your plan comes in the language you choose. Where a place only works in Korean, we say so and tell you how to handle it."],
    // 바꾼 답 (2026-10): 위와 같음
    ["Can I visit several cities?",
     "For now you can pick Seoul only. Inside Seoul, pick as many neighbourhoods as you like."],
    ["How many people?", "One to twenty."],
    ["Do I need a visa?",
     "That depends on your passport, so we cannot answer it for you. Please check with a Korean embassy or hikorea.go.kr."],
  ],
};

export default async function FaqPage({ searchParams }: PageProps<"/mohallae/faq">) {
  const lang = langFrom((await searchParams).lang);

  return (
    <div lang={lang} className={`${styles.page} flex-1`}>
      <SubHeader lang={lang} path="/mohallae/faq" />

      <main className={`${styles.wrap} pt-14 pb-20 md:pt-20 md:pb-28`}>
        <h1 className="text-[clamp(34px,4.2vw,56px)] leading-[1.1] font-extrabold tracking-[-0.02em]">{TITLE[lang]}</h1>
        <p className="mt-4 max-w-[36rem] text-[17px] leading-relaxed text-[var(--m-ink-2)] md:mt-5 md:text-[18px]">
          {DESCRIPTION[lang]}
        </p>

        {/*
          details/summary 를 쓴다. **여닫는 데 자바스크립트가 하나도 안 든다** —
          브라우저가 원래 하는 일이라 화면 낭독기도 알아서 읽고, 느려지지도 않는다.
          group-open: 은 열렸을 때 + 를 × 로 돌리는 것뿐이다.
        */}
        <div className={`${styles.panel} mt-10 max-w-[780px] divide-y divide-[var(--m-line)] md:mt-12`}>
          {FAQ[lang].map(([question, answer]) => (
            <details key={question} className="group">
              <summary
                className={`${styles.faqSummary} flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 md:gap-5 md:px-8 md:py-6`}
              >
                <span className="text-[17px] leading-snug font-semibold md:text-[18px]">{question}</span>
                <span
                  aria-hidden="true"
                  className="flex size-[30px] flex-none items-center justify-center rounded-full bg-[var(--m-band)] transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none md:size-8"
                >
                  <svg viewBox="0 0 12 12" className="size-3">
                    <path d="M6 1.5v9M1.5 6h9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="-mt-1.5 px-6 pb-6 text-[16px] leading-relaxed break-keep text-[var(--m-ink-2)] md:-mt-2 md:px-8 md:pr-[84px] md:pb-7">
                {answer}
              </p>
            </details>
          ))}
        </div>

        {/*
          문의 안내는 **목록 아래**에 둔다. 위에 두면 아직 읽지도 않은 사람에게 먼저 물어보라고 하는 셈이다.
          여덟 개를 다 훑고도 답이 없을 때 바로 눈에 들어오는 자리가 여기다.
          모양은 랜딩의 '먼저 물어보고 싶으신가요?' 칸(MoreSections.tsx 의 Ask)과 같다. 문의 화면(/contact)은 아직 예전 것이다.
        */}
        <section
          aria-label={MORE[lang]}
          className="mt-10 flex max-w-[780px] flex-col items-start gap-6 rounded-[var(--m-radius)] bg-[var(--m-band)] p-7 md:mt-12 md:flex-row md:items-center md:justify-between md:p-8"
        >
          <div>
            <p className="text-[20px] leading-snug font-bold tracking-[-0.01em]">{MORE[lang]}</p>
            <p className="mt-2 text-[15.5px] text-[var(--m-ink-2)]">
              <Link href="/contact" className={styles.textLink}>
                {ask.contact[lang]}
              </Link>
            </p>
          </div>
          <Link href={planHref(lang)} className={`${styles.pillDark} h-[50px] shrink-0 px-8 text-[16.5px]`}>
            {ask.cta[lang]}
          </Link>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}
