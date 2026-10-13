import { GoogleGenAI } from '@google/genai'
import { buildFreeDraftPrompt, freeItinerarySchema } from '@/lib/prompt'

/**
 * 임시 진단 (2026-10-13) — 무료 초안이 502 로 실패하는 원인 찾기.
 * - 기본: 지금 키로 모델마다 아주 짧은 요청을 보내 보고, 성공·실패와 구글이 돌려준 오류 문장을 보여 준다
 * - ?draft=모델이름: 실제 무료 초안 지시문(예시 손님)으로 한 번 만들어 보고 걸린 시간을 잰다 (저장하지 않는다)
 * 키 값은 보여 주지 않는다 (있는지만). 미리보기 배포에서만 열리고, 원인을 찾으면 이 파일은 지운다.
 */
export const maxDuration = 60

const MODELS = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest']

const SAMPLE = {
  destinations: ['Seoul'], startDate: '2026-11-05', durationDays: 3, travelers: 2, budgetCurrency: 'KRW',
  budgetRange: '250,000–350,000 KRW (about $185–260) for the whole trip', styles: ['Food', 'Culture & history'],
  audience: 'Couple', pace: 'Balanced', avoid: [], dietary: [], language: 'ko',
}

/** 응답이 안 오면 기다리다 함수 전체가 60초에 끊긴다 — 모델마다 시간 제한을 둔다 */
const within = <T,>(ms: number, p: Promise<T>) =>
  Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(Object.assign(new Error(`no answer in ${ms}ms`), { status: 0 })), ms))])

const fail = (e: unknown) => {
  const err = e as { status?: number; message?: string }
  return { ok: false, status: err.status, message: String(err.message ?? e).slice(0, 600) }
}

export async function GET(req: Request) {
  if (process.env.VERCEL_ENV !== 'preview') return new Response('Not found', { status: 404 })
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const draftModel = new URL(req.url).searchParams.get('draft')

  if (draftModel) {
    const started = Date.now()
    try {
      const res = await within(52_000, ai.models.generateContent({
        model: draftModel,
        contents: buildFreeDraftPrompt(SAMPLE),
        config: { responseMimeType: 'application/json', responseSchema: freeItinerarySchema, temperature: 0.7 },
      }))
      const draft = JSON.parse(res.text ?? '{}')
      return Response.json({ model: draftModel, ok: true, ms: Date.now() - started, modelVersion: res.modelVersion, title: draft.tripTitle, days: draft.days?.length })
    } catch (e) {
      return Response.json({ model: draftModel, ms: Date.now() - started, ...fail(e) })
    }
  }

  const results = await Promise.all(
    MODELS.map(async (model) => {
      const started = Date.now()
      try {
        const res = await within(15_000, ai.models.generateContent({ model, contents: 'Reply with the single word OK.' }))
        return { model, ok: true, ms: Date.now() - started, text: (res.text ?? '').trim().slice(0, 20), modelVersion: res.modelVersion }
      } catch (e) {
        return { model, ms: Date.now() - started, ...fail(e) }
      }
    }),
  )
  return Response.json({ keySet: !!process.env.GEMINI_API_KEY, modelEnv: process.env.GEMINI_MODEL ?? null, results })
}
