import { Type } from '@google/genai'
import type { PlanInput } from './types'

/**
 * 결과의 모양을 API에게 강제한다. 글로 "이 형식으로 줘"라고 부탁만 하면
 * 가끔 JSON 뒤에 설명을 덧붙여서 읽다가 깨진다 (실제로 겪었다).
 *
 * 부수 효과가 더 중요하다 — **여기 없는 항목은 AI가 만들어낼 수 없다.**
 * 무료 범위(1/3)가 부탁이 아니라 규칙이 된다.
 */
export const freeItinerarySchema = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { type: Type.STRING },
    summary: { type: Type.STRING },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          theme: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            minItems: 3,
            maxItems: 3, // 아침·오후·저녁. 늘리려면 무료로 얼마나 줄지부터 다시 정한다
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                name: { type: Type.STRING },
                note: { type: Type.STRING },
              },
              required: ['time', 'name', 'note'],
            },
          },
        },
        required: ['dayNumber', 'theme', 'activities'],
      },
    },
    sampleTip: {
      type: Type.OBJECT,
      properties: {
        activityName: { type: Type.STRING },
        highlight: { type: Type.STRING },
        pitfall: { type: Type.STRING },
        insiderSecret: { type: Type.STRING },
      },
      required: ['activityName', 'highlight', 'pitfall', 'insiderSecret'],
    },
    picks: {
      type: Type.OBJECT,
      properties: { stay: { type: Type.STRING }, dining: { type: Type.STRING } },
      required: ['stay', 'dining'],
    },
    totalEstimate: { type: Type.STRING },
  },
  required: ['tripTitle', 'summary', 'days', 'sampleTip', 'picks', 'totalEstimate'],
}

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

Field notes:
- summary: 2-3 sentences on how this trip will feel
- theme: max 6 words
- note: one line per activity
- sampleTip.highlight: the must-do, max 12 words
- sampleTip.pitfall: a specific mistake first-timers make here
- sampleTip.insiderSecret: something only a local would know
- totalEstimate: one line, whole trip`
}

function languageName(code: string): string {
  const names: Record<string, string> = { en: 'English', ko: 'Korean', ja: 'Japanese', zh: 'Chinese' }
  return names[code] ?? 'English'
}
