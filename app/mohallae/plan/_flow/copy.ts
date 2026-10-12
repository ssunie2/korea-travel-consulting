import type { Text } from "../flow";

/**
 * 입력 흐름 화면에 나가는 글 (보기 글자는 flow.ts 에 있다).
 *
 * 질문 문구는 베타(#82)의 말투를 이어받았다 — 숙제가 아니라 대화처럼 (PRODUCT.md 원칙 3).
 * 오류 문구는 지금 폼(app/plan)의 MESSAGES 와 같은 뜻이다: 서버 문장은 손님에게 보이지 않는다.
 * 규칙 3장(법적 경계): 대신 해 준다는 말을 쓰지 않는다. 초안은 프로그램이 쓰는 정보 문서다.
 */
const tx = (ko: string, en: string): Text => ({ ko, en });

export const flowCopy = {
  freeDraft: tx("무료 초안", "Free draft"),
  home: tx("mohallae 첫 화면", "mohallae home"),
  langLabel: tx("언어", "Language"),
  step: { ko: (n: number, total: number) => `${n} / ${total}`, en: (n: number, total: number) => `Step ${n} / ${total}` },
  progressLabel: tx("진행", "Progress"),

  back: tx("이전", "Back"),
  next: tx("다음", "Next"),
  skip: tx("건너뛰기", "Skip"),
  toReview: tx("바로 확인으로", "Skip to review"),
  submit: tx("무료 초안 받기", "Get my free draft"),

  picked: { ko: (n: number) => `${n}개 골랐어요 · 다시 누르면 풀려요`, en: (n: number) => `${n} picked — tap again to remove` },
  pickedOne: tx("골랐어요", "Picked"),
  optionalNote: tx("고르지 않아도 돼요.", "Optional — skip if it doesn't matter."),
  other: tx("그 외", "Something else"),
  otherPlace: tx("그 외 — 직접 적기", "Somewhere else"),
  otherPlaceholder: tx("적어 주세요", "Type it"),
  closeOther: tx("닫기", "Close"),

  // 질문 — 도시 이름이 들어가는 것은 함수
  where: { q: tx("어디로 가세요?", "Where are you going?"), help: tx("여러 곳을 골라도 좋아요. 목록에 없으면 직접 적어 주세요.", "Pick as many as you like. Not listed? Type it.") },
  todo: {
    q: { ko: (city: string) => `${city}에서는 뭘 해볼까요?`, en: (city: string) => `What do you want to do in ${city}?` },
    help: tx("끌리는 것을 다 골라 주세요 — 날짜에 맞춰 골라 담아 초안을 씁니다.", "Pick everything that pulls you in — the draft fits them to your days."),
  },
  scene: { help: tx("여러 개 골라도 좋아요.", "Pick as many as you like.") },
  interests: {
    q: { ko: (places: string) => `${places}에서는 무엇이 끌리세요?`, en: (places: string) => `What are you into in ${places}?` },
    help: tx("고르지 않아도 돼요. 여러 개 골라도 좋아요.", "Optional — pick as many as you like."),
  },
  who: { q: tx("이 여행, 누구와 함께해요?", "Who's coming?"), help: tx("하나만 골라 주세요.", "Pick one.") },
  kids: { q: tx("아이는 몇 살쯤이에요?", "How old are the kids?"), help: tx("이동 거리와 쉬는 시간이 달라져요.", "It changes the distances and the breaks.") },
  pace: { q: tx("이번 여행은 어떤 속도로?", "What pace suits this trip?"), help: tx("하루에 넣는 일정 수가 달라져요.", "It sets how much goes into each day.") },
  dates: { q: tx("언제 떠나세요?", "When are you going?"), help: tx("가는 날과 오는 날을 골라 주세요. 최대 30일까지예요.", "Pick the day you arrive and the day you leave — up to 30 days.") },
  calendar: {
    arrive: tx("가는 날", "Arrive"),
    leave: tx("오는 날", "Leave"),
    pickDate: tx("날짜 고르기", "Pick a date"),
    pickArrive: tx("가는 날을 눌러 주세요.", "Tap the day you arrive."),
    pickLeave: tx("이제 오는 날을 눌러 주세요.", "Now tap the day you leave."),
    chosen: {
      ko: (n: number) => `${n}박 ${n + 1}일 · 다른 날을 누르면 처음부터 다시 골라요.`,
      en: (n: number) => `${n} ${n === 1 ? "night" : "nights"}, ${n + 1} days · tap another day to start over.`,
    },
    prev: tx("이전 달", "Previous month"),
    next: tx("다음 달", "Next month"),
  },
  travelers: { q: tx("모두 몇 명이에요?", "How many of you?"), help: tx("본인을 포함해서 세어 주세요.", "Count yourself in.") },
  travelersUnit: { ko: (n: number) => `${n}명`, en: (n: number) => (n === 1 ? "1 person" : `${n} people`) },
  minus: tx("한 명 줄이기", "One fewer"),
  plus: tx("한 명 늘리기", "One more"),
  budget: {
    q: tx("1인 예산은 어느 정도예요?", "Budget per person?"),
    help: tx("여행 전체 기준이에요.", "For the whole trip."),
    currency: tx("비용을 볼 통화", "Show costs in"),
  },
  visited: { q: tx("한국은 처음이세요?", "First time in Korea?") },
  transport: { q: tx("어떻게 다니실 건가요?", "How will you get around?") },
  stay: { q: tx("숙소는 어디쯤이 좋으세요?", "Where would you like to stay?") },
  rhythm: { q: tx("하루를 언제 시작하세요?", "When do your days start?") },
  occasion: { q: tx("특별한 날인가요?", "Is it a special occasion?") },
  avoid: { q: tx("빼고 싶은 것이 있나요?", "Anything to leave out?") },
  diet: {
    q: tx("꼭 맞춰야 할 것이 있나요?", "Anything the plan must work around?"),
    help: tx("식사나 이동에서 맞춰야 할 것을 골라 주세요. 고르지 않아도 돼요.", "Food or getting around — optional."),
  },
  review: {
    q: tx("이대로 초안을 쓸까요?", "Ready for your draft?"),
    help: tx("고칠 곳이 있으면 오른쪽에서 눌러 바로 돌아갈 수 있어요.", "Want to change something? Tap it on the right to go back."),
    language: tx("초안을 받을 언어", "Language of your draft"),
    note: tx("가입도 카드도 필요 없어요. 보통 15초쯤 걸려요.", "No account, no card. Usually about 15 seconds."),
  },

  // 오른쪽 판
  panel: {
    title: tx("지금까지의 여행", "Your trip so far"),
    edit: tx("고치기", "Edit"),
    where: tx("어디로", "Where"),
    todo: tx("하고 싶은 것", "To do"),
    interests: tx("끌리는 것", "Into"),
    who: tx("누구와", "Who's coming"),
    pace: tx("속도", "Your pace"),
    dates: tx("날짜", "Your dates"),
    travelers: tx("인원", "How many"),
    budget: tx("예산", "Budget"),
    details: tx("세부 (고르지 않아도 돼요)", "Details (optional)"),
    days: { ko: (n: number) => `${n}일`, en: (n: number) => (n === 1 ? "1 day" : `${n} days`) },
  },

  // 기다림 — 초안을 쓰는 동안 랜딩의 고쳐 쓰기 장면을 보여 준다
  waiting: {
    title: tx("초안을 쓰고 있어요", "Writing your draft"),
    body: tx("보통 15초쯤 걸려요. 그동안 현지인이 고쳐 쓴 계획을 구경해 보세요.", "Usually about 15 seconds. Meanwhile, a few plans a local would rewrite:"),
  },
  errors: {
    400: tx("적어 주신 값 중에 이상한 게 있어요. 날짜와 인원을 확인해 주세요.", "Something doesn't look right. Please check the dates and the number of people."),
    429: tx("초안을 이미 여러 번 만드셨어요. 한 시간 뒤에 다시 시도해 주세요.", "You've made a few drafts already. Please try again in an hour."),
    502: tx("지금 초안을 못 쓰고 있어요. 다시 시도해 주세요.", "Our writer is having a moment. Please try again."),
    fallback: tx("초안을 만들지 못했어요. 다시 시도해 주세요.", "We couldn't create your draft. Please try again."),
    timeout: tx("평소보다 오래 걸리고 있어요. 다시 시도해 주세요.", "This is taking longer than usual. Please try again."),
  },
};
