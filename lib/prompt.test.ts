// 실행: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildFreeDraftPrompt, buildFullPlanPrompt } from './prompt.ts'
import type { PlanInput } from './types.ts'

const input: PlanInput = {
  destinations: ['Seoul'],
  startDate: '2026-10-14',
  durationDays: 3,
  travelers: 2,
  budgetCurrency: 'USD',
  styles: ['Food'],
  language: 'ko',
}

/**
 * 규칙 3장 1번을 AI 에게 말해주는 문장이 지시문에 남아 있는지 지킨다.
 *
 * 지시문은 길어서 나중에 누가 정리하다 통째로 지우기 쉽다. 그런데 이 몇 줄이
 * 빠지면 AI 가 "예약해 드리겠습니다" 를 쓸 수 있고, 그러면 문체부 회신의 전제
 * (단순 정보 제공)가 깨진다. 문구가 사라지면 여기서 먼저 걸린다.
 */
for (const [이름, 지시문] of [
  ['무료 초안', buildFreeDraftPrompt(input)],
  ['유료 전체 일정', buildFullPlanPrompt(input)],
] as const) {
  test(`${이름} 지시문에 법적 경계가 들어 있다`, () => {
    assert.match(지시문, /legal line/, '경계 블록 자체가 없다')
    assert.match(지시문, /NEVER write/, '금지 목록이 없다')
    assert.match(지시문, /on their behalf/, '대리 금지 문구가 없다')
    assert.match(지시문, /MEDICAL/, '병원 이름 금지가 없다')
  })
}
