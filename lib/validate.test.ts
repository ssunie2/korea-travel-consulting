// 실행: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validatePlanInput } from './validate.ts'

const good = {
  destinations: ['Seoul'],
  startDate: '2026-10-01',
  durationDays: 5,
  travelers: 2,
  budgetCurrency: 'USD',
  language: 'en',
  styles: ['food'],
}

test('정상 입력은 통과한다', () => {
  const r = validatePlanInput(good)
  assert.equal(r.ok, true)
})

test('기간이 30일을 넘으면 막는다 (AI 요금 방어)', () => {
  const r = validatePlanInput({ ...good, durationDays: 365 })
  assert.equal(r.ok, false)
})

test('기간이 숫자가 아니면 막는다', () => {
  assert.equal(validatePlanInput({ ...good, durationDays: 'many' }).ok, false)
})

test('인원 범위를 벗어나면 막는다', () => {
  assert.equal(validatePlanInput({ ...good, travelers: 0 }).ok, false)
  assert.equal(validatePlanInput({ ...good, travelers: 999 }).ok, false)
})

test('목적지가 없으면 막는다 (AI가 일정을 못 만든다)', () => {
  assert.equal(validatePlanInput({ ...good, destinations: [] }).ok, false)
})

test('통화가 이상하면 KRW 로 되돌린다', () => {
  const r = validatePlanInput({ ...good, budgetCurrency: 'BTC' })
  assert.equal(r.ok && r.value.budgetCurrency, 'KRW')
})

test('날짜 형식이 틀리면 막는다', () => {
  assert.equal(validatePlanInput({ ...good, startDate: '10/01/2026' }).ok, false)
})

test('언어 코드가 이상하면 영어로 되돌린다', () => {
  const r = validatePlanInput({ ...good, language: 'not-a-language' })
  assert.equal(r.ok && r.value.language, 'en')
})

test('관심사가 너무 길면 잘라낸다', () => {
  const r = validatePlanInput({ ...good, interests: 'a'.repeat(9999) })
  assert.equal(r.ok && r.value.interests?.length, 500)
})
