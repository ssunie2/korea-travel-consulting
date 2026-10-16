/**
 * 새 입력 흐름(/mohallae/plan)의 질문 순서와 답 정리 — 화면 없이 돌아가는 부분만.
 *
 * 2026-10-13 질문을 새로 짰다. 써니가 후보 300개(첫 질문 "러프하게? 디테일하게?" 아래로 이어지는 것)에서
 * ★★★ 41개만 골라 "일단 만들어서 줘, 확인해 볼게". 뮤조와 정한 방향: 손님 중심, 짧게, "딱 내가 원하는 스타일대로".
 * - 첫 질문은 "이번 여행 계획, 어떻게 짜고 싶으세요?" — 러프하게 / 디테일하게. 고른 쪽에 따라 뒤 질문이 달라진다
 * - 러프는 초안에 꼭 필요한 것만 10가지 안팎 (써니 2026-10-15: "러프하게인데 17가지나 더 물어보는 건 너무 많아"):
 *   동네 → 하고 싶은 것 → 날짜 → 도착·출발 시간 → 누구와(아이 나이·인원) → 서울 처음인지 → 예산 → 맞춰야 할 것 → 하루 몇 곳
 *   남긴 기준: 날짜·인원은 서버가 꼭 받아야 하고, 나머지는 빠지면 초안이 틀리거나(첫날·마지막 날, 식단) 손님과 안 맞는 것들이다.
 *   이어서 묻는 건 고른 답에 따라서만 — 동네를 모르면 취향, 아이와 함께면 나이, 알레르기면 무엇인지, 셋 이상이면 인원
 * - 디테일은 거기에 1순위·꼭 갈 곳·먹는 것·숙소·뺄 것·하루 시간·이동·공항·한복·살 것을 더 묻는다
 * - 도시는 서울만 연다. '어디로'는 서울 안의 동네를 묻는다 (써니: "서울도 넓고 할 거 구경할 거 먹을 거 많으니까")
 * - 한 화면에 질문 하나. 줄이 둘인 질문(도착·출발 시간 등)은 줄마다 하나씩 고르면 넘어간다
 * - 고른 것을 풀면 **그 아래 답만** 지운다 (디테일 → 러프로 바꾸면 디테일 질문의 답만 지운다)
 * - 이전 화면의 늦은 클릭이 두 칸을 건너뛰지 않게 막는다 (next 의 from)
 *
 * 보내는 값은 지금 /api/plan 이 받는 모양 그대로다 (lib/validate.ts 의 한도 안). 새로 묻는 것 중 받을 칸이 없는 것
 * (러프·디테일, 1순위, 동네, 도착·출발 시간 …)은 styles 에 짧은 영어 문장으로 넣는다.
 * 칸을 새로 만들고 AI 지시문이 제대로 쓰게 하는 건 공용 파일(lib/) PR 에서 — 뮤조 리뷰를 받는다.
 *
 * 화면에 나가는 글은 한국어·영어를 나란히 둔다 (app/mohallae/content.ts 와 같은 방식).
 * AI 에게 가는 값(value)은 늘 영어다. 이 파일은 다른 파일을 불러오지 않는다 (node --test 로 바로 돌리려고).
 * 규칙 3장(법적 경계): 대신 예약하거나 안내한다는 말을 쓰지 않는다. 초안은 프로그램이 쓰는 정보 문서다.
 */

export type Lang = "ko" | "en";
export type Text = { ko: string; en: string };

/** 고를 수 있는 보기 하나. value 는 AI·DB 로 가는 영어 글자 */
export type Choice = { id: string; title: Text; description?: Text; value: string; image?: string };

/**
 * 도시별 '하고 싶은 것' 사진 카드. ai 는 "Seoul: palaces & hanok" 처럼 도시 이름을 붙여 보내던 값 (서버 한도 40자 안).
 * 2026-10-13 새 질문(서울 안의 동네·관심사)으로 바꾸면서 흐름에서는 쓰지 않는다 — 다른 도시를 다시 열 때 쓰려고 둔다
 */
type Experience = { id: string; title: Text; description: Text; image: string; ai: string };
/** photos: 오른쪽 판 엽서 자리에서 번갈아 보여 줄 사진 (148×100) */
type Curated = { photos: string[]; experiences: Experience[] };

const tx = (ko: string, en: string): Text => ({ ko, en });

/** 사진 카드 (2:1) 와 엽서 (148×100). 힉스필드로 만든 원본은 .impeccable/plates/places 에 있다 (써니 맥) */
const card = (id: string) => `/mohallae/do/${id}.webp`;
const postcard = (id: string) => `/mohallae/postcards/${id}.jpg`;

/**
 * 서울 동네 장면 — 동네 질문(AREAS)의 12곳마다 한 장, 모두 다른 장소다 (써니 2026-10-14: "같은 장면을 부분만 다르게 컷한 것
 * 말고 아예 다른 장소의 장면들을 하나씩"). 남산타워는 남산 한 장에만 나온다. 원본은 .impeccable/plates/seoul (써니 맥)
 */
const SEOUL_SCENES = ["gwanghwamun", "bukchon", "myeongdong", "dongdaemun", "euljiro", "hongdae", "seongsu", "itaewon", "yongsan", "yeouido", "gangnam", "jamsil"];
const seoulScene = (area: string) => postcard(`seoul-${area}`);

/**
 * 도시별 '하고 싶은 것' — lib/places.ts 의 15개 도시 모두. 열쇠는 lib/places.ts 의 값(v)과 같은 영어 이름이다.
 * 서울·부산·제주·경주의 글은 베타 그대로(영어는 새로 옮김), 나머지 11곳은 새로 썼다.
 *
 * 사진은 모두 '평범한 폰 사진, 맑은 날' 느낌으로 맞췄다 (써니가 고른 강릉 안목 카페거리 판이 기준, 2026-10-12).
 * 엽서는 그 도시의 사진 카드와 다른 장면만 — 같은 장면이 옆에 또 보이면 의미가 없다 (써니 2026-10-12).
 * 가게·식당 이름은 쓰지 않는다 — 우리는 정보만 준다 (AGENTS.md 3장)
 */
export const CURATED: Record<string, Curated> = {
  Seoul: {
    // 서울 엽서: 동네 12곳의 장면을 차례로 (동네를 고르면 고른 곳만 — postcardPhotos)
    photos: SEOUL_SCENES.map(seoulScene),
    experiences: [
      { id: "heritage", title: tx("궁궐과 한옥", "Palaces & hanok"), description: tx("시간이 천천히 흐르는 서울", "Where time slows down"), image: "/landing/gyeongbokgung.webp", ai: "palaces & hanok" },
      { id: "neighbourhood", title: tx("골목과 카페", "Alleys & cafés"), description: tx("발길 닿는 대로 발견하는 취향", "Find your own corners"), image: "/landing/bukchon.webp", ai: "alleys & cafes" },
      { id: "food", title: tx("시장과 먹거리", "Markets & street food"), description: tx("맛있는 냄새를 따라가는 하루", "Follow the smell"), image: "/landing/gwangjang-market.webp", ai: "markets & street food" },
      { id: "outdoors", title: tx("한강과 야경", "Han River & night views"), description: tx("도시 속에서 숨을 고르는 시간", "Catch your breath in the city"), image: "/landing/han-river.webp", ai: "Han River & night views" },
    ],
  },
  Busan: {
    // 바다 카드는 해운대가 아니라 송정 — 엽서(해운대)와 겹치지 않게
    photos: ["/mohallae/postcard-busan.jpg", postcard("busan-huinnyeoul")],
    experiences: [
      { id: "coast", title: tx("바다와 해변", "Sea & beaches"), description: tx("파도 소리로 채우는 하루", "A day filled with the sound of waves"), image: card("busan-coast"), ai: "beaches & sea views" },
      { id: "food", title: tx("시장과 먹거리", "Markets & local food"), description: tx("부산다운 한 끼를 찾아서", "Looking for a very Busan meal"), image: card("busan-food"), ai: "markets & seafood" },
      { id: "neighbourhood", title: tx("언덕과 골목", "Hills & alleys"), description: tx("오르내릴수록 달라지는 풍경", "Views that change as you climb"), image: card("busan-neighbourhood"), ai: "hillside alleys & villages" },
      { id: "night", title: tx("야경과 도시", "Night & the city"), description: tx("해가 진 뒤 만나는 또 다른 부산", "Another Busan after dark"), image: card("busan-night"), ai: "night views & bridges" },
    ],
  },
  Jeju: {
    photos: [postcard("jeju-seongsan"), postcard("jeju-oreum")],
    experiences: [
      { id: "coast", title: tx("바다와 해안", "Sea & coast"), description: tx("물빛을 따라 섬을 만나는 시간", "Meet the island by the colour of its water"), image: card("jeju-coast"), ai: "beaches & coastal walks" },
      { id: "nature", title: tx("숲과 오름", "Forests & oreum"), description: tx("초록 사이에서 깊게 숨 쉬기", "Breathe deep among the green"), image: card("jeju-nature"), ai: "forests & oreum" },
      { id: "rest", title: tx("카페와 쉼", "Cafés & rest"), description: tx("비워둔 시간이 더 좋은 여행", "A trip that's better with empty time"), image: card("jeju-rest"), ai: "cafes & slow village time" },
      { id: "food", title: tx("시장과 먹거리", "Markets & food"), description: tx("섬의 맛을 하나씩 발견하기", "Find the island's flavours one by one"), image: card("jeju-food"), ai: "markets & local food" },
    ],
  },
  Gyeongju: {
    photos: ["/mohallae/postcard-gyeongju.jpg", postcard("gyeongju-bulguksa")],
    experiences: [
      { id: "heritage", title: tx("신라와 유적", "Silla history & sites"), description: tx("풍경 속에서 만나는 오래된 이야기", "Old stories in the landscape"), image: card("gyeongju-heritage"), ai: "Silla tombs & temples" },
      { id: "neighbourhood", title: tx("골목과 한옥", "Alleys & hanok"), description: tx("익숙한 듯 새로운 동네 산책", "A walk that's familiar and new"), image: card("gyeongju-neighbourhood"), ai: "hanok alleys & cafes" },
      { id: "night", title: tx("야경과 산책", "Night views & walks"), description: tx("밤이 되면 새로 보이는 경주", "Gyeongju, new again at night"), image: card("gyeongju-night"), ai: "night views by the water" },
      { id: "rest", title: tx("자연과 여유", "Nature & slow time"), description: tx("역사 구경 사이에 잠깐의 쉼", "A pause between the history"), image: card("gyeongju-rest"), ai: "lakes & green walks" },
    ],
  },
  Gangneung: {
    photos: [postcard("gangneung-jeongdongjin"), postcard("gangneung-jumunjin")],
    experiences: [
      // 카페 카드가 이번 사진들의 기준이 된 판이다 (써니 2026-10-12 "그냥 내가 최근에 보낸 장면으로 하자")
      { id: "cafe", title: tx("커피거리와 바다", "Coffee by the sea"), description: tx("안목 해변 카페에서 보내는 느린 오후", "A slow afternoon in Anmok's seaside cafés"), image: card("gangneung-cafe"), ai: "Anmok coffee street" },
      { id: "beach", title: tx("바다와 솔숲", "Sea & pine woods"), description: tx("경포 해변을 따라 걷는 하루", "A day along Gyeongpo Beach"), image: card("gangneung-gyeongpo"), ai: "Gyeongpo beach & pine walks" },
      { id: "tofu", title: tx("초당 순두부", "Chodang soft tofu"), description: tx("바닷물로 굳힌 강릉의 두부 한 그릇", "Gangneung's tofu, set with seawater"), image: card("gangneung-tofu"), ai: "Chodang soft tofu" },
      { id: "heritage", title: tx("오죽헌과 옛집", "Ojukheon & old houses"), description: tx("검은 대나무 숲 곁의 조선 집", "A Joseon house by the black bamboo"), image: card("gangneung-ojukheon"), ai: "Ojukheon & old hanok" },
    ],
  },
  Sokcho: {
    photos: [postcard("sokcho-cheongchoho"), postcard("sokcho-daepo")],
    experiences: [
      { id: "mountain", title: tx("설악산 케이블카", "Seoraksan cable car"), description: tx("바위 봉우리 가까이 올라가 보기", "Ride up close to the granite peaks"), image: card("sokcho-seorak"), ai: "Seoraksan & cable car" },
      { id: "market", title: tx("시장 먹거리", "Market snacks"), description: tx("닭강정과 오징어순대로 채우는 한 끼", "Crispy fried chicken and squid sundae"), image: card("sokcho-market"), ai: "Jungang Market street food" },
      { id: "ferry", title: tx("아바이마을 갯배", "Abai Village ferry"), description: tx("줄을 당겨 건너는 작은 배", "A tiny ferry pulled across by rope"), image: card("sokcho-ferry"), ai: "Abai Village & hand ferry" },
      { id: "coast", title: tx("바닷가 정자와 등대", "Seaside pavilion & lighthouse"), description: tx("파도 소리 들리는 영금정과 등대 전망대", "Yeonggeumjeong and the lighthouse lookout"), image: card("sokcho-lighthouse"), ai: "Yeonggeumjeong & lighthouse" },
    ],
  },
  Incheon: {
    photos: [postcard("incheon-bridge"), postcard("incheon-eurwangni")],
    experiences: [
      { id: "oldport", title: tx("차이나타운과 개항장", "Chinatown & old port"), description: tx("백 년 전 항구 도시를 걷는 산책", "Walk a century-old port town"), image: card("incheon-chinatown"), ai: "Chinatown & old port streets" },
      { id: "seaside", title: tx("월미도 바닷길", "Wolmido seaside"), description: tx("배와 놀이기구가 보이는 바닷가 산책", "A seaside stroll past ships and rides"), image: card("incheon-wolmido"), ai: "Wolmido seaside promenade" },
      { id: "songdo", title: tx("송도 센트럴파크", "Songdo Central Park"), description: tx("수로를 따라 걷는 빌딩 숲의 저녁", "An evening by the canal among the towers"), image: card("incheon-songdo"), ai: "Songdo Central Park at dusk" },
      { id: "market", title: tx("신포시장 먹거리", "Sinpo Market snacks"), description: tx("닭강정과 만두로 채우는 시장 나들이", "Crispy fried chicken and dumplings"), image: card("incheon-sinpo"), ai: "Sinpo Market street food" },
    ],
  },
  Chuncheon: {
    photos: [postcard("chuncheon-uiamho"), postcard("chuncheon-soyangho")],
    experiences: [
      { id: "dakgalbi", title: tx("닭갈비 한 판", "Dakgalbi on the pan"), description: tx("춘천에 왔다면 꼭 먹는 철판 요리", "The dish people come to Chuncheon for"), image: card("chuncheon-dakgalbi"), ai: "dakgalbi & local food" },
      { id: "island", title: tx("남이섬 나무길", "Nami Island tree lanes"), description: tx("키 큰 나무 사이를 걷거나 자전거로", "Tall tree lanes on foot or by bike"), image: card("chuncheon-nami"), ai: "Nami Island tree lanes" },
      { id: "skywalk", title: tx("소양강 스카이워크", "Soyang River skywalk"), description: tx("강 위로 걸어 나가는 유리 다리", "A glass walkway out over the river"), image: card("chuncheon-skywalk"), ai: "Soyang River skywalk" },
      { id: "railbike", title: tx("레일바이크", "Rail bike"), description: tx("옛 기찻길을 페달 밟아 달리기", "Pedal along an old railway line"), image: card("chuncheon-railbike"), ai: "rail bike on old tracks" },
    ],
  },
  Andong: {
    photos: [postcard("andong-andongho"), postcard("andong-bongjeongsa")],
    experiences: [
      { id: "village", title: tx("하회마을", "Hahoe Folk Village"), description: tx("강이 휘감아 도는 옛 마을", "An old village in a bend of the river"), image: card("andong-hahoe"), ai: "Hahoe Folk Village" },
      { id: "jjimdak", title: tx("안동찜닭", "Andong jjimdak"), description: tx("구시장 골목의 간장 찜닭 한 접시", "Soy-braised chicken in the old market"), image: card("andong-jjimdak"), ai: "jjimdak in the old market" },
      { id: "night", title: tx("월영교 밤 산책", "Woryeonggyo at night"), description: tx("불 켜진 나무다리를 건너는 저녁", "Cross the lit wooden bridge at dusk"), image: card("andong-woryeonggyo"), ai: "Woryeonggyo bridge at night" },
      { id: "seowon", title: tx("병산서원", "Byeongsan Seowon"), description: tx("강과 절벽을 마주한 옛 서원의 마루", "An old academy facing river and cliffs"), image: card("andong-byeongsan"), ai: "Byeongsan Seowon academy" },
    ],
  },
  Pohang: {
    photos: [postcard("pohang-guryongpo"), postcard("pohang-igari")],
    experiences: [
      { id: "sunrise", title: tx("호미곶 해돋이", "Sunrise at Homigot"), description: tx("바다 위 손 조각 너머로 뜨는 해", "The sun rising past the hand in the sea"), image: card("pohang-homigot"), ai: "Homigot sunrise" },
      { id: "mulhoe", title: tx("죽도시장 물회", "Mulhoe at Jukdo Market"), description: tx("살얼음 육수에 말아 먹는 회 한 그릇", "Raw fish in an icy, spicy broth"), image: card("pohang-mulhoe"), ai: "mulhoe at Jukdo Market" },
      { id: "spacewalk", title: tx("스페이스워크", "Space Walk"), description: tx("걸어서 오르는 롤러코스터 모양 전망대", "A roller-coaster-shaped walkway you climb"), image: card("pohang-spacewalk"), ai: "Space Walk lookout" },
      { id: "beach", title: tx("영일대 해변", "Yeongildae Beach"), description: tx("바다 위 정자가 있는 도심 해변", "A city beach with a pavilion over the sea"), image: card("pohang-yeongildae"), ai: "Yeongildae beach & pavilion" },
    ],
  },
  Daegu: {
    photos: [postcard("daegu-suseongmot"), postcard("daegu-dongseongno")],
    experiences: [
      { id: "alleys", title: tx("근대골목", "Modern history alleys"), description: tx("붉은 벽돌과 담쟁이 사이 옛 골목", "Old lanes of red brick and ivy"), image: card("daegu-alleys"), ai: "modern history alleys" },
      { id: "nightmarket", title: tx("서문시장 야시장", "Seomun Night Market"), description: tx("불 밝힌 노점에서 골라 먹는 밤", "Pick your snacks under the stall lights"), image: card("daegu-seomun"), ai: "Seomun Night Market" },
      { id: "view", title: tx("앞산 전망대 야경", "Apsan night view"), description: tx("도시 불빛이 산자락까지 이어지는 밤", "City lights all the way to the hills"), image: card("daegu-apsan"), ai: "Apsan Observatory night view" },
      { id: "mountain", title: tx("팔공산과 산사", "Palgongsan & temples"), description: tx("산자락의 오래된 절까지 걷는 길", "A walk up to an old mountain temple"), image: card("daegu-palgongsan"), ai: "Palgongsan & mountain temples" },
    ],
  },
  Tongyeong: {
    photos: [postcard("tongyeong-harbor"), postcard("tongyeong-park")],
    experiences: [
      { id: "murals", title: tx("동피랑 벽화마을", "Dongpirang murals"), description: tx("벽화 골목 끝에 보이는 항구", "Mural alleys that end at the harbour"), image: card("tongyeong-dongpirang"), ai: "Dongpirang mural village" },
      { id: "cablecar", title: tx("케이블카와 섬 풍경", "Cable car & islands"), description: tx("작은 섬들이 흩어진 바다 내려다보기", "Look down on a sea full of small islands"), image: card("tongyeong-cablecar"), ai: "cable car & island views" },
      { id: "market", title: tx("충무김밥과 시장", "Chungmu gimbap & market"), description: tx("충무김밥과 꿀빵으로 채우는 한 끼", "Chungmu gimbap and honey bread"), image: card("tongyeong-market"), ai: "chungmu gimbap & market food" },
      { id: "island", title: tx("섬 나들이", "Island day trip"), description: tx("배 타고 가는 소매물도 등대섬", "By boat to Somaemuldo's lighthouse"), image: card("tongyeong-island"), ai: "island trip to Somaemuldo" },
    ],
  },
  Jeonju: {
    photos: [postcard("jeonju-deokjin"), postcard("jeonju-stream")],
    experiences: [
      { id: "hanok", title: tx("한옥마을", "Hanok Village"), description: tx("기와지붕 사이로 걷는 골목", "Lanes between tiled roofs"), image: card("jeonju-hanok"), ai: "Hanok Village lanes" },
      { id: "food", title: tx("비빔밥과 콩나물국밥", "Bibimbap & bean sprout soup"), description: tx("전주에서 먹는 전주의 한 끼", "Jeonju's own dishes, in Jeonju"), image: card("jeonju-bibimbap"), ai: "bibimbap & kongnamul gukbap" },
      { id: "nightmarket", title: tx("남부시장 야시장", "Nambu night market"), description: tx("밤이면 불이 켜지는 시장 골목", "Market lanes that light up after dark"), image: card("jeonju-nambu"), ai: "Nambu night market" },
      { id: "cathedral", title: tx("전동성당과 옛 성문", "Jeondong Cathedral"), description: tx("붉은 벽돌 성당과 오래된 성문", "A red-brick cathedral by an old city gate"), image: card("jeonju-cathedral"), ai: "Jeondong Cathedral & old gate" },
    ],
  },
  Yeosu: {
    photos: [postcard("yeosu-hyangiram"), postcard("yeosu-expo")],
    experiences: [
      { id: "night", title: tx("밤바다와 포차", "Night sea & tent bars"), description: tx("불빛 비치는 바다 앞 포장마차", "Tent bars glowing by the night sea"), image: card("yeosu-night"), ai: "night sea & tent pubs" },
      { id: "cablecar", title: tx("해상 케이블카", "Sea cable car"), description: tx("바다 위를 건너 돌산까지", "Over the water to Dolsan Island"), image: card("yeosu-cablecar"), ai: "maritime cable car" },
      { id: "island", title: tx("오동도 동백숲", "Odongdo camellias"), description: tx("동백나무 숲길 사이로 보이는 바다", "Sea glimpses through a camellia forest"), image: card("yeosu-odongdo"), ai: "Odongdo camellia forest walk" },
      { id: "gejang", title: tx("게장 한 상", "Marinated crab"), description: tx("간장게장과 양념게장에 밥 한 공기", "Soy and spicy marinated crab with rice"), image: card("yeosu-gejang"), ai: "gejang (marinated crab)" },
    ],
  },
  Mokpo: {
    photos: [postcard("mokpo-gatbawi"), postcard("mokpo-bridge")],
    experiences: [
      { id: "cablecar", title: tx("유달산과 케이블카", "Yudalsan & cable car"), description: tx("바위산을 넘어 바다 건너 섬까지", "Over the rocky hill and out across the sea"), image: card("mokpo-cablecar"), ai: "Yudalsan & marine cable car" },
      { id: "modern", title: tx("근대역사거리", "Modern history streets"), description: tx("백 년 전 건물이 남은 옛 항구 거리", "Old port streets with century-old buildings"), image: card("mokpo-modern"), ai: "modern history streets" },
      { id: "seafood", title: tx("남도 바다 한 상", "Mokpo seafood"), description: tx("민어회와 낙지로 차린 한 상", "Croaker sashimi, octopus and more"), image: card("mokpo-seafood"), ai: "seafood: croaker & octopus" },
      { id: "fountain", title: tx("바다 분수 쇼", "Sea fountain show"), description: tx("밤바다 위에서 춤추는 분수", "Fountains dancing over the night sea"), image: card("mokpo-fountain"), ai: "dancing sea fountain at night" },
    ],
  },
};

/**
 * 지금 열어 둔 도시 — 일단 서울만 (써니 2026-10-13).
 * 위의 CURATED(15개 도시의 사진 카드·엽서)는 그대로 두었다 — 다시 열 때 쓴다. 지금 흐름은 서울 엽서 사진만 쓴다.
 */
export const OPEN_PLACES: string[] = ["Seoul"];

/**
 * 오른쪽 판 엽서에서 번갈아 보여 줄 사진. 도시를 여럿 고르면 도시마다 한 장씩 번갈아
 * (서울1 → 부산1 → 서울2 → 부산2 …) — 한 도시 사진만 이어지지 않게. 사진이 없는 곳(직접 적은 곳)은 건너뛴다.
 * 아무 데도 없으면 지금 열어 둔 도시(OPEN_PLACES)의 사진 — 빈 엽서는 어색하다 (써니 2026-10-12)
 */
/**
 * 오른쪽 판 엽서 — 고른 동네의 장면만, 고른 순서대로 번갈아. 아직 안 골랐거나 '잘 모르겠어요'·직접 적은 곳뿐이면
 * 서울 12곳을 차례로 (써니 2026-10-14)
 */
export function postcardPhotos(a: Answers): string[] {
  const picked = (a.area ?? []).map((id) => AREAS.find((c) => c.id === id)?.image).filter((x): x is string => !!x);
  return picked.length ? picked : panelPhotos(OPEN_PLACES);
}

export function panelPhotos(places: string[]): string[] {
  if (!places.length) return OPEN_PLACES.length ? panelPhotos(OPEN_PLACES) : [];
  const lists = places.map((p) => CURATED[p]?.photos ?? []);
  const out: string[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) {
    for (const l of lists) if (i < l.length && !out.includes(l[i])) out.push(l[i]);
  }
  return out;
}

/* ── 보기 ──────────────────────────────────────────────────────────── */

const choice = (id: string, value: string, ko: string, en: string, dko?: string, den?: string): Choice => ({
  id, value, title: tx(ko, en), ...(dko && den ? { description: tx(dko, den) } : {}),
});

/** 첫 질문. 러프는 초안에 꼭 필요한 것만, 디테일은 1순위·꼭 갈 곳·먹는 것·숙소·뺄 것·하루 시간·이동·공항·한복·살 것을 더 묻는다 */
export const MODES: Choice[] = [
  choice("rough", "rough", "러프하게", "Keep it rough", "큰 틀만 — 하루 주제와 꼭 갈 곳", "The big picture — a theme and key spots each day"),
  choice("detail", "detailed", "디테일하게", "Go into detail", "시간 단위까지 — 이동·식사·예약할 곳까지", "Down to the hour — routes, meals, what to book"),
];

/**
 * 서울 안의 동네 12곳. value 는 AI 로 가는 영어 이름이다 — "Booked near …"(12자)를 붙여도 40자 안.
 * 설명은 그 동네가 어떤 곳인지 한 줄 — 가게·브랜드 이름은 쓰지 않는다 (규칙 3장, 상표)
 */
export const AREAS: Choice[] = [
  choice("gwanghwamun", "Gwanghwamun/Gyeongbokgung", "광화문·경복궁", "Gwanghwamun & Gyeongbokgung", "궁궐과 광장, 서울의 한가운데", "Palaces and the big square at the centre"),
  choice("bukchon", "Bukchon/Seochon/Ikseon-dong", "북촌·서촌·익선동", "Bukchon, Seochon & Ikseon-dong", "한옥 골목과 작은 가게들", "Hanok lanes and little shops"),
  choice("myeongdong", "Myeongdong/Namsan", "명동·남산", "Myeongdong & Namsan", "쇼핑 거리와 남산 전망", "Shopping streets and the Namsan lookout"),
  choice("dongdaemun", "Dongdaemun/DDP", "동대문·DDP", "Dongdaemun & DDP", "밤늦게까지 여는 쇼핑, 곡선 건물", "Late-night shopping and a curving landmark"),
  choice("euljiro", "Euljiro/Gwangjang Market", "을지로·광장시장", "Euljiro & Gwangjang Market", "시장 먹거리와 오래된 골목 가게", "Market food and old backstreet spots"),
  choice("hongdae", "Hongdae/Yeonnam/Mangwon", "홍대·연남·망원", "Hongdae, Yeonnam & Mangwon", "버스킹, 젊은 거리, 동네 카페", "Buskers, young streets, local cafés"),
  choice("seongsu", "Seongsu/Seoul Forest", "성수·서울숲", "Seongsu & Seoul Forest", "팝업과 카페, 공장을 고친 거리", "Pop-ups and cafés in old factories"),
  choice("itaewon", "Itaewon/Hannam", "이태원·한남", "Itaewon & Hannam", "세계 음식과 편집숍, 밤 문화", "World food, boutiques, nightlife"),
  choice("yongsan", "Yongsan", "용산", "Yongsan", "큰 박물관과 새로 뜨는 골목", "Big museums and up-and-coming lanes"),
  choice("yeouido", "Yeouido/Han River", "여의도·한강", "Yeouido & the Han River", "강변 공원의 피크닉과 노을", "Riverside picnics and sunsets"),
  choice("gangnam", "Gangnam/Apgujeong/Sinsa", "강남·압구정·신사", "Gangnam, Apgujeong & Sinsa", "가로수길 쇼핑과 세련된 밤", "Boutique streets and polished nights"),
  choice("jamsil", "Jamsil", "잠실", "Jamsil", "호수 공원과 높은 전망대", "A lake park and a sky-high lookout"),
].map((c) => ({ ...c, image: seoulScene(c.id) })); // 사진은 카드에 붙이지 않고 오른쪽 판 엽서에만 쓴다
/** '잘 모르겠어요'는 동네와 같이 고를 수 없다. 고르면 취향 두 가지를 묻는다 */
const UNSURE = choice("unsure", "", "잘 모르겠어요", "Not sure", "취향 두 가지만 더 물어볼게요", "Two quick taste questions instead");

/** 동네를 모를 때만 */
export const FAMOUS: Choice[] = [
  choice("famous", "famous sights", "유명한 곳", "Famous sights"),
  choice("mix", "a mix of famous & local", "반반", "A bit of both"),
  choice("local", "local neighbourhoods", "현지인 동네", "Where locals go"),
];
export const ERAS: Choice[] = [
  choice("old", "old Seoul (palaces, hanok)", "옛 서울 (궁궐·한옥)", "Old Seoul (palaces, hanok)"),
  choice("mix", "old & new Seoul", "반반", "A bit of both"),
  choice("new", "new Seoul (cafes, boutiques)", "요즘 서울 (카페·편집숍)", "New Seoul (cafés, boutiques)"),
];

export const INTERESTS: Choice[] = [
  choice("history", "history & palaces", "역사·궁궐", "History & palaces"),
  choice("kpop", "K-pop & K-culture", "K-pop·한류", "K-pop & K-culture"),
  choice("food", "food", "먹거리", "Food"),
  choice("shopping", "shopping", "쇼핑", "Shopping"),
  choice("cafe", "cafes", "카페", "Cafés"),
  choice("nature", "nature & walks", "자연·산책", "Nature & walks"),
  choice("night", "night views", "야경", "Night views"),
  choice("art", "art & exhibitions", "전시·예술", "Art & exhibitions"),
  choice("nightlife", "nightlife", "밤 문화", "Nightlife"),
  choice("hands", "hands-on activities", "체험", "Hands-on activities"),
];

export const FOODS: Choice[] = [
  choice("bbq", "Korean BBQ", "한국식 바비큐", "Korean BBQ"),
  choice("chicken", "fried chicken", "치킨", "Fried chicken"),
  choice("tteokbokki", "tteokbokki", "떡볶이", "Tteokbokki"),
  choice("bibimbap", "bibimbap", "비빔밥", "Bibimbap"),
  choice("naengmyeon", "naengmyeon", "냉면", "Naengmyeon (cold noodles)"),
  choice("gukbap", "gukbap", "국밥", "Gukbap (rice soup)"),
  choice("street", "street snacks", "길거리 간식", "Street snacks"),
  choice("hanjeongsik", "hanjeongsik", "한정식", "Hanjeongsik (set meal)"),
];

/** 몰라요는 보내지 않는다 (value "") */
export const ARRIVALS: Choice[] = [
  choice("morning", "morning", "오전", "Morning"),
  choice("afternoon", "afternoon", "오후", "Afternoon"),
  choice("evening", "evening", "저녁", "Evening"),
  choice("late", "late night", "밤늦게", "Late at night"),
  choice("unknown", "", "몰라요", "Not sure"),
];
export const DEPARTURES: Choice[] = [
  choice("early", "early morning", "오전 일찍", "Early morning"),
  choice("noon", "around noon", "점심쯤", "Around noon"),
  choice("afternoon", "afternoon", "오후", "Afternoon"),
  choice("night", "night", "밤", "At night"),
  choice("unknown", "", "몰라요", "Not sure"),
];

/** 누구와 — 문구는 베타, 값은 지금 폼의 AUDIENCES + 직장 동료 */
export const COMPANIONS: Choice[] = [
  choice("solo", "Solo", "나 혼자", "Just me", "내 마음이 이끄는 대로", "Wherever I feel like going"),
  choice("couple", "Couple", "좋아하는 사람과", "With my partner", "둘이서 오래 기억할 장면", "Scenes for the two of us"),
  choice("friends", "Friends", "친구들과", "With friends", "함께 웃을 이야기를 모으러", "Stories to laugh about later"),
  choice("family", "Family with kids", "아이와 함께", "With kids", "작은 발견도 큰 추억이 되게", "Small finds, big memories"),
  choice("parents", "With parents", "부모님과", "With my parents", "함께 걷는 시간부터 소중하게", "Time together, at their pace"),
  choice("coworkers", "Coworkers", "직장 동료와", "With coworkers", "다 같이 즐길 만한 곳 위주로", "Places the whole group enjoys"),
];

/**
 * 아이 나이 — 여러 명이면 여럿 고른다. 지금 API 에는 칸이 없어서 '누구와' 값 뒤에 붙인다:
 * "Family with kids (under 6, 6–12, 13–18)" — 셋 다 골라도 40자 안.
 * 이름은 지하철 요금과 같은 나눔 — 유아(만 6세 미만)·어린이(만 6–12세)·청소년(만 13–18세) (써니 2026-10-12)
 */
export const CHILDREN: Choice[] = [
  choice("young", "under 6", "유아 (6세 미만)", "Little ones (under 6)", "쉬는 시간과 짧은 이동이 중요해요", "Breaks and short hops matter"),
  choice("school", "6–12", "어린이 (6–12세)", "Children (6–12)", "직접 보고 해보는 걸 좋아해요", "They love seeing and doing"),
  choice("teen", "13–18", "청소년 (13–18세)", "Teens (13–18)", "아이의 취향도 함께 골라보고 싶어요", "Their tastes count too"),
];

export const VISITS: Choice[] = [
  choice("first", "First time", "처음이에요", "First time", "대표 명소부터 담아요", "The landmarks come first"),
  choice("again", "Been before", "와 본 적 있어요", "Been before", "새로운 동네 위주로 담아요", "Fresher, lesser-known spots"),
];

export const STAYS: Choice[] = [
  choice("booked", "booked", "네, 정했어요", "Yes, it's booked", "숙소 근처부터 동선을 짜요", "Each day starts from where you stay"),
  choice("open", "not booked", "아직이에요", "Not yet", "묵기 좋은 동네를 알려 드려요", "We'll suggest good areas to stay"),
];

/**
 * 1인 예산 — 현지에서 쓸 돈, 숙소·항공 빼고, 여행 전체 기준 (★★★ 지문 그대로).
 * 구간 숫자는 지금 폼과 같다. AI 에게는 기준을 글로 밝힌다: 지시문이 뒤에 " per person" 을 붙여서
 * "Whole trip, excl. stay & flights: 150,000–250,000 KRW per person" 으로 읽힌다 (서버 한도 60자 안)
 */
export const BUDGETS: Choice[] = [
  choice("under150", "Whole trip, excl. stay & flights: under 150,000 KRW", "15만원 미만", "Under ₩150,000", "약 $110", "about $110"),
  choice("150to250", "Whole trip, excl. stay & flights: 150,000–250,000 KRW", "15–25만원", "₩150,000–250,000", "약 $110–185", "about $110–185"),
  choice("250to350", "Whole trip, excl. stay & flights: 250,000–350,000 KRW", "25–35만원", "₩250,000–350,000", "약 $185–260", "about $185–260"),
  choice("350to500", "Whole trip, excl. stay & flights: 350,000–500,000 KRW", "35–50만원", "₩350,000–500,000", "약 $260–370", "about $260–370"),
  choice("over500", "Whole trip, excl. stay & flights: over 500,000 KRW", "50만원 이상", "Over ₩500,000", "약 $370 이상", "about $370 and up"),
  choice("undecided", "", "아직 몰라요", "Not sure yet", "취향부터 알아가는 중이에요", "Still working it out"),
];
export const CURRENCIES = ["KRW", "USD", "EUR", "JPY"] as const;

export const ADVENTURES: Choice[] = [
  choice("familiar", "familiar food only", "익숙한 맛 위주", "Familiar flavours"),
  choice("some", "tries a little", "조금씩 도전", "A little adventurous"),
  choice("anything", "eats anything", "뭐든 먹어요", "Anything goes"),
];
/**
 * 못 먹어요는 식단(dietary)으로 보낸다 — 지시문이 "MUST WORK AROUND" 로 지킨다.
 * 나머지는 맛과 한 줄로: "Food: familiar food only, mild spice ok" — 어느 둘을 골라도 40자 안
 */
export const SPICES: Choice[] = [
  choice("none", "No spicy food", "못 먹어요", "Can't do spicy"),
  choice("mild", "mild spice ok", "조금", "A little"),
  choice("likes", "likes spicy", "좋아해요", "Love it"),
  choice("hot", "loves it hot", "아주 매워도 OK", "The hotter the better"),
];

/** 식단·접근성 — 건강·종교 정보라 고르는 방식으로만 받는다 (lib/types.ts 의 경고 그대로). 값은 지금 폼과 같다 */
export const NEEDS: Choice[] = [
  choice("halal", "Halal", "할랄", "Halal"),
  choice("vegetarian", "Vegetarian", "채식", "Vegetarian"),
  choice("vegan", "Vegan", "비건", "Vegan"),
  choice("allergy", "Food allergy", "알레르기", "Allergies"),
  choice("wheelchair", "Wheelchair access", "휠체어", "Wheelchair"),
  choice("stroller", "Stroller", "유아차", "Stroller"),
  choice("walk", "Hard to walk far", "오래 걷기 어려움", "Can't walk far"),
  choice("none", "", "없어요", "None"),
];
/** 러프의 '맞춰야 할 것' — 매운 음식을 못 먹는 것도 여기서 (디테일은 '먹는 건 어때요?'에서 묻는다) */
const NEEDS_ROUGH: Choice[] = [...NEEDS.slice(0, 3), choice("spicy", "No spicy food", "매운 음식은 못 먹어요", "No spicy food"), ...NEEDS.slice(3)];
export const ALLERGIES: Choice[] = [
  choice("nut", "Nut allergy", "견과류", "Nuts"),
  choice("shellfish", "Shellfish allergy", "갑각류", "Shellfish"),
  choice("dairy", "Dairy allergy", "유제품", "Dairy"),
  choice("wheat", "Wheat allergy", "밀", "Wheat"),
  choice("egg", "Egg allergy", "달걀", "Eggs"),
];

/** 하루에 몇 곳 — 지시문의 Pace 줄에 그대로 들어간다 */
export const PACES: Choice[] = [
  choice("slow", "Relaxed: about 2 stops a day", "2곳 정도", "About 2", "한 곳에 오래, 여유롭게", "Linger, no rush"),
  choice("balanced", "Balanced: 3–4 stops a day", "3–4곳", "3 or 4", "구경도, 쉬는 시간도", "Sights and breaks"),
  choice("full", "Packed: 5+ stops a day", "5곳 이상", "5 or more", "한 곳이라도 더", "As much as you can fit"),
];

export const AVOIDS: Choice[] = [
  choice("crowds", "Crowded places", "사람 많은 곳", "Crowds"),
  choice("stairs", "Lots of stairs & hills", "계단·언덕", "Stairs & hills"),
  choice("long", "Long travel legs", "긴 이동", "Long journeys"),
  choice("late", "Late nights", "늦은 밤", "Late nights"),
  choice("queues", "Long queues", "줄 서기", "Queues"),
  choice("touristy", "Places that feel too touristy", "너무 관광지 같은 곳", "Tourist traps"),
];

/* 디테일만 */
export const STARTS: Choice[] = [
  choice("8", "8am", "아침 8시", "8am"),
  choice("9", "9am", "9시", "9am"),
  choice("10", "10am", "10시", "10am"),
  choice("11", "11am or later", "11시 이후", "11am or later"),
];
export const ENDS: Choice[] = [
  choice("18", "6pm", "저녁 6시", "6pm"),
  choice("21", "9pm", "밤 9시", "9pm"),
  choice("23", "11pm", "밤 11시", "11pm"),
  choice("late", "late at night", "늦게까지", "Late"),
];
export const TRANSPORTS: Choice[] = [
  choice("transit", "Subway and bus", "지하철·버스", "Subway & bus"),
  choice("taxi", "Mostly taxi", "택시 위주", "Mostly taxi"),
  choice("walk", "Walking", "걷기", "Walking"),
  choice("car", "Rental car", "렌터카", "Rental car"),
];
/** 처음이면 교통 값 뒤에 붙인다: "Subway and bus, new to the subway" */
export const SUBWAY: Choice[] = [
  choice("new", "new", "처음이라 자세히 알려 주세요", "New to it — spell it out"),
  choice("used", "used", "어느 정도 알아요", "I know my way around"),
];
export const AIRPORTS: Choice[] = [
  choice("icn", "Incheon (ICN)", "인천", "Incheon (ICN)"),
  choice("gmp", "Gimpo (GMP)", "김포", "Gimpo (GMP)"),
  choice("none", "none", "공항 아님 (기차·배)", "Not flying in (train, ferry)"),
  choice("unknown", "", "아직 몰라요", "Not sure yet"),
];
export const RIDES: Choice[] = [
  choice("arex", "AREX train", "공항철도", "Airport railroad (AREX)"),
  choice("bus", "limousine bus", "리무진 버스", "Limousine bus"),
  choice("taxi", "taxi", "택시", "Taxi"),
  choice("compare", "compare options", "비교해 주세요", "Compare them for me"),
];
/** 빌리는 곳·입기 좋은 길은 정보로만 — 대여 예약을 대신하지 않는다 (규칙 3장) */
export const HANBOK: Choice[] = [
  choice("yes", "Wants to wear hanbok", "네, 입어 볼래요", "Yes, I'd love to"),
  choice("no", "", "아니요", "No thanks"),
];
export const BUYS: Choice[] = [
  choice("cosmetics", "cosmetics", "화장품", "Cosmetics"),
  choice("clothes", "clothes", "옷", "Clothes"),
  choice("souvenirs", "souvenirs", "기념품", "Souvenirs"),
  choice("electronics", "electronics", "전자제품", "Electronics"),
  choice("snacks", "snacks & food", "과자·식품", "Snacks & food"),
  choice("books", "books & stationery", "책·문구", "Books & stationery"),
];

export const LANGUAGES = [
  { code: "en", label: "English" }, { code: "ko", label: "한국어" }, { code: "ja", label: "日本語" }, { code: "zh", label: "中文" },
] as const;

/* ── 질문 ──────────────────────────────────────────────────────────── */

/**
 * 답은 칸(key) 이름으로 모은다. 직접 적은 '그 외'는 `${key}:other`, 통화·초안 언어는 currency·language.
 * 칸은 늘 글자 목록이다 — 하나만 고르는 칸도 [id].
 */
export type Answers = Partial<Record<string, string[]>>;

/** 한 화면 안의 한 줄. 줄이 여럿이면 label 로 무엇을 묻는지 적는다 */
export type Field = {
  key: string;
  label?: Text;
  /** 보기. 앞의 답에 따라 바뀌면 함수 (예: '꼭 하나'는 고른 관심사 중에서) */
  options?: Choice[] | ((a: Answers) => Choice[]);
  multiple?: boolean;
  /** 이 보기를 고르면 다른 것이 풀린다 (잘 모르겠어요, 없어요) */
  exclusive?: string[];
  /** 고르지 않아도 된다 */
  optional?: boolean;
  /** '그 외 — 직접 적기' */
  other?: boolean;
  /** 보기 대신 직접 적는 칸 */
  text?: { placeholder: Text; max: number };
  /** 앞의 답에 따라 보이는 줄 (예: 지하철·버스를 고르면 '지하철은 익숙해요?') */
  show?: (a: Answers) => boolean;
};

export type StepId =
  | "mode" | "area" | "taste" | "interests" | "must" | "wish" | "dates" | "times"
  | "who" | "kids" | "travelers" | "visited" | "stay" | "stayArea" | "budget" | "food" | "needs" | "allergy"
  | "pace" | "avoid" | "hours" | "move" | "airport" | "hanbok" | "buy" | "review";

export type StepDef = {
  id: StepId;
  q: Text;
  help: Text;
  kind: "choice" | "dates" | "travelers" | "review";
  fields: Field[];
  /** 앞의 답에 따라 묻는 질문 */
  when?: (a: Answers) => boolean;
  /** 러프·디테일 한쪽에서만 묻는 질문 */
  mode?: "rough" | "detail";
};

const first = (a: Answers, key: string) => a[key]?.[0];
const has = (a: Answers, key: string, id: string) => !!a[key]?.includes(id);

/** 묻는 순서 그대로. 고르는 재미가 있는 것(동네·하고 싶은 것) 먼저, 사실(예산·식단)은 뒤로 */
export const STEPS: StepDef[] = [
  {
    id: "mode", kind: "choice",
    q: tx("이번 여행 계획, 어떻게 짜고 싶으세요?", "How do you want to plan this trip?"),
    // 하나만 고르는 질문의 첫 화면 — 고르면 바로 넘어간다는 것을 미리 알린다 (WCAG 3.2.2)
    help: tx("하나를 고르면 바로 다음 질문으로 넘어가요.", "Pick one — you'll go straight to the next question."),
    fields: [{ key: "mode", options: MODES }],
  },
  {
    id: "area", kind: "choice",
    q: tx("서울 어디를 가 보고 싶어요?", "Where in Seoul do you want to go?"),
    help: tx("끌리는 동네를 다 골라 주세요. 잘 모르겠으면 '잘 모르겠어요'.", "Pick every area that pulls you in — or ‘Not sure’."),
    fields: [{ key: "area", options: [...AREAS, UNSURE], multiple: true, exclusive: ["unsure"], other: true }],
  },
  {
    id: "taste", kind: "choice", when: (a) => has(a, "area", "unsure"),
    q: tx("그럼 취향만 알려 주세요.", "Then just tell us your taste."),
    help: tx("줄마다 하나씩 고르면 넘어가요. 맞는 동네는 초안이 골라 담아요.", "One in each row and you'll move on — the draft picks the areas."),
    fields: [
      { key: "famous", label: tx("유명한 곳 위주? 현지인 동네 위주?", "Famous sights, or where locals go?"), options: FAMOUS },
      { key: "era", label: tx("옛 서울과 요즘 서울, 어느 쪽이 더 끌려요?", "Old Seoul or new Seoul?"), options: ERAS },
    ],
  },
  {
    id: "interests", kind: "choice",
    q: tx("서울에서 끌리는 걸 다 골라 주세요.", "Pick everything in Seoul that pulls you in."),
    help: tx("하루하루의 주제가 여기서 나와요. 여러 개 골라도 좋아요.", "Each day's theme comes from these. Pick as many as you like."),
    fields: [{ key: "interests", options: INTERESTS, multiple: true }],
  },
  {
    // 관심사를 하나만 골랐으면 그게 1순위다 — 묻지 않는다
    id: "must", kind: "choice", mode: "detail", when: (a) => (a.interests?.length ?? 0) !== 1,
    q: tx("이것만은 꼭! 하나만 고른다면?", "If you could only do one?"),
    help: tx("그걸 가장 좋은 시간에 넣고, 나머지를 그 주변으로 짜요.", "It gets the best time of day, and the rest is built around it."),
    fields: [{ key: "must", options: (a) => INTERESTS.filter((c) => has(a, "interests", c.id)) }],
  },
  {
    id: "wish", kind: "choice", mode: "detail",
    q: tx("꼭 가고 싶은 곳이나 먹고 싶은 게 있어요?", "Anywhere you have to go, or anything you have to eat?"),
    help: tx("없으면 건너뛰어도 돼요.", "Nothing yet? Skip it."),
    fields: [
      {
        key: "place", label: tx("꼭 가고 싶은 곳", "Places you have to see"), optional: true,
        text: { placeholder: tx("예: 경복궁, 성수동, 광장시장", "e.g. Gyeongbokgung, Seongsu, Gwangjang Market"), max: 80 },
      },
      { key: "foods", label: tx("꼭 먹어 보고 싶은 것", "Food you have to try"), options: FOODS, multiple: true, optional: true },
    ],
  },
  {
    id: "dates", kind: "dates",
    q: tx("언제 서울에 도착하고, 언제 떠나세요?", "When do you arrive in Seoul, and when do you leave?"),
    help: tx("가는 날과 오는 날을 골라 주세요. 최대 30일까지예요.", "Pick the day you arrive and the day you leave — up to 30 days."),
    fields: [{ key: "dates" }],
  },
  {
    id: "times", kind: "choice",
    q: tx("몇 시쯤 도착하고, 몇 시쯤 떠나요?", "Roughly when do you land, and leave?"),
    help: tx("첫날과 마지막 날에 넣는 일정 양이 달라져요.", "It sets how much fits on your first and last day."),
    fields: [
      { key: "arrive", label: tx("첫날 서울 도착", "Getting to Seoul on day one"), options: ARRIVALS },
      { key: "leave", label: tx("마지막 날 출발", "Leaving on the last day"), options: DEPARTURES },
    ],
  },
  {
    id: "who", kind: "choice",
    q: tx("누구와 함께해요?", "Who's coming with you?"),
    help: tx("장소 고르는 기준과 하루 속도가 달라져요.", "It changes the places and the pace."),
    fields: [{ key: "who", options: COMPANIONS }],
  },
  {
    id: "kids", kind: "choice", when: (a) => first(a, "who") === "family",
    q: tx("아이는 몇 살쯤이에요?", "How old are the kids?"),
    help: tx("해당하는 걸 다 골라 주세요. 이동 거리와 쉬는 시간이 달라져요.", "Pick all that apply — it changes distances and breaks."),
    fields: [{ key: "kids", options: CHILDREN, multiple: true }],
  },
  {
    // 혼자는 1명, 둘이는 2명 — 묻지 않는다
    id: "travelers", kind: "travelers", when: (a) => !["solo", "couple"].includes(first(a, "who") ?? ""),
    q: tx("모두 몇 명이에요?", "How many of you are going?"),
    help: tx("본인을 포함해서 세어 주세요.", "Count yourself in."),
    fields: [{ key: "travelers" }],
  },
  {
    id: "visited", kind: "choice",
    q: tx("서울은 처음이에요?", "Is this your first time in Seoul?"),
    help: tx("처음이면 대표 명소부터, 와 봤으면 새로운 동네 위주로 담아요.", "First-timers get the landmarks; repeat visitors get fresher spots."),
    fields: [{ key: "visited", options: VISITS }],
  },
  {
    id: "stay", kind: "choice", mode: "detail",
    q: tx("숙소는 이미 정했어요?", "Have you booked your stay yet?"),
    help: tx("정했으면 그 동네를 하루의 시작점으로 삼아요.", "If you have, each day starts from there."),
    fields: [{ key: "stay", options: STAYS }],
  },
  {
    id: "stayArea", kind: "choice", mode: "detail", when: (a) => first(a, "stay") === "booked",
    q: tx("숙소가 어느 동네예요?", "Which area is your stay in?"),
    help: tx("매일 출발·도착 지점이 정해져서 이동 시간이 정확해져요.", "Each day starts and ends there, so travel times get accurate."),
    // 같은 12곳 — 여기서는 설명 없이 이름만 (어디 묵는지는 손님이 이미 안다)
    fields: [{ key: "stayArea", options: AREAS.map((c) => ({ id: c.id, title: c.title, value: c.value })), other: true }],
  },
  {
    id: "budget", kind: "choice",
    q: tx("현지에서 쓸 1인 예산은 어느 정도예요?", "How much will each person spend in Seoul?"),
    help: tx("숙소·항공은 빼고, 여행 전체 기준이에요.", "Not counting flights or your stay — for the whole trip."),
    fields: [{ key: "budget", options: BUDGETS }],
  },
  {
    id: "food", kind: "choice", mode: "detail",
    q: tx("먹는 건 어때요?", "How do you like to eat?"),
    help: tx("줄마다 하나씩 고르면 넘어가요.", "One in each row and you'll move on."),
    fields: [
      { key: "adventure", label: tx("처음 보는 음식은", "Unfamiliar dishes"), options: ADVENTURES },
      { key: "spicy", label: tx("매운 음식은", "Spicy food"), options: SPICES },
    ],
  },
  {
    id: "needs", kind: "choice",
    q: tx("꼭 맞춰야 할 게 있어요?", "Anything the plan must work around?"),
    help: tx("식단이나 이동에서 맞춰야 할 걸 골라 주세요. 고르지 않아도 돼요.", "Diet or getting around — optional."),
    // 러프는 '먹는 건 어때요?'(맛·매운 정도)를 묻지 않는다 — 매운 걸 못 먹는 것만 여기서 고른다
    fields: [{ key: "needs", options: (a) => (first(a, "mode") === "detail" ? NEEDS : NEEDS_ROUGH), multiple: true, exclusive: ["none"], optional: true }],
  },
  {
    id: "allergy", kind: "choice", when: (a) => has(a, "needs", "allergy"),
    q: tx("어떤 알레르기예요?", "What are you allergic to?"),
    help: tx("피해야 할 메뉴를 표시해요. 고르지 않아도 돼요.", "The draft flags dishes to avoid. Optional."),
    fields: [{ key: "allergy", options: ALLERGIES, multiple: true, optional: true, other: true }],
  },
  {
    id: "pace", kind: "choice",
    q: tx("하루에 몇 군데 정도 가고 싶어요?", "How many places a day feels right?"),
    help: tx("하루에 넣는 일정 수가 달라져요.", "It sets how much goes into each day."),
    fields: [{ key: "pace", options: PACES }],
  },
  {
    id: "avoid", kind: "choice", mode: "detail",
    q: tx("빼고 싶은 게 있어요?", "Anything you'd rather avoid?"),
    help: tx("고른 건 일정에서 빼거나 줄여요. 고르지 않아도 돼요.", "Whatever you pick gets cut or kept short. Optional."),
    fields: [{ key: "avoid", options: AVOIDS, multiple: true, optional: true, other: true }],
  },
  {
    id: "hours", kind: "choice", mode: "detail",
    q: tx("하루는 몇 시에 시작해서 몇 시에 마칠까요?", "When should each day start and finish?"),
    help: tx("매일 첫 일정과 마지막 일정의 시간이 정해져요.", "It sets the first and last stop of every day."),
    fields: [
      { key: "start", label: tx("시작", "Start"), options: STARTS },
      { key: "end", label: tx("마침", "Finish"), options: ENDS },
    ],
  },
  {
    id: "move", kind: "choice", mode: "detail",
    q: tx("주로 어떻게 다닐 거예요?", "How will you mostly get around?"),
    help: tx("이동 안내 방식과 걸리는 시간이 달라져요.", "It changes the directions and the travel times."),
    fields: [
      { key: "transport", label: tx("다니는 방법", "Getting around"), options: TRANSPORTS },
      { key: "subway", label: tx("지하철 타는 건 익숙해요?", "Used to the subway?"), options: SUBWAY, show: (a) => first(a, "transport") === "transit" },
    ],
  },
  {
    id: "airport", kind: "choice", mode: "detail",
    q: tx("어느 공항으로 들어와요?", "Which airport are you flying into?"),
    help: tx("공항에서 숙소까지 가는 길을 맞춰 적어요.", "The draft covers the way from the airport to your stay."),
    fields: [
      { key: "airport", label: tx("공항", "Airport"), options: AIRPORTS },
      {
        key: "ride", label: tx("공항에서 숙소까지는", "From the airport to your stay"), options: RIDES,
        show: (a) => ["icn", "gmp"].includes(first(a, "airport") ?? ""),
      },
    ],
  },
  {
    id: "hanbok", kind: "choice", mode: "detail",
    q: tx("한복 입고 다녀 볼래요?", "Want to wear hanbok for a day?"),
    help: tx("입어 본다면 빌리는 동네와 입고 걷기 좋은 길을 초안에 적어요.", "If so, the draft notes where to rent one and where to wear it."),
    fields: [{ key: "hanbok", options: HANBOK }],
  },
  {
    id: "buy", kind: "choice", mode: "detail", when: (a) => has(a, "interests", "shopping"),
    q: tx("무엇을 사고 싶어요?", "What do you want to buy?"),
    help: tx("쇼핑할 동네를 고르는 기준이 돼요. 여러 개 골라도 좋아요.", "It decides where you shop. Pick as many as you like."),
    fields: [{ key: "buy", options: BUYS, multiple: true }],
  },
  {
    id: "review", kind: "review",
    q: tx("이대로 초안을 쓸까요?", "Ready for your draft?"),
    help: tx("고칠 곳이 있으면 '지금까지의 여행'에서 눌러 바로 돌아갈 수 있어요.", "Want to change something? Tap it under “Your trip so far” to go back."),
    fields: [],
  },
];

export const STEP = Object.fromEntries(STEPS.map((st) => [st.id, st])) as Record<StepId, StepDef>;
const FIELD: Record<string, Field> = Object.fromEntries(STEPS.flatMap((st) => st.fields.map((f) => [f.key, f])));
/** 질문 밖에서 정하는 값 (예산 화면의 통화, 확인 화면의 초안 언어) — 지우지 않는다 */
const AUX = ["currency", "language"];

export type FlowState = { step: StepId; answers: Answers; reviewed?: boolean };
/** reviewed: 확인 화면까지 한 번 와 봤는지. 그 뒤로 앞 질문을 고치러 가면 '확인 화면으로' 단추가 생긴다 */
export const INITIAL_STATE: FlowState = { step: "mode", answers: {}, reviewed: false };

/** 지금 답으로 묻게 되는 질문들, 순서대로. 러프·디테일을 고르기 전에는 둘 다에 있는 질문만 */
export function stepOrder(a: Answers): StepId[] {
  const mode = first(a, "mode");
  return STEPS.filter((st) => (!st.mode || st.mode === mode) && (!st.when || st.when(a))).map((st) => st.id);
}

/** 이 화면에 지금 보이는 줄 */
export function visibleFields(step: StepId, a: Answers): Field[] {
  return STEP[step].fields.filter((f) => !f.show || f.show(a));
}

export function optionsFor(f: Field, a: Answers): Choice[] {
  return typeof f.options === "function" ? f.options(a) : f.options ?? [];
}

const typed = (a: Answers, key: string) => (a[`${key}:other`]?.[0] ?? "").trim();

/** 고른 보기의 이름 (+ 직접 적은 것) — 오른쪽 판에 적을 글 */
export function labelsOf(a: Answers, key: string): Text[] {
  const f = FIELD[key];
  if (!f) return [];
  if (f.text) {
    const v = (a[key]?.[0] ?? "").trim();
    return v ? [{ ko: v, en: v }] : [];
  }
  const options = optionsFor(f, a);
  const picked = (a[key] ?? []).map((id) => options.find((o) => o.id === id)?.title).filter((x): x is Text => !!x);
  const other = typed(a, key);
  return other ? [...picked, { ko: other, en: other }] : picked;
}

/**
 * 고르면 '다음' 없이 넘어가는 질문인지 — 보이는 줄이 모두 하나만 고르는 보기이고, 직접 적는 칸이 열려 있지 않을 때.
 * 여러 개 고르는 질문, 직접 적는 칸, 날짜(달력)·인원(+−)은 다 됐는지 화면이 알 수 없으니 '다음' 단추를 둔다.
 * 줄이 여럿이면 마지막 줄을 채운 순간 넘어간다 (화면 쪽 PlanFlow.pick)
 */
export function autoAdvance(step: StepId, a: Answers): boolean {
  if (STEP[step].kind !== "choice") return false;
  const fields = visibleFields(step, a);
  return fields.length > 0 && fields.every((f) => !f.multiple && !f.text && a[`${f.key}:other`] === undefined);
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
  const { step, answers: a } = state;
  const def = STEP[step];
  if (def.kind === "review") return null;
  if (def.kind === "dates") {
    const [start, end] = a.dates ?? [];
    if (!start || !end) return tx("가는 날과 오는 날을 모두 골라 주세요.", "Pick the day you arrive and the day you leave.");
    if (!realDate(start) || !realDate(end)) return tx("달력에 있는 날짜를 골라 주세요.", "Please pick dates from the calendar.");
    if (start < today) return tx("가는 날은 오늘 이후로 골라 주세요.", "Arrival can't be in the past.");
    if (end < start) return tx("오는 날은 가는 날과 같거나 뒤여야 해요.", "Leaving has to be on or after arriving.");
    if (nights(start, end) + 1 > 30) return tx("여행 기간은 30일까지 고를 수 있어요.", "Trips can be up to 30 days.");
    return null;
  }
  if (def.kind === "travelers") {
    // 이 질문은 혼자·둘이가 아닐 때만 묻는다 — 본인 포함 2명부터
    const v = a.travelers?.[0];
    const n = Number(v);
    if (!v || !Number.isInteger(n) || n < 2 || n > 20) return tx("인원은 본인 포함 2명부터 20명까지예요.", "Travellers: 2 to 20, you included.");
    return null;
  }
  const fields = visibleFields(step, a);
  for (const f of fields) {
    if (f.text) {
      if (!f.optional && !(a[f.key]?.[0] ?? "").trim()) return tx("적어 주세요.", "Please type something.");
      continue;
    }
    const otherOpen = !!f.other && a[`${f.key}:other`] !== undefined;
    if (otherOpen && !typed(a, f.key)) return tx("직접 적는 칸이 비어 있어요. 적거나 닫아 주세요.", "The ‘other’ box is empty — type something or close it.");
    const values = a[f.key] ?? [];
    const ids = new Set(optionsFor(f, a).map((o) => o.id));
    if (!values.every((v) => ids.has(v))) return tx("고를 수 없는 보기가 들어 있어요.", "Something picked isn't on the list.");
    if (!f.optional && !values.length && !otherOpen) {
      if (fields.length > 1) return tx("줄마다 하나씩 골라 주세요.", "Pick one in each row.");
      return f.multiple ? tx("하나 이상 골라 주세요.", "Pick at least one.") : tx("마음에 드는 것을 골라 주세요.", "Pick the one that fits.");
    }
  }
  return null;
}

export type Action =
  | { type: "choose"; field: string; value: string }
  | { type: "input"; field: "dates" | "travelers"; values: string[] }
  | { type: "text"; field: string; text: string }
  | { type: "other"; field: string; text: string | null } // null 이면 '그 외' 칸을 닫는다
  | { type: "set"; key: "currency" | "language"; value: string }
  | { type: "next"; from: StepId }
  | { type: "back" }
  | { type: "goto"; to: StepId } // 오른쪽 판에서 고칠 곳으로
  | { type: "resume"; from?: StepId } // 확인 화면을 본 뒤 고치러 왔을 때: 곧장 확인 화면으로 (from: next 와 같은 늦은 클릭 막이)
  | { type: "reset" };

export function flowReducer(state: FlowState, action: Action): FlowState {
  if (action.type === "reset") return INITIAL_STATE;
  const order = stepOrder(state.answers);
  const index = order.indexOf(state.step);
  const move = (step: StepId): FlowState => ({ ...state, step, reviewed: state.reviewed || step === "review" });
  const broken = (st: StepId) => !!stepError({ step: st, answers: state.answers });

  switch (action.type) {
    case "back":
      return move(order[Math.max(0, index - 1)]);
    case "next":
      // 이전 화면에서 늦게 들어온 클릭이 다음 질문까지 건너뛰지 않게 한다 (베타와 같다)
      if (action.from !== state.step || state.step === "review" || broken(state.step)) return state;
      return move(order[index + 1]);
    case "resume": {
      // 확인 화면에서 날짜 하나 고치러 왔는데 다음·다음·다음을 눌러야 돌아가는 건 번거롭다 (써니 2026-10-12).
      // 고치는 사이에 새로 생긴 필수 질문(아이 나이, 다시 세야 할 인원, 디테일 질문 …)이 있으면 거기서 멈춘다
      if (action.from && action.from !== state.step) return state;
      if (!state.reviewed || state.step === "review" || broken(state.step)) return state;
      return move(order.find((st) => st !== "review" && broken(st)) ?? "review");
    }
    case "goto": {
      const target = order.indexOf(action.to);
      if (target < 0 || target === index) return state;
      // 앞으로 건너뛰는 건 확인 화면을 본 뒤에만, 지금 화면부터 그 앞까지 모두 답이 있을 때만 — 필수 질문을 건너뛰지 못하게
      if (target > index && (!state.reviewed || order.slice(index, target).some(broken))) return state;
      return move(action.to);
    }
    case "set":
      return { ...state, answers: { ...state.answers, [action.key]: [action.value] } };
    case "input":
      if (STEP[state.step].kind !== action.field) return state;
      return { ...state, answers: { ...state.answers, [action.field]: action.values } };
  }

  // 아래는 지금 화면의 한 줄에 답하는 것
  const field = visibleFields(state.step, state.answers).find((f) => f.key === action.field);
  if (!field) return state;
  const answers: Answers = { ...state.answers };
  const otherKey = `${field.key}:other`;

  if (action.type === "text") {
    if (!field.text) return state;
    answers[field.key] = [action.text.slice(0, field.text.max)];
  } else if (action.type === "other") {
    if (!field.other) return state;
    if (action.text === null) delete answers[otherKey];
    else {
      // 직접 적기를 열면: 하나만 고르는 줄은 고른 것을 풀고, '잘 모르겠어요' 같은 혼자 고르는 보기도 푼다
      if (answers[otherKey] === undefined) {
        answers[field.key] = field.multiple ? (answers[field.key] ?? []).filter((v) => !field.exclusive?.includes(v)) : [];
      }
      answers[otherKey] = [action.text.slice(0, 40)];
    }
  } else {
    if (!optionsFor(field, state.answers).some((o) => o.id === action.value)) return state;
    const current = answers[field.key] ?? [];
    if (field.multiple) {
      if (current.includes(action.value)) answers[field.key] = current.filter((v) => v !== action.value);
      else if (field.exclusive?.includes(action.value)) {
        answers[field.key] = [action.value];
        delete answers[otherKey];
      } else answers[field.key] = [...current.filter((v) => !field.exclusive?.includes(v)), action.value];
    } else {
      // 고르지 않아도 되는 줄은 다시 누르면 풀린다. 하나만 고르는 줄에서 보기를 고르면 '직접 적기'는 닫힌다
      answers[field.key] = field.optional && current[0] === action.value ? [] : [action.value];
      delete answers[otherKey];
    }
    // 누구와를 바꾸면 인원을 다시 센다 (혼자·둘이는 묻지 않는다)
    if (field.key === "who" && current[0] !== action.value) delete answers.travelers;
  }
  return { ...state, answers: prune(answers) };
}

/**
 * 더는 묻지 않는 질문의 답만 지운다 (동네를 알게 되면 취향, 러프로 바꾸면 디테일 질문 …).
 * 보기가 앞의 답에 따라 바뀌는 줄('꼭 하나')은 없어진 보기만 뺀다. 지운 것 때문에 또 바뀔 수 있어 멈출 때까지 돈다
 */
function prune(input: Answers): Answers {
  let answers = input;
  for (let round = 0; round < 8; round++) {
    const keep = new Set<string>(AUX);
    for (const st of stepOrder(answers)) {
      for (const f of visibleFields(st, answers)) {
        keep.add(f.key);
        if (f.other) keep.add(`${f.key}:other`);
      }
    }
    let changed = false;
    const next: Answers = {};
    for (const [key, values] of Object.entries(answers)) {
      if (keep.has(key)) next[key] = values;
      else changed = true;
    }
    for (const st of stepOrder(next)) {
      for (const f of visibleFields(st, next)) {
        const values = next[f.key];
        if (!f.options || !values) continue;
        const ids = new Set(optionsFor(f, next).map((o) => o.id));
        const kept = values.filter((v) => ids.has(v));
        if (kept.length !== values.length) {
          next[f.key] = kept;
          changed = true;
        }
      }
    }
    answers = next;
    if (!changed) break;
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

const valueOf = (a: Answers, key: string) => {
  const id = first(a, key);
  return (FIELD[key] && optionsFor(FIELD[key], a).find((o) => o.id === id)?.value) || undefined;
};
const valuesOf = (a: Answers, key: string) => {
  const options = FIELD[key] ? optionsFor(FIELD[key], a) : [];
  return (a[key] ?? []).map((id) => options.find((o) => o.id === id)?.value).filter((v): v is string => !!v);
};

/**
 * 같은 머리말로 시작하는 짧은 문장으로 묶는다: pack("Areas: ", [a, b, c]) → ["Areas: a, b", "Areas: c"].
 * 서버는 styles 한 줄에 40자까지만 받는다 (lib/validate.ts) — 넘치면 다음 줄로
 */
export function pack(prefix: string, items: string[], max = 40): string[] {
  const out: string[] = [];
  let line = "";
  for (const raw of items) {
    const item = raw.trim().slice(0, max - prefix.length);
    if (!item) continue;
    if (line && `${line}, ${item}`.length <= max) line = `${line}, ${item}`;
    else {
      if (line) out.push(line);
      line = prefix + item;
    }
  }
  if (line) out.push(line);
  return out;
}

/** 직접 적은 '꼭 가고 싶은 곳'을 쉼표 등으로 나눈다 ("경복궁, 성수동·광장시장") */
const splitPlaces = (text: string) => text.split(/[,，、;·\n]+/).map((p) => p.trim()).filter(Boolean);

/**
 * 남은 줄을 목록들에 나눈다. 고른 게 있는 목록은 적어도 한 줄씩 받고, 남으면 앞의 목록부터 한 줄씩 더 받는다.
 * 동네를 열 곳 고른 손님 때문에 '꼭 먹을 것'이 통째로 빠지는 일이 없게 — 길게 고른 목록의 뒤쪽이 잘린다
 */
function share(lists: string[][], room: number): string[][] {
  const take = lists.map(() => 0);
  for (let round = 0; room > 0; round++) {
    let added = false;
    for (let i = 0; i < lists.length && room > 0; i++) {
      if (lists[i].length > round) {
        take[i]++;
        room--;
        added = true;
      }
    }
    if (!added) break;
  }
  return lists.map((l, i) => l.slice(0, take[i]));
}

/** 기본 통화: 한국어 화면이면 원화, 영어면 달러 (예산 화면에서 바꿀 수 있다) */
export const defaultCurrency = (lang: Lang) => (lang === "ko" ? "KRW" : "USD");

export function toPlanRequest(a: Answers, lang: Lang): PlanRequest {
  const [start, end] = a.dates ?? [];
  const who = first(a, "who");

  // 도착·출발 시간은 한 줄로 ("Arrives late night, leaves early morning" 이 가장 긴데 딱 40자)
  const arrival = valueOf(a, "arrive");
  const departure = valueOf(a, "leave");
  const timing = arrival && departure ? [`Arrives ${arrival}, leaves ${departure}`]
    : arrival ? [`Arrives ${arrival}`] : departure ? [`Leaves ${departure}`] : [];

  // 동네가 많으면 줄을 많이 먹는다 — 두 줄을 넘으면 짧은 이름으로 ("Bukchon/Seochon/Ikseon-dong" → "Bukchon")
  const areas = valuesOf(a, "area");
  const fullAreas = pack("Areas: ", [...areas, typed(a, "area")]);
  const areaLines = has(a, "area", "unsure") ? ["Areas: please suggest"]
    : fullAreas.length > 2 ? pack("Areas: ", [...areas.map((v) => v.split("/")[0]), typed(a, "area")]) : fullAreas;

  const airport = first(a, "airport");
  const ride = valueOf(a, "ride");
  const must = valueOf(a, "must");
  const spicy = first(a, "spicy");
  const hanbok = valueOf(a, "hanbok");
  const mode = first(a, "mode");

  // 한 줄짜리 — 늘 다 들어간다 (가장 많아도 6줄)
  const plan = mode ? [mode === "detail" ? "Plan: detailed, hour by hour" : "Plan: rough outline, key spots only"] : [];
  const top = must ? [`Top priority: ${must}`] : [];
  // 못 먹어요는 식단으로 간다. 맛·매운 정도는 어느 둘을 골라도 한 줄 안이다
  const food = pack("Food: ", [...valuesOf(a, "adventure"), ...(spicy && spicy !== "none" ? valuesOf(a, "spicy") : [])]);
  const airportLine = airport === "icn" || airport === "gmp" ? [`Airport: ${valueOf(a, "airport")}${ride ? ` → ${ride}` : ""}`]
    : airport === "none" ? ["No airport, arrives by train or ferry"]
      : airport === "unknown" ? ["Airport: not sure yet (ICN or GMP)"] : [];
  const wear = hanbok ? [hanbok] : [];
  const singles = [plan, top, timing, food, airportLine, wear];

  // 서버는 13줄까지만 받는다. 남은 줄은 여러 개 고르는 목록에 나눈다 (share)
  const [areaL, tasteL, intoL, visitL, eatL, shopL] = share([
    areaLines,
    pack("Taste: ", valuesOf(a, "famous").concat(valuesOf(a, "era"))),
    pack("Into: ", valuesOf(a, "interests")),
    pack("Must visit: ", splitPlaces(a.place?.[0] ?? "")),
    pack("Must eat: ", valuesOf(a, "foods")),
    pack("Shopping: ", valuesOf(a, "buy")),
  ], 13 - singles.flat().length);
  const styles = [...plan, ...top, ...areaL, ...tasteL, ...intoL, ...visitL, ...eatL, ...timing, ...food, ...airportLine, ...wear, ...shopL];

  const kids = valuesOf(a, "kids");
  const whoValue = valueOf(a, "who");
  const transport = valueOf(a, "transport");
  const stay = first(a, "stay");
  const stayNear = valueOf(a, "stayArea") ?? typed(a, "stayArea");
  const dayStart = valueOf(a, "start");
  const dayEnd = valueOf(a, "end");
  const allergyOther = typed(a, "allergy");
  const allergies = [...valuesOf(a, "allergy"), ...(allergyOther ? [`Allergy: ${allergyOther}`.slice(0, 40)] : [])];

  return {
    destinations: [...OPEN_PLACES],
    startDate: start,
    durationDays: nights(start, end) + 1,
    travelers: who === "solo" ? 1 : who === "couple" ? 2 : Number(a.travelers?.[0]),
    budgetRange: valueOf(a, "budget"),
    budgetCurrency: first(a, "currency") ?? defaultCurrency(lang),
    styles,
    audience: whoValue && kids.length ? `${whoValue} (${kids.join(", ")})` : whoValue,
    pace: valueOf(a, "pace"),
    visitedBefore: valueOf(a, "visited"),
    transport: transport && first(a, "subway") === "new" ? `${transport}, new to the subway` : transport,
    stayArea: stay === "booked" ? (stayNear ? `Booked near ${stayNear}`.slice(0, 40) : "Booked")
      : stay === "open" ? "Not booked yet, suggest an area" : undefined,
    dayRhythm: dayStart && dayEnd ? `Starts ${dayStart}, ends ${dayEnd}` : undefined,
    occasion: undefined,
    avoid: [...valuesOf(a, "avoid"), ...(typed(a, "avoid") ? [typed(a, "avoid")] : [])].slice(0, 8),
    // 알레르기를 자세히 골랐으면 그쪽을 보낸다. 알레르기가 맨 앞 — 서버는 12개까지만 받는다.
    // 매운 음식은 러프에서는 '맞춰야 할 것', 디테일에서는 '먹는 건 어때요?'에서 온다 — 겹치면 한 번만
    dietary: [...new Set([
      ...allergies,
      ...valuesOf(a, "needs").filter((v) => !(v === "Food allergy" && allergies.length)),
      ...(spicy === "none" ? [valueOf(a, "spicy") as string] : []),
    ])].slice(0, 12),
    language: first(a, "language") ?? lang,
  };
}
