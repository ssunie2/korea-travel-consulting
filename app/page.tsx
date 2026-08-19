import Link from "next/link";
import Image from "next/image";
import { Instrument_Serif } from "next/font/google";
import { seoulWeather } from "@/lib/weather";
import { t } from "@/lib/copy";
import DayPattern from "@/components/DayPattern";

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

const steps = [
  {
    title: t({ ko: "여행 정보를 알려주세요", en: "Tell us about your trip" }),
    body: t({ ko: "날짜, 기간, 동행, 관심사. 2분이면 되고 가입도 필요 없습니다.", en: "Dates, how long, who's coming, what you're into. Two minutes, no account." }),
  },
  {
    title: t({ ko: "무료 초안을 받으세요", en: "Get a free draft" }),
    body: t({ ko: "일자별 개요와 컨시어지 팁 하나. 나머지가 어떨지 판단하실 수 있습니다.", en: "A day-by-day outline, plus one concierge tip so you can judge the rest." }),
  },
  {
    title: t({ ko: "전체 일정을 받으세요", en: "Get the full plan" }),
    body: t({ ko: "₩150,000. 모든 정거장에 팁이 붙고, 시간을 가장 덜 버리는 동선으로 짜드립니다.", en: "₩150,000. A tip at every stop, and the route that wastes the least of your time." }),
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
const paid = t({
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
    "Exactly what to book and when — including the places that only take Korean phone reservations",
  ],
});

/**
 * 누르는 자리. `x` 는 화면 폭의 몇 %인지다 — 넓은 화면과 폰 장면이
 * 같은 비율로 정거장을 놓기 때문에 이 한 벌로 둘 다 덮는다.
 */
/**
 * 지나가는 창밖. **없앤 전동차를 대신하는 자리다** — 아래로 스크롤하면 옆으로 흐른다.
 *
 * TODO(출시 전): 지금은 흰 바탕 임시 이미지다. 진짜 사진으로 갈아야 한다.
 * `public/placeholder-seoul-*.svg` 를 같은 이름의 사진으로 바꾸면 된다.
 */
const WINDOW_VIEWS = [
  { src: "/placeholder-seoul-1.svg", en: "GYEONGBOKGUNG", ko: "경복궁", note: t({ ko: "화요일은 닫습니다", en: "Closed on Tuesdays" }) },
  { src: "/placeholder-seoul-2.svg", en: "BUKCHON", ko: "북촌한옥마을", note: t({ ko: "사람이 사는 골목입니다", en: "People live in these lanes" }) },
  { src: "/placeholder-seoul-3.svg", en: "GWANGJANG", ko: "광장시장", note: t({ ko: "좋은 자리는 현금만 받습니다", en: "The best stalls take cash only" }) },
  { src: "/placeholder-seoul-4.svg", en: "NAMSAN", ko: "남산 N서울타워", note: t({ ko: "자가용은 못 올라갑니다", en: "Private cars can't drive up" }) },
];

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
    headline: t({ ko: "첫 한 시간이 남은 나흘을 정합니다.", en: "The first hour decides the next four days." }),
    place: t({ ko: "인천공항", en: "Incheon Airport" }),
    dont: t({ ko: "공항 환전소에서 현금을 다 바꾼다.", en: "Change all your cash at the airport counter." }),
    do: t({
      ko: "공항 환율이 한국에서 제일 나쁩니다. 들어오는 교통비만 바꾸고 나머지는 카드로 쓰세요 — 시장 노점까지 거의 다 받습니다. 온 김에 편의점에서 티머니 카드를 사두면 전국 버스와 지하철에서 그대로 씁니다.",
      en: "Airport rates are the worst you'll see in Korea. Change just enough for the ride in, then pay by card — almost everywhere takes it, down to market stalls. Pick up a T-money card at any convenience store while you're there; it works on every bus and subway in the country.",
    }),
  },
  {
    day: 2,
    headline: t({ ko: "하나만 어긋나도 하루가 통째로 바뀝니다.", en: "One detail can reroute a whole day." }),
    place: t({ ko: "경복궁", en: "Gyeongbokgung Palace" }),
    dont: t({ ko: "화요일 오전 10시, 여기서 시작.", en: "Tuesday morning, 10:00 — start here." }),
    do: t({
      ko: "화요일은 휴관입니다. 수요일에 가시고, 한복을 입으세요. 대여점이 정문 바로 앞에 있고 한복을 입으면 입장료가 무료입니다.",
      en: "It's closed on Tuesdays. Go Wednesday — and wear hanbok. The rental shops are right outside the gate, and wearing it makes admission free.",
    }),
  },
  {
    day: 3,
    headline: t({ ko: "어떤 골목은 누군가의 대문 앞입니다.", en: "Some streets are someone's front door." }),
    place: t({ ko: "북촌한옥마을", en: "Bukchon Hanok Village" }),
    dont: t({ ko: "사람 없는 사진을 찍으려고 아침 8시에 간다.", en: "Arrive at 8am for empty photos." }),
    do: t({
      ko: "사람이 사는 동네라 관람 시간이 정해져 있습니다 — 대략 10시부터 17시까지, 주요 골목은 일요일에 닫습니다. 그 시간 안에 오시고 목소리만 낮춰주시면 환영받습니다.",
      en: "People live here, so the lanes have posted visiting hours — roughly 10:00 to 17:00, and the main alley closes to visitors on Sundays. Come inside those hours, keep your voice down, and you'll be welcome.",
    }),
  },
  {
    day: 4,
    headline: t({ ko: "마지막 정거장에서 제일 많이 헤맵니다.", en: "The last stop is the one people get wrong." }),
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


      {/* ── 역명판 + 하늘 ─────────────────────────────── */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-8 md:grid-cols-[1.05fr_.95fr] md:items-start md:gap-14 md:pt-12">
          <div>
            {/* 상호. 역명판의 역명 자리다 — 동그라미(역번호)는 빼고 이름만 남겼다 */}
            <div>
              <p className="font-[family-name:var(--font-geist-sans)] text-[1.6rem] font-semibold lowercase leading-none tracking-[-0.035em] text-[var(--c-text)]">
                mohallae
              </p>
              <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[0.65rem] tracking-[0.18em] text-[var(--c-text-3)]">
                모할래 <span aria-hidden className="mx-1 text-[var(--c-text-4)]">·</span>
                <span className="uppercase">{t({ ko: "떠나기 전에", en: "Before you fly" })}</span>
              </p>
            </div>

            <h1 className="mt-12 max-w-[15ch] font-[family-name:var(--font-display)] text-[clamp(2.75rem,7vw,5rem)] leading-[0.95] tracking-tight">
              {t({ ko: "한국에 ", en: "Plan Korea like you know " })}
              <span className="text-[var(--c-accent)]">
                {t({ ko: "아는 사람 있는 것처럼", en: "someone who lives here." })}
              </span>
              {t({ ko: " 여행하세요.", en: "" })}
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
                {t({ ko: "가입 없이 · 무료", en: "No account · Free" })}
              </span>
            </div>

            {/* 지금 서울 몇 시인지. 손님은 시차 반대편에 있다 */}
            <p className="mt-7 inline-flex items-center gap-2 border-t border-[var(--c-line-2)] pt-3 font-[family-name:var(--font-geist-mono)] text-[0.7rem] tracking-[0.1em] text-[var(--c-text-3)]">
              {t({ ko: "서울", en: "Seoul" })}{" "}
              <b className="font-semibold tabular-nums text-[var(--c-text)]">{now.label}</b>
              <span aria-hidden>·</span> {t({ ko: "북위 37.5665°", en: "37.5665° N" })}
            </p>
          </div>

          {/* 한옥의 결은 사진으로, 노선의 그래픽은 아래 SVG로 이어 붙인다. */}
          <figure className="ktc-rise relative mx-auto w-full max-w-[31rem] overflow-hidden rounded-[1.75rem] border border-[var(--c-line-2)] bg-[var(--c-deep)] shadow-[0_28px_70px_-28px_rgba(0,0,0,0.7)] md:justify-self-end">
            {/*
              TODO(출시 전): 이 이미지는 **AI 가 만든 그림이지 실제 사진이 아니다.**
              1024×1536(AI 표준 출력 크기), 카메라 정보 전무, 확대하면 사람 형체와
              기와가 뭉개져 있다. 북촌로11길에서 남산을 본 구도를 흉내낸 것이다.

              우리가 파는 게 "실제로 가보면 이렇다"는 정보라서, 첫 화면에 존재하지 않는
              골목을 걸어두면 들키는 순간 무너지는 게 사진 한 장이 아니다.
              **손님을 받기 전에 직접 찍은 사진이나 라이선스가 분명한 실사진으로 바꾼다.**
              선경이 알고 있고, 지금은 자리를 채워두는 용도로만 둔다.
            */}
            {/* 2:3 — 원본 비율 그대로다. 잘리는 데 없이 세로가 길어진다 */}
            <div className="relative aspect-[2/3]">
              <Image
                src="/seoul-blue-hour.jpg"
                alt="A hanok-lined street in Seoul at blue hour, with Namsan Tower in the distance"
                fill
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover"
                preload
                unoptimized
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,22,32,.12)_35%,rgba(8,22,32,.82)_100%)]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-[var(--c-bg)] sm:p-7">
                <div>
                  {/* 사진 위에 얹히는 글이다. 바탕 토큰을 따라가면 안 된다 — 어두운 사진 위에서 안 보인다 */}
                  <p className="max-w-[12ch] font-[family-name:var(--font-display)] text-3xl leading-none text-[var(--c-text)] sm:text-4xl">
                    {t({ ko: "오래된 지붕, 새로운 서울.", en: "Old roofs. New Seoul." })}
                  </p>
                </div>
                <span className="grid h-16 w-16 flex-none place-items-center rounded-full border-2 border-[var(--c-bg)] bg-[var(--c-accent)] text-lg font-bold tracking-[0.12em] shadow-lg">
                  서울
                </span>
              </figcaption>
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-[var(--c-bg)]/90 px-3 py-2 font-[family-name:var(--font-geist-mono)] text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[var(--c-text)] backdrop-blur-sm sm:left-7 sm:top-7">
                <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--c-accent)]" />
                {t({ ko: "현지의 시선", en: "Local view" })}
              </div>
            </div>
          </figure>
        </div>

        <div className="ktc-route mt-14">
          {/* 안내 표지의 머리줄. 노선 이름과 **지금 서울 상태**가 여기 한 줄에 온다 */}
          <div className="mx-auto max-w-6xl px-6">
            <p className="whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-[0.9rem] uppercase tracking-[0.08em] text-[var(--c-text-3)] sm:text-[0.72rem] sm:tracking-[0.3em]">
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
          <div aria-hidden className="mt-3 h-px w-full bg-[var(--c-line-2)]" />

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

                  <input
                    id={`ktc-day-${station.day}`}
                    type="radio"
                    name="ktc-day"
                    value={station.day}
                    defaultChecked={station.day === 2}
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
                    <p className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight sm:text-4xl">
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

      {/* ── 창밖 — 가로로 지나간다 ─────────────────────── */}
      <section
        className="ktc-hstrip relative border-t border-[var(--c-line-2)]"
        aria-label={t({ ko: "서울의 정거장들", en: "Stops around Seoul" })}
      >
        <div className="ktc-hstrip-sticky">
          <div className="ktc-htrack items-center gap-5 px-6 sm:gap-8">
            {WINDOW_VIEWS.map((v, i) => (
              <figure key={v.en} className="ktc-hcard w-[78vw] flex-none sm:w-[52vw] lg:w-[38vw]">
                {/* 역 번호와 선 — 노선도 말투를 여기서도 이어간다 */}
                <div className="flex items-center gap-3">
                  <span className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] tracking-[0.2em] text-[var(--c-accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden className="h-2 w-2 flex-none rounded-full bg-[var(--c-accent)]" />
                  <span aria-hidden className="h-px flex-1 bg-[var(--c-line-2)]" />
                </div>
                {/* unoptimized: 지금 임시 이미지가 SVG 라 그렇다. 진짜 사진(jpg)으로 갈면 이 줄을 지운다 */}
                <Image
                  src={v.src}
                  alt=""
                  width={1600}
                  height={1000}
                  unoptimized
                  className="mt-4 aspect-[8/5] w-full rounded-[3px] object-cover"
                />
                <figcaption className="mt-4">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[0.7rem] uppercase tracking-[0.18em] text-[var(--c-text-3)]">
                    {v.en}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-2xl leading-tight">{v.ko}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--c-text-2)]">{v.note}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
        {/* 지나온 만큼 차오르는 선 */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[var(--c-line-2)]">
          <div className="ktc-hprogress h-full w-full bg-[var(--c-accent)]" />
        </div>
      </section>

      {/* ── how it works — 표를 포개듯 쌓인다 ──────────────── */}
      <section className="ktc-stack border-t border-[var(--c-line-2)]">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 className="ktc-rise font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[var(--c-text-3)]">
            {t({ ko: "진행 방식", en: "How it works" })}
          </h2>
          <ol className="mt-10">
            {steps.map((step, i) => (
              <li
                key={step.title}
                /* --ktc-rev: 뒤로 밀린 정도. 마지막 카드는 0이라 그대로 남는다 */
                style={{
                  ["--ktc-rev" as string]: String(steps.length - 1 - i),
                  ["--ktc-from" as string]: `${(i / steps.length) * 100}%`,
                  ["--ktc-to" as string]: `${((i + 1) / steps.length) * 100}%`,
                }}
                className="sticky top-24 pb-6"
              >
                <div className="ktc-stack-card relative overflow-hidden rounded-[3px] border border-[var(--c-line-2)] bg-[var(--c-surface)] p-7 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.9)] sm:p-9">
                  <span className="font-[family-name:var(--font-geist-mono)] text-xs tracking-[0.2em] text-[var(--c-accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-xl leading-relaxed text-[var(--c-text-2)]">{step.body}</p>
                  {/* 덮이는 막. 뒤로 갈수록 짙어져 앞 카드와 구분된다 */}
                  <div aria-hidden className="ktc-stack-veil pointer-events-none absolute inset-0 bg-[var(--c-bg)] opacity-0" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── free vs paid ────────────────────────────────── */}
      <section className="ktc-rise border-t border-[var(--c-line-2)] bg-[var(--c-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-display)] text-3xl leading-tight md:text-4xl">
            {t({ ko: "무엇이 무료이고, 무엇에 값을 치르는지", en: "What's free, and what you're paying for" })}
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[var(--c-text-3)]">
                {t({ ko: "무료 초안", en: "Free draft" })}
              </p>
              <ul className="mt-4 space-y-3">
                {free.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span aria-hidden className="text-[var(--c-text-3)]">
                      —
                    </span>
                    <span className="text-[var(--c-text-2)]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[var(--c-accent)]">
                {t({ ko: "전체 일정 · ₩150,000", en: "Full plan · ₩150,000" })}
              </p>
              <ul className="mt-4 space-y-3">
                {paid.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span aria-hidden className="text-[var(--c-accent)]">
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* 우리는 여행사가 아니다. 이 선을 손님에게도 분명히 해둔다 (규칙 6번) */}
          <p className="mt-10 max-w-2xl leading-relaxed text-[var(--c-text-3)]">
            {t({
              ko: "저희는 계획을 세우고, 예약은 손님이 하십니다. 숙소·식당·입장권을 대신 예약해 드리거나 그 대금을 받지 않습니다 — 무엇을 어떻게 예약하면 되는지 알려드립니다.",
              en: "We plan; you book. We don't make reservations for you or take payment for hotels, restaurants or tickets — we tell you exactly what to book and how.",
            })}
          </p>
        </div>
      </section>

      {/* ── pricing + contact ───────────────────────────── */}
      <section id="pricing" className="ktc-rise scroll-mt-20 border-t border-[var(--c-line-2)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[var(--c-text-3)]">
              {t({ ko: "가격", en: "Pricing" })}
            </p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight md:text-4xl">
              {t({ ko: "초안은 무료입니다. 전체 일정은 ₩150,000 입니다.", en: "The draft is free. The full plan is ₩150,000." })}
            </p>
            <p className="mt-4 max-w-md leading-relaxed text-[var(--c-text-2)]">
              {t({
                ko: "여행이 며칠이든 값은 하나입니다. 처음부터 끝까지 만들어져 나오니 예약할 통화도, 기다릴 사람도 없습니다.",
                en: "One price, however long your trip is. It's put together for you start to finish — so there's no call to book and nobody to wait on.",
              })}
            </p>
          </div>
          <div id="contact" className="scroll-mt-20 md:justify-self-end">
            <Link
              href="/plan"
              className="inline-flex items-center rounded-full bg-[var(--c-text)] px-8 py-3.5 text-base text-[var(--c-bg)] transition-colors hover:bg-[var(--c-accent)] hover:text-[var(--c-bg)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--c-focus)]"
            >
              {t({ ko: "무료 초안부터 받아보기", en: "Start with the free draft" })}
            </Link>
            <p className="mt-5 leading-relaxed text-[var(--c-text-2)]">
              {t({ ko: "먼저 물어보고 싶으신가요?", en: "Rather just ask a question first?" })}{" "}
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
  );
}
