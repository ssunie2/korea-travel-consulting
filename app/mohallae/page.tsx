import "./pretendard.css";
import styles from "./landing.module.css";
import { langFrom } from "./content";
import Hero from "./_components/Hero";
import Samples from "./_components/Samples";
import { HowItWorks, LandingFooter, Plans } from "./_components/MoreSections";

/**
 * 새 랜딩 — https://korea-travel-consulting.vercel.app/mohallae (이슈 #86)
 *
 * 시안 21-5 '결과 미리보기' + 날짜별 가격 막대 (캔버스 '21 업그레이드', 2026-10-20 써니 결정).
 * 순서: ① 첫 화면(제목 · 결과 미리보기 · 가격 막대) → ② 초안은 이렇게 생겼습니다(샘플 4 + 1일차 예시)
 * → ③ 무료로 보고, 원하는 날만 열어요 → ④ 이용 방법 + 먼저 물어보기 → 꼬리말.
 *
 * 글꼴은 이 화면만 Pretendard(시안 글꼴). 입력 흐름·결과·자주 묻는 것 화면은 아직 이전 글꼴이다.
 * 기존 첫 화면(/)은 그대로 두고 나란히 비교한다.
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
      </main>
      <LandingFooter lang={lang} />
    </div>
  );
}
