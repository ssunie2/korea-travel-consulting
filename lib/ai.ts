import { GoogleGenAI } from '@google/genai'

// 키는 서버에서만 쓴다. NEXT_PUBLIC_ 을 붙이면 브라우저로 새어나간다.
//
// 실제로 재보고 고른 값이다. gemini-3.6-flash 는 같은 품질에 5배 느렸다.
// 모델 이름은 종종 사라지므로(gemini-2.5-flash 가 그랬다) 코드를 안 고쳐도 되게 환경변수로 바꿀 수 있게 뒀다.
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash'

/**
 * 지시문과 형식을 주면 그 모양의 JSON을 받아온다.
 * 형식을 글로 부탁만 하면 가끔 JSON 뒤에 설명을 덧붙여서 읽다가 깨진다 (실제로 겪었다).
 * `responseSchema` 로 강제하면 그 일이 없고, 스키마에 없는 항목은 만들어낼 수도 없다.
 */
export async function generateJson<T>(prompt: string, schema: object): Promise<T> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.7 },
  })
  if (!res.text) throw new Error('empty response')
  return JSON.parse(res.text) as T
}
