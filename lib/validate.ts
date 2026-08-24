import type { PlanInput } from './types'

/**
 * 손님이 보낸 값을 검사한다.
 * 브라우저에서 막는 것만으로는 부족하다 — 서버를 직접 부르면 뚫린다.
 * 특히 duration(기간)은 AI 요금과 직결되므로 반드시 서버에서 막는다.
 */
export function validatePlanInput(raw: unknown): { ok: true; value: PlanInput } | { ok: false; error: string } {
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: 'invalid body' }
  const d = raw as Record<string, unknown>

  // 목적지가 없으면 AI가 일정을 만들 수 없다
  const destinations = Array.isArray(d.destinations)
    ? d.destinations.filter((s): s is string => typeof s === 'string' && s.trim() !== '').slice(0, 10)
    : []
  if (destinations.length === 0) return { ok: false, error: 'pick at least one destination' }

  if (typeof d.startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d.startDate)) {
    return { ok: false, error: 'startDate must be YYYY-MM-DD' }
  }
  const start = new Date(`${d.startDate}T00:00:00Z`)
  if (Number.isNaN(start.getTime())) return { ok: false, error: 'startDate is not a real date' }

  // 지나간 날짜로 신청하면 AI가 이미 끝난 여행의 일정을 만들어낸다. 요금은 나가고 결과는 쓸모없다.
  // 손님 쪽이 어제여도 한국은 오늘일 수 있으므로 하루 여유를 둔다.
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  if (d.startDate < oneDayAgo) return { ok: false, error: 'startDate must not be in the past' }
  const twoYears = new Date()
  twoYears.setFullYear(twoYears.getFullYear() + 2)
  if (start > twoYears) return { ok: false, error: 'startDate is too far in the future' }

  const durationDays = Number(d.durationDays)
  if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 30) {
    return { ok: false, error: 'durationDays must be 1-30' }
  }

  const travelers = Number(d.travelers)
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 20) {
    return { ok: false, error: 'travelers must be 1-20' }
  }

  let budgetPerPerson: number | undefined
  if (d.budgetPerPerson !== undefined && d.budgetPerPerson !== null && d.budgetPerPerson !== '') {
    budgetPerPerson = Number(d.budgetPerPerson)
    if (!Number.isInteger(budgetPerPerson) || budgetPerPerson < 0) {
      return { ok: false, error: 'budgetPerPerson must be a positive number' }
    }
  }

  const styles = Array.isArray(d.styles) ? d.styles.filter((s): s is string => typeof s === 'string') : []
  // 고를 수 있는 것이 12개 + 직접 적는 '그 외' 하나다. 6 으로 두면 많이 고른 손님이 거부당한다.
  if (styles.length > 13) return { ok: false, error: 'too many styles' }

  const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined)

  const CURRENCIES = ['KRW', 'USD', 'EUR', 'JPY']
  const budgetCurrency =
    typeof d.budgetCurrency === 'string' && CURRENCIES.includes(d.budgetCurrency) ? d.budgetCurrency : 'KRW'

  return {
    ok: true,
    value: {
      destinations,
      startDate: d.startDate,
      durationDays,
      travelers,
      budgetPerPerson,
      budgetCurrency,
      styles,
      audience: text(d.audience, 40),
      interests: text(d.interests, 500),
      dietaryNotes: text(d.dietaryNotes, 300),
      language: typeof d.language === 'string' && /^[a-z]{2}$/.test(d.language) ? d.language : 'en',
    },
  }
}
