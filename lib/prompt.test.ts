// 실행: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildFreeDraftPrompt, buildFullPlanPrompt, fullItinerarySchema } from './prompt.ts'
import type { FreeItinerary, PlanInput } from './types.ts'

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

/**
 * 유료 일정이 손님이 본 무료 초안을 이어받는지 지킨다 (써니 요청 2026-10-11).
 * 무료 초안 화면이 팁 없는 날마다 "전체 일정에서 볼 수 있습니다"라고 약속하기 때문에,
 * 초안의 장소를 넘기는 줄과 날 수를 못 박는 줄이 빠지면 안 된다.
 */
test('유료 지시문이 초안의 장소를 넘기고 빼지 말라고 한다', () => {
  const draft = {
    days: [{ dayNumber: 1, theme: '고궁', activities: [{ time: '', name: '경복궁', note: '' }, { time: '', name: '북촌한옥마을', note: '' }] }],
  } as unknown as FreeItinerary
  const 지시문 = buildFullPlanPrompt(input, draft)
  assert.match(지시문, /Day 1 — 고궁: 경복궁 \/ 북촌한옥마을/, '초안의 장소가 지시문에 없다')
  assert.match(지시문, /Never drop a draft stop/, '초안 장소를 빼지 말라는 줄이 없다')
  assert.match(지시문, /Every stop gets its own tips/, '정거장마다 팁 줄이 없다')
  assert.match(지시문, /Write exactly 3 days/, '날 수를 못 박는 줄이 없다')
})

test('초안이 없으면 초안 부분 없이 만든다 (옛 신청)', () => {
  assert.doesNotMatch(buildFullPlanPrompt(input), /The free draft/)
})

test('유료 형식이 날 수를 여행 길이로 못 박는다', () => {
  const days = fullItinerarySchema(4).properties.days
  assert.equal(days.minItems, 4)
  assert.equal(days.maxItems, 4)
})
