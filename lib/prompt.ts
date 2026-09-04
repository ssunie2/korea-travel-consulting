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
          // 그날 머무는 도시. 여러 도시를 도는 여행에서 짐을 옮기는 날을 알려준다
          city: { type: Type.STRING },
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
                // 앞 일정에서 여기까지 대략 얼마나 걸리는지. 그날 첫 일정은 빈 값
                travel: { type: Type.STRING },
              },
              required: ['time', 'name', 'note', 'travel'],
            },
          },
        },
        required: ['dayNumber', 'theme', 'city', 'activities'],
      },
    },
    sampleTip: {
      type: Type.OBJECT,
      properties: {
        // 몇 일째 이야기인지 — 그 날 아래에 붙여 보여준다
        dayNumber: { type: Type.INTEGER },
        activityName: { type: Type.STRING },
        highlight: { type: Type.STRING },
        pitfall: { type: Type.STRING },
        insiderSecret: { type: Type.STRING },
      },
      required: ['dayNumber', 'activityName', 'highlight', 'pitfall', 'insiderSecret'],
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
  // 이 한 줄이 무료·유료 두 지시문의 유일한 dayRhythm 지시다. 무료 쪽에 같은 말이
  // 한 번 더 있었는데(#53 🟡6), 두 벌을 두면 나중에 한쪽만 고쳐서 서로 다른 말을 하게 된다.
  // 뒤쪽에만 있던 "나머지 일정은 장소 사정에 맞춘다" 는 뜻을 여기로 합쳤다.
  if (input.dayRhythm) lines.push(`- Day rhythm: ${input.dayRhythm} — set the FIRST activity of each day to match. Let the rest follow what each place needs.`)
  if (input.occasion) lines.push(`- Occasion: ${input.occasion} — work one moment into the trip that fits it.`)
  if (input.avoid?.length) lines.push(`- AVOID: ${input.avoid.join(', ')} — do not put these in the plan.`)
  return lines.length ? lines.join('\n') + '\n' : ''
}

/**
 * 법적 경계 — **AI 에게도 규칙 3장을 말해준다.**
 *
 * 규칙 3장 1번은 우리가 화면에 쓰면 안 되는 말을 정해뒀는데, 정작 **손님에게 나가는 글의
 * 대부분을 쓰는 AI 에게는 그 말을 한 적이 없었다.** 사람이 쓴 문구만 아무리 조심해도
 * AI 가 "예약해 드리겠습니다" 한 줄을 쓰면 문체부 회신의 전제가 깨진다.
 *
 * 회신이 조건부였다는 점이 중요하다 — *"단순 여행 관련 정보만을 제공하는"* 한 등록 대상이
 * 아니고, **알선·대리·모객·여행 안내**가 끼면 여행업이 된다. AI 가 그 선을 넘는 문장을
 * 쓰면 실제 운영 방식이 그렇게 된 것으로 판단될 수 있다.
 *
 * 무료·유료 두 지시문이 같이 쓴다. 한쪽만 막으면 나머지 한쪽으로 새어나간다.
 *
 * 병원은 더 무겁다. 외국인환자 유치업 등록 없이 병원을 소개하면 형사처벌 대상이라
 * **이름을 아예 말하지 않게** 막는다.
 */
const BOUNDARY = `## What you are — this is a legal line, not a style preference

You produce written information. You never act for the traveller, and neither does the
company you write for. Korean tourism law treats arranging, booking, or guiding as a
different licensed business. Crossing this line in a sentence can make it true in fact.

NEVER write, in any language:
- that we book, reserve, arrange, confirm, or hold anything for them
- that we contact a hotel, restaurant, venue, or driver on their behalf
- that we accompany, guide, interpret, or meet them in person
- that we handle any payment for the trip itself
- any offer of service beyond this document
  ("we can...", "we'll take care of...", "leave it to us", "on your behalf")

ALWAYS write booking as something THEY do, with the facts they need to do it:
  GOOD  "Book two weeks ahead — this one only takes phone reservations in Korean."
  BAD   "We'll reserve this for you." / "We can arrange this."

Never describe this document as a guide service, a tour, or travel arrangement.
It is written information they use themselves.

MEDICAL: never name a hospital, clinic, or doctor, and never build medical treatment
into the trip. Naming one requires a licence we do not hold.`

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
- Vary the times across days. A market wakes early, a night view needs dusk, a temple closes at 17:00.
  Do NOT reuse the same three clock times every day — that reads as a template, not a plan.
- Every activity except the first of each day needs "travel" — roughly how long it takes to get
  there from the previous stop, in the form "about 25 min by subway" or "10 min walk".
  Round to 5 minutes. This shows the route makes sense. The FIRST activity of each day gets "" (empty).
  Do NOT give step-by-step directions, line numbers or transfers — that belongs to the paid plan.
- sampleTip needs "dayNumber" — which day the tip belongs to, so we can show it beside that day.
- Each day also needs a "city" value — the city or area they are in that day (Seoul, Incheon...).
  On a multi-city trip this is how they know which day they change hotels. Never leave it blank.
- Give EXACTLY ONE insider tip for the whole trip — pick the single most surprising thing a
  first-time visitor would get wrong. Make it specific and concrete, not generic advice.
  This one tip is what convinces them we know Korea. Make it count.
- Name only ONE place to stay and ONE place to eat, names only, no explanation.
- Give a cost estimate only, no breakdown. **Write BOTH per person AND the group total**,
  in that order, in ${input.budgetCurrency}. The traveller told us their budget per person,
  so a group-only number leaves them doing the division themselves.
- Do NOT include: per-activity tips, alternative options, photo spots, what to wear,
  packing lists, or booking instructions. Those belong to the paid consultation.

${BOUNDARY}

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

${BOUNDARY}

Write everything in ${languageName(input.language)}.
Tone: a professional who has done this route many times. Specific, calm, never salesy.`
}

function languageName(code: string): string {
  const names: Record<string, string> = { en: 'English', ko: 'Korean', ja: 'Japanese', zh: 'Chinese' }
  return names[code] ?? 'English'
}
