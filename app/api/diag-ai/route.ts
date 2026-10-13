import { GoogleGenAI } from '@google/genai'

/**
 * 임시 진단 (2026-10-13) — 무료 초안이 502 로 실패하는 원인 찾기.
 * 지금 키로 모델마다 아주 짧은 요청을 보내 보고, 성공·실패와 구글이 돌려준 오류 문장을 보여 준다.
 * 키 값은 보여 주지 않는다 (있는지만). 미리보기 배포에서만 열리고, 원인을 찾으면 이 파일은 지운다.
 */
export const maxDuration = 60

const MODELS = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest']

export async function GET() {
  if (process.env.VERCEL_ENV !== 'preview') return new Response('Not found', { status: 404 })
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const results = await Promise.all(
    MODELS.map(async (model) => {
      const started = Date.now()
      try {
        const res = await ai.models.generateContent({ model, contents: 'Reply with the single word OK.' })
        return { model, ok: true, ms: Date.now() - started, text: (res.text ?? '').trim().slice(0, 20), modelVersion: res.modelVersion }
      } catch (e) {
        const err = e as { status?: number; message?: string }
        return { model, ok: false, ms: Date.now() - started, status: err.status, message: String(err.message ?? e).slice(0, 900) }
      }
    }),
  )
  return Response.json({ keySet: !!process.env.GEMINI_API_KEY, modelEnv: process.env.GEMINI_MODEL ?? null, results })
}
