import OpenAI from 'openai'

// 키는 서버에서만 쓴다. NEXT_PUBLIC_ 을 붙이면 브라우저로 새어나간다.
//
// 모할래의 여행 초안과 전체 일정은 GPT-6 Astra가 만든다.
// 모델 이름이 바뀌어도 코드를 고치지 않도록 환경변수로 덮어쓸 수 있게 뒀다.
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-6-astra'

/**
 * 지시문과 형식을 주면 그 모양의 JSON을 받아온다.
 * 형식을 글로 부탁만 하면 가끔 JSON 뒤에 설명을 덧붙여서 읽다가 깨진다 (실제로 겪었다).
 * Structured Outputs(정해둔 형식대로만 답하게 하는 기능)로 강제하면 그 일이 없고,
 * 스키마에 없는 항목은 만들어낼 수도 없다.
 */
// 우리 잘못이 아니라 저쪽이 잠깐 붐빌 때 나는 응답들. 이때만 다시 시도한다.
// 실제로 503("This model is currently experiencing high demand")을 맞아서 넣었다.
const RETRYABLE = new Set([429, 500, 502, 503, 504])
const ATTEMPTS = 3

export async function generateJson<T>(prompt: string, schema: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

  const ai = new OpenAI({ apiKey })

  for (let attempt = 1; ; attempt++) {
    try {
      const res = await ai.responses.create({
        model: MODEL,
        input: prompt,
        reasoning: { effort: 'high' },
        store: false,
        text: {
          verbosity: 'low',
          format: {
            type: 'json_schema',
            name: 'mohallae_itinerary',
            strict: true,
            schema,
          },
        },
      })
      if (!res.output_text) throw new Error('empty response')
      return JSON.parse(res.output_text) as T
    } catch (e) {
      const status = (e as { status?: number }).status ?? 0
      if (attempt >= ATTEMPTS || !RETRYABLE.has(status)) throw e
      console.warn(`AI ${status} — ${attempt}번째 재시도`)
      // 붐비는 중이므로 바로 다시 찌르지 않는다
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
}
