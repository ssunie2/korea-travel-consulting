import test from 'node:test'
import assert from 'node:assert/strict'
import { planInputFromRow } from './plan-input.ts'
import type { Plan } from './types.ts'

/**
 * DB 한 줄에서 AI 입력으로 옮길 때 **칸이 새는지** 본다.
 *
 * 실제로 한 번 샜다 — 폼에 칸을 일곱 개 늘렸는데 유료 일정 쪽 옮기는 코드를 안 고쳐서
 * **$25 낸 문서가 공짜 초안보다 손님을 덜 아는 상태**가 됐다 (Codex 리뷰, PR #76).
 * 타입 검사로는 안 잡힌다 — 안 적어도 컴파일은 통과한다.
 */

/** 답이 아니라 관리용이라 AI 에게 안 넘기는 칸 */
const NOT_ANSWERS = new Set(['id', 'created_at', 'itinerary', 'dietary_notes', 'interests'])

/** `stay_place` → `stayPlace` */
const camel = (k: string) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())

// 아래를 다 적지 않으면 타입 검사가 막는다 — 그게 이 테스트의 첫 번째 안전장치다
const row: Plan = {
  id: 'p1', created_at: '2026-09-19T00:00:00Z',
  destinations: ['Seoul'], start_date: '2026-10-25', duration_days: 5, travelers: 2,
  budget_range: '250,000–350,000 KRW', budget_per_person: 300000, budget_currency: 'USD',
  styles: ['Food'], audience: 'Family with kids', pace: 'Balanced',
  visited_before: 'First time', transport: 'Subway and bus', stay_area: 'City centre',
  day_rhythm: 'Early start', occasion: 'Birthday',
  origin: 'Europe or the Middle East', first_day: 'From the morning',
  last_day: 'Leaving in the evening', budget_scope: 'Flights are included in that budget',
  stay_booked: 'Already booked', stay_place: '홍대', kids_ages: '4 and 9',
  avoid: ['Crowded places'], dietary: ['Halal'],
  dietary_notes: null, interests: null,
  language: 'ko', itinerary: null,
}

test('DB 의 답이 AI 입력으로 하나도 안 새고 넘어간다', () => {
  const input = planInputFromRow(row) as Record<string, unknown>
  const lost = Object.keys(row)
    .filter((k) => !NOT_ANSWERS.has(k))
    .filter((k) => input[camel(k)] === undefined)

  assert.deepEqual(
    lost,
    [],
    `AI 입력으로 안 넘어간 칸이 있다: ${lost.join(', ')}\n` +
      `→ lib/plan-input.ts 의 planInputFromRow() 에 추가하라.`,
  )
})

test('비어 있는 칸은 undefined 로 넘긴다', () => {
  // null 을 그대로 넘기면 프롬프트에 "null" 이라는 글자가 들어간다.
  // shape() 는 값이 있을 때만 줄을 넣으므로 undefined 여야 아예 빠진다.
  const empty = planInputFromRow({ ...row, origin: null, kids_ages: null, stay_place: null })
  assert.equal(empty.origin, undefined)
  assert.equal(empty.kidsAges, undefined)
  assert.equal(empty.stayPlace, undefined)
})
