// 실행: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkFullPlan } from './check-full-plan.ts'
import type { FreeItinerary, FullItinerary } from './types.ts'

const tip = { highlight: '꼭 할 것', pitfall: '피할 것', insiderSecret: '현지인의 말', reservationRequired: false }
const stop = (name: string, tips: object = tip) => ({ time: '10:00', name, description: '', gettingThere: '', tips })

/** 검사에 필요한 칸만 채운 유료 일정 */
const fullPlan = (days: { dayNumber: number; activities: ReturnType<typeof stop>[] }[]) =>
  ({ days: days.map((d) => ({ ...d, theme: '', area: '', routeNote: '' })) }) as unknown as FullItinerary

const draft = {
  days: [
    { dayNumber: 1, theme: '', activities: [{ time: '', name: '경복궁', note: '' }, { time: '', name: '동대문디자인플라자(DDP)', note: '' }] },
    { dayNumber: 2, theme: '', activities: [{ time: '', name: 'N서울타워', note: '' }] },
  ],
} as unknown as FreeItinerary

test('초안의 장소가 다 있고 팁이 다 차 있으면 통과한다 (이름이 조금 달라도 같은 곳)', () => {
  const full = fullPlan([
    { dayNumber: 1, activities: [stop('경복궁 (Gyeongbokgung Palace)'), stop('동대문디자인플라자 DDP'), stop('광장시장')] },
    { dayNumber: 2, activities: [stop('남산 N서울타워'), stop('명동'), stop('청계천')] },
  ])
  assert.deepEqual(checkFullPlan(full, 2, draft), [])
})

test('날이 빠지면 걸린다', () => {
  const full = fullPlan([{ dayNumber: 1, activities: [stop('경복궁'), stop('동대문디자인플라자(DDP)'), stop('N서울타워')] }])
  assert.match(checkFullPlan(full, 2, draft).join('\n'), /날 수가 2일이 아니라 1일/)
})

test('팁 칸이 있어도 글이 비어 있으면 걸린다', () => {
  const full = fullPlan([
    { dayNumber: 1, activities: [stop('경복궁', { ...tip, pitfall: '  ' }), stop('동대문디자인플라자(DDP)'), stop('광장시장')] },
    { dayNumber: 2, activities: [stop('N서울타워'), stop('명동'), stop('청계천')] },
  ])
  assert.match(checkFullPlan(full, 2, draft).join('\n'), /1일차 '경복궁'의 팁이 비어 있습니다/)
})

test('초안에서 본 장소가 유료 일정에 없으면 걸린다', () => {
  const full = fullPlan([
    { dayNumber: 1, activities: [stop('경복궁'), stop('동대문디자인플라자(DDP)'), stop('광장시장')] },
    { dayNumber: 2, activities: [stop('명동'), stop('청계천'), stop('점심')] },
  ])
  assert.match(checkFullPlan(full, 2, draft).join('\n'), /초안 2일차의 'N서울타워'/)
})

test("짧은 낱말 하나('점심')를 초안 장소('광장시장 점심')로 치지 않는다", () => {
  const lunch = { days: [{ dayNumber: 1, theme: '', activities: [{ time: '', name: '광장시장 점심', note: '' }] }] } as unknown as FreeItinerary
  const full = fullPlan([{ dayNumber: 1, activities: [stop('점심'), stop('경복궁'), stop('북촌')] }])
  assert.match(checkFullPlan(full, 1, lunch).join('\n'), /'광장시장 점심'/)
})

test('휴무일 때문에 다른 날로 옮긴 장소는 있는 것으로 본다', () => {
  const full = fullPlan([
    { dayNumber: 1, activities: [stop('동대문디자인플라자(DDP)'), stop('광장시장'), stop('N서울타워')] },
    { dayNumber: 2, activities: [stop('경복궁'), stop('북촌'), stop('삼청동')] },
  ])
  assert.deepEqual(checkFullPlan(full, 2, draft), [])
})

test('초안이 없는 옛 신청도 날 수와 팁은 본다', () => {
  const full = fullPlan([{ dayNumber: 1, activities: [] }])
  assert.match(checkFullPlan(full, 1, null).join('\n'), /1일차에 정거장이 없습니다/)
})
