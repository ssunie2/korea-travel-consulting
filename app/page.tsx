import Link from "next/link";
import Image from "next/image";
import { Instrument_Serif } from "next/font/google";
import { seoulWeather } from "@/lib/weather";
import { t } from "@/lib/copy";
import DayPattern, { BackgroundMotifs } from "@/components/DayPattern";
import namsan from "@/public/landing/namsan.webp";
import bukchon from "@/public/landing/bukchon.webp";
import gwangjangMarket from "@/public/landing/gwangjang-market.webp";
import hanRiver from "@/public/landing/han-river.webp";
import gyeongbokgung from "@/public/landing/gyeongbokgung.webp";

// 표제용 서체. layout.tsx 를 건드리지 않으려고 이 화면에서만 불러온다.
const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

// 서울 현재 시각에 맞춰 하늘이 바뀐다. 미리 만들어두면 늘 같은 하늘이 나온다.
export const dynamic = "force-dynamic";

/** 서울 시각. 손님이 어디서 접속하든 기준은 한국이다 — 여행지가 여기니까. */
function seoulNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { label: `${get("hour")}:${get("minute")}` };
}

// 보이고 감추는 것은 CSS로만 준다. 자바스크립트가 없어도 그림은 그대로 나온다.
const MOTION = `
.ktc-tip { display: none }
.ktc-route:has(#ktc-day-1:checked) .ktc-tip-1,
.ktc-route:has(#ktc-day-2:checked) .ktc-tip-2,
.ktc-route:has(#ktc-day-3:checked) .ktc-tip-3,
.ktc-route:has(#ktc-day-4:checked) .ktc-tip-4 { display: block }
@media (min-width: 768px) {
  .ktc-route:has(#ktc-day-1:checked) .ktc-tip-1,
  .ktc-route:has(#ktc-day-2:checked) .ktc-tip-2,
  .ktc-route:has(#ktc-day-3:checked) .ktc-tip-3,
  .ktc-route:has(#ktc-day-4:checked) .ktc-tip-4 { display: grid }
}
/*
  카드가 넘어가는 모양. **꺾지 않되 밋밋하지도 않게.**

  처음엔 튕기는 맛을 주려고 55% 에서 아래로 눌렀다가 올리고, 88% 에서 되돌아오게 했다.
  **방향이 꺾이는 지점마다 눈에 걸린다** — 스크롤로 도는 애니메이션이라 손가락은 계속
  한 쪽으로 가는데 그림만 반대로 가서 어긋난다. 그래서 다섯 값 전부 한 방향으로만 두되,
  꺾는 대신 **두 가지로 성격을 낸다.**

  하나, **속도를 고르지 않게.** 22% 지점에서 회전은 벌써 갈 길의 27% 를 갔는데 위치는 4% 뿐이다 —
  제자리에서 기울기만 하다가 마지막에 확 빠진다. 고르게 움직이면 부드럽긴 해도 볼 게 없다.

  둘, **옆으로 민다.** 네 장 모두 같은 쪽(왼쪽)으로 나간다. 가로로 26% 가는 동안
  세로로는 3.5% 만 움직여서, 들려서 사라지는 게 아니라 옆으로 넘겨지는 것으로 읽힌다.
  기울기 5도는 넘길 때 손끝이 한쪽을 미는 느낌을 내려고 남겨둔 것이다.
*/
@keyframes ktc-deck-lift {
  0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1 }
  22% { transform: translate(-1.2%, -.2%) rotate(-.8deg) scale(.997); opacity: 1 }
  55% { transform: translate(-6%, -1%) rotate(-2.4deg) scale(.986); opacity: 1 }
  100% { transform: translate(-26%, -3.5%) rotate(-5deg) scale(.95); opacity: 0 }
}
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .ktc-deck {
      height: calc(100vh + 310vh);
      view-timeline-name: --ktc-deck;
      view-timeline-axis: block;
    }
    .ktc-deck-sticky { position: sticky; top: 3rem }
    .ktc-deck-card {
      transform-origin: 50% 85%;
      animation: ktc-deck-lift linear forwards;
      animation-timeline: --ktc-deck;
      animation-range: contain var(--ktc-from) contain var(--ktc-to);
    }
  }
}
/*
  문양이 뜰 때. 그냥 켜면 툭 나타나서 딱딱하다.
  **작게 돌아가 있다가 제자리로 펴지면서** 나타난다 — 둥근 문양이라 회전이 자연스럽게 읽힌다.

  자리잡기(가운데 정렬)는 바깥 span 의 transform 이 맡고 있어서 건드리면 안 된다.
  그래서 움직임은 **안쪽 svg** 에만 준다. 둘을 나눠두면 서로 덮어쓰지 않는다.

  나타날 때(.55s)를 사라질 때(.28s)보다 길게 뒀다. 새로 고른 것이 주인공이고
  물러나는 쪽이 꾸물대면 두 개가 겹쳐 보인다.
*/
.ktc-mark { transition: opacity .28s ease }
.ktc-mark svg {
  transform: scale(.62) rotate(-32deg);
  transition: transform .3s ease;
}
.group:has(:checked) .ktc-mark { transition: opacity .45s ease }
.group:has(:checked) .ktc-mark svg {
  transform: none;
  /* 끝에서 살짝 느려지며 놓이는 곡선. 기계적으로 도착하지 않는다 */
  transition: transform .55s cubic-bezier(.16, 1, .3, 1);
}
@media (prefers-reduced-motion: reduce) {
  .ktc-mark, .ktc-mark svg,
  .group:has(:checked) .ktc-mark,
  .group:has(:checked) .ktc-mark svg { transition: none }
  .ktc-mark svg { transform: none }
}
`;

/**
 * 진행 방식 세 단계.
 *
 * 설명글을 **두 도막으로 나눠 들고 있다.** 앞은 무엇을 주는지, 뒤는 그래서 어떻다는 것이다.
 * 한 줄로 이어두면 브라우저가 자리 나는 대로 끊어서 "판단하실" 이 "판 / 단하실" 로 갈라졌다.
 * 마침표 자리에서 우리가 끊어주면 그런 일이 없고, 읽는 사람도 두 가지를 따로 받는다.
 */
/**
 * 원화 기호 하나. **쓰는 서체에 ₩(U+20A9)가 없어서** 브라우저가 다른 서체로 대신 그린다.
 * 그 대신 그리는 서체의 ₩ 는 옆에 오는 숫자와 키가 안 맞는다 — 브라우저에서 재보니
 * Geist Mono 옆에서는 **20% 크고**, Instrument Serif 옆에서는 **24% 작다.**
 * (₩ 는 늘 같은 서체에서 오는데 숫자 쪽 서체가 달라서 방향이 반대로 나온다)
 *
 * 그래서 자리마다 잰 값을 넣어 키를 맞춘다. ₩ 는 베이스라인에 앉는 글자라
 * 크기만 줄이고 늘리면 밑선은 그대로 맞는다.
 *
 * 숫자는 안 감싼다 — 감싸면 서체에 있는 글자까지 건드리게 되고, 고칠 이유가 없다.
 */
function Won({ scale }: { scale: number }) {
  return <span style={{ fontSize: `${scale}em` }}>₩</span>;
}

/** 모노 서체 옆에서 쓰는 값. 12px 기준으로 ₩ 잉크 12px, 숫자 10px 이었다 */
const WON_MONO = 0.833;
/** 명조 서체 옆. 28px 기준으로 ₩ 16px, 숫자 21px 이었다 */
const WON_SERIF = 1.313;

const steps = [
  {
    title: t({ ko: "여행 정보를 알려주세요", en: "Tell us about your trip" }),
    body: t({
      ko: ["날짜, 기간, 동행, 관심사.", "2분이면 되고 가입도 필요 없습니다."],
      en: ["Dates, how long, who's coming, what you're into.", "Two minutes, no account."],
    }),
  },
  {
    title: t({ ko: "무료 초안을 받으세요", en: "Get a free draft" }),
    body: t({
      ko: ["일자별 개요와 컨시어지 팁 하나.", "나머지가 어떨지 판단하실 수 있습니다."],
      en: ["A day-by-day outline, plus one concierge tip", "so you can judge the rest."],
    }),
  },
  {
    title: t({ ko: "전체 일정을 받으세요", en: "Get the full plan" }),
    // 값은 제목 옆에 붙는다. 셋 중 이 단계에만 있다.
    price: (
      <>
        <Won scale={WON_MONO} />
        150,000
      </>
    ),
    body: t({
      ko: ["모든 정거장에 팁이 붙고,", "시간을 효율적으로 쓸 수 있게 동선을 짜드립니다."],
      en: ["A tip at every stop,", "and a route that makes good use of your time."],
    }),
  },
];

const free = t({
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
});

/* 규칙 6번(#28): 예약 대행·통역은 쓰지 않는다. 우리는 알려주고, 예약은 손님이 한다. */
/**
 * 유료 항목. **글자 하나면 한 줄, 둘이면 아랫줄에 작게 붙는다.**
 *
 * 전에는 `팁 — 건너뛸 것` 처럼 줄표로 이어 붙였는데, 줄이 넘치면 줄표 뒤가
 * 아무 데나 걸쳐서 두 도막이 한 덩어리로 뭉개졌다. 줄표를 빼고 아예 줄을 나눈다.
 * 뒷도막은 앞도막을 풀어 주는 말이라 한 단계 작게 둔다.
 */
const paid = t<(string | [string, string])[]>({
  ko: [
    ["모든 정거장에 팁", "건너뛸 것, 현지인은 어떻게 하는지"],
    "숙소 다섯 곳과 식당 다섯 곳, 고른 이유까지",
    "비용 항목별 분해, 동선과 시간 계산",
    ["무엇을 언제 예약하면 되는지", "한국 전화로만 받는 곳까지"],
  ],
  en: [
    ["A tip on every stop", "what to skip, what locals do"],
    "Five stays and five restaurants, with reasons",
    "Costs broken down, routes and timing worked out",
    ["Exactly what to book and when", "including the places that only take Korean phone reservations"],
  ],
});

/** 클로드 시안에서 고른 사진 다섯 장. 밝은 장면부터 차례로 보여준다. */
const HERO_CARDS = [
  {
    src: namsan,
    number: "01",
    place: t({ ko: "남산", en: "Namsan" }),
    localName: t({ ko: "NAMSAN", en: "남산" }),
    line: t({ ko: "서울의 능선을 따라", en: "Above Seoul's ridgelines" }),
    alt: t({ ko: "파란 하늘 아래 남산과 N서울타워", en: "Namsan and N Seoul Tower beneath a blue sky" }),
  },
  {
    src: bukchon,
    number: "02",
    place: t({ ko: "북촌", en: "Bukchon" }),
    localName: t({ ko: "BUKCHON", en: "북촌" }),
    line: t({ ko: "한옥 골목 사이로", en: "Through the hanok lanes" }),
    alt: t({ ko: "한옥 골목 사이로 보이는 남산", en: "Namsan seen between the hanok lanes of Bukchon" }),
  },
  {
    src: gwangjangMarket,
    number: "03",
    place: t({ ko: "광장시장", en: "Gwangjang Market" }),
    localName: t({ ko: "GWANGJANG", en: "광장시장" }),
    line: t({ ko: "시장 불빛과 한 끼", en: "Market lights and a warm meal" }),
    alt: t({ ko: "따뜻한 조명 아래 손님들이 앉아 있는 광장시장", en: "Diners seated beneath warm lights at Gwangjang Market" }),
  },
  {
    src: hanRiver,
    number: "04",
    place: t({ ko: "한강", en: "Han River" }),
    localName: t({ ko: "HAN RIVER", en: "한강" }),
    line: t({ ko: "해 질 무렵 강변에서", en: "By the river at sunset" }),
    alt: t({ ko: "노을 진 한강의 반포대교와 남산", en: "Banpo Bridge and Namsan at sunset over the Han River" }),
  },
  {
    src: gyeongbokgung,
    number: "05",
    place: t({ ko: "경복궁", en: "Gyeongbokgung" }),
    localName: t({ ko: "GYEONGBOKGUNG", en: "경복궁" }),
    line: t({ ko: "밤의 궁궐 지붕", en: "Palace roofs after dark" }),
    alt: t({ ko: "불이 켜진 경복궁과 어두운 산", en: "Illuminated Gyeongbokgung Palace beneath a dark mountain" }),
  },
];

/**
 * 누르는 자리. `x` 는 화면 폭의 몇 %인지다 — 넓은 화면과 폰 장면이
 * 같은 비율로 정거장을 놓기 때문에 이 한 벌로 둘 다 덮는다.
 */
const STATIONS = [
  // 양끝 여백 125, 정거장 사이 250. 끝을 좁혀 선이 화면 밖으로 이어지는 느낌을 남긴다
  { day: 1, x: 125, en: "INCHEON", ko: "인천공항", enSub: "인천공항", koSub: "INCHEON" },
  { day: 2, x: 375, en: "GYEONGBOKGUNG", ko: "경복궁", enSub: "경복궁", koSub: "GYEONGBOKGUNG" },
  { day: 3, x: 625, en: "BUKCHON", ko: "북촌", enSub: "북촌", koSub: "BUKCHON" },
  { day: 4, x: 875, en: "NAMSAN", ko: "남산", enSub: "남산", koSub: "NAMSAN" },
];

/**
 * 랜딩에 보여주는 맛보기 팁. **우리가 무엇을 파는지 설명하는 대신 하나를 그냥 보여준다.**
 *
 * 규칙 6장(#28) — 우리는 알려주기만 하고 예약은 손님이 한다.
 * 네 개 다 "가서 무엇을 하라"가 아니라 "가기 전에 알았으면 하는 것"이다.
 */
const TIPS = [
  {
    day: 1,
    // 줄 위치를 직접 잡은 하나. 낱말 단위로 끊어도 "첫 한 시간이 남은 / 나흘을" 이 되는데,
    // "첫 한 시간이" 와 "남은 나흘" 이 서로 대비되는 문장이라 거기서 끊어야 뜻이 산다.
    headline: t({
      ko: (
        <>
          첫 한 시간이
          <br />
          남은 나흘을 정합니다.
        </>
      ),
      en: (
        <>
          The first hour
          <br />
          decides the next four days.
        </>
      ),
    }),
    place: t({ ko: "인천공항", en: "Incheon Airport" }),
    dont: t({ ko: "공항 환전소에서 현금을 다 바꾼다.", en: "Change all your cash at the airport counter." }),
    do: t({
      ko: "공항 환율이 한국에서 제일 나쁩니다. 들어오는 교통비만 바꾸고 나머지는 카드로 쓰세요 — 시장 노점까지 거의 다 받습니다. 온 김에 편의점에서 티머니 카드를 사두면 전국 버스와 지하철에서 그대로 씁니다.",
      en: "Airport rates are the worst you'll see in Korea. Change just enough for the ride in, then pay by card — almost everywhere takes it, down to market stalls. Pick up a T-money card at any convenience store while you're there; it works on every bus and subway in the country.",
    }),
  },
  {
    day: 2,
    // "하나만 어긋나도" 가 조건, "하루가 통째로" 가 결과다. 그 사이에서 끊는다.
    headline: t({
      ko: (
        <>
          하나만 어긋나도
          <br />
          하루가 통째로 바뀝니다.
        </>
      ),
      en: (
        <>
          One detail
          <br />
          can reroute a whole day.
        </>
      ),
    }),
    place: t({ ko: "경복궁", en: "Gyeongbokgung Palace" }),
    dont: t({ ko: "화요일 오전 10시, 여기서 시작.", en: "Tuesday morning, 10:00 — start here." }),
    do: t({
      ko: "화요일은 휴관입니다. 수요일에 가시고, 한복을 입으세요. 대여점이 정문 바로 앞에 있고 한복을 입으면 입장료가 무료입니다.",
      en: "It's closed on Tuesdays. Go Wednesday — and wear hanbok. The rental shops are right outside the gate, and wearing it makes admission free.",
    }),
  },
  {
    day: 3,
    // "누군가의 대문" 은 한 덩어리라 갈라지면 안 된다. 앞마디에서 끊는다.
    headline: t({
      ko: (
        <>
          어떤 골목은
          <br />
          누군가의 대문 앞입니다.
        </>
      ),
      en: (
        <>
          Some streets
          <br />
          are someone&rsquo;s front door.
        </>
      ),
    }),
    place: t({ ko: "북촌한옥마을", en: "Bukchon Hanok Village" }),
    dont: t({ ko: "사람 없는 사진을 찍으려고 아침 8시에 간다.", en: "Arrive at 8am for empty photos." }),
    do: t({
      ko: "사람이 사는 동네라 관람 시간이 정해져 있습니다 — 대략 10시부터 17시까지, 주요 골목은 일요일에 닫습니다. 그 시간 안에 오시고 목소리만 낮춰주시면 환영받습니다.",
      en: "People live here, so the lanes have posted visiting hours — roughly 10:00 to 17:00, and the main alley closes to visitors on Sundays. Come inside those hours, keep your voice down, and you'll be welcome.",
    }),
  },
  {
    day: 4,
    // 장소("마지막 정거장에서")와 그 장소에서 벌어지는 일("제일 많이 헤맵니다")을 갈라 놓는다.
    headline: t({
      ko: (
        <>
          마지막 정거장에서
          <br />
          제일 많이 헤맵니다.
        </>
      ),
      en: (
        <>
          The last stop
          <br />
          is the one people get wrong.
        </>
      ),
    }),
    place: t({ ko: "남산 · N서울타워", en: "Namsan & N Seoul Tower" }),
    dont: t({ ko: "타워 입구까지 택시를 탄다.", en: "Take a taxi to the tower entrance." }),
    do: t({
      ko: "남산은 자가용이 못 올라갑니다. 명동에서 케이블카를 타거나 01·02·05번 버스를 타야 합니다 — 올라갈 수 있는 건 그것뿐입니다. 해 지기 전에 올라가서 어두워진 뒤에 내려오시면 낮과 밤을 한 번에 봅니다.",
      en: "Private cars can't drive up Namsan. Your options are the cable car from Myeongdong or the 01, 02 and 05 buses — those are the only vehicles allowed. Go up before sunset and come down after dark; you get both views for one trip.",
    }),
  },
];

/**
 * 장면 한 벌. 넓은 화면과 폰이 좌표계 폭만 다르게 쓴다.
 *
 * 폭을 460 으로 좁히면 같은 높이에 담기는 가로 범위가 줄어, 폰에서 선과 글자가 커진다.
 * 정거장 x 는 두 장면이 **같은 비율**(15 / 42 / 68 / 90%)이다. 누르는 자리는 % 로
 * 한 벌만 얹기 때문에, 비율이 어긋나면 폰에서 손가락이 빗나간다.
 */
type Scene = {
  id: string;
  w: number;
};

const WIDE: Scene = { id: "w", w: 1000 };
const NARROW: Scene = { id: "n", w: 460 };

/**
 * 노선. **그림을 그리지 않는다.**
 *
 * 해·구름·전동차를 빼고 선 하나만 남겼다. 지하철 안내 표지가 하는 방식이고,
 * 역 이름과 지역명은 그림이 아니라 **글자**가 맡는다(아래 HTML 이 그린다).
 * 지나가던 전동차도 뺐다 — 그 자리는 이제 고른 날짜의 전통 문양이 쓴다.
 */
function MetroScene({ scene, className }: { scene: Scene; className: string }) {
  return (
    <svg
      viewBox={`0 0 ${scene.w} 220`}
      className={className}
      role="img"
      aria-label="A subway line. DAY 1 through DAY 4 are the stations."
    >
      {/* 노선 — 10px 이던 것을 2.5px 로. 굵기가 유아틱함의 절반이었다 */}
      <line x1="0" y1="120" x2={scene.w} y2="120" stroke="var(--c-text)" strokeWidth="2.5" />
    </svg>
  );
}

export default async function Home() {
  const now = seoulNow();
  const weather = await seoulWeather();

  return (
    <div
      className={`${display.variable} flex-1 bg-[var(--c-bg)] text-[var(--c-text)] font-[family-name:var(--font-geist-sans)] selection:bg-[var(--c-accent)] selection:text-[var(--c-bg)]`}
    >
      <style dangerouslySetInnerHTML={{ __html: MOTION }} />
      <BackgroundMotifs />
      <div className="relative z-[1]">
      {/* ── 역명판 + 하늘 ─────────────────────────────── */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-8 md:grid-cols-[1.05fr_.95fr] md:items-start md:gap-14 md:pt-12 md:[&>div:first-child]:sticky md:[&>div:first-child]:top-12">
          {/*
            왼쪽 글 칸을 카드와 같은 높이(top-12 = 48px)에 고정한다.
            전에는 12vh(900px 화면에서 108px)였다 — 카드 윗선보다 60px 아래라
            둘이 어긋나 보였다. **카드의 .ktc-deck-sticky 도 top: 3rem(48px)이므로
            둘 중 하나를 고치면 다른 쪽도 같이 맞춰야 한다.**
          */}
          <div>
            {/* 상호. 역명판의 역명 자리다 — 동그라미(역번호)는 빼고 이름만 남겼다 */}
            <div>
              <p className="font-[family-name:var(--font-geist-sans)] text-[1.6rem] font-semibold lowercase leading-none tracking-[-0.035em] text-[var(--c-text)]">
                mohallae
              </p>
              <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[0.65rem] tracking-[0.18em] text-[var(--c-text-3)]">
                모할래? <span aria-hidden className="mx-1 text-[var(--c-text-4)]">·</span>
                <span className="lowercase">what shall we do?</span>
              </p>
            </div>

            {/*
              제목만 조금 굵게. **굵은 서체로 바꾸지 않고 획을 두껍게 한다** —
              쓰는 명조 계열은 굵은 획이 따로 없어서, 굵게 지정하면 브라우저가
              억지로 늘려 뭉개진 글자가 된다. 획을 0.8px 키우면 서체 모양은 그대로다.
            */}
            <h1
              className="mt-12 font-[family-name:var(--font-display)] text-[clamp(2.25rem,5.4vw,3.875rem)] leading-[1.24] tracking-tight"
              style={{ wordSpacing: ".16em", WebkitTextStroke: "0.8px currentColor" }}
            >
              <span className="whitespace-nowrap">
                {t({ ko: "한국에 ", en: "Plan Korea like you know " })}
                <span
                  className="inline-block whitespace-nowrap text-[var(--c-accent)]"
                  style={{
                    fontFamily: '"AppleMyungjo", "Nanum Myeongjo", Georgia, "Times New Roman", serif',
                    wordSpacing: "normal",
                    textDecorationLine: "underline",
                    textDecorationColor: "#C29338",
                    textDecorationThickness: "3px",
                    textUnderlineOffset: ".17em",
                    textDecorationSkipInk: "none",
                  }}
                >
                  {t({ ko: "아는 사람", en: "someone" })}
                </span>
              </span>
              <br />
              <span className="whitespace-nowrap">
                {t({ ko: "있는 것처럼 여행하세요.", en: "who lives here." })}
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--c-text-2)]">
              {t({
                ko: "여행 정보를 알려주시면 일자별 초안을 무료로 만들어 드립니다. 가이드북에 없는 팁 하나가 함께 갑니다.",
                en: "Tell us about your trip and we'll write you a free day-by-day draft — with one tip a guidebook won't give you.",
              })}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Link
                href="/plan"
                className="inline-flex items-center rounded-full bg-[var(--c-text)] px-8 py-3.5 text-base text-[var(--c-bg)] transition-colors hover:bg-[var(--c-accent)] hover:text-[var(--c-bg)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--c-focus)]"
              >
                {t({ ko: "무료 초안 받기", en: "Get your free draft" })}
              </Link>
              <span className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.18em] text-[var(--c-text-3)]">
                {t({ ko: "가입 없음", en: "No account" })}
              </span>
            </div>

            {/* 지금 서울 몇 시인지. 손님은 시차 반대편에 있다 */}
            <p className="mt-7 inline-flex items-center gap-2 border-t border-[var(--c-line-2)] pt-3 font-[family-name:var(--font-geist-mono)] text-[0.7rem] tracking-[0.1em] text-[var(--c-text-3)]">
              {t({ ko: "서울", en: "Seoul" })}{" "}
              <b className="font-semibold tabular-nums text-[var(--c-text)]">{now.label}</b>
              <span aria-hidden>·</span> {t({ ko: "북위 37.5665°", en: "37.5665° N" })}
            </p>

            <p className="mt-3 whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-[0.7rem] uppercase tracking-[0.08em] text-[var(--c-text-3)] sm:tracking-[0.3em]">
              {t({ ko: "서울 지하철 · 4일", en: "Seoul Metro · 4 Days" })}
              {weather.tempC !== null && (
                <>
                  <span aria-hidden className="mx-2 text-[var(--c-text-4)]">·</span>
                  {weather.tempC}°
                </>
              )}
              <span aria-hidden className="mx-2 text-[var(--c-text-4)]">·</span>
              {weather.sky === "clear"
                ? t({ ko: "맑음", en: "Clear" })
                : weather.sky === "cloud"
                  ? t({ ko: "흐림", en: "Cloudy" })
                  : weather.sky === "rain"
                    ? t({ ko: "비", en: "Rain" })
                    : t({ ko: "눈", en: "Snow" })}
            </p>
          </div>

          {/* 밝은 사진부터 시작해 스크롤할 때 한 장씩 걷히는 서울 카드 묶음. */}
          {/*
            md:mt-0 — **PC 에서는 위 여백을 없앤다.** mt-14(56px)가 카드를 처음에
            아래로 밀어놔서, 스크롤을 조금 하면 카드가 스티키 자리(48px)로 올라앉는
            한 번의 움직임이 생겼다. 그 56px 이 화면에 보이던 단차다.
            폰은 카드가 글 아래에 오므로 이 여백이 그대로 필요하다.
          */}
          <div className="ktc-deck mt-14 w-full md:mt-0 md:justify-self-end">
            {/*
              그림자 크기를 화면마다 달리 준다. **카드가 커지면 그림자도 같이 커져야 한다** —
              PC 카드는 폰보다 37% 넓은데 그림자를 14px 로 두면 상대적으로 얇아져
              폰에서 보이던 두께가 PC 에서는 사라진 것처럼 보인다. 카드 폭에 맞춰 같은 비율로 키웠다.
            */}
            <div className="ktc-deck-sticky relative mx-auto aspect-[4/5] w-full max-w-[31rem] shadow-[14px_16px_0_rgba(5,19,16,.58)] md:shadow-[19px_22px_0_rgba(5,19,16,.58)]">
              {HERO_CARDS.map((card, index) => (
                <figure
                  key={card.number}
                  style={{
                    zIndex: HERO_CARDS.length - index,
                    // 0% 부터 시작한다. 전에는 6% 부터라 카드가 제자리에 앉고도
                    // 한참(228px) 스크롤해야 첫 장이 넘어갔다. 네 장이 23% 씩 나눠 갖고
                    // 마지막 8% 는 남은 한 장을 보는 자리로 둔다.
                    ["--ktc-from" as string]: `${index * 23}%`,
                    ["--ktc-to" as string]: `${(index + 1) * 23}%`,
                  }}
                  className={`absolute inset-0 overflow-hidden border border-[var(--c-line-2)] bg-[var(--c-deep)] ${
                    index < HERO_CARDS.length - 1 ? "ktc-deck-card" : ""
                  }`}
                >
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    sizes="(min-width: 768px) 42vw, calc(100vw - 3rem)"
                    className="object-cover"
                    placeholder="blur"
                    preload={index === 0}
                  />
                  <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,27,24,.04)_48%,rgba(10,27,24,.9)_100%)]" />
                  <span className="absolute left-5 top-5 font-[family-name:var(--font-geist-mono)] text-xs tracking-[.2em] text-white/85 sm:left-7 sm:top-7">
                    {card.number}
                  </span>
                  <div aria-hidden className="absolute right-5 top-5 flex gap-1.5 sm:right-7 sm:top-7">
                    {HERO_CARDS.map((_, dot) => (
                      <span key={dot} className={`h-px w-5 ${dot === index ? "bg-[var(--c-accent)]" : "bg-white/40"}`} />
                    ))}
                  </div>
                  <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                    <div className="flex items-end justify-between gap-4 border-b border-white/45 pb-4">
                      <p className="font-[family-name:var(--font-display)] text-4xl leading-none sm:text-5xl">{card.place}</p>
                      <span className="font-[family-name:var(--font-geist-mono)] text-[.62rem] tracking-[.14em] text-white/70">{card.localName}</span>
                    </div>
                    <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[.68rem] tracking-[.08em] text-white/75">{card.line}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>

        <div className="ktc-route mt-14">
          {/* 누르는 자리를 그림 위에 겹쳐야 해서 relative 가 필요하다 */}
          <div className="relative">
            <MetroScene scene={NARROW} className="block h-auto w-full md:hidden" />
            <MetroScene scene={WIDE} className="hidden h-auto w-full md:block" />

            <fieldset className="absolute inset-0 m-0 border-0 p-0">
              <legend className="sr-only">{t({ ko: "날짜를 골라 그 날의 컨시어지 팁을 보세요", en: "Choose a day to preview its concierge tip" })}</legend>
              {STATIONS.map((station) => (
                <label
                  key={station.day}
                  style={{ left: `${station.x / 10}%` }}
                  className="group absolute top-[54.5%] h-[92px] w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer sm:h-[112px] sm:w-28 md:h-[160px] md:w-44"
                >
                  {/*
                    전통 문양 — DAY 글자 위. 원래 전동차가 지나가던 자리다.
                    크기는 그 전동차(주황 타원)의 좁은 폭에서 출발했고, PC 가 답답해 보여 1.5배로 키웠다.
                    폰도 16px 로 올렸다 — 문양이 세 겹이라 11px 에서는 뭉개진다.
                    `opacity` 로만 켜고 끈다. `hidden` 으로 하면 켜질 때 줄이 밀린다.
                  */}
                  <span
                    aria-hidden
                    className="ktc-mark absolute bottom-[calc(50%+28.9px)] left-1/2 h-[24px] w-[24px] -translate-x-1/2 text-[var(--c-accent-soft)] opacity-0 group-has-[:checked]:opacity-100 sm:bottom-[calc(50%+36.8px)] sm:h-[30px] sm:w-[30px] md:bottom-[calc(50%+52.2px)] md:h-[39px] md:w-[39px]"
                  >
                    <DayPattern day={station.day} />
                  </span>

                  {/* 날짜 — 점 위 */}
                  <span className="absolute bottom-[calc(50%+12px)] left-1/2 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-[0.62rem] font-bold leading-none tracking-[0.16em] text-[var(--c-text)] group-has-[:checked]:text-[var(--c-accent)] sm:bottom-[calc(50%+15px)] sm:text-[0.8rem] sm:tracking-[0.2em] md:bottom-[calc(50%+21px)] md:text-[1.2rem]">
                    DAY {station.day}
                  </span>

                  {/* 새로고침하면 늘 DAY 1 이 눌린 채로 시작한다 */}
                  <input
                    id={`ktc-day-${station.day}`}
                    type="radio"
                    name="ktc-day"
                    value={station.day}
                    defaultChecked={station.day === 1}
                    aria-controls={`ktc-tip-${station.day}`}
                    className="peer sr-only"
                  />

                  {/* 역 — 작고 정확한 점. 고른 역에만 가는 테두리가 하나 더 */}
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--c-text)] peer-checked:bg-[var(--c-accent)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--c-focus)] sm:h-3 sm:w-3 md:h-[18px] md:w-[18px]"
                  />

                  {/* 지역 — 점 아래. 그림 대신 글자가 일하는 자리다 */}
                  <span className="absolute top-[calc(50%+12px)] left-1/2 -translate-x-1/2 whitespace-nowrap text-center font-[family-name:var(--font-geist-mono)] text-[0.75rem] leading-none tracking-[0.02em] text-[var(--c-text-3)] sm:top-[calc(50%+15px)] sm:text-[0.65rem] sm:tracking-[0.14em] sm:tracking-[0.14em] md:top-[calc(50%+21px)] md:text-[0.98rem]">
                    {station.en}
                  </span>
                  <span className="absolute top-[calc(50%+27px)] left-1/2 -translate-x-1/2 whitespace-nowrap text-center font-[family-name:var(--font-geist-mono)] text-[0.75rem] leading-none text-[var(--c-text-4)] sm:top-[calc(50%+34.4px)] sm:text-[0.6rem] md:top-[calc(50%+48.7px)] md:text-[0.9rem]">
                    {station.ko}
                  </span>
                </label>
              ))}
            </fieldset>
          </div>

          {/* 선택한 역 아래에 그 DAY의 컨시어지 팁을 보여준다. */}
          <div className="mx-auto max-w-5xl px-6 pb-16 pt-8">
            {TIPS.map((tip) => (
              <figure
                key={tip.day}
                id={`ktc-tip-${tip.day}`}
                aria-live="polite"
                className={`ktc-tip ktc-tip-${tip.day} overflow-hidden rounded-[3px] border border-[var(--c-line-2)] bg-[var(--c-surface)] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.6)] md:grid-cols-[.8fr_1.2fr]`}
              >
                <figcaption className="flex flex-col justify-between gap-8 bg-[var(--c-surface-2)] p-6 text-[var(--c-text)] sm:p-8">
                  <div>
                    <p className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--c-accent-soft)]">
                      {t({ ko: `DAY ${tip.day} · 환승역`, en: `Day ${tip.day} · Transfer here` })}
                    </p>
                    {/*
                      break-keep: 한국어는 기본값이 **글자 아무 데서나 끊는 것**이라
                      "나흘을" 이 "나흘 / 을" 로 갈라진다. 낱말(띄어쓰기) 단위로만 끊게 한다.
                    */}
                    <p className="mt-4 break-keep font-[family-name:var(--font-display)] text-3xl leading-tight sm:text-4xl">
                      {tip.headline}
                    </p>
                  </div>
                  <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.16em] text-[var(--c-accent-dim)]">
                    {t({ ko: `컨시어지 팁 ${String(tip.day).padStart(2, "0")}`, en: `Concierge tip ${String(tip.day).padStart(2, "0")}` })}
                  </span>
                </figcaption>
                <div className="flex flex-col gap-5 bg-[var(--c-bg)] p-6 sm:p-8">
                  <p className="font-[family-name:var(--font-display)] text-2xl leading-snug sm:text-3xl">
                    {tip.place}
                  </p>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex-none rounded bg-[var(--c-accent)] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[0.6rem] font-bold uppercase tracking-wider text-[var(--c-bg)]">
                      {t({ ko: "이렇게 마세요", en: "Don\u2019t" })}
                    </span>
                    <span className="leading-relaxed text-[var(--c-text-4)] line-through">{tip.dont}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex-none rounded bg-[var(--c-focus)] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[0.6rem] font-bold uppercase tracking-wider text-[var(--c-bg)]">
                      {t({ ko: "이렇게 하세요", en: "Do" })}
                    </span>
                    <span className="leading-relaxed">{tip.do}</span>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── how it works ────────────────────────────────── */}
      <section className="border-t border-[var(--c-line-2)]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[var(--c-text-3)]">
            {t({ ko: "진행 방식", en: "How it works" })}
          </h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className="font-[family-name:var(--font-geist-mono)] text-xs text-[var(--c-accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/*
                  값은 **제목 옆에, 제목 절반 크기로.** 제목이 24px 이니 12px 다.
                  baseline 이 아니라 가운데(align-middle)에 맞춘다 — 크기 차이가 두 배라
                  밑줄을 맞추면 값이 바닥에 가라앉아 딸려 붙은 것처럼 보인다.
                */}
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight">
                  {step.title}
                  {"price" in step && (
                    <span className="ml-2 align-middle font-[family-name:var(--font-geist-mono)] text-xs tracking-tight text-[var(--c-text-3)]">
                      {step.price}
                    </span>
                  )}
                </h3>
                {/* break-keep: 한국어가 낱말 가운데서 끊기지 않게. 큰제목과 같은 처리다. */}
                {step.body.map((line, li) => (
                  <p
                    key={li}
                    className={`break-keep leading-relaxed text-[var(--c-text-2)] ${li === 0 ? "mt-2" : "mt-1.5"}`}
                  >
                    {line}
                  </p>
                ))}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── free vs paid ────────────────────────────────── */}
      <section className="border-t border-[var(--c-line-2)] bg-[var(--c-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="break-keep font-[family-name:var(--font-display)] text-3xl leading-tight md:text-4xl">
            {t({
              ko: (
                <>
                  <span className="block">무엇이 무료이고,</span>
                  <span className="block">무엇에 값을 치르는지</span>
                </>
              ),
              en: (
                <>
                  <span className="block">What&rsquo;s free,</span>
                  <span className="block">and what you&rsquo;re paying for</span>
                </>
              ),
            })}
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[var(--c-text-3)]">
                {t({ ko: "무료 초안", en: "Free draft" })}
              </p>
              <ul className="mt-4 space-y-3">
                {free.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    {/* 목록 기호. aria-hidden 은 화면 낭독기가 ul/li 로 이미 목록임을 알리기 때문이다 */}
                    <span aria-hidden className="select-none text-lg leading-relaxed text-[var(--c-text-3)]">
                      •
                    </span>
                    <span className="text-[var(--c-text-2)]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[var(--c-accent)]">
                {t({
                  ko: (
                    <>
                      전체 일정 · <Won scale={WON_MONO} />
                      150,000
                    </>
                  ),
                  en: (
                    <>
                      Full plan · <Won scale={WON_MONO} />
                      150,000
                    </>
                  ),
                })}
              </p>
              <ul className="mt-4 space-y-3">
                {paid.map((item) => {
                  const [head, note] = Array.isArray(item) ? item : [item, null];
                  return (
                    <li key={head} className="flex gap-3 leading-relaxed">
                      <span aria-hidden className="select-none text-lg leading-relaxed text-[var(--c-accent)]">
                        •
                      </span>
                      <span>
                        {head}
                        {/* 풀어 주는 말. 아랫줄에 한 단계 작게 */}
                        {note && <span className="block text-sm">{note}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          {/* 우리는 여행사가 아니다. 이 선을 손님에게도 분명히 해둔다 (규칙 6번) */}
          {/*
            네 도막으로 끊어 읽힌다. **여기가 규칙 6번을 손님에게 밝히는 자리라**
            한 덩어리로 뭉쳐 있으면 "안 한다"는 말이 문단에 묻힌다.
            무엇을 하는지 / 무엇을 안 하는지 / 대금은 안 받는지 / 대신 무엇을 하는지, 넷을 갈랐다.
          */}
          <div className="mt-10 max-w-2xl space-y-1.5 leading-relaxed text-[var(--c-text-3)]">
            {t({
              ko: [
                "저희는 계획을 세우고, 예약은 손님이 하십니다.",
                "숙소·식당·입장권을 대신 예약해 드리거나",
                "그 대금을 받지 않습니다.",
                "— 무엇을 어떻게 예약하면 되는지 알려드립니다.",
              ],
              en: [
                "We plan; you book.",
                "We don't make reservations for you or take payment",
                "for hotels, restaurants or tickets.",
                "— We tell you exactly what to book and how.",
              ],
            }).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── pricing + contact ───────────────────────────── */}
      <section id="pricing" className="scroll-mt-20 border-t border-[var(--c-line-2)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[var(--c-text-3)]">
              {t({ ko: "가격", en: "Pricing" })}
            </p>
            {/*
              두 문장을 각각 한 줄에 놓는다. **줄이 넘치면 줄바꿈 대신 글자가 작아진다.**

              그냥 30px 로 두면 375px 폰에서 제일 긴 줄("전체 일정은 ₩150,000 입니다.")이
              334px 라 327px 인 자리를 6px 넘겨, "전체 일 / 정은" 처럼 낱말 가운데서 잘렸다.

              그 줄의 폭을 재보니 글자 크기의 11.12배다. 그래서 **자리 너비를 11.6 으로 나눈 값**을
              글자 크기로 준다(11.12 대신 11.6 은 서체가 늦게 뜰 때를 위한 여유다).
              이러면 화면이 좁아지는 만큼 글자도 같이 줄어 항상 한 줄에 들어간다.

              폰과 PC 는 자리 너비를 구하는 식이 다르다 — PC 는 2단이라 화면의 절반에서
              여백(24px)과 단 사이(40px)를 뺀다. clamp 의 양 끝은 원래 크기(30px / 36px)를
              넘지 않게, 그리고 너무 작아지지 않게 잡은 것이다.
            */}
            <p className="mt-4 font-[family-name:var(--font-display)] leading-tight text-[clamp(1.25rem,calc((100vw_-_3rem)/11.6),1.875rem)] md:text-[clamp(1.5rem,calc((50vw_-_44px)/11.6),2.25rem)]">
              {t({
                ko: (
                  <>
                    <span className="block">초안은 무료입니다.</span>
                    <span className="block">
                      전체 일정은 <Won scale={WON_SERIF} />
                      150,000 입니다.
                    </span>
                  </>
                ),
                en: (
                  <>
                    <span className="block">The draft is free.</span>
                    <span className="block">The full plan is ₩150,000.</span>
                  </>
                ),
              })}
            </p>
            <div className="mt-4 max-w-md space-y-1.5 leading-relaxed text-[var(--c-text-2)]">
              {t({
                ko: [
                  "여행이 며칠이든 값은 하나입니다.",
                  "처음부터 끝까지 만들어져 나오니",
                  "예약할 통화도, 기다릴 사람도 없습니다.",
                ],
                en: [
                  "One price, however long your trip is.",
                  "It's put together for you start to finish —",
                  "no call to book, nobody to wait on.",
                ],
              }).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
          <div id="contact" className="scroll-mt-20 md:justify-self-end">
            <Link
              href="/plan"
              className="inline-flex items-center rounded-full bg-[var(--c-text)] px-8 py-3.5 text-base text-[var(--c-bg)] transition-colors hover:bg-[var(--c-accent)] hover:text-[var(--c-bg)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--c-focus)]"
            >
              {t({ ko: "무료 초안부터 받아보기", en: "Start with the free draft" })}
            </Link>
            {/* 묻는 말과 누를 곳을 갈라 놓는다. 한 줄에 붙어 있으면 밑줄이 문장 끝에 묻힌다. */}
            <div className="mt-5 space-y-1.5 leading-relaxed text-[var(--c-text-2)]">
              <p>{t({ ko: "먼저 물어보고 싶으신가요?", en: "Rather just ask a question first?" })}</p>
              <p>
                <Link
                  href="/contact"
                  className="underline underline-offset-4 hover:text-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]"
                >
                  {t({ ko: "무엇이든 물어보세요", en: "Ask us anything" })}
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--c-line-2)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 font-[family-name:var(--font-geist-mono)] text-xs text-[var(--c-text-3)] sm:flex-row sm:items-center sm:justify-between">
          {/* 상호는 어디서든 같은 서체로. 크기는 꼬리말 기준(text-xs)을 그대로 물려받는다 */}
          <span className="font-[family-name:var(--font-geist-sans)] font-semibold tracking-[-0.02em]">
            mohallae
          </span>
          <div className="flex gap-5">
            <Link href="/privacy" className="underline-offset-4 hover:underline">
              {t({ ko: "개인정보 처리방침", en: "Privacy" })}
            </Link>
            <span>{t({ ko: "대한민국 서울", en: "Seoul, Korea" })}</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
