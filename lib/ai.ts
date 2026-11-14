import { GoogleGenAI, ThinkingLevel } from '@google/genai'

// 키는 서버에서만 쓴다. NEXT_PUBLIC_ 을 붙이면 브라우저로 새어나간다.
//
// 모델 이름은 종종 사라지므로 코드를 안 고쳐도 되게 환경변수(GEMINI_MODEL)로 바꿀 수 있게 뒀다.
// 기본값을 gemini-3.5-flash 에서 gemini-3.8-flash 로 바꿨다 (2026-11-14):
// 3.5-flash 는 2026-10-08 부터 구글이 gemini-3.6-flash 로 자동으로 넘기는데, 3.6 은 우리가 재 봤을 때 5배 느렸다(약 60초).
// 그래서 무료 초안이 서버 상한 60초를 넘겨 Vercel 504(FUNCTION_INVOCATION_TIMEOUT)로 끊겼다.
// 근거: https://ai.google.dev/gemini-api/docs/deprecations
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.8-flash'

/**
 * 지시문과 형식을 주면 그 모양의 JSON을 받아온다.
 * 형식을 글로 부탁만 하면 가끔 JSON 뒤에 설명을 덧붙여서 읽다가 깨진다 (실제로 겪었다).
 * `responseSchema` 로 강제하면 그 일이 없고, 스키마에 없는 항목은 만들어낼 수도 없다.
 */
// 우리 잘못이 아니라 저쪽이 잠깐 붐빌 때 나는 응답들. 이때만 다시 시도한다.
// 실제로 503("This model is currently experiencing high demand")을 맞아서 넣었다.
const RETRYABLE = new Set([429, 500, 502, 503, 504])
const ATTEMPTS = 3

export type GenerateOptions = {
  /**
   * 이 시간(ms) 안에 끝내지 못하면 포기하고 오류를 낸다.
   * 라우트의 maxDuration 보다 몇 초 짧게 준다 — 그래야 Vercel 이 함수를 끊기(504) 전에
   * 우리가 먼저 끝내고 손님에게 "다시 시도해 주세요"를 제대로 보낼 수 있다.
   */
  budgetMs?: number
  /**
   * 생각(thinking) 정도. 높을수록 느리다. gemini-3 계열만 받는다.
   * 기본값(중간)은 무료 초안에 너무 느려서 초안에는 'low' 를 준다.
   */
  thinking?: 'low' | 'medium' | 'high'
  /**
   * 첫 모델이 붐비거나(429·503) 시간 안에 못 끝내면 넘어갈 가벼운 모델.
   * 주면: 첫 모델에 남은 시간의 60% 만 주고, 나머지 시간에 이 모델로 한 번 더 쓴다.
   */
  fallbackModel?: string
}

const LEVEL = { low: ThinkingLevel.LOW, medium: ThinkingLevel.MEDIUM, high: ThinkingLevel.HIGH }

export async function generateJson<T>(prompt: string, schema: object, opts: GenerateOptions = {}): Promise<T> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const deadline = opts.budgetMs ? Date.now() + opts.budgetMs : Infinity
  // 차례대로 써 볼 모델. 가벼운 모델이 있으면 첫 모델 → 가벼운 모델, 없으면 같은 모델로 세 번
  const plan = opts.fallbackModel ? [MODEL, opts.fallbackModel] : Array<string>(ATTEMPTS).fill(MODEL)
  let lastError: unknown

  for (let i = 0; i < plan.length; i++) {
    const model = plan[i]
    const left = deadline - Date.now()
    if (left < 3000) break // 3초도 안 남았으면 시작해 봐야 못 끝낸다
    const timeout = Number.isFinite(left) ? (opts.fallbackModel && i === 0 ? Math.round(left * 0.6) : left) : undefined
    const thinking = opts.thinking && i === 0 && model.startsWith('gemini-3') ? { thinkingLevel: LEVEL[opts.thinking] } : undefined
    const started = Date.now()
    try {
      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.7,
          ...(thinking ? { thinkingConfig: thinking } : {}),
          ...(timeout ? { abortSignal: AbortSignal.timeout(timeout) } : {}),
        },
      })
      if (!res.text) throw new Error('empty response')
      // 걸린 시간을 남긴다 — 다음에 느려지면 Vercel 로그에서 어느 모델이 몇 초였는지 바로 보인다
      console.log(`AI ${model} 성공 ${Date.now() - started}ms`)
      return JSON.parse(res.text) as T
    } catch (e) {
      lastError = e
      const status = (e as { status?: number }).status ?? 0
      const name = (e as { name?: string }).name
      const timedOut = name === 'TimeoutError' || name === 'AbortError'
      console.warn(`AI ${model} 실패 ${timedOut ? '시간 초과' : status} ${Date.now() - started}ms`)
      // 가벼운 모델이 있으면 첫 모델의 어떤 실패든 한 번은 넘어가 본다 (예: 환경변수 모델이 생각 정도 설정을 못 받는 경우)
      if (!timedOut && !RETRYABLE.has(status) && !(opts.fallbackModel && i === 0)) throw e
      if (i === plan.length - 1) break
      // 붐비는 중이므로 바로 다시 찌르지 않는다 (시간 초과였으면 이미 충분히 기다렸다)
      if (!timedOut) await new Promise((r) => setTimeout(r, Math.min(2000 * (i + 1), Math.max(0, deadline - Date.now() - 3000))))
    }
  }
  throw lastError ?? new Error('AI time budget exhausted')
}
