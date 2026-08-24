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
/**
 * 문서의 짜임을 바꾸는 답들을 프롬프트 줄로 만든다.
 *
 * **답하지 않은 것은 아예 줄을 만들지 않는다.** 'not specified' 를 잔뜩 넣으면
 * AI 가 그 빈칸을 채우려 들면서 엉뚱한 가정을 지어낸다. 없으면 없는 대로 두는 편이 낫다.
 *
 * 각 줄에 **그 답이 무엇을 바꿔야 하는지** 를 같이 적는다. 값만 던지면
 * AI 가 읽고도 일정에 반영하지 않는다.
 */
function shape(input: PlanInput): string {
  const lines: string[] = []
  if (input.pace) lines.push(`- Pace: ${input.pace} — adjust how many stops each day holds.`)
  if (input.visitedBefore) lines.push(`- Been to Korea before: ${input.visitedBefore} — first-timers get the landmarks, repeat visitors get lesser-known places.`)
  if (input.transport) lines.push(`- Getting around: ${input.transport} — build the route around this, not around what is closest on a map.`)
  if (input.stayArea) lines.push(`- Prefers to stay: ${input.stayArea} — the one place to stay must match this.`)
  if (input.dayRhythm) lines.push(`- Day rhythm: ${input.dayRhythm} — set the first activity's time to match.`)
  if (input.occasion) lines.push(`- Occasion: ${input.occasion} — work one moment into the trip that fits it.`)
  if (input.avoid?.length) lines.push(`- AVOID: ${input.avoid.join(', ')} — do not put these in the plan.`)
  return lines.length ? lines.join('\n') + '\n' : ''
}

export function buildFreeDraftPrompt(input: PlanInput): string {
  // 구간(새 방식)이 있으면 그것을 쓴다. 숫자(옛 방식)는 예전 초안에만 남아 있다.
  const budget = input.budgetRange
    ? `${input.budgetRange} per person`
    : input.budgetPerPerson
      ? `about ${input.budgetPerPerson.toLocaleString()} ${input.budgetCurrency} per person`
      : 'not specified'

  return `You are a Korean travel consultant writing a FREE TEASER itinerary for a foreign visitor.

Trip:
- Going to: ${input.destinations.join(', ')}
- Start date: ${input.startDate}
- Length: ${input.durationDays} days
- Travelers: ${input.travelers} (${input.audience ?? 'unspecified group'})
- Budget: ${budget}
- Show every cost in ${input.budgetCurrency}.
- Styles: ${input.styles.length ? input.styles.join(', ') : 'no preference'}
${shape(input)}${input.dietary?.length ? `- MUST WORK AROUND: ${input.dietary.join(', ')}\n  Every food recommendation has to respect this. Do not suggest anything they cannot eat or reach.` : ''}
- Stay inside the places listed above. Do not add cities they did not ask for.

THIS IS A TEASER, NOT THE FULL PLAN. Follow these limits exactly:
- Each day: a short theme + EXACTLY 3 activities (morning, afternoon, evening). One line each.
- Give EXACTLY ONE insider tip for the whole trip — pick the single most surprising thing a
  first-time visitor would get wrong. Make it specific and concrete, not generic advice.
  This one tip is what convinces them we know Korea. Make it count.
- Name only ONE place to stay and ONE place to eat, names only, no explanation.
- Give a cost estimate only, no breakdown. **Write BOTH per person AND the group total**,
  in that order, in ${input.budgetCurrency}. The traveller told us their budget per person,
  so a group-only number leaves them doing the division themselves.
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
- totalEstimate: one line, per person first then the group total
  (e.g. "450,000 KRW per person · 900,000 KRW for 2")`
}

const place = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    area: { type: Type.STRING },
    priceLevel: { type: Type.STRING },
    reason: { type: Type.STRING },
  },
  required: ['name', 'area', 'priceLevel', 'reason'],
}

const fivePlaces = { type: Type.ARRAY, minItems: 5, maxItems: 5, items: place }

/** 유료 결과의 모양. 여기 없는 항목은 AI가 만들어낼 수 없다 */
export const fullItinerarySchema = {
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
          area: { type: Type.STRING },
          routeNote: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            minItems: 3,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                duration: { type: Type.STRING },
                location: { type: Type.STRING },
                estimatedCost: { type: Type.STRING },
                gettingThere: { type: Type.STRING },
                tips: {
                  type: Type.OBJECT,
                  properties: {
                    highlight: { type: Type.STRING },
                    pitfall: { type: Type.STRING },
                    insiderSecret: { type: Type.STRING },
                    reservationRequired: { type: Type.BOOLEAN },
                  },
                  required: ['highlight', 'pitfall', 'insiderSecret', 'reservationRequired'],
                },
              },
              required: ['time', 'name', 'description', 'gettingThere', 'tips'],
            },
          },
          photoSpot: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              bestTime: { type: Type.STRING },
              advice: { type: Type.STRING },
            },
            required: ['name', 'bestTime', 'advice'],
          },
        },
        required: ['dayNumber', 'theme', 'area', 'routeNote', 'activities'],
      },
    },
    picks: {
      type: Type.OBJECT,
      properties: { stay: fivePlaces, dining: fivePlaces, cafes: fivePlaces },
      required: ['stay', 'dining', 'cafes'],
    },
    costBreakdown: {
      type: Type.OBJECT,
      properties: {
        totalEstimate: { type: Type.STRING },
        accommodation: { type: Type.STRING },
        dining: { type: Type.STRING },
        transport: { type: Type.STRING },
        activities: { type: Type.STRING },
        budgetFit: { type: Type.STRING },
        valueMoves: { type: Type.ARRAY, minItems: 3, maxItems: 5, items: { type: Type.STRING } },
      },
      required: ['totalEstimate', 'accommodation', 'dining', 'transport', 'activities', 'budgetFit', 'valueMoves'],
    },
    clothing: {
      type: Type.OBJECT,
      properties: {
        weatherSummary: { type: Type.STRING },
        outfits: { type: Type.ARRAY, items: { type: Type.STRING } },
        advice: { type: Type.STRING },
      },
      required: ['weatherSummary', 'outfits', 'advice'],
    },
    packingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['tripTitle', 'summary', 'days', 'picks', 'costBreakdown', 'clothing', 'packingTips'],
}

/**
 * 유료 전체 일정.
 *
 * 무료와의 차이는 분량이 아니라 **분석**이다.
 * 손님이 돈을 내는 이유는 정보가 많아서가 아니라, 같은 예산으로 덜 헤매고 더 좋은 걸 하기 위해서다.
 * 그래서 지시문의 절반이 동선과 예산에 대한 것이다.
 */
export function buildFullPlanPrompt(input: PlanInput): string {
  const budget = input.budgetRange
    ? `${input.budgetRange} per person`
    : input.budgetPerPerson
      ? `${input.budgetPerPerson.toLocaleString()} ${input.budgetCurrency} per person for the whole trip`
      : 'not specified — assume mid-range'

  return `You are a Korean travel planner. This traveler has PAID for a full plan.
They are not paying for more words. They are paying for two things:

  1. A ROUTE that does not waste their time.
  2. The BEST USE OF THEIR MONEY.

Everything below serves those two. If a detail does not help them move better or spend better, leave it out.

Trip:
- Going to: ${input.destinations.join(', ')}
- Start date: ${input.startDate}
- Length: ${input.durationDays} days
- Travelers: ${input.travelers} (${input.audience ?? 'unspecified group'})
- Budget: ${budget}
- Show every cost in ${input.budgetCurrency}.
- Styles: ${input.styles.length ? input.styles.join(', ') : 'no preference'}
${shape(input)}${input.dietary?.length ? `- MUST WORK AROUND: ${input.dietary.join(', ')}\n  Every food recommendation must respect this. Do not suggest anything they cannot eat or reach.` : ''}

## 1. Route — this is the main thing

- Group each day by AREA. A day should stay in one part of the city or region.
- Never send them back to a neighbourhood they already finished.
- Order stops so travel between them is short. Say how to get from the previous stop
  and roughly how many minutes ("gettingThere").
- In "routeNote", explain in one or two lines WHY this order. That sentence is what they paid for.
- Respect opening days and hours. Do not schedule a place on the day it is closed.
- Leave the day realistic. A tired traveler skipping half the list is a failed plan.

## 2. Money — spend it where it counts

- Keep the total within their budget. Say plainly whether it fits ("budgetFit").
- In "valueMoves", give 3-5 specific swaps that get more for the same money.
  Concrete, not generic. Not "eat street food" — name the thing, name what it replaces,
  say what it saves.
- Price levels on every recommendation so they can trade up or down themselves.

## 3. Depth they did not get for free

- EVERY activity gets tips: the must-do, a specific trap to avoid, something only a local
  would know, and whether it needs booking ahead.
- 5 places to stay, 5 to eat, 5 cafes — each with the reason it is on the list.
- Cost split by accommodation / dining / transport / activities.
- Weather for those exact dates, what to wear, what to pack.

Write everything in ${languageName(input.language)}.
Tone: a professional who has done this route many times. Specific, calm, never salesy.`
}

function languageName(code: string): string {
  const names: Record<string, string> = { en: 'English', ko: 'Korean', ja: 'Japanese', zh: 'Chinese' }
  return names[code] ?? 'English'
}
