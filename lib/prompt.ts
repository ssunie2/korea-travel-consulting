import type { PlanInput } from './types'

/**
 * AI에게 주는 지시문.
 *
 * 여기서 제일 중요한 건 **무료로 얼마나 주느냐**다 (이슈 #2).
 * 초안이 너무 좋으면 손님이 상담을 사지 않는다. 항목을 늘리기 전에
 * "이걸 공짜로 주면 상담을 살까?"를 먼저 따진다.
 */
export function buildFreeDraftPrompt(input: PlanInput): string {
  const budget = input.budgetPerPerson
    ? `about ${input.budgetPerPerson.toLocaleString()} KRW per person`
    : 'not specified'

  return `You are a Korean travel consultant writing a FREE TEASER itinerary for a foreign visitor.

Trip:
- Start date: ${input.startDate}
- Length: ${input.durationDays} days
- Travelers: ${input.travelers} (${input.audience ?? 'unspecified group'})
- Budget: ${budget}
- Styles: ${input.styles.length ? input.styles.join(', ') : 'no preference'}
- Interests: ${input.interests ?? 'none given'}

THIS IS A TEASER, NOT THE FULL PLAN. Follow these limits exactly:
- Each day: a short theme + EXACTLY 3 activities (morning, afternoon, evening). One line each.
- Give EXACTLY ONE insider tip for the whole trip — pick the single most surprising thing a
  first-time visitor would get wrong. Make it specific and concrete, not generic advice.
  This one tip is what convinces them we know Korea. Make it count.
- Name only ONE place to stay and ONE place to eat, names only, no explanation.
- Give a total cost estimate only. No breakdown.
- Do NOT include: per-activity tips, alternative options, photo spots, what to wear,
  packing lists, booking instructions, or transport details. Those belong to the paid consultation.

Write everything in ${languageName(input.language)}.
Tone: warm, specific, confident. Never salesy.

Return ONLY valid JSON in exactly this shape:
{
  "tripTitle": string,
  "summary": string (2-3 sentences on the feel of this trip),
  "days": [
    {
      "dayNumber": number,
      "theme": string (max 6 words),
      "activities": [ { "time": string, "name": string, "note": string (one line) } ]
    }
  ],
  "sampleTip": {
    "activityName": string (which activity this tip is about),
    "highlight": string (the must-do, max 12 words),
    "pitfall": string (a specific mistake to avoid),
    "insiderSecret": string (something only a local would know)
  },
  "picks": { "stay": string, "dining": string },
  "totalEstimate": string
}`
}

function languageName(code: string): string {
  const names: Record<string, string> = { en: 'English', ko: 'Korean', ja: 'Japanese', zh: 'Chinese' }
  return names[code] ?? 'English'
}
