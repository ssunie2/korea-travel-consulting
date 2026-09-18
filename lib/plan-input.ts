import type { Plan, PlanInput } from './types.ts'

/**
 * DB 에 저장된 초안 한 줄을 **AI 에게 넘길 입력으로 되돌린다.**
 *
 * 이 함수가 왜 따로 있느냐 — **전에는 이 옮기는 일을 `app/admin/page.tsx` 안에서
 * 손으로 적고 있었고, 폼에 칸을 일곱 개 늘렸을 때 거기를 안 고쳤다.**
 * 그래서 무료 초안에는 들어간 답이 **$25 유료 일정에는 하나도 안 들어갔다.**
 * 돈을 낸 문서가 공짜 문서보다 손님을 덜 아는 상태였다 (Codex 리뷰, PR #76).
 *
 * 타입 검사로는 안 잡힌다. 옮기는 쪽이 칸을 그냥 안 적어도 컴파일은 통과한다.
 * 그래서 **옮기는 자리를 한 곳으로 모으고, 빠진 칸이 있으면 터지는 테스트**를 뒀다
 * (`lib/plan-input.test.ts`).
 *
 * ⚠️ `PlanInput` 에 칸을 더하면 **여기와 `Plan` 타입과 마이그레이션 세 곳**을 같이 고친다.
 */
export function planInputFromRow(plan: Plan): PlanInput {
  return {
    destinations: plan.destinations,
    startDate: plan.start_date,
    durationDays: plan.duration_days,
    travelers: plan.travelers,
    budgetRange: plan.budget_range ?? undefined,
    budgetPerPerson: plan.budget_per_person ?? undefined,
    budgetCurrency: plan.budget_currency,
    styles: plan.styles,
    audience: plan.audience ?? undefined,
    pace: plan.pace ?? undefined,
    visitedBefore: plan.visited_before ?? undefined,
    transport: plan.transport ?? undefined,
    stayArea: plan.stay_area ?? undefined,
    dayRhythm: plan.day_rhythm ?? undefined,
    occasion: plan.occasion ?? undefined,
    avoid: plan.avoid ?? undefined,
    dietary: plan.dietary ?? undefined,
    origin: plan.origin ?? undefined,
    firstDay: plan.first_day ?? undefined,
    lastDay: plan.last_day ?? undefined,
    budgetScope: plan.budget_scope ?? undefined,
    stayBooked: plan.stay_booked ?? undefined,
    stayPlace: plan.stay_place ?? undefined,
    kidsAges: plan.kids_ages ?? undefined,
    language: plan.language,
  }
}
