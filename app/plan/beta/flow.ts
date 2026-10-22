export type Choice = { id: string; title: string; description: string };
type Experience = Choice & { image?: string; question: string; details: Choice[] };
type City = Choice & { english: string; experiences: Experience[] };

// 체험용 분기만 이 경로 안에 둔다. 기존 폼·AI 입력 형식과 섞지 않는다.
export const CITIES: City[] = [
  {
    id: "seoul", title: "서울", english: "SEOUL", description: "오래된 골목과 새로운 취향 사이",
    experiences: [
      { id: "heritage", title: "궁궐과 한옥", description: "시간이 천천히 흐르는 서울", image: "/landing/gyeongbokgung.webp", question: "옛 서울을 만난다면, 어떤 장면이 좋을까요?", details: [
        { id: "palace", title: "궁궐 안을 거닐기", description: "넓은 마당과 처마를 보며 걷고 싶어요" },
        { id: "hanok", title: "한옥 골목에 머물기", description: "작은 골목과 찻집이 더 끌려요" },
        { id: "hanbok", title: "한복 입고 한 장", description: "한국다운 풍경 속에 제 모습을 남길래요" },
      ] },
      { id: "neighbourhood", title: "골목과 카페", description: "발길 닿는 대로 발견하는 취향", image: "/landing/bukchon.webp", question: "어떤 골목에서 시간을 보내고 싶어요?", details: [
        { id: "quiet", title: "조용한 골목의 작은 카페", description: "창가에 앉아 동네를 천천히 보고 싶어요" },
        { id: "lively", title: "새로운 가게가 많은 동네", description: "구경하다 마음에 드는 곳에 들어갈래요" },
        { id: "local", title: "일상이 보이는 동네", description: "유명한 곳보다 동네 분위기가 궁금해요" },
      ] },
      { id: "food", title: "시장과 먹거리", description: "맛있는 냄새를 따라가는 하루", image: "/landing/gwangjang-market.webp", question: "서울의 맛, 어디서부터 시작할까요?", details: [
        { id: "market", title: "시장에서 조금씩 맛보기", description: "이것저것 나눠 먹으며 구경할래요" },
        { id: "meal", title: "한 끼를 제대로 즐기기", description: "마음에 드는 음식에 시간을 쓰고 싶어요" },
        { id: "dessert", title: "달콤한 간식 찾아가기", description: "빵과 디저트를 고르는 순간이 좋아요" },
      ] },
      { id: "outdoors", title: "한강과 야경", description: "도시 속에서 숨을 고르는 시간", image: "/landing/han-river.webp", question: "서울에서 마음에 담고 싶은 풍경은요?", details: [
        { id: "river", title: "강바람 맞으며 걷기", description: "물가를 따라 걸으며 쉬고 싶어요" },
        { id: "sunset", title: "해 질 무렵의 하늘", description: "천천히 바뀌는 빛을 바라볼래요" },
        { id: "night", title: "불빛 가득한 도시", description: "서울의 밤을 사진으로 남기고 싶어요" },
      ] },
    ],
  },
  {
    id: "busan", title: "부산", english: "BUSAN", description: "바닷바람 따라, 조금 더 느긋하게",
    experiences: [
      { id: "coast", title: "바다와 해변", description: "파도 소리로 채우는 하루", question: "부산 바다를 어떻게 즐기고 싶어요?", details: [
        { id: "walk", title: "해변을 따라 산책", description: "모래와 파도를 가까이에서 느낄래요" },
        { id: "cafe", title: "바다가 보이는 카페", description: "창밖을 보며 오래 쉬고 싶어요" },
        { id: "view", title: "해안 풍경 찾아가기", description: "다른 높이와 각도에서 바다를 볼래요" },
      ] },
      { id: "food", title: "시장과 먹거리", description: "부산다운 한 끼를 찾아서", question: "부산에서 어떤 맛이 끌리세요?", details: [
        { id: "market", title: "시장 간식 하나씩", description: "활기찬 시장을 구경하며 맛볼래요" },
        { id: "local", title: "든든한 지역 음식", description: "부산에서 자주 먹는 한 끼가 궁금해요" },
        { id: "seafood", title: "바다 가까이 해산물", description: "해산물을 중심으로 맛보고 싶어요" },
      ] },
      { id: "neighbourhood", title: "언덕과 골목", description: "오르내릴수록 달라지는 풍경", question: "부산의 동네, 무엇을 발견하고 싶어요?", details: [
        { id: "colour", title: "색이 있는 골목", description: "골목의 표정과 색을 사진에 담을래요" },
        { id: "port", title: "항구가 보이는 동네", description: "바다와 일상이 만나는 곳이 좋아요" },
        { id: "shops", title: "작은 가게 둘러보기", description: "책방과 소품 가게를 발견하고 싶어요" },
      ] },
      { id: "night", title: "야경과 도시", description: "해가 진 뒤 만나는 또 다른 부산", question: "부산의 밤은 어떤 분위기가 좋을까요?", details: [
        { id: "bridge", title: "바다 건너 반짝이는 불빛", description: "물가에서 도시의 빛을 바라볼래요" },
        { id: "lively", title: "활기찬 저녁 거리", description: "가게와 사람이 많은 곳을 걸을래요" },
        { id: "quiet", title: "차분한 밤 산책", description: "복잡하지 않은 길에서 하루를 마칠래요" },
      ] },
    ],
  },
  {
    id: "jeju", title: "제주", english: "JEJU", description: "바람과 숲이 하루의 속도를 정하는 곳",
    experiences: [
      { id: "coast", title: "바다와 해안", description: "물빛을 따라 섬을 만나는 시간", question: "제주의 바다에서는 무엇을 하고 싶어요?", details: [
        { id: "sand", title: "모래사장에서 쉬기", description: "파도를 보며 아무것도 안 하고 싶어요" },
        { id: "walk", title: "해안 길 따라 걷기", description: "바람을 맞으며 풍경을 바꿔볼래요" },
        { id: "photo", title: "마음에 드는 물빛 찾기", description: "사진으로 남길 바다를 찾고 싶어요" },
      ] },
      { id: "nature", title: "숲과 오름", description: "초록 사이에서 깊게 숨 쉬기", question: "제주의 자연, 어느 쪽이 끌리세요?", details: [
        { id: "forest", title: "그늘진 숲길", description: "나무 사이를 편안하게 걸을래요" },
        { id: "oreum", title: "오름 위 탁 트인 풍경", description: "조금 걸어 올라가 넓게 바라볼래요" },
        { id: "garden", title: "가볍게 즐기는 정원", description: "멀리 걷지 않고 초록을 만나고 싶어요" },
      ] },
      { id: "rest", title: "카페와 쉼", description: "비워둔 시간이 더 좋은 여행", question: "제주에서 쉬는 시간을 그려볼까요?", details: [
        { id: "view", title: "풍경이 좋은 창가", description: "좋아하는 음료와 오래 머물래요" },
        { id: "village", title: "작은 마을 느리게 걷기", description: "돌담과 조용한 길이 좋아요" },
        { id: "stay", title: "숙소 주변에서 느긋하게", description: "이동을 줄이고 여유를 늘릴래요" },
      ] },
      { id: "food", title: "시장과 먹거리", description: "섬의 맛을 하나씩 발견하기", question: "제주에서는 어떤 식탁이 좋을까요?", details: [
        { id: "market", title: "시장에서 여러 가지", description: "조금씩 맛보는 재미를 느낄래요" },
        { id: "local", title: "제주다운 지역 음식", description: "이곳에서 즐기는 한 끼가 궁금해요" },
        { id: "dessert", title: "차와 달콤한 간식", description: "식사 사이의 작은 즐거움을 찾을래요" },
      ] },
    ],
  },
  {
    id: "gyeongju", title: "경주", english: "GYEONGJU", description: "천년의 풍경을 오늘의 걸음으로",
    experiences: [
      { id: "heritage", title: "신라와 유적", description: "풍경 속에서 만나는 오래된 이야기", question: "경주의 옛 이야기를 어떻게 만날까요?", details: [
        { id: "walk", title: "유적 사이를 산책", description: "야외 풍경을 보며 천천히 걸을래요" },
        { id: "temple", title: "사찰의 고요함", description: "건축과 주변 자연을 함께 보고 싶어요" },
        { id: "museum", title: "박물관에서 자세히", description: "유물에 담긴 이야기를 알아보고 싶어요" },
      ] },
      { id: "neighbourhood", title: "골목과 한옥", description: "익숙한 듯 새로운 동네 산책", question: "경주의 골목에서 마음이 가는 곳은요?", details: [
        { id: "cafe", title: "한옥 카페에서 쉬기", description: "차 한 잔과 처마 아래 시간을 보낼래요" },
        { id: "shops", title: "작은 가게 구경하기", description: "소품과 간식을 하나씩 발견할래요" },
        { id: "quiet", title: "조용한 골목 걷기", description: "사람이 적은 길을 느리게 걸을래요" },
      ] },
      { id: "night", title: "야경과 산책", description: "밤이 되면 새로 보이는 경주", question: "경주의 저녁은 어떻게 기억하고 싶어요?", details: [
        { id: "reflection", title: "물에 비친 불빛", description: "고요한 야경을 오래 바라볼래요" },
        { id: "walk", title: "불빛 따라 가볍게 걷기", description: "저녁 공기를 느끼며 하루를 마칠래요" },
        { id: "photo", title: "밤 풍경 한 장 남기기", description: "여행을 기억할 사진을 찍고 싶어요" },
      ] },
      { id: "rest", title: "자연과 여유", description: "역사 구경 사이에 잠깐의 쉼", question: "경주에서 한숨 돌린다면 어디가 좋을까요?", details: [
        { id: "green", title: "초록이 넓게 펼쳐진 곳", description: "시야가 트이는 풍경이 좋아요" },
        { id: "water", title: "물가를 따라 걷는 길", description: "가볍게 걸으며 생각을 비울래요" },
        { id: "cafe", title: "경치 좋은 카페", description: "많이 걷기보다 앉아서 즐길래요" },
      ] },
    ],
  },
];

export const COMPANIONS: Choice[] = [
  { id: "solo", title: "나 혼자", description: "내 마음이 이끄는 대로" },
  { id: "couple", title: "좋아하는 사람과", description: "둘이서 오래 기억할 장면" },
  { id: "friends", title: "친구들과", description: "함께 웃을 이야기를 모으러" },
  { id: "children", title: "아이와 함께", description: "작은 발견도 큰 추억이 되게" },
  { id: "parents", title: "부모님과", description: "함께 걷는 시간부터 소중하게" },
];
export const CHILDREN: Choice[] = [
  { id: "young", title: "아직 어린 아이", description: "쉬는 시간과 짧은 이동이 중요해요" },
  { id: "school", title: "초등학생", description: "직접 보고 해보는 걸 좋아해요" },
  { id: "teen", title: "청소년", description: "아이의 취향도 함께 골라보고 싶어요" },
];
export const PACES: Choice[] = [
  { id: "slow", title: "천천히, 깊게", description: "한 곳에 오래 머물러도 좋아요" },
  { id: "balanced", title: "구경도, 쉬는 시간도", description: "딱 좋은 균형으로 즐길래요" },
  { id: "full", title: "한 장면이라도 더", description: "발견하는 즐거움으로 채울래요" },
];

export const BUDGETS: Choice[] = [
  { id: "under150", title: "15만원 미만", description: "꼭 하고 싶은 것 중심으로" },
  { id: "150to250", title: "15–25만원", description: "작은 즐거움을 하나씩" },
  { id: "250to350", title: "25–35만원", description: "마음에 드는 경험을 골라서" },
  { id: "350to500", title: "35–50만원", description: "먹거리도, 즐길 거리도" },
  { id: "over500", title: "50만원 이상", description: "좋아하는 경험에 여유 있게" },
  { id: "undecided", title: "아직 정하지 않았어요", description: "취향부터 알아가는 중이에요" },
];

type Question = "city" | "experience" | "detail" | "company" | "children" | "pace" | "dates" | "travelers" | "budget" | "summary";
export type Step = Exclude<Question, "experience" | "detail"> | `experience:${string}` | `detail:${string}:${string}`;
export type Answers = Partial<Record<Step, string[]>>;
export type FlowState = { step: Step; answers: Answers };
export const INITIAL_STATE: FlowState = { step: "city", answers: {} };

export function selectedCities(answers: Answers) {
  return (answers.city ?? []).flatMap((id) => CITIES.filter((city) => city.id === id));
}

export function stepContext(state: FlowState) {
  const [kind, cityId, experienceId] = state.step.split(":");
  const city = CITIES.find((item) => item.id === cityId) ?? selectedCities(state.answers)[0];
  const experience = city?.experiences.find((item) => item.id === experienceId);
  return { kind: kind as Question, city, experience };
}

export function isMultiple(step: Step) {
  return step === "city" || step.startsWith("experience:") || step.startsWith("detail:");
}

export function stepOrder(answers: Answers): Step[] {
  const steps: Step[] = ["city"];
  for (const city of selectedCities(answers)) {
    steps.push(`experience:${city.id}`);
    for (const experience of city.experiences) {
      if (answers[`experience:${city.id}`]?.includes(experience.id)) steps.push(`detail:${city.id}:${experience.id}`);
    }
  }
  return [...steps, "company", ...(answers.company?.[0] === "children" ? ["children" as const] : []), "pace", "dates", "travelers", "budget", "summary"];
}

export function choicesFor(state: FlowState): Choice[] {
  const { kind, city, experience } = stepContext(state);
  switch (kind) {
    case "city": return CITIES;
    case "experience": return city?.experiences ?? [];
    case "detail": return experience?.details ?? [];
    case "company": return COMPANIONS;
    case "children": return CHILDREN;
    case "pace": return PACES;
    case "budget": return BUDGETS;
    default: return [];
  }
}

export function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function stepError(state: FlowState, today = localToday()): string | null {
  const values = state.answers[state.step] ?? [];
  if (state.step === "summary") return null;
  if (state.step === "dates") {
    const [start, end] = values;
    if (!start || !end) return "가는 날과 오는 날을 모두 골라주세요.";
    const valid = [start, end].every((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value);
    if (!valid) return "달력에 있는 날짜를 골라주세요.";
    if (start < today) return "가는 날은 오늘 이후로 골라주세요.";
    if (end < start) return "오는 날은 가는 날과 같거나 뒤여야 해요.";
    if ((Date.parse(end) - Date.parse(start)) / 86400000 >= 30) return "여행 기간은 최대 30일까지 골라주세요.";
    return null;
  }
  if (state.step === "travelers") {
    const count = Number(values[0]);
    if (!values[0] || !Number.isInteger(count) || count < 1 || count > 20) return "인원은 1명부터 20명까지 적어주세요.";
    if (state.answers.company?.[0] === "solo" && count !== 1) return "혼자 여행을 골랐어요. 인원은 1명으로 적거나 동행 선택을 바꿔주세요.";
    if (state.answers.company?.[0] !== "solo" && count < 2) return "함께하는 여행은 본인을 포함해 2명 이상으로 적어주세요.";
    return null;
  }
  return values.length && values.every((id) => choicesFor(state).some((choice) => choice.id === id)) ? null : "마음에 드는 항목을 하나 이상 골라주세요.";
}

type Action = { type: "choose"; value: string } | { type: "input"; values: string[] } | { type: "next"; from: Step } | { type: "back" } | { type: "reset" };

export function flowReducer(state: FlowState, action: Action): FlowState {
  if (action.type === "reset") return INITIAL_STATE;
  const order = stepOrder(state.answers);
  const index = order.indexOf(state.step);
  if (action.type === "back") return { ...state, step: order[Math.max(0, index - 1)] };
  if (action.type === "next") {
    // 이전 화면에서 발생한 중복 클릭으로 다음 질문까지 건너뛰지 않는다.
    if (action.from !== state.step || stepError(state) || state.step === "summary") return state;
    return { ...state, step: order[index + 1] };
  }
  if (action.type === "input") {
    if (state.step !== "dates" && state.step !== "travelers") return state;
    return { ...state, answers: { ...state.answers, [state.step]: action.values } };
  }
  if (!choicesFor(state).some((choice) => choice.id === action.value)) return state;

  const current = state.answers[state.step] ?? [];
  const values = isMultiple(state.step) ? (current.includes(action.value) ? current.filter((id) => id !== action.value) : [...current, action.value]) : [action.value];
  const answers: Answers = { ...state.answers, [state.step]: values };
  if (state.step === "company" && current[0] !== action.value) {
    delete answers.travelers;
    if (action.value === "solo") answers.travelers = ["1"];
    if (action.value === "couple") answers.travelers = ["2"];
  }
  // 없어진 도시·활동의 답만 제거한다. 여전히 유효한 다른 답은 보존한다.
  const activeSteps = stepOrder(answers);
  for (const key of Object.keys(answers) as Step[]) {
    if (!activeSteps.includes(key)) delete answers[key];
  }
  return { ...state, answers };
}
