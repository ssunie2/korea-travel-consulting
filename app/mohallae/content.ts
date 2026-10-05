/**
 * 새 랜딩(/mohallae)에 나가는 글.
 *
 * **새로 지어낸 사실은 없다.** 기존 랜딩(app/page.tsx)과 결과·상담 화면의 글을 옮겨 왔다.
 * - 고쳐 쓰기 띠의 팁 4개는 기존 TIPS 그대로이고, 한 줄에 들어가도록 **줄이기만** 했다.
 *   줄인 문장에도 원래 팁에 없는 내용은 넣지 않는다.
 * - 샘플 4개는 기존 SAMPLES 와 같은 실제 초안이다. 아이디를 바꿀 때는 두 랜딩을 같이 바꾼다.
 * - 규칙 3장(법적 경계): 우리는 알려주기만 하고 예약은 손님이 한다.
 *   "예약해 드립니다 / we book / on your behalf" 같은 말은 쓰지 않는다.
 *
 * 언어: 기존 랜딩은 lib/copy.ts 의 LANG 하나로 정한다. 이 화면은 주소 끝에 `?lang=en` 을 붙이면
 * 영어로 바뀐다(시안의 EN | 한국어 단추). 아무것도 안 붙이면 LANG 을 따른다.
 */
import { LANG } from "@/lib/copy";

export type Lang = "ko" | "en";
export type Pair<T> = { ko: T; en: T };

export function langFrom(value: string | string[] | undefined): Lang {
  return value === "en" || value === "ko" ? value : LANG;
}

export const nav = {
  how: { ko: "이용 방법", en: "How it works" },
  samples: { ko: "샘플", en: "Samples" },
  faq: { ko: "자주 묻는 것", en: "FAQ" },
  cta: { ko: "무료 초안 받기", en: "Get your free draft" },
  langLabel: { ko: "언어", en: "Language" },
};

export const hero = {
  // 두 줄로 나눠 든다. 기존 랜딩과 같은 자리에서 끊는다.
  headline: {
    ko: ["한국에 아는 사람", "있는 것처럼 여행하세요."],
    en: ["Plan Korea like you know", "someone who lives here."],
  },
  note: {
    ko: ["가입 없음", "일자별 초안 무료"],
    en: ["No account", "Free day-by-day draft"],
  },
  imageAlt: {
    ko: "해 질 녘 북촌 한옥 골목. 기와지붕 너머 멀리 남산과 N서울타워가 보인다",
    en: "A Bukchon hanok lane at golden hour, with N Seoul Tower on Namsan in the distance",
  },
};

export const tipLabel: Pair<string> = { ko: "현지 팁", en: "LOCAL TIP" };
export const commonPlan: Pair<string> = { ko: "흔한 계획", en: "Common plan" };

/**
 * 고쳐 쓰기 띠. **흔한 계획 → 현지인 팁.** 기존 TIPS 4개의 순서와 내용 그대로, 한 줄 길이로 줄였다.
 * `place` 는 화면 낭독기가 문장 앞에 읽는다.
 */
export const corrections: { place: Pair<string>; plan: Pair<string>; tip: Pair<string> }[] = [
  {
    place: { ko: "인천공항", en: "Incheon Airport" },
    plan: {
      ko: "공항 환전소에서 현금을 다 바꾼다.",
      en: "Change all your cash at the airport counter.",
    },
    tip: {
      ko: "교통비만 바꾸세요. 시장 노점까지 거의 다 카드를 받습니다.",
      en: "Change just enough for the ride in\u00A0— almost everywhere takes cards.",
    },
  },
  {
    place: { ko: "경복궁", en: "Gyeongbokgung Palace" },
    plan: {
      ko: "화요일 오전 10시, 경복궁에서 시작.",
      en: "Tuesday 10:00\u00A0— start at Gyeongbokgung.",
    },
    tip: {
      ko: "화요일은 휴관입니다. 수요일에 가세요\u00A0— 한복을 입으면 무료입니다.",
      en: "Closed Tuesdays. Go Wednesday\u00A0— in hanbok, entry is free.",
    },
  },
  {
    place: { ko: "북촌한옥마을", en: "Bukchon Hanok Village" },
    plan: {
      ko: "사람 없는 사진을 찍으려고 아침 8시에 북촌.",
      en: "Bukchon at 8am, for empty photos.",
    },
    tip: {
      ko: "사람이 사는 동네라 관람 시간이 있습니다\u00A0— 대략 10~17시.",
      en: "People live here\u00A0— visiting hours run roughly 10:00 to 17:00.",
    },
  },
  {
    place: { ko: "남산 · N서울타워", en: "Namsan & N Seoul Tower" },
    plan: {
      ko: "N서울타워 입구까지 택시를 탄다.",
      en: "Take a taxi to the tower entrance.",
    },
    tip: {
      ko: "남산은 자가용이 못 올라갑니다. 케이블카나 01·02·05번 버스를 타세요.",
      en: "No private cars up Namsan\u00A0— take the cable car or bus 01, 02, 05.",
    },
  },
];

export const samples = {
  heading: { ko: "초안은 이렇게 생겼습니다", en: "See what a draft looks like" },
  open: { ko: "샘플 초안 열기", en: "Open sample draft" },
  // 기존 랜딩 첫 화면의 설명 문장. 새 첫 화면(시안 ②)에는 이 문장 자리가 없어 여기로 옮겼다.
  leadTitle: { ko: "가이드북에 없는 팁 하나", en: "One tip a guidebook won't give you" },
  // 기존 랜딩 첫 화면의 설명 문장을 둘로 나눴다 — 뒷부분은 제목으로, 앞부분은 본문으로.
  lead: {
    ko: "여행 정보를 알려주시면 일자별 초안을 무료로 만들어 드립니다.",
    en: "Tell us about your trip and we'll write you a free day-by-day draft.",
  },
  // 기존 랜딩 SAMPLES 와 같은 네 개. 실제로 폼을 거쳐 만들어 저장된 초안이다.
  items: [
    {
      id: "afe82bca-e5d1-49d1-b0fb-2517d3a698ce",
      who: { ko: "혼자 · 서울 3일", en: "Solo · 3 days in Seoul" },
      title: {
        ko: "처음 만나는 서울: 3일간의 문화와 미식 여정",
        en: "Seoul for the first time: three days of culture and food",
      },
      alt: {
        ko: "해 질 녘 한옥 지붕 너머로 보이는 N서울타워",
        en: "N Seoul Tower beyond hanok rooftops at sunset",
      },
    },
    {
      id: "bb69139f-db3e-47fc-94f7-f7779df74f49",
      who: { ko: "둘이 · 서울과 부산 5일", en: "Two of you · 5 days, Seoul and Busan" },
      title: {
        ko: "서울과 부산에서 맞이하는 로맨틱 5일간의 여정",
        en: "Five romantic days across Seoul and Busan",
      },
      alt: { ko: "부산의 해변과 광안대교", en: "A Busan beach and the Gwangan Bridge" },
    },
    {
      id: "e45be288-0b7a-438a-9e02-176eafce1ee4",
      who: { ko: "아이와 함께 · 서울 4일", en: "With kids · 4 days in Seoul" },
      title: {
        ko: "첫 서울 여행을 위한 여유로운 가족 힐링 4일",
        en: "Four unhurried family days on a first trip to Seoul",
      },
      alt: {
        ko: "한옥 처마 사이로 보이는 남산과 N서울타워",
        en: "Namsan and N Seoul Tower between hanok eaves",
      },
    },
    {
      id: "5c297ae8-61fe-4b98-aae1-ac6476e8cade",
      who: {
        ko: "다시 온 여행 · 경주와 안동 4일",
        en: "Been before · 4 days, Gyeongju and Andong",
      },
      title: {
        ko: "경주와 안동, 숨은 옛 자취를 따라가는 4일간의 여정",
        en: "Gyeongju and Andong: four days along the old quiet trails",
      },
      alt: {
        ko: "단풍 든 산 아래 절 마당의 석탑",
        en: "A stone pagoda in a temple yard under autumn hills",
      },
    },
  ],
};

/**
 * 초안 속 하루 (시안 ③의 초안 패널).
 *
 * **예시다.** 실제 샘플 초안의 내용을 옮긴 것이 아니라, 초안이 어떤 모양인지 보여주려고 짠 하루다.
 * 그래서 화면에 '예시' 를 붙인다(기획서 10장). 장소와 고쳐 쓰는 팁은 기존 랜딩의 것만 쓴다.
 * 시간은 기존 팁과 어긋나지 않게 잡았다 — 북촌은 관람 시간(10~17시) 안, 남산은 해 지기 전.
 */
export const draftDay = {
  badge: { ko: "예시", en: "Sample" },
  title: { ko: "서울 3일", en: "Seoul · 3 days" },
  day: { ko: "1일차", en: "Day 1" },
  stops: [
    { time: "10:30", place: { ko: "북촌한옥마을", en: "Bukchon Hanok Village" }, image: "bukchon" },
    { time: "12:30", place: { ko: "광장시장 점심", en: "Lunch at Gwangjang Market" }, image: "gwangjang" },
    { time: "16:00", place: { ko: "남산 · N서울타워", en: "Namsan & N Seoul Tower" }, image: "namsan", fix: 3 },
  ] as { time: string; place: Pair<string>; image: "bukchon" | "gwangjang" | "namsan"; fix?: number }[],
  // 패널 안의 팁은 띠보다 자리가 넉넉해서 원래 팁에 더 가깝게 쓴다.
  longTip: {
    ko: "남산은 자가용이 못 올라갑니다. 명동에서 케이블카를 타거나 01·02·05번 버스를 타세요.",
    en: "Private cars can't drive up Namsan. Take the cable car from Myeongdong, or bus 01, 02 or 05.",
  },
};

export const steps: { title: Pair<string>; body: Pair<string[]> }[] = [
  {
    title: { ko: "여행 정보를 알려주세요", en: "Tell us about your trip" },
    body: {
      ko: ["날짜, 기간, 동행, 관심사 등", "선택하는 데 2분이면 충분합니다."],
      en: [
        "Dates, how long, who's coming, what you're into, and more.",
        "Two minutes to pick your answers.",
      ],
    },
  },
  {
    title: { ko: "무료 초안을 받으세요", en: "Get a free draft" },
    body: {
      ko: [
        "일자별 개요와 컨시어지 팁 하나.",
        "그 자리에서 바로 받아보고, 전체 일정이 필요할지 판단하실 수 있습니다.",
      ],
      en: [
        "A day-by-day outline, plus one concierge tip,",
        "delivered right away, so you can decide if you need the full plan.",
      ],
    },
  },
  {
    title: { ko: "전체 일정을 받으세요", en: "Get the full plan" },
    body: {
      ko: ["모든 정거장에 팁이 붙고,", "시간을 효율적으로 쓸 수 있게 동선을 짜드립니다."],
      en: ["A tip at every stop,", "and a route that makes good use of your time."],
    },
  },
];

export const plans = {
  heading: { ko: "무료 초안, 아니면 전체 일정?", en: "Free draft or full plan?" },
  free: {
    name: { ko: "무료 초안", en: "Free draft" },
    price: "$0",
    items: {
      ko: [
        "일자별 테마와 하루 세 가지 일정",
        "컨시어지 팁 하나, 내용 전부",
        "숙소 한 곳, 식당 한 곳",
        "총예산 추정",
      ],
      en: [
        "Day-by-day themes, three activities a day",
        "One concierge tip, in full",
        "One place to stay, one place to eat",
        "A total budget estimate",
      ],
    },
  },
  full: {
    name: { ko: "전체 일정", en: "Full plan" },
    price: "$25",
    priceNote: { ko: "여행이 며칠이든 값은 하나입니다.", en: "One price, however long your trip is." },
    // 규칙 3장 — 예약은 손님이 한다. '무엇을 언제 예약하면 되는지' 까지만 알려준다.
    items: {
      ko: [
        "모든 정거장에 팁 — 건너뛸 것, 현지인은 어떻게 하는지",
        "숙소 다섯 곳과 식당 다섯 곳, 고른 이유까지",
        "비용 항목별 분해, 동선과 시간 계산",
        "무엇을 언제 예약하면 되는지 — 한국 전화로만 받는 곳까지",
      ],
      en: [
        "A tip on every stop — what to skip, what locals do",
        "Five stays and five restaurants, with reasons",
        "Costs broken down, routes and timing worked out",
        "Exactly what to book and when — including places that only take Korean phone reservations",
      ],
    },
    how: {
      ko: "무료 초안을 받은 화면에서 바로 신청하실 수 있습니다.",
      en: "Start with the free draft — you can get the full plan right from it.",
    },
  },
};

export const ask = {
  question: { ko: "먼저 물어보고 싶으신가요?", en: "Rather just ask a question first?" },
  faq: { ko: "자주 묻는 것 보기", en: "Read the FAQ" },
  contact: { ko: "무엇이든 물어보세요", en: "Ask us anything" },
  cta: { ko: "무료 초안부터 받아보기", en: "Start with the free draft" },
};

export const footer = {
  tagline: "모할래? · what shall we do?",
  place: { ko: "대한민국 서울", en: "Seoul, Korea" },
  faq: { ko: "자주 묻는 것", en: "Questions" },
  privacy: { ko: "개인정보 처리방침", en: "Privacy" },
};
