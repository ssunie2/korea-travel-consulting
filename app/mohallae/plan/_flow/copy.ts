import type { Text } from "../flow";

/**
 * 입력 흐름 화면에 나가는 글 중 질문이 아닌 것 — 단추, 달력, 오른쪽 판, 기다림, 오류.
 * 질문·도움말·보기 글자는 flow.ts 의 STEPS 에 질문과 같이 있다 (2026-10-13 질문을 새로 짜면서 한곳으로 모았다).
 *
 * 말투는 숙제가 아니라 대화처럼 (PRODUCT.md 원칙 3).
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
  backToReview: tx("확인 화면으로", "Back to review"),
  nextQuestion: tx("다음 질문", "Next question"),
  submit: tx("무료 초안 받기", "Get my free draft"),

  picked: { ko: (n: number) => `${n}개 골랐어요 · 다시 누르면 풀려요`, en: (n: number) => `${n} picked — tap again to remove` },
  pickedOne: tx("골랐어요", "Picked"),
  other: tx("그 외 — 직접 적기", "Something else"),
  otherPlaceholder: tx("적어 주세요", "Type it"),

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
  travelersUnit: { ko: (n: number) => `${n}명`, en: (n: number) => (n === 1 ? "1 person" : `${n} people`) },
  minus: tx("한 명 줄이기", "One fewer"),
  plus: tx("한 명 늘리기", "One more"),
  currency: tx("비용을 볼 통화", "Show costs in"),
  language: tx("초안을 받을 언어", "Language of your draft"),
  reviewNote: tx("가입도 카드도 필요 없어요. 보통 15초쯤 걸려요.", "No account, no card. Usually about 15 seconds."),

  postcardPause: tx("엽서 사진 멈추기", "Pause the photos"),

  // 오른쪽 판 — 줄 하나에 질문 한두 개를 모아 적는다 (질문이 많아져서 판이 너무 길어지지 않게)
  panel: {
    title: tx("지금까지의 여행", "Your trip so far"),
    edit: tx("고치기", "Edit"),
    place: tx("서울", "Seoul"),
    plan: tx("이번 여행", "This trip"),
    area: tx("서울 어디", "Where in Seoul"),
    interests: tx("하고 싶은 것", "Into"),
    top: tx("1순위", "top"),
    wish: tx("꼭", "Must-dos"),
    dates: tx("날짜", "Dates"),
    arrive: { ko: (x: string) => `${x} 도착`, en: (x: string) => `arrive ${x.toLowerCase()}` },
    leave: { ko: (x: string) => `${x} 출발`, en: (x: string) => `leave ${x.toLowerCase()}` },
    days: { ko: (n: number) => `${n}일`, en: (n: number) => (n === 1 ? "1 day" : `${n} days`) },
    who: tx("누구와", "Who"),
    visited: tx("서울은", "Seoul before?"),
    stay: tx("숙소", "Stay"),
    budget: tx("예산", "Budget"),
    food: tx("먹는 것", "Food"),
    needs: tx("맞춰야 할 것", "Work around"),
    spicy: tx("매운 음식", "Spicy"),
    pace: tx("하루에", "Per day"),
    avoid: tx("빼고 싶은 것", "Avoid"),
    detail: tx("세부", "Details"),
    subwayNew: tx("지하철 처음", "first time on the subway"),
    hanbok: tx("한복 입기", "Wearing hanbok"),
    none: tx("없어요", "None"),
  },

  // 기다림 — 초안을 쓰는 동안 랜딩의 고쳐 쓰기 장면을 보여 준다
  waiting: {
    title: tx("초안을 쓰고 있어요", "Writing your draft"),
    body: tx("보통 15초쯤 걸려요. 그동안 현지인이 고쳐 쓴 계획을 구경해 보세요.", "Usually about 15 seconds. Meanwhile, a few plans a local would rewrite:"),
    slow: tx("여행이 길면 1분 가까이 걸리기도 해요. 조금만 더 기다려 주세요.", "Longer trips can take up to a minute. Hang on a little longer."),
  },
  errors: {
    400: tx("적어 주신 값 중에 이상한 게 있어요. 날짜와 인원을 확인해 주세요.", "Something doesn't look right. Please check the dates and the number of people."),
    429: tx("초안을 이미 여러 번 만드셨어요. 한 시간 뒤에 다시 시도해 주세요.", "You've made a few drafts already. Please try again in an hour."),
    502: tx("지금 초안을 못 쓰고 있어요. 다시 시도해 주세요.", "Our writer is having a moment. Please try again."),
    fallback: tx("초안을 만들지 못했어요. 다시 시도해 주세요.", "We couldn't create your draft. Please try again."),
    timeout: tx("평소보다 오래 걸리고 있어요. 다시 시도해 주세요.", "This is taking longer than usual. Please try again."),
  },
};
