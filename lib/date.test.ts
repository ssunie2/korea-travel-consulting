// 실행: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dayLabel, dateRange } from './date.ts'
import { LANG } from './copy.ts'

/**
 * 하나 차이(off-by-one)와 시간대 밀림을 붙들어 둔다 (이슈 #53 🟡6).
 *
 * 지금 계산은 맞다 — 뮤조가 월말 넘김까지 직접 확인했다. 이 테스트는
 * **앞으로 안 깨지게** 하려는 것이지 버그를 잡으려는 게 아니다.
 *
 * 화면 언어(LANG)에 따라 나오는 글자가 달라서, 한국어일 때만 글자를 비교한다.
 * 영어로 넘어가도 테스트가 거짓으로 실패하지 않게 하려는 것이다.
 */
const 한국어 = LANG === 'ko'

test('1일차는 출발일 그대로다 (하루 밀리지 않는다)', () => {
  // 2026-10-04 는 일요일
  assert.equal(dayLabel('2026-10-04', 1), 한국어 ? '10월 4일 (일)' : 'Oct 4, Sun')
})

test('며칠째를 더할 때 하나씩 정확히 간다', () => {
  assert.equal(dayLabel('2026-10-04', 2), 한국어 ? '10월 5일 (월)' : 'Oct 5, Mon')
  assert.equal(dayLabel('2026-10-04', 7), 한국어 ? '10월 10일 (토)' : 'Oct 10, Sat')
})

test('월말을 넘어가도 맞다', () => {
  // 10/30 + 4일째 = 11/2 (월)
  assert.equal(dayLabel('2026-10-30', 4), 한국어 ? '11월 2일 (월)' : 'Nov 2, Mon')
})

test('연말을 넘어가도 맞다', () => {
  // 2026-12-31 + 2일째 = 2027-01-01 (금)
  assert.equal(dayLabel('2026-12-31', 2), 한국어 ? '1월 1일 (금)' : 'Jan 1, Fri')
})

test('윤년 2월 29일을 건너뛰지 않는다', () => {
  // 2028 은 윤년. 2/28 + 2일째 = 2/29
  assert.equal(dayLabel('2028-02-28', 2), 한국어 ? '2월 29일 (화)' : 'Feb 29, Tue')
})

test('기간은 마지막 날을 포함한다 (3일이면 4일~6일)', () => {
  assert.equal(
    dateRange('2026-10-04', 3),
    한국어 ? '2026년 10월 4일 – 10월 6일' : 'Oct 4 – Oct 6, 2026',
  )
})

test('하루짜리 여행은 시작과 끝이 같다', () => {
  assert.equal(
    dateRange('2026-10-04', 1),
    한국어 ? '2026년 10월 4일 – 10월 4일' : 'Oct 4 – Oct 4, 2026',
  )
})

/**
 * 시간대 밀림 확인. 손님은 해외에서 접속하므로 서버·브라우저 시간대가
 * 한국이 아닐 수 있다. UTC 로만 세는지 본다.
 */
test('시간대가 달라도 날짜가 안 밀린다', () => {
  const 원래 = process.env.TZ
  for (const tz of ['America/Los_Angeles', 'Pacific/Kiritimati', 'UTC']) {
    process.env.TZ = tz
    assert.equal(dayLabel('2026-10-04', 1), 한국어 ? '10월 4일 (일)' : 'Oct 4, Sun', `${tz} 에서 밀림`)
  }
  process.env.TZ = 원래
})
