import { supabaseServer } from '@/lib/supabase-server'
import { validatePlanInput } from '@/lib/validate'
import { fixSlips } from '@/lib/slips'
import { generateJson } from '@/lib/ai'
import { buildFreeDraftPrompt, freeItinerarySchema } from '@/lib/prompt'
import type { FreeItinerary } from '@/lib/types'

// AI 생성에 실측 12.7초가 걸린다(gemini-3.5-flash 시절). 기본 상한에 걸려 잘리면 손님은 원인 모를 실패를 본다.
export const maxDuration = 120

// ponytail: 요금 폭탄 방어용 최소 장치. 서버 한 대 안에서만 세므로 서버가 여러 대로 늘면 그만큼 헐거워진다.
// 제대로 하려면 DB나 별도 저장소로 옮긴다 (이슈 C3)
const RECENT = new Map<string, number[]>()
const LIMIT = 5
const WINDOW_MS = 60 * 60 * 1000

function tooManyRequests(ip: string): boolean {
  const now = Date.now()
  const hits = (RECENT.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  RECENT.set(ip, hits)
  return hits.length > LIMIT
}

export async function POST(req: Request) {
  const parsed = validatePlanInput(await req.json().catch(() => null))
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 })
  }

  // 손님이 직접 보낼 수 있는 값은 믿지 않는다.
  // `x-forwarded-for` 앞쪽은 조작할 수 있어서 그것만 보면 5회 제한이 무한이 된다.
  // Vercel이 직접 채우는 `x-real-ip` 를 먼저 보고, 없으면 `x-forwarded-for` 의 **마지막** 값을 쓴다
  // (프록시가 뒤에 붙이므로 마지막이 실제 접속자에 가장 가깝다).
  const forwarded = req.headers.get('x-forwarded-for')?.split(',').map((s) => s.trim()).filter(Boolean) ?? []
  const ip = req.headers.get('x-real-ip')?.trim() || forwarded.at(-1) || 'unknown'
  if (tooManyRequests(ip)) {
    return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const input = parsed.value

  let itinerary: FreeItinerary
  try {
    // 품질 우선 (써니 2026-11-14): 상한 120초, 그중 112초를 AI 에 쓴다(나머지는 저장할 시간).
    // 좋은 모델에 약 90초를 다 주고, 가벼운 모델은 좋은 모델이 오류·붐빔으로 실패하거나 90초를 넘겼을 때만 쓴다.
    // (처음엔 52초 예산에 31초만 줬더니 절반쯤이 가벼운 모델로 넘어가 품질이 들쭉날쭉했다)
    itinerary = await generateJson<FreeItinerary>(buildFreeDraftPrompt(input), freeItinerarySchema, {
      budgetMs: 112_000,
      thinking: 'low',
      fallbackModel: 'gemini-3.5-flash-lite',
      primaryShare: 0.8,
    })
    // AI 가 자꾸 틀리는 말(한복 ↔ 한옥)을 저장 전에 바로잡는다 — lib/slips.ts
    itinerary = fixSlips(itinerary)
  } catch (e) {
    console.error('itinerary generation failed:', e)
    return Response.json({ error: 'Could not create your plan right now. Please try again.' }, { status: 502 })
  }

  const { data, error } = await supabaseServer()
    .from('plans')
    .insert({
      destinations: input.destinations,
      start_date: input.startDate,
      duration_days: input.durationDays,
      travelers: input.travelers,
      budget_range: input.budgetRange ?? null,
      budget_per_person: input.budgetPerPerson ?? null,
      budget_currency: input.budgetCurrency,
      styles: input.styles,
      audience: input.audience ?? null,
      pace: input.pace ?? null,
      visited_before: input.visitedBefore ?? null,
      transport: input.transport ?? null,
      stay_area: input.stayArea ?? null,
      day_rhythm: input.dayRhythm ?? null,
      occasion: input.occasion ?? null,
      // 빈 배열은 null 로 넣는다. 나중에 "답을 안 했다" 와 "아무것도 안 골랐다" 를 구분할 수 있다.
      avoid: input.avoid?.length ? input.avoid : null,
      dietary: input.dietary?.length ? input.dietary : null,
      language: input.language,
      itinerary,
    })
    .select('id')
    .single()

  if (error) {
    console.error('saving plan failed:', error)
    return Response.json({ error: 'Could not save your plan.' }, { status: 500 })
  }

  // 결과 화면(A4)이 이 id로 주소를 만든다
  return Response.json({ id: data.id })
}
