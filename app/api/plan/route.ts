import { GoogleGenAI } from '@google/genai'
import { supabaseServer } from '@/lib/supabase-server'
import { validatePlanInput } from '@/lib/validate'
import { buildFreeDraftPrompt, freeItinerarySchema } from '@/lib/prompt'
import type { FreeItinerary } from '@/lib/types'

// AI 키는 이 파일(서버) 안에서만 쓰인다. 브라우저로는 절대 나가지 않는다.
// 실제로 재보고 고른 값이다. gemini-3.6-flash 는 같은 품질에 58초가 걸렸다.
// 모델 이름은 종종 사라지므로(gemini-2.5-flash 가 그랬다) 코드를 안 고쳐도 되게 환경변수로 바꿀 수 있게 뒀다.
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash'

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

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (tooManyRequests(ip)) {
    return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const input = parsed.value

  let itinerary: FreeItinerary
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: buildFreeDraftPrompt(input),
      config: {
        responseMimeType: 'application/json',
        responseSchema: freeItinerarySchema,
        temperature: 0.7,
      },
    })
    if (!res.text) throw new Error('empty response')
    itinerary = JSON.parse(res.text) as FreeItinerary
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
      budget_per_person: input.budgetPerPerson ?? null,
      budget_currency: input.budgetCurrency,
      styles: input.styles,
      audience: input.audience ?? null,
      interests: input.interests ?? null,
      dietary_notes: input.dietaryNotes ?? null,
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
