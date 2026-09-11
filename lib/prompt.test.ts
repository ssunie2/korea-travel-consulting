// 실행: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildFreeDraftPrompt, buildFullPlanPrompt, freeItinerarySchema, fullItinerarySchema } from './prompt.ts'
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

/** Astra의 strict JSON 형식은 모든 객체의 항목을 required에 넣고, 여분 항목을 막아야 한다. */
function assertStrictSchema(schema: unknown): void {
  if (!schema || typeof schema !== 'object') return
  const node = schema as { type?: string; properties?: Record<string, unknown>; required?: string[]; additionalProperties?: boolean; items?: unknown }

  if (node.type === 'object') {
    assert.equal(node.additionalProperties, false)
    assert.deepEqual(new Set(node.required), new Set(Object.keys(node.properties ?? {})))
    Object.values(node.properties ?? {}).forEach(assertStrictSchema)
  }
  if (node.type === 'array') assertStrictSchema(node.items)
}

test('Astra 출력 형식이 strict JSON 규칙을 지킨다', () => {
  assertStrictSchema(freeItinerarySchema)
  assertStrictSchema(fullItinerarySchema)
})
