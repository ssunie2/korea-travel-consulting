import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { t } from "@/lib/copy";

const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata = {
  title: "Questions people ask — mohallae",
  description: "What the free draft includes, when you get it, and what we do and don't do.",
};

/**
 * 자주 묻는 것.
 *
 * **이건 상담이 아니라 안내문이다** — 규칙 6장(사람이 상담하지 않는다)에 걸리지 않는다.
 * 가이드북에 적힌 글과 같은 성격이고, 미리 써서 붙여 두는 것이다.
 *
 * 첫 화면에 두지 않고 따로 페이지로 뺐다. **찾아보는 글이지 설득하는 글이 아니다** —
 * 랜딩 한가운데에 여덟 개를 늘어놓으면 사려는 사람의 발을 붙든다.
 * 개인정보 처리방침과 같은 자리(꼬리말)에 링크로 둔다.
 *
 * 답을 지어내지 않는다. 환불·수정 요청처럼 **아직 정해지지 않은 것은 아예 넣지 않았다** —
 * 반쯤 아는 것을 적어 두면 그게 약속이 된다.
 */
const FAQ = t({
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
    ["여러 도시를 도는 여행도 되나요?",
     "됩니다. 열다섯 곳 중에서 여러 곳을 고르실 수 있고, 목록에 없는 곳은 직접 적으시면 됩니다."],
    ["몇 명까지 되나요?", "한 명부터 스무 명까지 됩니다."],
    ["비자가 필요한가요?",
     "국적마다 달라서 저희가 답할 수 없습니다. 반드시 대한민국 대사관이나 하이코리아(hikorea.go.kr)에서 확인해 주세요."],
  ] as [string, string][],
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
    ["Can I visit several cities?",
     "Yes. Pick as many as you like from fifteen, and type in anywhere that is not on the list."],
    ["How many people?", "One to twenty."],
    ["Do I need a visa?",
     "That depends on your passport, so we cannot answer it for you. Please check with a Korean embassy or hikorea.go.kr."],
  ] as [string, string][],
});

export default function FaqPage() {
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
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight">
          {t({ ko: "자주 묻는 것", en: "Questions people ask" })}
        </h1>
        <p className="mt-5 break-keep text-lg leading-relaxed text-[var(--c-text-2)]">
          {t({
            ko: "여기 없는 것이 궁금하시면 물어봐 주세요.",
            en: "If your question isn't here, just ask.",
          })}{" "}
          <Link
            href="/contact"
            className="underline underline-offset-4 hover:text-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]"
          >
            {t({ ko: "무엇이든 물어보세요", en: "Ask us anything" })}
          </Link>
          .
        </p>

        {/*
          details/summary 를 쓴다. **여닫는 데 자바스크립트가 하나도 안 든다** —
          브라우저가 원래 하는 일이라 화면 낭독기도 알아서 읽고, 느려지지도 않는다.
          group-open: 은 열렸을 때 + 를 × 로 돌리는 것뿐이다.
        */}
        <div className="mt-12 divide-y divide-[var(--c-line-2)] border-y border-[var(--c-line-2)]">
          {FAQ.map(([question, answer]) => (
            <details key={question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)]">
                {/*
                  **닫힌 것은 작게, 연 것은 크고 주황으로.** 여는 순간 글자가 커지고 색이 바뀌어
                  확대되는 느낌이 난다. transition 이 없으면 툭 바뀌어 확대가 아니라
                  다른 글자로 갈아탄 것처럼 보인다. 0.2초는 눈이 따라갈 수 있으면서
                  기다린다는 느낌은 안 드는 길이다.

                  **진한 주황(--c-accent)이 아니라 밝은 주황(--c-accent-soft)을 쓴다.**
                  이 바탕(#16302C)에서 진한 주황은 대비가 3.96 이라 읽기 기준(4.5)에 못 미친다.
                  밝은 주황은 5.34 로 통과한다. 18px 는 '큰 글자' 예외에 안 들어가므로
                  4.5 를 그대로 맞춰야 한다.
                */}
                <span className="break-keep text-base leading-snug text-[var(--c-text)] transition-[font-size,color] duration-200 group-open:text-lg group-open:text-[var(--c-accent-soft)]">
                  {question}
                </span>
                <span
                  aria-hidden
                  className="flex-none text-[var(--c-text-3)] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="break-keep pb-6 leading-relaxed text-[var(--c-text-2)]">{answer}</p>
            </details>
          ))}
        </div>

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
