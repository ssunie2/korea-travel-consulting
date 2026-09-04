import { t } from './copy.ts'

/**
 * 초안 화면의 날짜 표기. **화면에서 옮겨 왔다** (이슈 #53 🟡6).
 *
 * 하나 차이(off-by-one)가 나기 딱 좋은 계산인데 확인 장치가 없었다.
 * 지금 값은 맞지만 앞으로 안 깨지게 붙들어 두려고 lib 로 빼서 테스트를 붙였다
 * (`lib/date.test.ts`).
 *
 * 두 함수 모두 **UTC 로만 센다.** 현지 시간대로 세면 접속한 나라에 따라
 * 하루가 밀린다 — 손님이 해외에 있으므로 실제로 밀린다.
 */

/**
 * 며칠째가 실제로 몇 월 며칠 무슨 요일인지.
 *
 * **AI 에게 시키지 않는다.** 출발일과 며칠째만 있으면 정확히 나오는 계산이고,
 * 맡기면 요일을 틀리게 쓴다. 요일이 중요한 이유는 **일요일에 문 닫는 곳이 많아서**다 —
 * 요일을 모르면 헛걸음한다.
 */
export function dayLabel(startDate: string, dayNumber: number) {
  const d = new Date(`${startDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dayNumber - 1)
  const KO = ['일', '월', '화', '수', '목', '금', '토']
  return t({
    ko: `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${KO[d.getUTCDay()]})`,
    en: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short', timeZone: 'UTC' }),
  })
}

/** 여행 전체 기간. 머리줄에 한 번 나온다. */
export function dateRange(startDate: string, days: number) {
  const start = new Date(`${startDate}T00:00:00Z`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + days - 1)
  // 위 dayLabel 과 같은 방식으로 직접 만든다. toLocaleDateString("ko-KR") 은
  // "2026. 10. 4." 처럼 점을 찍어서 우리 화면의 다른 날짜 표기와 어긋난다.
  return t({
    ko: `${start.getUTCFullYear()}년 ${start.getUTCMonth() + 1}월 ${start.getUTCDate()}일 – ${end.getUTCMonth() + 1}월 ${end.getUTCDate()}일`,
    en: (() => {
      const fmt = (d: Date) =>
        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
      return `${fmt(start)} – ${fmt(end)}, ${start.getUTCFullYear()}`
    })(),
  })
}
