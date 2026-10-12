/**
 * 새 입력 흐름(/mohallae/plan)의 질문 순서와 답 정리 — 화면 없이 돌아가는 부분만.
 *
 * 베타(#82, app/plan/beta/flow.ts)의 짜임을 이어받았다 (써니 결정 2026-10-12: "베타 짜임 그대로 + 새 모양").
 * - 한 화면에 질문 하나. 도시 → 도시별로 하고 싶은 것 → 그 장면 → 누구와 → … → 확인
 * - 고른 것을 다시 누르면 풀린다. 도시나 활동을 풀면 **그 아래 답만** 지우고 나머지는 둔다
 * - 이전 화면의 늦은 클릭이 두 칸을 건너뛰지 않게 막는다 (next 의 from)
 * 베타와 달라진 것:
 * - 도시는 베타의 4곳이 아니라 lib/places.ts 의 전체 목록 + "그 외" (기획서 5장). 목록은 화면이 넘겨준다
 * - 장면 질문은 베타가 써 둔 4개 도시(서울·부산·제주·경주)만. 그 밖의 도시는 지금 폼의 관심사 보기를 쓴다
 * - 지금 폼(app/plan)이 묻는 것은 하나도 빠뜨리지 않는다. 다만 세부(재방문·교통·숙소·리듬·기념일·피할 것·식이)는
 *   지금 폼처럼 **고르지 않아도 된다** — 건너뛰거나 바로 확인으로 갈 수 있다
 * - 마지막에 지금 폼과 **똑같은 모양**의 PlanInput 을 만든다. /api/plan 과 AI 지시문은 그대로다
 *
 * 화면에 나가는 글은 한국어·영어를 나란히 둔다 (app/mohallae/content.ts 와 같은 방식).
 * AI 에게 가는 값(ai, value)은 늘 영어다 — 지금 폼과 같은 글자라 지난 초안과 말이 맞는다.
 * 이 파일은 다른 파일을 불러오지 않는다 (node --test 로 바로 돌리려고).
 */

export type Lang = "ko" | "en";
export type Text = { ko: string; en: string };

/** 고를 수 있는 보기 하나. value 는 AI·DB 로 가는 영어 글자 */
export type Choice = { id: string; title: Text; description?: Text; value: string; image?: string };

/**
 * 도시별 '하고 싶은 것'. ai 는 "Seoul: palaces & hanok" 처럼 도시 이름을 붙여 보낸다 (서버 한도 40자 안).
 * 베타에는 고른 것마다 '어떤 장면이 좋을까요?' 두 번째 질문이 있었는데 뺐다 — 모든 도시가 같은 모양으로,
 * 질문 수도 줄게 (써니 2026-10-12 "빼봐")
 */
type Experience = { id: string; title: Text; description: Text; image?: string; ai: string };
/** photos: 오른쪽 판 엽서 자리에서 번갈아 보여 줄 사진 (148×100). 없으면 postcard 한 장 */
type Curated = { tagline: Text; postcard?: string; photos?: string[]; experiences: Experience[] };

const tx = (ko: string, en: string): Text => ({ ko, en });

/**
 * 베타가 써 둔 네 도시. 한국어는 베타 그대로, 영어는 새로 옮겼다.
 * 열쇠는 lib/places.ts 의 값(v)과 같은 영어 이름이다.
 */
export const CURATED: Record<string, Curated> = {
  Seoul: {
    tagline: tx("오래된 골목과 새로운 취향 사이", "Between old alleys and new tastes"),
    // 엽서는 전부 148×100(가로 엽서) 비율로 원본(.impeccable/plates)에서 잘라 둔 것. 서울은 노을 사진 대신 북촌 골목 —
    // 노을 사진은 하늘이 절반이라 (써니: "하늘만 보이는 느낌"). 북촌은 원본 높이 그대로 — 하늘부터 골목 바닥까지 (써니가 고름)
    postcard: "/mohallae/postcard-seoul-bukchon.jpg",
    // 엽서는 사진 카드(경복궁·북촌·광장시장·한강)와 다른 장면만 — 같은 사진이 옆에 또 보이면 의미가 없다 (써니 2026-10-12).
    // 북촌 골목(써니가 고름) → 노을 진 서울 → 남산
    photos: ["/mohallae/postcard-seoul-bukchon.jpg", "/mohallae/panel-seoul-sunset.jpg", "/mohallae/panel-seoul-namsan.jpg"],
    experiences: [
      { id: "heritage", title: tx("궁궐과 한옥", "Palaces & hanok"), description: tx("시간이 천천히 흐르는 서울", "Where time slows down"), image: "/landing/gyeongbokgung.webp", ai: "palaces & hanok" },
      { id: "neighbourhood", title: tx("골목과 카페", "Alleys & cafés"), description: tx("발길 닿는 대로 발견하는 취향", "Find your own corners"), image: "/landing/bukchon.webp", ai: "alleys & cafes" },
      { id: "food", title: tx("시장과 먹거리", "Markets & street food"), description: tx("맛있는 냄새를 따라가는 하루", "Follow the smell"), image: "/landing/gwangjang-market.webp", ai: "markets & street food" },
      { id: "outdoors", title: tx("한강과 야경", "Han River & night views"), description: tx("도시 속에서 숨을 고르는 시간", "Catch your breath in the city"), image: "/landing/han-river.webp", ai: "Han River & night views" },
    ],
  },
  Busan: {
    tagline: tx("바닷바람 따라, 조금 더 느긋하게", "Follow the sea breeze, a little slower"),
    postcard: "/mohallae/postcard-busan.jpg",
    experiences: [
      { id: "coast", title: tx("바다와 해변", "Sea & beaches"), description: tx("파도 소리로 채우는 하루", "A day filled with the sound of waves"), ai: "beaches & sea views" },
      { id: "food", title: tx("시장과 먹거리", "Markets & local food"), description: tx("부산다운 한 끼를 찾아서", "Looking for a very Busan meal"), ai: "markets & seafood" },
      { id: "neighbourhood", title: tx("언덕과 골목", "Hills & alleys"), description: tx("오르내릴수록 달라지는 풍경", "Views that change as you climb"), ai: "hillside alleys & villages" },
      { id: "night", title: tx("야경과 도시", "Night & the city"), description: tx("해가 진 뒤 만나는 또 다른 부산", "Another Busan after dark"), ai: "night views & bridges" },
    ],
  },
  Jeju: {
    tagline: tx("바람과 숲이 하루의 속도를 정하는 곳", "Where wind and forest set the pace"),
    experiences: [
      { id: "coast", title: tx("바다와 해안", "Sea & coast"), description: tx("물빛을 따라 섬을 만나는 시간", "Meet the island by the colour of its water"), ai: "beaches & coastal walks" },
      { id: "nature", title: tx("숲과 오름", "Forests & oreum"), description: tx("초록 사이에서 깊게 숨 쉬기", "Breathe deep among the green"), ai: "forests & oreum" },
      { id: "rest", title: tx("카페와 쉼", "Cafés & rest"), description: tx("비워둔 시간이 더 좋은 여행", "A trip that's better with empty time"), ai: "cafes & slow village time" },
      { id: "food", title: tx("시장과 먹거리", "Markets & food"), description: tx("섬의 맛을 하나씩 발견하기", "Find the island's flavours one by one"), ai: "markets & local food" },
    ],
  },
  Gyeongju: {
    tagline: tx("천년의 풍경을 오늘의 걸음으로", "A thousand-year-old view, at today's pace"),
    postcard: "/mohallae/postcard-gyeongju.jpg",
    experiences: [
      { id: "heritage", title: tx("신라와 유적", "Silla history & sites"), description: tx("풍경 속에서 만나는 오래된 이야기", "Old stories in the landscape"), ai: "Silla tombs & temples" },
      { id: "neighbourhood", title: tx("골목과 한옥", "Alleys & hanok"), description: tx("익숙한 듯 새로운 동네 산책", "A walk that's familiar and new"), ai: "hanok alleys & cafes" },
      { id: "night", title: tx("야경과 산책", "Night views & walks"), description: tx("밤이 되면 새로 보이는 경주", "Gyeongju, new again at night"), ai: "night views by the water" },
      { id: "rest", title: tx("자연과 여유", "Nature & slow time"), description: tx("역사 구경 사이에 잠깐의 쉼", "A pause between the history"), ai: "lakes & green walks" },
    ],
  },
};

/* ── 지금 폼(app/plan/page.tsx)과 같은 보기·같은 영어 값 ─────────────────── */

const choice = (id: string, value: string, ko: string, en: string, dko?: string, den?: string): Choice => ({
  id, value, title: tx(ko, en), ...(dko && den ? { description: tx(dko, den) } : {}),
});

/** 장면 질문이 없는 도시에서 쓰는 관심사 (지금 폼의 STYLES) */
export const INTERESTS: Choice[] = [
  choice("food", "Food", "먹거리", "Food"), choice("culture", "Culture & history", "문화·역사", "Culture & history"),
  choice("kculture", "K-culture", "K-컬처", "K-culture"), choice("hanbok", "Hanbok", "한복 체험", "Hanbok"),
  choice("nature", "Nature & hiking", "자연·등산", "Nature & hiking"), choice("beaches", "Beaches", "바다·해변", "Beaches"),
  choice("springs", "Hot springs & jjimjilbang", "온천·찜질방", "Hot springs & jjimjilbang"), choice("parks", "Theme parks", "테마파크", "Theme parks"),
  choice("art", "Art & exhibitions", "미술관·전시", "Art & exhibitions"), choice("shopping", "Shopping", "쇼핑", "Shopping"),
  choice("night", "Nightlife", "밤 문화", "Nightlife"), choice("photo", "Photo spots", "사진 명소", "Photo spots"),
];

/** 누구와 — 문구는 베타, 값은 지금 폼의 AUDIENCES */
export const COMPANIONS: Choice[] = [
  choice("solo", "Solo", "나 혼자", "Just me", "내 마음이 이끄는 대로", "Wherever I feel like going"),
  choice("couple", "Couple", "좋아하는 사람과", "With my partner", "둘이서 오래 기억할 장면", "Scenes for the two of us"),
  choice("friends", "Friends", "친구들과", "With friends", "함께 웃을 이야기를 모으러", "Stories to laugh about later"),
  choice("family", "Family with kids", "아이와 함께", "With kids", "작은 발견도 큰 추억이 되게", "Small finds, big memories"),
  choice("parents", "With parents", "부모님과", "With my parents", "함께 걷는 시간부터 소중하게", "Time together, at their pace"),
];

/** 아이 나이 (베타). 지금 API 에는 칸이 없어서 '누구와' 값 뒤에 붙여 보낸다: "Family with kids (under 6)" */
export const CHILDREN: Choice[] = [
  choice("young", "under 6", "아직 어린 아이", "Little ones", "쉬는 시간과 짧은 이동이 중요해요", "Breaks and short hops matter"),
  choice("school", "primary school", "초등학생", "Primary school", "직접 보고 해보는 걸 좋아해요", "They love seeing and doing"),
  choice("teen", "teenagers", "청소년", "Teenagers", "아이의 취향도 함께 골라보고 싶어요", "Their tastes count too"),
];

/** 속도 — 문구는 베타, 값은 지금 폼의 PACES */
export const PACES: Choice[] = [
  choice("slow", "Relaxed", "천천히, 깊게", "Slow and deep", "한 곳에 오래 머물러도 좋아요", "Happy to stay long in one place"),
  choice("balanced", "Balanced", "구경도, 쉬는 시간도", "A bit of both", "딱 좋은 균형으로 즐길래요", "Sights and rest, balanced"),
  choice("full", "Packed", "한 장면이라도 더", "As much as possible", "발견하는 즐거움으로 채울래요", "Fill it with discoveries"),
];

/** 1인 예산 — 여행 전체 기준 (지금 폼의 BUDGETS 와 같은 값). '아직 몰라요'는 값을 보내지 않는다 */
export const BUDGETS: Choice[] = [
  choice("under150", "Under 150,000 KRW (about $110) for the whole trip", "15만원 미만", "Under ₩150,000", "약 $110", "about $110"),
  choice("150to250", "150,000–250,000 KRW (about $110–185) for the whole trip", "15–25만원", "₩150,000–250,000", "약 $110–185", "about $110–185"),
  choice("250to350", "250,000–350,000 KRW (about $185–260) for the whole trip", "25–35만원", "₩250,000–350,000", "약 $185–260", "about $185–260"),
  choice("350to500", "350,000–500,000 KRW (about $260–370) for the whole trip", "35–50만원", "₩350,000–500,000", "약 $260–370", "about $260–370"),
  choice("over500", "Over 500,000 KRW (about $370) for the whole trip", "50만원 이상", "Over ₩500,000", "약 $370 이상", "about $370 and up"),
  choice("undecided", "", "아직 몰라요", "Not sure yet", "취향부터 알아가는 중이에요", "Still working it out"),
];
export const CURRENCIES = ["KRW", "USD", "EUR", "JPY"] as const;

/* 세부 — 지금 폼에서도 고르지 않아도 되는 것들. 화면마다 '건너뛰기'와 '바로 확인'이 있다 */
export const VISITS: Choice[] = [
  choice("first", "First time", "처음이에요", "First time"),
  choice("again", "Been before", "와본 적 있어요", "Been before"),
];
export const TRANSPORTS: Choice[] = [
  choice("transit", "Subway and bus", "지하철·버스", "Subway and bus"),
  choice("car", "Rental car", "렌터카", "Rental car"),
  choice("taxi", "Mostly taxi", "택시 위주", "Mostly taxi"),
];
export const STAY_AREAS: Choice[] = [
  choice("centre", "City centre", "도심 한가운데", "In the middle of it all"),
  choice("quiet", "Quiet neighbourhood", "조용한 동네", "A quiet neighbourhood"),
];
export const RHYTHMS: Choice[] = [
  choice("early", "Early start", "일찍 시작할게요", "Early starts"),
  choice("late", "Late start", "늦게 시작할게요", "Late starts"),
];
export const OCCASIONS: Choice[] = [
  choice("birthday", "Birthday", "생일", "Birthday"), choice("anniversary", "Anniversary", "기념일", "Anniversary"),
  choice("honeymoon", "Honeymoon", "신혼여행", "Honeymoon"), choice("graduation", "Graduation", "졸업·합격", "Graduation"),
];
export const AVOIDS: Choice[] = [
  choice("crowds", "Crowded places", "사람 많은 곳", "Crowded places"), choice("stairs", "Lots of stairs", "계단 많은 곳", "Lots of stairs"),
  choice("spicy", "Spicy food", "매운 음식", "Spicy food"), choice("late", "Late nights", "늦은 밤 일정", "Late nights"),
  choice("long", "Long travel legs", "긴 이동", "Long journeys"), choice("drinking", "Drinking", "술자리", "Drinking"),
];
/** 식이·접근성 — 건강·종교 정보라 고르는 방식으로만 받는다 (lib/types.ts 의 경고 그대로) */
export const DIETARY: Choice[] = [
  choice("halal", "Halal", "할랄", "Halal"), choice("vegetarian", "Vegetarian", "채식", "Vegetarian"), choice("vegan", "Vegan", "비건", "Vegan"),
  choice("nut", "Nut allergy", "견과류 알레르기", "Nut allergy"), choice("dairy", "Dairy allergy", "유제품 알레르기", "Dairy allergy"),
  choice("seafood", "Seafood allergy", "해산물 알레르기", "Seafood allergy"), choice("nospicy", "No spicy food", "매운 음식 못 먹음", "No spicy food"),
  choice("wheelchair", "Wheelchair access", "휠체어 접근", "Wheelchair access"), choice("stroller", "Stroller", "유아차", "Stroller"),
  choice("walk", "Hard to walk far", "오래 걷기 어려움", "Can't walk far"),
];
export const LANGUAGES = [
  { code: "en", label: "English" }, { code: "ko", label: "한국어" }, { code: "ja", label: "日本語" }, { code: "zh", label: "中文" },
] as const;

/* ── 단계 ─────────────────────────────────────────────────────────── */

/** 직접 적는 '그 외' 칸이 있는 단계 */
export const OTHER_STEPS = ["where", "interests", "avoid", "diet"] as const;
type OtherStep = (typeof OTHER_STEPS)[number];

type Simple = "where" | "interests" | "who" | "kids" | "pace" | "dates" | "travelers" | "budget"
  | "visited" | "transport" | "stay" | "rhythm" | "occasion" | "avoid" | "diet" | "review";
export type Step = Simple | `do:${string}`;

/** 고르지 않아도 되는 세부. 여기부터는 '바로 확인으로' 가 보인다 */
export const OPTIONAL: Step[] = ["visited", "transport", "stay", "rhythm", "occasion", "avoid", "diet"];
const MULTI_SIMPLE: Step[] = ["where", "interests", "avoid", "diet"];

export type Answers = Partial<Record<Step | `${OtherStep}:other` | "budget:currency" | "review:language", string[]>>;
/** reviewed: 확인 화면까지 한 번 와 봤는지. 그 뒤로 앞 질문을 고치러 가면 '확인 화면으로' 단추가 생긴다 */
export type FlowState = { step: Step; answers: Answers; reviewed?: boolean };
export const INITIAL_STATE: FlowState = { step: "where", answers: {}, reviewed: false };

/** 화면이 넘겨주는 도시 목록 (lib/places.ts 의 DESTINATIONS 와 같은 모양) */
export type Destination = { v: string; ko: string };

export function isMultiple(step: Step) {
  return MULTI_SIMPLE.includes(step) || step.startsWith("do:");
}

/** 고른 도시 + 직접 적은 곳 (값은 영어 이름, 직접 적은 곳은 적은 그대로) */
export function pickedPlaces(answers: Answers): string[] {
  const typed = (answers["where:other"]?.[0] ?? "").trim();
  return [...new Set([...(answers.where ?? []), ...(typed ? [typed] : [])])];
}

/**
 * 오른쪽 판 엽서에서 번갈아 보여 줄 사진. 도시를 여럿 고르면 도시마다 한 장씩 번갈아
 * (서울1 → 부산1 → 서울2 → 부산2 …) — 한 도시 사진만 이어지지 않게. 사진이 없는 곳은 건너뛴다.
 */
export function panelPhotos(places: string[]): string[] {
  const lists = places.map((p) => CURATED[p]?.photos ?? (CURATED[p]?.postcard ? [CURATED[p].postcard!] : []));
  const out: string[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) {
    for (const l of lists) if (i < l.length && !out.includes(l[i])) out.push(l[i]);
  }
  return out;
}

export function stepOrder(answers: Answers): Step[] {
  const steps: Step[] = ["where"];
  const places = pickedPlaces(answers);
  for (const place of places) if (CURATED[place]) steps.push(`do:${place}`);
  // '하고 싶은 것' 보기가 없는 곳(직접 적은 곳 등)이 하나라도 있으면 관심사를 한 번 묻는다
  if (places.some((p) => !CURATED[p])) steps.push("interests");
  steps.push("who");
  if (answers.who?.[0] === "family") steps.push("kids");
  return [...steps, "pace", "dates", "travelers", "budget", ...OPTIONAL, "review"];
}

/** 이 단계의 보기 */
export function choicesFor(step: Step): Choice[] {
  if (step.startsWith("do:")) {
    const city = CURATED[step.slice(3)];
    return (city?.experiences ?? []).map((e) => ({ id: e.id, title: e.title, description: e.description, value: e.ai, image: e.image }));
  }
  switch (step as Simple) {
    case "interests": return INTERESTS;
    case "who": return COMPANIONS;
    case "kids": return CHILDREN;
    case "pace": return PACES;
    case "budget": return BUDGETS;
    case "visited": return VISITS;
    case "transport": return TRANSPORTS;
    case "stay": return STAY_AREAS;
    case "rhythm": return RHYTHMS;
    case "occasion": return OCCASIONS;
    case "avoid": return AVOIDS;
    case "diet": return DIETARY;
    default: return [];
  }
}

export function localToday(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** 두 날짜 사이 밤 수 (9/13 → 9/15 는 2) */
export function nights(start: string, end: string) {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000);
}

const realDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;

/** 다음으로 못 가는 이유 (없으면 null). 화면에 그대로 보이는 말이라 두 언어로 돌려준다 */
export function stepError(state: FlowState, today = localToday()): Text | null {
  const { step, answers } = state;
  const values = answers[step] ?? [];
  if (step === "review" || OPTIONAL.includes(step) || step === "interests") {
    // 고르지 않아도 된다. 다만 '그 외'를 켜 두고 비워 두면 무엇인지 알 수 없다
    const other = answers[`${step}:other` as keyof Answers];
    if (other && other.length && !other[0].trim()) return tx("직접 적는 칸이 비어 있어요. 적거나 닫아 주세요.", "The ‘other’ box is empty — type something or close it.");
    return null;
  }
  if (step === "where") {
    const other = answers["where:other"];
    if (other && other.length && !other[0].trim()) return tx("그 외를 고르셨어요 — 어디인지 적어 주세요.", "You picked somewhere else — please type where.");
    return pickedPlaces(answers).length ? null : tx("가고 싶은 곳을 하나 이상 골라 주세요.", "Pick at least one place you want to go.");
  }
  if (step === "dates") {
    const [start, end] = values;
    if (!start || !end) return tx("가는 날과 오는 날을 모두 골라 주세요.", "Pick the day you arrive and the day you leave.");
    if (!realDate(start) || !realDate(end)) return tx("달력에 있는 날짜를 골라 주세요.", "Please pick dates from the calendar.");
    if (start < today) return tx("가는 날은 오늘 이후로 골라 주세요.", "Arrival can't be in the past.");
    if (end < start) return tx("오는 날은 가는 날과 같거나 뒤여야 해요.", "Leaving has to be on or after arriving.");
    if (nights(start, end) + 1 > 30) return tx("여행 기간은 30일까지 고를 수 있어요.", "Trips can be up to 30 days.");
    return null;
  }
  if (step === "travelers") {
    const n = Number(values[0]);
    if (!values[0] || !Number.isInteger(n) || n < 1 || n > 20) return tx("인원은 1명부터 20명까지 적어 주세요.", "Travellers: 1 to 20.");
    if (answers.who?.[0] === "solo" && n !== 1) return tx("혼자 여행을 고르셨어요. 1명으로 적거나 '누구와'를 바꿔 주세요.", "You picked ‘just me’ — set 1 or change who's coming.");
    if (answers.who?.[0] && answers.who[0] !== "solo" && n < 2) return tx("함께하는 여행은 본인 포함 2명 이상이에요.", "With company it's at least 2, you included.");
    return null;
  }
  const ok = values.length > 0 && values.every((id) => choicesFor(step).some((c) => c.id === id));
  return ok ? null : tx("마음에 드는 것을 골라 주세요.", "Pick the one that fits.");
}

export type Action =
  | { type: "choose"; value: string }
  | { type: "input"; values: string[] }
  | { type: "other"; text: string | null } // null 이면 '그 외' 칸을 닫는다
  | { type: "set"; key: "budget:currency" | "review:language"; value: string }
  | { type: "next"; from: Step }
  | { type: "back" }
  | { type: "goto"; to: Step } // 확인 화면에서 고칠 곳으로, 세부에서 바로 확인으로
  | { type: "resume" } // 확인 화면을 본 뒤 고치러 왔을 때: 곧장 확인 화면으로
  | { type: "reset" };

export function flowReducer(state: FlowState, action: Action): FlowState {
  if (action.type === "reset") return INITIAL_STATE;
  const order = stepOrder(state.answers);
  const index = order.indexOf(state.step);
  const move = (step: Step): FlowState => ({ ...state, step, reviewed: state.reviewed || step === "review" });

  if (action.type === "back") return move(order[Math.max(0, index - 1)]);
  if (action.type === "resume") {
    // 확인 화면에서 날짜 하나 고치러 왔는데 다음·다음·다음을 눌러야 돌아가는 건 번거롭다 (써니 2026-10-12).
    // 고치는 사이에 새로 생긴 필수 질문(새 도시의 '하고 싶은 것', 아이 나이, 다시 세야 할 인원)이 있으면 거기서 멈춘다
    if (!state.reviewed || state.step === "review" || stepError(state)) return state;
    const pending = order.find((st) => st !== "review" && stepError({ step: st, answers: state.answers }));
    return move(pending ?? "review");
  }
  if (action.type === "goto") {
    if (!order.includes(action.to)) return state;
    // 앞으로 건너뛰는 건 세부 → 확인뿐이다. 필수 질문을 건너뛰지 못하게 한다
    const forward = order.indexOf(action.to) > index;
    if (forward && !(OPTIONAL.includes(state.step) && action.to === "review")) return state;
    if (forward && stepError(state)) return state;
    return move(action.to);
  }
  if (action.type === "next") {
    // 이전 화면에서 늦게 들어온 클릭이 다음 질문까지 건너뛰지 않게 한다 (베타와 같다)
    if (action.from !== state.step || stepError(state) || state.step === "review") return state;
    return move(order[index + 1]);
  }
  if (action.type === "input") {
    if (state.step !== "dates" && state.step !== "travelers") return state;
    return { ...state, answers: { ...state.answers, [state.step]: action.values } };
  }
  if (action.type === "set") {
    return { ...state, answers: { ...state.answers, [action.key]: [action.value] } };
  }
  if (action.type === "other") {
    if (!(OTHER_STEPS as readonly string[]).includes(state.step)) return state;
    const key = `${state.step}:other` as keyof Answers;
    const answers: Answers = { ...state.answers };
    if (action.text === null) delete answers[key];
    else answers[key] = [action.text.slice(0, 40)];
    return { ...state, answers: prune(answers) };
  }

  // choose
  const options = state.step === "where" ? null : choicesFor(state.step);
  if (options && !options.some((c) => c.id === action.value)) return state;
  const current = state.answers[state.step] ?? [];
  const values = isMultiple(state.step)
    ? current.includes(action.value) ? current.filter((v) => v !== action.value) : [...current, action.value]
    : OPTIONAL.includes(state.step) && current[0] === action.value ? [] // 세부는 다시 누르면 풀린다
      : [action.value];
  const answers: Answers = { ...state.answers, [state.step]: values };
  // 누구와를 바꾸면 인원을 다시 채운다 (혼자 1, 둘이 2) — 베타와 같다
  if (state.step === "who" && current[0] !== action.value) {
    delete answers.travelers;
    if (action.value === "solo") answers.travelers = ["1"];
    if (action.value === "couple") answers.travelers = ["2"];
  }
  return { ...state, answers: prune(answers) };
}

/** 없어진 도시·활동·아이 질문의 답만 지운다. 아직 유효한 답은 둔다 */
function prune(answers: Answers): Answers {
  const active = new Set<string>(stepOrder(answers));
  for (const key of Object.keys(answers)) {
    const base = key.endsWith(":other") || key === "budget:currency" || key === "review:language" ? key.split(":")[0] : key;
    if (!active.has(base)) delete answers[key as keyof Answers];
  }
  return answers;
}

/* ── 보내는 값 ─────────────────────────────────────────────────────── */

/** /api/plan 이 받는 모양 (lib/types.ts 의 PlanInput 에서 이 화면이 채우는 칸) */
export type PlanRequest = {
  destinations: string[];
  startDate: string;
  durationDays: number;
  travelers: number;
  budgetRange?: string;
  budgetCurrency: string;
  styles: string[];
  audience?: string;
  pace?: string;
  visitedBefore?: string;
  transport?: string;
  stayArea?: string;
  dayRhythm?: string;
  occasion?: string;
  avoid: string[];
  dietary: string[];
  language: string;
};

const pick = (step: Step, answers: Answers) => {
  const id = answers[step]?.[0];
  return choicesFor(step).find((c) => c.id === id)?.value || undefined;
};
const many = (step: Step, answers: Answers) =>
  (answers[step] ?? []).map((id) => choicesFor(step).find((c) => c.id === id)?.value).filter((v): v is string => !!v);

/** 기본 통화: 한국어 화면이면 원화, 영어면 달러 (지금 폼은 손님이 고른다 — 예산 화면에서 바꿀 수 있다) */
export const defaultCurrency = (lang: Lang) => (lang === "ko" ? "KRW" : "USD");

export function toPlanRequest(answers: Answers, lang: Lang): PlanRequest {
  const [start, end] = answers.dates ?? [];
  // 도시별로 고른 것은 "Seoul: palaces & hanok" 처럼 도시를 붙여 보낸다. 관심사는 지금 폼과 같은 값
  const todo = pickedPlaces(answers).flatMap((place) =>
    many(`do:${place}`, answers).map((ai) => `${place}: ${ai}`.slice(0, 40)));
  const interestOther = (answers["interests:other"]?.[0] ?? "").trim();
  const kids = pick("kids", answers);
  const who = pick("who", answers);
  const avoidOther = (answers["avoid:other"]?.[0] ?? "").trim();
  const dietOther = (answers["diet:other"]?.[0] ?? "").trim();
  return {
    destinations: pickedPlaces(answers),
    startDate: start,
    durationDays: nights(start, end) + 1,
    travelers: Number(answers.travelers?.[0]),
    budgetRange: pick("budget", answers),
    budgetCurrency: answers["budget:currency"]?.[0] ?? defaultCurrency(lang),
    // 서버는 13개까지만 받는다 (lib/validate.ts). 도시별로 고른 것이 먼저 — 이 여행의 뼈대다
    styles: [...todo, ...many("interests", answers), ...(interestOther ? [interestOther] : [])].slice(0, 13),
    audience: who && kids ? `${who} (${kids})` : who,
    pace: pick("pace", answers),
    visitedBefore: pick("visited", answers),
    transport: pick("transport", answers),
    stayArea: pick("stay", answers),
    dayRhythm: pick("rhythm", answers),
    occasion: pick("occasion", answers),
    avoid: [...many("avoid", answers), ...(avoidOther ? [avoidOther] : [])],
    dietary: [...many("diet", answers), ...(dietOther ? [dietOther] : [])],
    language: answers["review:language"]?.[0] ?? lang,
  };
}
