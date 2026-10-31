import type { Pair } from "./content";

/**
 * 사진 대장 — 새 랜딩에 쓰는 서울 사진(만든 20장 — 지금 18장, 다시 만든 2장은 받는 대로 더함)과, 사진마다 쓰는 자리 (써니 2026-10-30).
 *
 * 규칙 (photo-ledger.test.ts 가 지킨다)
 * - **같은 사진은 사이트에서 한 곳에만 쓴다.** 사진 하나에 자리 하나, 자리 하나에 사진 하나.
 * - 화면에서는 photos.ts 의 photo("자리") 로만 꺼낸다. 자리 이름은 코드 전체에서 딱 한 번만 나와야 한다.
 * - 남산타워가 보이는 사진은 이 20장에 없다 — 남산이 두 번 보이지 않게.
 * - slot 이 null 인 사진은 아직 안 쓰는 사진이다. 결과 화면 등에 쓸 때 여기서 자리를 정한다.
 *
 * 사진: 힉스필드 GPT Image 2.5 (flare · medium · 1k · 3:2), 1024×688.
 * 원본 PNG 는 써니 맥 .impeccable/plates/seoul-landing (받는 스크립트: .impeccable/plates/download-seoul-landing.sh).
 * 만들 때 지킨 것: 남산타워 없음 · 간판 글씨는 흐려서 안 읽힘 · 가게·브랜드 이름 없음 · 사람은 작게, 얼굴 안 보이게.
 */

/** 사진을 쓰는 자리. 새 자리가 생기면 여기에 더하고, 대장에서 사진 하나를 그 자리에 정한다 */
export const SLOTS = [
  "hero.lock", // 첫 화면 오른쪽 — 잠금화면 배경
  "samples.s1", // 샘플 카드 1 — 혼자 · 서울 3일
  "samples.s3", // 샘플 카드 3 — 아이와 함께 · 서울 4일
  "example.bukchon", // 예시 칸 — '북촌 골목과 광장시장' 안의 작은 사진
  "example.seongsu", // 예시 칸 — 무료로 연 '성수 카페와 서울숲 노을' 안, 첫 정거장 사진
  "example.hanRiver", // 예시 칸 — '여의도 한강과 남산 야경' 안의 작은 사진
  "example.euljiro", // 예시 칸 — '을지로 골목과 오래된 술집' 안의 작은 사진
] as const;

export type Slot = (typeof SLOTS)[number];

export type LedgerPhoto = {
  /** 파일 이름 — public/mohallae/seoul/<id>.jpg */
  id: string;
  /** 지역 */
  area: string;
  /** 화면 낭독기용 설명 (장식으로만 쓰는 자리에서는 빈 alt 를 쓴다) */
  alt: Pair<string>;
  /** 쓰는 자리. null 이면 아직 안 쓴다 */
  slot: Slot | null;
  /** 칸에 맞춰 잘릴 때 보여 줄 곳 (CSS object-position). 없으면 가운데 */
  position?: string;
  /** 남산타워가 보이는 사진. 사이트 전체에 한 장까지만 */
  tower?: true;
};

export const SEOUL_PHOTOS: LedgerPhoto[] = [
  // 경복궁·서촌
  {
    id: "gyeonghoeru",
    area: "경복궁·서촌",
    alt: { ko: "경복궁 경회루와 연못, 뒤로 보이는 인왕산", en: "Gyeonghoeru Pavilion and its pond at Gyeongbokgung, Inwangsan behind" },
    slot: "samples.s1",
  },
  {
    id: "seochon-inwangsan",
    area: "경복궁·서촌",
    alt: { ko: "서촌 골목 너머로 보이는 인왕산", en: "Inwangsan rising beyond a Seochon alley" },
    slot: null,
  },
  // 북촌·삼청동
  {
    id: "bukchon-lane",
    area: "북촌·삼청동",
    alt: { ko: "북촌 한옥 지붕 사이로 내려가는 골목", en: "A downhill lane between hanok roofs in Bukchon" },
    slot: "example.bukchon",
  },
  {
    id: "samcheong-wall",
    area: "북촌·삼청동",
    alt: { ko: "은행나무가 물든 삼청동 돌담길", en: "Yellow ginkgo trees along a stone wall in Samcheong-dong" },
    slot: null,
  },
  {
    id: "hanok-courtyard",
    area: "북촌·삼청동",
    alt: { ko: "한옥 마당과 툇마루", en: "A hanok courtyard and its wooden veranda" },
    slot: null,
  },
  // 종로·인사동
  {
    id: "insadong-teahouse",
    area: "종로·인사동",
    alt: { ko: "인사동 골목 안 찻집 마당", en: "A teahouse courtyard off an Insa-dong alley" },
    slot: null,
  },
  {
    id: "jongmyo-wall",
    area: "종로·인사동",
    alt: { ko: "단풍 든 종묘 돌담길", en: "The stone wall path by Jongmyo Shrine in autumn" },
    slot: null,
  },
  // 을지로·동대문
  {
    id: "euljiro-alley",
    area: "을지로·동대문",
    alt: { ko: "불이 켜진 저녁 을지로 골목", en: "An Euljiro alley lit up in the evening" },
    slot: "example.euljiro",
  },
  {
    id: "heunginjimun-night",
    area: "을지로·동대문",
    alt: { ko: "불 밝힌 흥인지문(동대문)", en: "Heunginjimun Gate lit up at dusk" },
    // 밤하늘이 위에 있어 잠금화면의 흰 글씨가 잘 읽힌다. 세로로 잘려도 문 한가운데가 남는다
    slot: "hero.lock",
  },
  // 성수·서울숲
  {
    id: "seoulforest-ginkgo",
    area: "성수·서울숲",
    alt: { ko: "서울숲 은행나무길", en: "The ginkgo path in Seoul Forest" },
    slot: null,
  },
  {
    id: "seongsu-courtyard",
    area: "성수·서울숲",
    alt: { ko: "붉은 벽돌 공장을 고친 성수 카페 마당", en: "A café courtyard in a red-brick former factory in Seongsu" },
    slot: "example.seongsu",
  },
  {
    id: "seoulforest-bridge",
    area: "성수·서울숲",
    alt: { ko: "서울숲 연못 위 나무다리", en: "A wooden bridge over a pond in Seoul Forest" },
    slot: null,
  },
  // 홍대·연남
  {
    id: "yeonnam-street",
    area: "홍대·연남",
    alt: { ko: "작은 가게가 늘어선 연남동 골목", en: "A Yeonnam-dong lane of small shops and cafés" },
    slot: null,
  },
  // 이태원·한남
  {
    id: "hannam-gallery",
    area: "이태원·한남",
    alt: { ko: "갤러리가 들어선 한남동 언덕길", en: "A sloping street of galleries in Hannam-dong" },
    slot: null,
  },
  {
    id: "itaewon-rooftop",
    area: "이태원·한남",
    alt: { ko: "노을 진 이태원 언덕 동네", en: "Itaewon's hillside rooftops at sunset" },
    slot: null,
  },
  // 한강
  {
    id: "banpo-fountain",
    area: "한강",
    alt: { ko: "밤의 반포대교 무지개분수", en: "The Banpo Bridge rainbow fountain at night" },
    slot: "example.hanRiver",
  },
  {
    id: "ttukseom-bike",
    area: "한강",
    alt: { ko: "뚝섬 한강공원 자전거길", en: "The riverside bike path at Ttukseom Hangang Park" },
    slot: null,
  },
  // 잠실
  {
    id: "olympic-lonetree",
    area: "잠실",
    alt: { ko: "올림픽공원 나홀로나무", en: "The lone tree in Olympic Park" },
    slot: "samples.s3",
  },
];

// 다시 만든 2장 — 써니 맥에서 받으면(.impeccable/plates/download-seoul-landing-2.sh) 대장에 더한다.
// 홍대 거리 공연: 앞사람이 크게 나와서 사람을 작게 다시 만듦 · 몽촌토성: 평화의 문 사진에 오륜 마크(상표)가 보여서 바꿈
