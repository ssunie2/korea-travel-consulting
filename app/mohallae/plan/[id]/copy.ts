import type { Pair } from "../../content";

/**
 * 결과 화면(무료 초안)에 나가는 글.
 *
 * **예전 결과 화면(app/plan/[id]/page.tsx)의 글을 그대로 옮겨 왔다.** 새로 쓴 것은 시안 ③의
 * 짧은 이름표뿐이다 — "1일차", "무료 초안", 버튼 옆 가격($25, 랜딩의 요금 안내와 같은 값).
 * 규칙 3장(법적 경계): 알려주기만 하고 예약은 손님이 한다. 대신 해 준다는 말은 쓰지 않는다.
 */
export const draftCopy = {
  freeDraft: { ko: "무료 초안", en: "Free draft" },
  // 랜딩의 샘플 카드로 들어온 초안. 남의 여행이라 '무료 초안'·링크 보관·$25 버튼을 보이지 않는다
  sampleDraft: { ko: "샘플 초안", en: "Sample draft" },
  langLabel: { ko: "언어", en: "Language" },
  home: { ko: "mohallae 첫 화면", en: "mohallae home" },
  dayNumber: { ko: (n: number) => `${n}일차`, en: (n: number) => `Day ${n}` },
  // 제목 아래 사실 줄의 이름표 (써니 요청 2026-10-11)
  datesLabel: { ko: "여행 날짜", en: "Dates" },
  travelersLabel: { ko: "인원", en: "Travelers" },
  placesLabel: { ko: "여행지", en: "Destination" },
  daysHeading: { ko: "날짜별 일정", en: "Day by day" },
  // 낭독기용. 다음 일정까지 얼마나 걸리는지가 무엇에서 무엇까지인지 말해 준다 (예전 화면과 같은 이유)
  toNext: { ko: "다음 일정까지 이동, ", en: "To the next stop, " },
  avoid: { ko: "피하실 것", en: "What to avoid" },
  insider: { ko: "여기 사는 사람이라면 이렇게 말합니다", en: "What someone here would tell you" },
  stay: { ko: "묵을 곳", en: "Where to stay" },
  eat: { ko: "먹을 곳", en: "Where to eat" },
  total: { ko: "예상 총액", en: "Estimated total" },
  oneTip: {
    ko: "팁 하나를 보셨습니다. 모든 정거장에 하나씩 있습니다.",
    en: "That’s one tip. Every stop has one.",
  },
  fullPlan: { ko: "전체 일정 받기", en: "Get the full plan" },
  price: "$25",
  copyLink: { ko: "링크 복사", en: "Copy link" },
  copied: { ko: "복사했습니다", en: "Copied" },
  copyFailed: {
    ko: "복사하지 못했습니다 — 주소창의 주소를 그대로 저장해 두세요.",
    en: "Couldn’t copy — please save the address in your browser bar.",
  },
  keepLink: {
    ko: "이 링크를 보관하세요 — 초안은 여기 그대로 있습니다",
    en: "Keep this link — your draft stays here",
  },
  failedTitle: { ko: "이 초안은 끝까지 만들어지지 못했습니다.", en: "This draft didn’t finish." },
  failedBody: {
    ko: "죄송합니다 — 다시 시작해 주세요. 2분이면 됩니다.",
    en: "Sorry — please start again, it only takes two minutes.",
  },
  startOver: { ko: "다시 시작하기", en: "Start over" },
} satisfies Record<string, Pair<unknown> | string>;
