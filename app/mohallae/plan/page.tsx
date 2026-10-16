import type { Metadata } from "next";
import { langFrom } from "../content";
import PlanFlow from "./_flow/PlanFlow";

/**
 * 새 입력 흐름 — 한 화면에 질문 하나 (이슈 #86 2단계, 승인 시안 input-comp-3 "초안이 자라나는 판").
 *
 * 예전 폼(app/plan)과 베타(app/plan/beta)는 그대로 둔다. 같은 /api/plan 에 같은 모양의 값을 보내고,
 * 다 쓰면 새 결과 화면(/mohallae/plan/[id])으로 간다. 화면은 전부 PlanFlow(브라우저 쪽)가 그린다.
 * 지금은 서울만 묻는다 — 도시 대신 서울 안의 동네를 고른다 (flow.ts)
 */
export const metadata: Metadata = {
  title: "mohallae — 무료 초안 · Free draft",
};

export default async function PlanPage({ searchParams }: PageProps<"/mohallae/plan">) {
  const lang = langFrom((await searchParams).lang);
  return <PlanFlow initialLang={lang} />;
}
