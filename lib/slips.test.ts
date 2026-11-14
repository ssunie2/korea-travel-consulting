// 실행: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fixSlipText, fixSlips } from './slips.ts'

test('입는 한옥은 한복으로 — 실제로 AI 가 쓴 문장들', () => {
  assert.equal(
    fixSlipText('Wear a traditional hanok costume to enter the palace grounds completely free.'),
    'Wear a traditional hanbok costume to enter the palace grounds completely free.',
  )
  assert.equal(fixSlipText('Rent traditional hanok attire for free entry to the royal palace.'), 'Rent traditional hanbok attire for free entry to the royal palace.')
  assert.equal(fixSlipText('Wear a traditional hanok costume for free admission'), 'Wear a traditional hanbok costume for free admission')
  assert.equal(fixSlipText('Hanok rentals near the gate'), 'Hanbok rentals near the gate')
  assert.equal(fixSlipText('wearing a hanok gets you in free'), 'wearing a hanbok gets you in free')
  assert.equal(fixSlipText('한옥을 입고 가면 무료예요'), '한복을 입고 가면 무료예요')
})

test('집으로서의 한옥은 그대로', () => {
  for (const s of [
    'Bukchon Hanok Village',
    'Stay one night in a hanok guesthouse.',
    'Walk past rows of hanok houses with tiled roofs.',
    '북촌 한옥마을을 걸어요',
    '한옥에서 하룻밤',
  ]) assert.equal(fixSlipText(s), s)
})

test('초안 전체 모양은 그대로, 글자만 고친다', () => {
  const draft = { tripTitle: 'Seoul', days: [{ activities: [{ note: 'wear hanok attire' }] }], travelers: 1, tip: null }
  assert.deepEqual(fixSlips(draft), { tripTitle: 'Seoul', days: [{ activities: [{ note: 'wear hanbok attire' }] }], travelers: 1, tip: null })
})
