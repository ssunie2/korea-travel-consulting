/**
 * 폼에서 **고르는 답**의 값 목록.
 *
 * 한 곳에 모아 둔 이유 — 같은 글자가 폼·검증·지시문 세 군데에 흩어져 있으면
 * 한쪽만 고쳐서 서로 다른 말을 하게 된다. 실제로 지시문이 `'Already booked'` 를
 * 문자열로 비교하고 있었고, 폼에서 그 글자를 바꾸면 조용히 어긋났다 (Codex 리뷰, PR #76).
 *
 * `v` 가 **서버·DB·AI 로 나가는 값**이고 `ko` 는 화면에만 쓴다.
 * 영어 라벨을 그대로 값으로 쓰는 것은 앞선 문항들과 같은 방식이다 —
 * 이 글자가 그대로 AI 프롬프트로 들어가기 때문에 코드값을 따로 두면 번역이 한 번 더 필요하다.
 *
 * ⚠️ 여기 값을 바꾸면 **이미 저장된 초안의 값과 달라진다.** 옛 값은 그대로 남는다.
 */
export const ORIGINS = [
  { v: 'East Asia — little or no jet lag', ko: '동아시아 — 일본·중국·대만 등' },
  { v: 'Southeast or South Asia', ko: '동남아·남아시아' },
  { v: 'Europe or the Middle East', ko: '유럽·중동' },
  { v: 'North America', ko: '북미' },
  { v: 'Oceania', ko: '오세아니아' },
] as const

export const FIRST_DAYS = [
  { v: 'From the morning — a full first day', ko: '아침부터 — 첫날을 온전히 써요' },
  { v: 'From around midday', ko: '점심쯤부터' },
  { v: 'From the evening', ko: '저녁부터' },
  { v: 'Arriving late at night — the first day is basically gone', ko: '밤늦게 도착 — 첫날은 거의 못 써요' },
] as const

export const LAST_DAYS = [
  { v: 'Leaving early in the morning — the last day is basically gone', ko: '아침 일찍 떠나요 — 마지막날은 거의 못 써요' },
  { v: 'Leaving around midday', ko: '점심쯤 떠나요' },
  { v: 'Leaving in the evening', ko: '저녁에 떠나요' },
  { v: 'Staying until late — a full last day', ko: '밤늦게까지 — 마지막날을 온전히 써요' },
] as const

/** 이 값은 지시문에서도 비교한다 (`lib/prompt.ts`). 바꾸면 거기도 같이 본다 */
export const STAY_BOOKED_YES = 'Already booked'
export const STAY_BOOKED = [
  { v: STAY_BOOKED_YES, ko: '이미 잡았어요' },
  { v: 'Not booked yet', ko: '아직이요 — 추천해 주세요' },
] as const

export const BUDGET_SCOPES = [
  { v: 'Flights are included in that budget', ko: '항공권 포함이에요' },
  { v: 'Flights not included — that is spending money inside Korea', ko: '항공권 빼고, 한국에서 쓸 돈이에요' },
] as const

/** 서버 검증용 — 보기에 없는 값은 받지 않는다 */
export const values = (list: readonly { v: string }[]) => list.map((o) => o.v)
