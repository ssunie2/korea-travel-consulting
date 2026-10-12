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

/** 장면 — 도시별 활동을 고른 다음에 고르는 것. ai 는 "Seoul: palace walk" 처럼 도시 이름을 붙여 보낸다 (40자 안) */
type Scene = { id: string; title: Text; description: Text; ai: string };
type Experience = { id: string; title: Text; description: Text; image?: string; question: Text; scenes: Scene[] };
type Curated = { tagline: Text; postcard?: string; experiences: Experience[] };

const tx = (ko: string, en: string): Text => ({ ko, en });

/**
 * 베타가 써 둔 네 도시. 한국어는 베타 그대로, 영어는 새로 옮겼다.
 * 열쇠는 lib/places.ts 의 값(v)과 같은 영어 이름이다.
 */
export const CURATED: Record<string, Curated> = {
  Seoul: {
    tagline: tx("오래된 골목과 새로운 취향 사이", "Between old alleys and new tastes"),
    // 노을 사진은 하늘이 절반이고 한옥이 사진 아래 끝에서 잘려 있어 칸 비율로는 못 살린다 (써니: "하늘만 보이는 느낌") — 북촌 골목으로
    postcard: "/mohallae/postcard-seoul-bukchon.jpg",
    experiences: [
      { id: "heritage", title: tx("궁궐과 한옥", "Palaces & hanok"), description: tx("시간이 천천히 흐르는 서울", "Where time slows down"), image: "/landing/gyeongbokgung.webp",
        question: tx("옛 서울을 만난다면, 어떤 장면이 좋을까요?", "Old Seoul — which scene is yours?"), scenes: [
          { id: "palace", title: tx("궁궐 안을 거닐기", "Walk the palace grounds"), description: tx("넓은 마당과 처마를 보며 걷고 싶어요", "Wide courtyards and curved eaves"), ai: "palace walks" },
          { id: "hanok", title: tx("한옥 골목에 머물기", "Linger in hanok alleys"), description: tx("작은 골목과 찻집이 더 끌려요", "Small lanes and tea houses"), ai: "hanok alleys and tea houses" },
          { id: "hanbok", title: tx("한복 입고 한 장", "A photo in hanbok"), description: tx("한국다운 풍경 속에 제 모습을 남길래요", "Yourself in a very Korean scene"), ai: "hanbok photo" },
        ] },
      { id: "neighbourhood", title: tx("골목과 카페", "Alleys & cafés"), description: tx("발길 닿는 대로 발견하는 취향", "Find your own corners"), image: "/landing/bukchon.webp",
        question: tx("어떤 골목에서 시간을 보내고 싶어요?", "Which kind of street is yours?"), scenes: [
          { id: "quiet", title: tx("조용한 골목의 작은 카페", "A small café on a quiet lane"), description: tx("창가에 앉아 동네를 천천히 보고 싶어요", "A window seat and a slow street"), ai: "quiet-lane cafés" },
          { id: "lively", title: tx("새로운 가게가 많은 동네", "A street full of new shops"), description: tx("구경하다 마음에 드는 곳에 들어갈래요", "Browse and wander into whatever you like"), ai: "trendy shopping streets" },
          { id: "local", title: tx("일상이 보이는 동네", "A neighbourhood where people live"), description: tx("유명한 곳보다 동네 분위기가 궁금해요", "Everyday life over famous sights"), ai: "everyday local neighbourhoods" },
        ] },
      { id: "food", title: tx("시장과 먹거리", "Markets & street food"), description: tx("맛있는 냄새를 따라가는 하루", "Follow the smell"), image: "/landing/gwangjang-market.webp",
        question: tx("서울의 맛, 어디서부터 시작할까요?", "Where should Seoul's food start?"), scenes: [
          { id: "market", title: tx("시장에서 조금씩 맛보기", "A bite of everything at a market"), description: tx("이것저것 나눠 먹으며 구경할래요", "Share plates and look around"), ai: "market food stalls" },
          { id: "meal", title: tx("한 끼를 제대로 즐기기", "One proper meal"), description: tx("마음에 드는 음식에 시간을 쓰고 싶어요", "Take your time over a good meal"), ai: "one proper sit-down meal" },
          { id: "dessert", title: tx("달콤한 간식 찾아가기", "Chasing sweet snacks"), description: tx("빵과 디저트를 고르는 순간이 좋아요", "Bakeries and desserts"), ai: "bakeries and desserts" },
        ] },
      { id: "outdoors", title: tx("한강과 야경", "Han River & night views"), description: tx("도시 속에서 숨을 고르는 시간", "Catch your breath in the city"), image: "/landing/han-river.webp",
        question: tx("서울에서 마음에 담고 싶은 풍경은요?", "Which Seoul view do you want to keep?"), scenes: [
          { id: "river", title: tx("강바람 맞으며 걷기", "A walk in the river breeze"), description: tx("물가를 따라 걸으며 쉬고 싶어요", "Rest by walking along the water"), ai: "Han River walk" },
          { id: "sunset", title: tx("해 질 무렵의 하늘", "The sky at sunset"), description: tx("천천히 바뀌는 빛을 바라볼래요", "Watch the light change slowly"), ai: "sunset views" },
          { id: "night", title: tx("불빛 가득한 도시", "A city full of lights"), description: tx("서울의 밤을 사진으로 남기고 싶어요", "Photos of Seoul at night"), ai: "night views and photos" },
        ] },
    ],
  },
  Busan: {
    tagline: tx("바닷바람 따라, 조금 더 느긋하게", "Follow the sea breeze, a little slower"),
    postcard: "/mohallae/card-busan.jpg",
    experiences: [
      { id: "coast", title: tx("바다와 해변", "Sea & beaches"), description: tx("파도 소리로 채우는 하루", "A day filled with the sound of waves"),
        question: tx("부산 바다를 어떻게 즐기고 싶어요?", "How do you want Busan's sea?"), scenes: [
          { id: "walk", title: tx("해변을 따라 산책", "A walk along the beach"), description: tx("모래와 파도를 가까이에서 느낄래요", "Sand and waves up close"), ai: "beach walk" },
          { id: "cafe", title: tx("바다가 보이는 카페", "A café with a sea view"), description: tx("창밖을 보며 오래 쉬고 싶어요", "Rest long by the window"), ai: "sea-view café" },
          { id: "view", title: tx("해안 풍경 찾아가기", "Coastal viewpoints"), description: tx("다른 높이와 각도에서 바다를 볼래요", "The sea from other heights and angles"), ai: "coastal viewpoints" },
        ] },
      { id: "food", title: tx("시장과 먹거리", "Markets & local food"), description: tx("부산다운 한 끼를 찾아서", "Looking for a very Busan meal"),
        question: tx("부산에서 어떤 맛이 끌리세요?", "Which Busan flavours call you?"), scenes: [
          { id: "market", title: tx("시장 간식 하나씩", "Market snacks one by one"), description: tx("활기찬 시장을 구경하며 맛볼래요", "Taste your way through a busy market"), ai: "market snacks" },
          { id: "local", title: tx("든든한 지역 음식", "Hearty local dishes"), description: tx("부산에서 자주 먹는 한 끼가 궁금해요", "What people in Busan actually eat"), ai: "hearty local dishes" },
          { id: "seafood", title: tx("바다 가까이 해산물", "Seafood by the sea"), description: tx("해산물을 중심으로 맛보고 싶어요", "Mostly seafood"), ai: "seafood" },
        ] },
      { id: "neighbourhood", title: tx("언덕과 골목", "Hills & alleys"), description: tx("오르내릴수록 달라지는 풍경", "Views that change as you climb"),
        question: tx("부산의 동네, 무엇을 발견하고 싶어요?", "What do you want to find in Busan's neighbourhoods?"), scenes: [
          { id: "colour", title: tx("색이 있는 골목", "Colourful alleys"), description: tx("골목의 표정과 색을 사진에 담을래요", "Faces and colours of the alleys in photos"), ai: "colourful hillside alleys" },
          { id: "port", title: tx("항구가 보이는 동네", "Harbour-view streets"), description: tx("바다와 일상이 만나는 곳이 좋아요", "Where the sea meets daily life"), ai: "harbour neighbourhoods" },
          { id: "shops", title: tx("작은 가게 둘러보기", "Small shops"), description: tx("책방과 소품 가게를 발견하고 싶어요", "Bookshops and little stores"), ai: "small shops and bookshops" },
        ] },
      { id: "night", title: tx("야경과 도시", "Night & the city"), description: tx("해가 진 뒤 만나는 또 다른 부산", "Another Busan after dark"),
        question: tx("부산의 밤은 어떤 분위기가 좋을까요?", "What kind of Busan night?"), scenes: [
          { id: "bridge", title: tx("바다 건너 반짝이는 불빛", "Lights across the water"), description: tx("물가에서 도시의 빛을 바라볼래요", "City lights from the waterfront"), ai: "bridge lights at night" },
          { id: "lively", title: tx("활기찬 저녁 거리", "Lively evening streets"), description: tx("가게와 사람이 많은 곳을 걸을래요", "Shops and crowds"), ai: "lively evening streets" },
          { id: "quiet", title: tx("차분한 밤 산책", "A calm night walk"), description: tx("복잡하지 않은 길에서 하루를 마칠래요", "End the day somewhere quiet"), ai: "calm night walk" },
        ] },
    ],
  },
  Jeju: {
    tagline: tx("바람과 숲이 하루의 속도를 정하는 곳", "Where wind and forest set the pace"),
    experiences: [
      { id: "coast", title: tx("바다와 해안", "Sea & coast"), description: tx("물빛을 따라 섬을 만나는 시간", "Meet the island by the colour of its water"),
        question: tx("제주의 바다에서는 무엇을 하고 싶어요?", "What do you want to do by Jeju's sea?"), scenes: [
          { id: "sand", title: tx("모래사장에서 쉬기", "Rest on the sand"), description: tx("파도를 보며 아무것도 안 하고 싶어요", "Watch the waves and do nothing"), ai: "beach rest" },
          { id: "walk", title: tx("해안 길 따라 걷기", "Walk the coastal path"), description: tx("바람을 맞으며 풍경을 바꿔볼래요", "Let the wind change the view"), ai: "coastal path walk" },
          { id: "photo", title: tx("마음에 드는 물빛 찾기", "Find your favourite water colour"), description: tx("사진으로 남길 바다를 찾고 싶어요", "A sea worth a photo"), ai: "photogenic coast" },
        ] },
      { id: "nature", title: tx("숲과 오름", "Forests & oreum"), description: tx("초록 사이에서 깊게 숨 쉬기", "Breathe deep among the green"),
        question: tx("제주의 자연, 어느 쪽이 끌리세요?", "Which side of Jeju's nature?"), scenes: [
          { id: "forest", title: tx("그늘진 숲길", "Shady forest trails"), description: tx("나무 사이를 편안하게 걸을래요", "An easy walk between trees"), ai: "forest trails" },
          { id: "oreum", title: tx("오름 위 탁 트인 풍경", "Open views from an oreum"), description: tx("조금 걸어 올라가 넓게 바라볼래요", "A short climb to a wide view"), ai: "oreum hike" },
          { id: "garden", title: tx("가볍게 즐기는 정원", "An easy garden"), description: tx("멀리 걷지 않고 초록을 만나고 싶어요", "Green without the long walk"), ai: "gardens" },
        ] },
      { id: "rest", title: tx("카페와 쉼", "Cafés & rest"), description: tx("비워둔 시간이 더 좋은 여행", "A trip that's better with empty time"),
        question: tx("제주에서 쉬는 시간을 그려볼까요?", "Picture your downtime in Jeju"), scenes: [
          { id: "view", title: tx("풍경이 좋은 창가", "A window with a view"), description: tx("좋아하는 음료와 오래 머물래요", "Stay long with a favourite drink"), ai: "view cafés" },
          { id: "village", title: tx("작은 마을 느리게 걷기", "Slow walks in small villages"), description: tx("돌담과 조용한 길이 좋아요", "Stone walls and quiet lanes"), ai: "village walks" },
          { id: "stay", title: tx("숙소 주변에서 느긋하게", "Taking it easy near the stay"), description: tx("이동을 줄이고 여유를 늘릴래요", "Less moving, more resting"), ai: "slow days near the stay" },
        ] },
      { id: "food", title: tx("시장과 먹거리", "Markets & food"), description: tx("섬의 맛을 하나씩 발견하기", "Find the island's flavours one by one"),
        question: tx("제주에서는 어떤 식탁이 좋을까요?", "What kind of table in Jeju?"), scenes: [
          { id: "market", title: tx("시장에서 여러 가지", "A bit of everything at a market"), description: tx("조금씩 맛보는 재미를 느낄래요", "The fun of small tastes"), ai: "market food" },
          { id: "local", title: tx("제주다운 지역 음식", "Jeju's own dishes"), description: tx("이곳에서 즐기는 한 끼가 궁금해요", "A meal you only get here"), ai: "local Jeju dishes" },
          { id: "dessert", title: tx("차와 달콤한 간식", "Tea and something sweet"), description: tx("식사 사이의 작은 즐거움을 찾을래요", "Small treats between meals"), ai: "tea and desserts" },
        ] },
    ],
  },
  Gyeongju: {
    tagline: tx("천년의 풍경을 오늘의 걸음으로", "A thousand-year-old view, at today's pace"),
    postcard: "/mohallae/card-gyeongju.jpg",
    experiences: [
      { id: "heritage", title: tx("신라와 유적", "Silla history & sites"), description: tx("풍경 속에서 만나는 오래된 이야기", "Old stories in the landscape"),
        question: tx("경주의 옛 이야기를 어떻게 만날까요?", "How do you want to meet Gyeongju's past?"), scenes: [
          { id: "walk", title: tx("유적 사이를 산책", "A walk among the ruins"), description: tx("야외 풍경을 보며 천천히 걸을래요", "Slowly, outdoors"), ai: "walks among historic sites" },
          { id: "temple", title: tx("사찰의 고요함", "The calm of a temple"), description: tx("건축과 주변 자연을 함께 보고 싶어요", "Architecture and the nature around it"), ai: "temples" },
          { id: "museum", title: tx("박물관에서 자세히", "The museum, in detail"), description: tx("유물에 담긴 이야기를 알아보고 싶어요", "The stories behind the artefacts"), ai: "museum" },
        ] },
      { id: "neighbourhood", title: tx("골목과 한옥", "Alleys & hanok"), description: tx("익숙한 듯 새로운 동네 산책", "A walk that's familiar and new"),
        question: tx("경주의 골목에서 마음이 가는 곳은요?", "Which Gyeongju lanes pull you in?"), scenes: [
          { id: "cafe", title: tx("한옥 카페에서 쉬기", "Rest in a hanok café"), description: tx("차 한 잔과 처마 아래 시간을 보낼래요", "Tea under the eaves"), ai: "hanok cafés" },
          { id: "shops", title: tx("작은 가게 구경하기", "Browse small shops"), description: tx("소품과 간식을 하나씩 발견할래요", "Little things and snacks"), ai: "small shops" },
          { id: "quiet", title: tx("조용한 골목 걷기", "Walk quiet lanes"), description: tx("사람이 적은 길을 느리게 걸을래요", "Slow, on emptier streets"), ai: "quiet lanes" },
        ] },
      { id: "night", title: tx("야경과 산책", "Night views & walks"), description: tx("밤이 되면 새로 보이는 경주", "Gyeongju, new again at night"),
        question: tx("경주의 저녁은 어떻게 기억하고 싶어요?", "How do you want to remember Gyeongju's evenings?"), scenes: [
          { id: "reflection", title: tx("물에 비친 불빛", "Lights on the water"), description: tx("고요한 야경을 오래 바라볼래요", "A long look at a quiet night view"), ai: "lights reflected on water" },
          { id: "walk", title: tx("불빛 따라 가볍게 걷기", "An easy walk by the lights"), description: tx("저녁 공기를 느끼며 하루를 마칠래요", "End the day in the evening air"), ai: "evening walk" },
          { id: "photo", title: tx("밤 풍경 한 장 남기기", "One night photo to keep"), description: tx("여행을 기억할 사진을 찍고 싶어요", "A photo to remember the trip by"), ai: "night photos" },
        ] },
      { id: "rest", title: tx("자연과 여유", "Nature & slow time"), description: tx("역사 구경 사이에 잠깐의 쉼", "A pause between the history"),
        question: tx("경주에서 한숨 돌린다면 어디가 좋을까요?", "Where would you catch your breath in Gyeongju?"), scenes: [
          { id: "green", title: tx("초록이 넓게 펼쳐진 곳", "Wide open green"), description: tx("시야가 트이는 풍경이 좋아요", "A view that opens up"), ai: "open green spaces" },
          { id: "water", title: tx("물가를 따라 걷는 길", "A path by the water"), description: tx("가볍게 걸으며 생각을 비울래요", "An easy walk to clear the head"), ai: "walks by the water" },
          { id: "cafe", title: tx("경치 좋은 카페", "A café with a view"), description: tx("많이 걷기보다 앉아서 즐길래요", "Sit and enjoy rather than walk"), ai: "view cafés" },
        ] },
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
export type Step = Simple | `do:${string}` | `scene:${string}:${string}`;

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
  return MULTI_SIMPLE.includes(step) || step.startsWith("do:") || step.startsWith("scene:");
}

/** 고른 도시 + 직접 적은 곳 (값은 영어 이름, 직접 적은 곳은 적은 그대로) */
export function pickedPlaces(answers: Answers): string[] {
  const typed = (answers["where:other"]?.[0] ?? "").trim();
  return [...new Set([...(answers.where ?? []), ...(typed ? [typed] : [])])];
}

export function stepOrder(answers: Answers): Step[] {
  const steps: Step[] = ["where"];
  const places = pickedPlaces(answers);
  for (const place of places) {
    const city = CURATED[place];
    if (!city) continue;
    steps.push(`do:${place}`);
    for (const exp of city.experiences) {
      if (answers[`do:${place}`]?.includes(exp.id)) steps.push(`scene:${place}:${exp.id}`);
    }
  }
  // 장면 질문이 없는 곳이 하나라도 있으면 관심사를 한 번 묻는다
  if (places.some((p) => !CURATED[p])) steps.push("interests");
  steps.push("who");
  if (answers.who?.[0] === "family") steps.push("kids");
  return [...steps, "pace", "dates", "travelers", "budget", ...OPTIONAL, "review"];
}

/** 이 단계의 보기 */
export function choicesFor(step: Step): Choice[] {
  if (step.startsWith("do:")) {
    const city = CURATED[step.slice(3)];
    return (city?.experiences ?? []).map((e) => ({ id: e.id, title: e.title, description: e.description, value: e.id, image: e.image }));
  }
  if (step.startsWith("scene:")) {
    const [, place, expId] = step.split(":");
    const exp = CURATED[place]?.experiences.find((e) => e.id === expId);
    return (exp?.scenes ?? []).map((s) => ({ id: s.id, title: s.title, description: s.description, value: s.ai }));
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
  // 장면은 "Seoul: palace walks" 처럼 도시를 붙여 보낸다. 관심사는 지금 폼과 같은 값
  const scenes = (Object.keys(answers) as Step[])
    .filter((k) => k.startsWith("scene:"))
    .flatMap((k) => many(k, answers).map((ai) => `${k.split(":")[1]}: ${ai}`.slice(0, 40)));
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
    // 서버는 13개까지만 받는다 (lib/validate.ts). 장면이 먼저 — 고른 장면이 이 여행의 뼈대다
    styles: [...scenes, ...many("interests", answers), ...(interestOther ? [interestOther] : [])].slice(0, 13),
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
