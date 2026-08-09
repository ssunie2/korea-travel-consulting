import type { PlanInput } from './types'

/**
 * 손님이 보낸 값을 검사한다.
 * 브라우저에서 막는 것만으로는 부족하다 — 서버를 직접 부르면 뚫린다.
 * 특히 duration(기간)은 AI 요금과 직결되므로 반드시 서버에서 막는다.
 */
export function validatePlanInput(raw: unknown): { ok: true; value: PlanInput } | { ok: false; error: string } {
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: 'invalid body' }
  const d = raw as Record<string, unknown>

  if (typeof d.startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d.startDate)) {
    return { ok: false, error: 'startDate must be YYYY-MM-DD' }
  }
  const start = new Date(`${d.startDate}T00:00:00Z`)
  if (Number.isNaN(start.getTime())) return { ok: false, error: 'startDate is not a real date' }
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
  if (styles.length > 6) return { ok: false, error: 'too many styles' }

  const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined)

  return {
    ok: true,
    value: {
      startDate: d.startDate,
      durationDays,
      travelers,
      budgetPerPerson,
      styles,
      audience: text(d.audience, 40),
      interests: text(d.interests, 500),
      language: typeof d.language === 'string' && /^[a-z]{2}$/.test(d.language) ? d.language : 'en',
    },
  }
}
