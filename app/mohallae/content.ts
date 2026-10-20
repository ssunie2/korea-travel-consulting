/**
 * 새 랜딩(/mohallae)에 나가는 글. 기준은 캔버스의 **시안 21-5**(결과 미리보기 + 날짜별 가격 막대, 2026-10-20 써니 결정)와
 * 기획 문서 '모할래 새 흐름 기획' — 날마다 안 3–5개, 첫날 안 하나는 무료로 전부, 원하는 날만 날짜별 값으로 연다.
 *
 * - 첫 화면 잠금화면과 '1일차 · 안 4개' 칸의 안·정거장·팁은 **예시다**(화면에 '예시' 를 붙인다). 실제 가게 이름은 없다.
 *   정거장 팁의 역 이름(서울숲역 수인분당선, 뚝섬유원지역 7호선)은 실제 노선 그대로다.
 * - 샘플 4개는 실제로 폼을 거쳐 만든 초안이다. 카드를 누르면 그 초안이 열리므로 글은 초안 내용과 같게 둔다.
 * - 고쳐 쓰기 띠(corrections)는 랜딩에서는 빠졌지만, 입력 흐름의 기다리는 화면(PlanFlow)이 계속 쓴다.
 * - 규칙 3장(법적 경계): 우리는 알려주기만 하고 예약은 손님이 한다.
 *   "예약해 드립니다 / we book / on your behalf" 같은 말은 쓰지 않는다.
 *
 * 언어: 기존 랜딩은 lib/copy.ts 의 LANG 하나로 정한다. 이 화면은 주소 끝에 `?lang=en` 을 붙이면
 * 영어로 바뀐다(EN | 한국어 단추). 아무것도 안 붙이면 LANG 을 따른다.
 */
import { LANG } from "@/lib/copy";

export type Lang = "ko" | "en";
export type Pair<T> = { ko: T; en: T };

export function langFrom(value: string | string[] | undefined): Lang {
  return value === "en" || value === "ko" ? value : LANG;
}

/** '무료 초안 받기' 단추가 가는 곳 — 새 입력 흐름. 영어로 보던 손님은 영어로 이어서 묻는다 */
export const planHref = (lang: Lang) => `/mohallae/plan${lang === "en" ? "?lang=en" : ""}`;

/**
 * 새 화면들 사이의 링크 주소. planHref 와 같은 규칙 — 영어로 보던 손님은 `?lang=en` 을 달고 간다.
 * 자리 표시(#how)는 뒤에 붙인다: withLang("/mohallae", lang) + "#how"
 */
export const withLang = (path: string, lang: Lang) => `${path}${lang === "en" ? "?lang=en" : ""}`;

export const nav = {
  how: { ko: "이용 방법", en: "How it works" },
  samples: { ko: "샘플", en: "Samples" },
  faq: { ko: "자주 묻는 것", en: "FAQ" },
  cta: { ko: "무료 초안 받기", en: "Get your free draft" },
  langLabel: { ko: "언어", en: "Language" },
};

/** 제목 한 줄 = 조각 여러 개. em 조각만 강조색 (시안 21-5: '아는 사람') */
export type HeadlineLine = { text: string; em?: boolean }[];

export const hero = {
  // 한국어는 시안 그대로 세 줄. 영어는 길어서 줄을 달리 끊고 글자를 조금 줄인다.
  headline: {
    ko: [[{ text: "한국에 " }, { text: "아는 사람", em: true }], [{ text: "있는 것처럼" }], [{ text: "여행하세요." }]],
    en: [[{ text: "Plan Korea like" }], [{ text: "you " }, { text: "know someone", em: true }], [{ text: "who lives here." }]],
  } as Pair<HeadlineLine[]>,
  note: {
    ko: "가입 없음 · 첫날 안 하나는 전부 무료",
    en: "No sign-up · One Day 1 plan free, in full",
  },
};

/**
 * '1일차 · 안 4개' — 첫 화면 잠금화면과 샘플 아래 예시 칸이 같이 쓴다. **예시다.**
 * 네 안은 예산 단계(고른 예산 ± 한 단계)와 프로그램이 정한 차이(밤 산책)로 갈린다 — 기획 문서 그대로.
 * open: 무료로 연 안. 나머지는 제목·예산만 보이고 자세한 칸은 회색 줄이다(결제 전엔 내용이 없다는 원칙).
 */
export const dayOne = {
  date: { ko: "10월 24일 금요일", en: "Friday, October 24" },
  day: { ko: "1일차", en: "Day 1" },
  count: { ko: "1일차 · 안 4개", en: "Day 1 · 4 plans" },
  pill: { ko: "안 4개 · 하나를 눌러 무료로 열어 보세요", en: "4 plans · Tap one to open it free" },
  opened: { ko: "무료로 연 안", en: "Opened free" },
  now: { ko: "지금", en: "now" },
  caption: { ko: "초안 결과 화면 예시", en: "Sample result screen" },
  sample: { ko: "예시", en: "Sample" },
  freeOne: { ko: "첫날 하나는 무료", en: "One Day 1 plan is free" },
  locked: { ko: "잠김", en: "Locked" },
  screenLabel: {
    ko: "초안 결과 화면 예시. 1일차 안 4개 가운데 보통 예산 안 '성수 카페와 서울숲 노을'을 무료로 연 모습이고, 나머지 3개는 잠겨 있다. 연 안의 첫 팁: 주말 오후엔 줄이 길어요, 오전에 먼저 들르고 오후엔 골목 안쪽 카페로 가세요.",
    en: "Sample result screen: four plans for Day 1. The standard-budget plan, 'Seongsu cafés, Seoul Forest sunset', is opened free and the other three stay locked. Its first tip: weekend afternoons mean long lines, so go in the morning and try the cafés deeper in the alleys later.",
  },
  variants: [
    {
      tier: { ko: "아끼는", en: "Budget" },
      title: { ko: "북촌 골목과 광장시장", en: "Bukchon lanes & Gwangjang Market" },
      cost: { ko: "1인 약 4만 원", en: "~₩40K pp" },
      photo: "bukchon",
    },
    {
      tier: { ko: "보통", en: "Standard" },
      title: { ko: "성수 카페와 서울숲 노을", en: "Seongsu cafés, Seoul Forest sunset" },
      cost: { ko: "1인 약 9만 원", en: "~₩90K pp" },
      photo: "seongsu",
      open: true,
    },
    {
      tier: { ko: "여유", en: "Comfort" },
      title: { ko: "여의도 한강과 남산 야경", en: "Yeouido riverside, Namsan at night" },
      cost: { ko: "1인 약 15만 원", en: "~₩150K pp" },
      photo: "hanRiver",
    },
    {
      tier: { ko: "밤 산책", en: "Night walk" },
      title: { ko: "을지로 골목과 오래된 술집", en: "Euljiro alleys & old pubs" },
      cost: { ko: "1인 약 8만 원", en: "~₩80K pp" },
      photo: "euljiro",
    },
  ] as {
    tier: Pair<string>;
    title: Pair<string>;
    cost: Pair<string>;
    photo: "bukchon" | "seongsu" | "hanRiver" | "euljiro";
    open?: boolean;
  }[],
  // 무료로 연 안(성수)의 정거장. 첫 정거장만 흔한 계획에 줄을 긋는다.
  stops: [
    {
      time: "11:00",
      place: { ko: "성수동 카페 골목", en: "Seongsu café alleys" },
      plan: { ko: "유명 카페 한 곳에서 오래 줄을 선다.", en: "Queue for ages at one famous café." },
      tip: {
        ko: "주말 오후엔 줄이 길어요. 오전에 먼저 들르고, 오후엔 골목 안쪽 카페로 가세요.",
        en: "Weekend afternoons mean long lines. Go in the morning, then try the cafés deeper in the alleys.",
      },
      // 첫 화면 잠금화면의 알림은 좁아서 영어는 앞 문장만 줄여 쓴다 (한국어는 한 줄에 들어간다)
      tipShort: {
        ko: "주말 오후엔 줄이 길어요. 오전에 먼저 들르고, 오후엔 골목 안쪽 카페로 가세요.",
        en: "Long lines on weekend afternoons — go in the morning.",
      },
      icon: "photo",
    },
    {
      time: "15:00",
      place: { ko: "서울숲", en: "Seoul Forest" },
      tip: {
        ko: "서울숲역(수인분당선)에서 내리면 가까워요.",
        en: "Seoul Forest Station (Suin–Bundang Line) is the closest stop.",
      },
      icon: "tree",
    },
    {
      time: "17:30",
      place: { ko: "뚝섬 한강공원 노을", en: "Sunset at Ttukseom Hangang Park" },
      tip: {
        ko: "뚝섬유원지역(7호선)에서 내리면 공원이 바로 앞이에요. 해 지기 30분 전에 도착하세요.",
        en: "Ttukseom Resort Station (Line 7) opens right onto the park. Get there 30 minutes before sunset.",
      },
      icon: "sunset",
    },
  ] as {
    time: string;
    place: Pair<string>;
    plan?: Pair<string>;
    tip: Pair<string>;
    tipShort?: Pair<string>;
    icon: "photo" | "tree" | "sunset";
  }[],
};

/** 첫 화면 아래 칸 — 날짜별 가격 막대 (21-6 에서 가져옴, 기획 문서의 가격). 막대 높이는 값에 비례한다 */
export const dayPrice = {
  title: { ko: "같이 열수록 하루 값이 내려가요", en: "Open more days, pay less per day" },
  sub: {
    ko: ["4일 모두 열면 $70 ·", "하루씩 따로 열 때보다 $30 아껴요"],
    en: ["All 4 days: $70 ·", "$30 less than one at a time"],
  },
  label: {
    ko: "하루 값: 첫 번째 날 25달러, 두 번째부터 네 번째 날 15달러, 다섯 번째 날부터 10달러",
    en: "Price per day: $25 for the first day, $15 for the 2nd to 4th, $10 from the 5th on",
  },
  bars: [
    { price: "$25", height: 96, label: { ko: "첫 번째", en: "1st" } },
    { price: "$15", height: 58, label: { ko: "2번째", en: "2nd" } },
    { price: "$15", height: 58, label: { ko: "3번째", en: "3rd" } },
    { price: "$15", height: 58, label: { ko: "4번째", en: "4th" } },
    { price: "$10", height: 38, label: { ko: "5번째~", en: "5th+" } },
  ],
};

export const tipLabel: Pair<string> = { ko: "현지 팁", en: "LOCAL TIP" };
export const commonPlan: Pair<string> = { ko: "흔한 계획", en: "Common plan" };

/**
 * 고쳐 쓰기 띠. **흔한 계획 → 현지인 팁.** 기존 TIPS 4개의 순서와 내용 그대로, 한 줄 길이로 줄였다.
 *
 * 사실 확인 (2026-10-06): 남산 버스 번호만 고쳤다. 기존 문구의 01·02·05번은 예전 번호이고,
 * 지금 N서울타워까지 가는 녹색순환버스는 01A·01B번이다 (서울의 공원 남산공원 안내).
 * 남산은 2005년부터 일반 승용차와 택시가 못 올라간다 — 그래서 '택시' 계획을 고치는 팁에 택시를 넣었다.
 * 북촌 관람 시간(레드존 10~17시, 2025년 3월부터 과태료)과 경복궁 화요일 휴관은 그대로 맞다.
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
      ko: "택시도 자가용도 못 올라갑니다. 케이블카나 01A·01B번 버스를 타세요.",
      en: "No taxis or cars up Namsan\u00A0— take the cable car or bus 01A/01B.",
    },
  },
];

export const samples = {
  heading: { ko: "초안은 이렇게 생겼습니다", en: "See what a draft looks like" },
  open: { ko: "샘플 초안 열기", en: "Open sample draft" },
  // 기존 랜딩 첫 화면의 설명 문장. 새 첫 화면(시안 ②)에는 이 문장 자리가 없어 여기로 옮겼다.
  leadTitle: { ko: "가이드북에 없는 팁 하나", en: "One tip a guidebook won't give you" },
  lead: {
    ko: "여행 정보를 알려주시면 날마다 안을 3–5개 만들어 드려요. 첫날 안 하나는 무료로 전부 볼 수 있어요.",
    en: "Tell us about your trip and we'll make 3–5 plans for each day. One Day 1 plan is free to see in full.",
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

/** 이용 방법 세 칸. tag 는 칸 오른쪽 위 꼬리표 */
export const steps: { tag: Pair<string>; title: Pair<string>; body: Pair<string> }[] = [
  {
    tag: { ko: "2분", en: "2 min" },
    title: { ko: "질문에 답하세요", en: "Answer a few questions" },
    body: {
      ko: "도시, 날짜, 동행, 숙소 등 고르는 데 2분이면 충분합니다.",
      en: "City, dates, who's coming, where you're staying — about two minutes of tapping.",
    },
  },
  {
    tag: { ko: "바로", en: "Right away" },
    title: { ko: "날마다 안을 받으세요", en: "Get plans for every day" },
    body: {
      ko: "날마다 안 3–5개를 카드로 비교하고, 첫날 안 하나는 무료로 전부 열어 보세요.",
      en: "Compare 3–5 plans for each day as cards, and open one Day 1 plan in full, free.",
    },
  },
  {
    tag: { ko: "$25부터", en: "From $25" },
    title: { ko: "원하는 날만 여세요", en: "Open only the days you want" },
    body: {
      ko: "같이 열수록 하루 값이 내려가요. 고른 날의 안이 전부 열려요.",
      en: "The more days you open together, the less each one costs. Every plan for those days opens up.",
    },
  },
];

/**
 * 무료 vs 원하는 날만 열기 (기획 문서의 가격: 첫 번째 날 $25 · 2–4번째 $15 · 5번째부터 $10).
 * 다크패턴 금지 — 할인은 진짜(따로 열면 하루 $25)이고, 미리 체크·카운트다운은 없다.
 * 규칙 3장 — 예약은 손님이 한다. 우리가 여는 것은 안(정보)뿐이다.
 */
export const plans = {
  heading: { ko: "무료로 보고, 원하는 날만 열어요", en: "See it free. Open only the days you want." },
  free: {
    name: { ko: "무료", en: "Free" },
    price: "$0",
    items: {
      ko: [
        "날마다 안 3–5개 요약 — 제목, 예산, 대략적인 동선",
        "첫날 안 하나는 팁, 식당, 숙소, 비용까지 전부",
        "숙소 추천 1곳",
        "가입 없음",
      ],
      en: [
        "A summary of 3–5 plans for each day — title, budget, rough route",
        "One Day 1 plan in full — tips, restaurants, where to stay, costs",
        "One place-to-stay suggestion",
        "No sign-up",
      ],
    },
  },
  days: {
    name: { ko: "원하는 날만 열기", en: "Open the days you want" },
    price: "$25",
    from: { ko: "부터", en: "from" },
    ladder: {
      ko: ["첫 번째 날 $25", "2–4번째 날 $15", "5번째 날부터 $10"],
      en: ["1st day $25", "2nd–4th day $15", "5th day on $10"],
    },
    example: {
      ko: "4일 모두 열면 $70 · 하루씩 따로 열 때보다 $30 아껴요",
      en: "All 4 days: $70 · $30 less than opening them one at a time",
    },
    items: {
      ko: [
        "고른 날의 안 전부 — 모든 정거장 팁, 식당, 비용",
        "숙소 추천 4곳 전부",
        "마음에 드는 안이 없으면 그날 안 2개 더",
        "내 스케줄 만들기와 포스터",
      ],
      en: [
        "Every plan for the days you open — tips at every stop, restaurants, costs",
        "All 4 place-to-stay suggestions",
        "Not feeling any of them? 2 more plans for that day",
        "Build your own schedule, plus a poster",
      ],
    },
    how: {
      ko: "무료 결과 화면에서 날을 골라 열 수 있어요. 여행 시작 전까지 날을 더 열면 할인이 이어져요.",
      en: "Pick the days to open right from your free results. Open more days before your trip starts and the discount carries on.",
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
