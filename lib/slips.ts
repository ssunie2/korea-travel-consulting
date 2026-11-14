/**
 * AI 가 자꾸 틀리는 말을 코드로 바로잡는다 (2026-11-14).
 *
 * 지시문에 "한복(hanbok)과 한옥(hanok)을 헷갈리지 마라"고 적어도, 영어 초안에서
 * "Wear a traditional hanok costume" · "Rent traditional hanok attire" 를 세 번 연속 썼다.
 * 경복궁에 한복을 입고 가면 무료라는 팁을 거의 매번 고르는데, 그때마다 옷을 '한옥'이라고 부른다.
 * 손님에게는 "이 사람들 한국 모르네"로 보이는 실수라, 지시문만 믿지 않고 저장 전·화면에 보이기 전에 한 번 더 고친다.
 *
 * 고치는 건 '입는 것'이 분명할 때뿐이다. "stay in a hanok"(한옥에 묵기) 같은 맞는 말은 건드리지 않는다.
 */
const RULES: [RegExp, (m: string, ...g: string[]) => string][] = [
  // hanok + 옷을 뜻하는 말 → hanbok  (hanok attire / costume / clothes / outfit / dress / rental ...)
  [/\b(h)anok(?=\s+(?:attire|costumes?|cloth(?:es|ing)|outfits?|dress(?:es)?|garments?|rentals?|robes?)\b)/gi, (_m, h) => `${h}anbok`],
  // 입는다는 동사 뒤의 hanok → hanbok  (wear a traditional hanok, dressed in hanok ...)
  [/\b((?:wear|wears|wearing|wore|worn|dressed in|put on|try on|trying on)\s+(?:an?\s+|the\s+|your\s+)?(?:traditional\s+|korean\s+)?)(h)anok\b/gi, (_m, pre, h) => `${pre}${h}anbok`],
  // 한국어: 한옥을 입다 · 한옥 차림 · 한옥 대여(옷) → 한복
  [/한옥(?=(?:을|를)?\s*(?:입|차림|의상))/g, () => "한복"],
]

export function fixSlipText(s: string): string {
  return RULES.reduce((acc, [re, to]) => acc.replace(re, to as (m: string, ...g: string[]) => string), s)
}

/** 초안 전체(객체 · 배열 · 글자)를 돌며 글자마다 fixSlipText 를 건다. 모양은 그대로 */
export function fixSlips<T>(value: T): T {
  if (typeof value === "string") return fixSlipText(value) as T
  if (Array.isArray(value)) return value.map(fixSlips) as T
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fixSlips(v)])) as T
  }
  return value
}
