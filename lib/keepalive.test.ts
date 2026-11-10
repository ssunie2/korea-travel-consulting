// 실행: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { keepaliveAllowed } from './keepalive.ts'

test('CRON_SECRET 이 없으면 누구 요청이든 받는다 — 설정을 빠뜨려도 깨우기가 멈추지 않게', () => {
  assert.equal(keepaliveAllowed(null, undefined), true)
  assert.equal(keepaliveAllowed(null, ''), true)
})

test('CRON_SECRET 이 있으면 Vercel 이 보내는 Bearer 값이 맞을 때만 받는다', () => {
  assert.equal(keepaliveAllowed('Bearer s3cret-value', 's3cret-value'), true)
  assert.equal(keepaliveAllowed(null, 's3cret-value'), false)
  assert.equal(keepaliveAllowed('Bearer wrong', 's3cret-value'), false)
  assert.equal(keepaliveAllowed('s3cret-value', 's3cret-value'), false) // 'Bearer ' 가 빠지면 안 된다
})
