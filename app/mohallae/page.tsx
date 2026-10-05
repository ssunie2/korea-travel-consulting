import styles from "./mohallae.module.css";
import { langFrom } from "./content";
import Hero from "./_components/Hero";
import Samples from "./_components/Samples";
import { Ask, Footer, HowItWorks, Plans } from "./_components/MoreSections";

/**
 * 새 랜딩 — https://korea-travel-consulting.vercel.app/mohallae (이슈 #86, 1단계)
 *
 * 기존 첫 화면(/)은 그대로 두고 나란히 비교한다. 순서는 기획서 10장:
 * ① 첫 화면 → ② 초안은 이렇게 생겼습니다(샘플 4 + 초안 속 하루) → ③ 무료 vs 전체 일정
 * → ④ 이용 방법 → ⑤ 자주 묻는 것·문의 → 꼬리말.
 *
 * "무료 초안 받기" 는 지금은 기존 입력 화면(/plan)으로 간다. 새 입력 화면은 2단계에서 만든다.
 */
export default async function MohallaePage({ searchParams }: PageProps<"/mohallae">) {
  const lang = langFrom((await searchParams).lang);

  return (
    <div lang={lang} className={`${styles.page} flex-1`}>
      <Hero lang={lang} />
      <main>
        <Samples lang={lang} />
        <Plans lang={lang} />
        <HowItWorks lang={lang} />
        <Ask lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}
