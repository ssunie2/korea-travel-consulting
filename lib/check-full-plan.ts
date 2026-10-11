import type { FreeItinerary, FullItinerary } from './types'

/**
 * 유료 전체 일정이 손님에게 한 약속을 지키는지 **만든 뒤에** 확인한다 (써니 요청 2026-10-11).
 * 문제를 한국어 문장으로 돌려준다. 빈 목록이면 통과다.
 *
 * 무료 초안 화면은 팁이 없는 날마다 팁 자리를 가려 두고 "이 날의 현지 팁은 전체 일정에서 볼 수 있습니다"라고 적는다.
 * 그러니 유료 일정을 받았을 때 그 안에 내용이 반드시 있어야 한다. AI 에게 부탁하는 것(lib/prompt.ts)만으로는
 * 약속이 되지 않는다 — 그래서 여기서 한 번 더 본다.
 *
 * 1. 날 수가 여행 길이와 같다 — 하루가 빠지면 그 날의 팁이 통째로 없다
 * 2. 날마다 정거장이 있고, **모든 정거장의 팁 세 줄**(꼭 할 것·피할 것·현지인의 말)이 비어 있지 않다.
 *    형식(스키마)은 칸이 있는지만 보고, 빈 글자("")는 막지 못한다
 * 3. 초안이 있으면 **초안의 장소가 유료 일정에 빠짐없이 있다** — 초안에서 본 그 날의 메인 장소에 팁이 붙어야 하니까.
 *    휴무일 때문에 다른 날로 옮긴 경우는 허용하므로(지시문 참고) 날은 따지지 않고 전체에서 찾는다.
 */
export function checkFullPlan(full: FullItinerary, dayCount: number, draft?: FreeItinerary | null): string[] {
  const problems: string[] = []
  const days = Array.isArray(full?.days) ? full.days : []

  if (days.length !== dayCount) problems.push(`날 수가 ${dayCount}일이 아니라 ${days.length}일입니다`)

  days.forEach((day, i) => {
    const label = `${day.dayNumber ?? i + 1}일차`
    const stops = Array.isArray(day.activities) ? day.activities : []
    if (stops.length === 0) problems.push(`${label}에 정거장이 없습니다`)
    for (const stop of stops) {
      const tip = stop.tips
      if (!tip || !filled(tip.highlight) || !filled(tip.pitfall) || !filled(tip.insiderSecret)) {
        problems.push(`${label} '${stop.name}'의 팁이 비어 있습니다`)
      }
    }
  })

  if (draft) {
    const names = days.flatMap((day) => (Array.isArray(day.activities) ? day.activities : []).map((a) => same(a.name)))
    for (const day of draft.days) {
      if (day.dayNumber < 1 || day.dayNumber > dayCount) continue
      for (const stop of day.activities) {
        const want = same(stop.name)
        // 유료 쪽 이름이 더 길거나("경복궁 (Gyeongbokgung)"), 초안 쪽에 말이 조금 더 붙은 것("경복궁 관람")까지 같은 곳으로 본다.
        // "점심" 처럼 짧은 낱말 하나가 "광장시장 점심" 에 들어 있다고 같은 곳으로 치지는 않는다.
        const found = names.some(
          (have) => have.includes(want) || (have.length > 1 && want.includes(have) && have.length >= want.length * 0.6)
        )
        if (want && !found) {
          problems.push(`초안 ${day.dayNumber}일차의 '${stop.name}'이(가) 유료 일정에 없습니다`)
        }
      }
    }
  }

  return problems
}

const filled = (text: unknown) => typeof text === 'string' && text.trim().length > 0

/** 띄어쓰기·괄호·문장부호만 다르면 같은 장소로 본다 ("동대문디자인플라자(DDP)" = "동대문디자인플라자 DDP") */
const same = (name: unknown) =>
  typeof name === 'string' ? name.toLowerCase().replace(/[\s()[\]{}·・.,:;!?'"‘’“”\-–—/&]/g, '') : ''
