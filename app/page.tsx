import Link from "next/link";
import Image from "next/image";
import { Instrument_Serif } from "next/font/google";

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
  const hour = Number(get("hour"));
  return { hour, label: `${get("hour")}:${get("minute")}` };
}

/**
 * 하늘색. 배경 그림(남산·경복궁)은 걷어내고 하늘과 노선만 남겼다.
 * `paper` 는 페이지 바탕색이다 — 그림 위아래를 이 색으로 녹여서 경계선을 없앤다.
 */
const PAPER = "#F2EDE3";

const SKY = {
  dawn: { top: "#F2A9A0", bottom: "#FBD9C0", orb: "#FFD1A8", orbOpacity: 0.9, stars: 0.35, haze: 0.2 },
  day: { top: "#8FD0F0", bottom: "#BEE6F8", orb: "#FFD52E", orbOpacity: 1, stars: 0, haze: 0 },
  dusk: { top: "#EE8A5E", bottom: "#FFC98B", orb: "#FF8A4C", orbOpacity: 1, stars: 0.25, haze: 0.15 },
  night: { top: "#0E1E38", bottom: "#1B2E4D", orb: "#EDEFF5", orbOpacity: 0.95, stars: 1, haze: 0.1 },
} as const;

function skyFor(hour: number) {
  if (hour < 6) return SKY.night;
  if (hour < 8) return SKY.dawn;
  if (hour < 17) return SKY.day;
  if (hour < 20) return SKY.dusk;
  return SKY.night;
}

// 움직임은 CSS로만 준다. 자바스크립트가 없어도 그림은 그대로 나온다.
const MOTION = `
@keyframes ktc-drift { from { transform: translateX(-40px) } to { transform: translateX(60px) } }
@keyframes ktc-ride  { from { transform: translateX(-300px) } to { transform: translateX(1060px) } }
@keyframes ktc-ride-n { from { transform: translateX(-290px) } to { transform: translateX(500px) } }
@keyframes ktc-tw    { 0%,100% { opacity:.2 } 50% { opacity:1 } }
.ktc-clouds { animation: ktc-drift 24s ease-in-out infinite alternate }
.ktc-train   { animation: ktc-ride 13s linear infinite }
.ktc-train-n { animation: ktc-ride-n 9s linear infinite }
.ktc-star   { animation: ktc-tw 3.4s ease-in-out infinite }
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
@media (prefers-reduced-motion: reduce) {
  .ktc-clouds, .ktc-star { animation: none }
  .ktc-train   { animation: none; transform: translateX(340px) }
  .ktc-train-n { animation: none; transform: translateX(60px) }
}
`;

const steps = [
  {
    title: "Tell us about your trip",
    body: "Dates, how long, who's coming, what you're into. Two minutes, no account.",
  },
  {
    title: "Get a free draft",
    body: "A day-by-day outline, plus one concierge tip so you can judge the rest.",
  },
  {
    title: "Get the full plan",
    body: "₩150,000. A tip at every stop, and the route that wastes the least of your time.",
  },
];

const free = [
  "Day-by-day themes, three activities a day",
  "One concierge tip, in full",
  "One place to stay, one place to eat",
  "A total budget estimate",
];

/* 규칙 6번(#28): 예약 대행·통역은 쓰지 않는다. 우리는 알려주고, 예약은 손님이 한다. */
const paid = [
  "A tip on every stop — what to skip, what locals do",
  "Five stays and five restaurants, with reasons",
  "Costs broken down, routes and timing worked out",
  "Exactly what to book and when — including the places that only take Korean phone reservations",
];

/**
 * 누르는 자리. `x` 는 화면 폭의 몇 %인지다 — 넓은 화면과 폰 장면이
 * 같은 비율로 정거장을 놓기 때문에 이 한 벌로 둘 다 덮는다.
 */
const STATIONS = [
  { day: 1, x: 150 },
  { day: 2, x: 420 },
  { day: 3, x: 680 },
  { day: 4, x: 900 },
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
    headline: "The first hour decides the next four days.",
    place: "Incheon Airport",
    dont: "Change all your cash at the airport counter.",
    do: "Airport rates are the worst you'll see in Korea. Change just enough for the ride in, then pay by card — almost everywhere takes it, down to market stalls. Pick up a T-money card at any convenience store while you're there; it works on every bus and subway in the country.",
  },
  {
    day: 2,
    headline: "One detail can reroute a whole day.",
    place: "Gyeongbokgung Palace",
    dont: "Tuesday morning, 10:00 — start here.",
    do: "It's closed on Tuesdays. Go Wednesday — and wear hanbok. The rental shops are right outside the gate, and wearing it makes admission free.",
  },
  {
    day: 3,
    headline: "Some streets are someone's front door.",
    place: "Bukchon Hanok Village",
    dont: "Arrive at 8am for empty photos.",
    do: "People live here, so the lanes have posted visiting hours — roughly 10:00 to 17:00, and the main alley closes to visitors on Sundays. Come inside those hours, keep your voice down, and you'll be welcome.",
  },
  {
    day: 4,
    headline: "The last stop is the one people get wrong.",
    place: "Namsan & N Seoul Tower",
    dont: "Take a taxi to the tower entrance.",
    do: "Private cars can't drive up Namsan. Your options are the cable car from Myeongdong or the 01, 02 and 05 buses — those are the only vehicles allowed. Go up before sunset and come down after dark; you get both views for one trip.",
  },
];

/**
 * 장면 한 벌. 넓은 화면과 폰이 **다른 그림**을 쓴다.
 *
 * 같은 그림을 폭만 줄이면 세로도 같이 눌려서, 폰에서는 높이가 112px 밖에 안 남는다.
 * 애써 그린 전철이 손톱만해지고 DAY 글자를 못 읽는다.
 * 그래서 폰은 **좌표계 폭을 460 으로 좁힌** 장면을 따로 쓴다. 높이는 둘 다 450 이라
 * 폰에서 세로가 367px 로 살아나고, 그 안의 모든 것이 같이 커진다.
 *
 * 세로 450 은 하늘을 넉넉히 보이게 하려고 잡은 값이다(원래 300). 노선은 y=309,
 * 전동차는 그 위 `trainY` 에 놓여 DAY 글자를 살짝 띄우고 달린다.
 */
type Scene = {
  id: string;
  w: number;
  stations: { x: number; label: string }[];
  orbX: number;
  /** 전동차 높이. DAY 글자 바로 위를 달리게 맞춘 값 (장면마다 다르다) */
  trainY: number;
  rideClass: string;
  clouds: { x: number; y: number; s: number; o?: number }[];
  stars: { cx: number; cy: number; r: number; delay: string }[];
};

const WIDE: Scene = {
  id: "w",
  w: 1000,
  stations: [
    { x: 150, label: "DAY 1" },
    { x: 420, label: "DAY 2" },
    { x: 680, label: "DAY 3" },
    { x: 900, label: "DAY 4" },
  ],
  orbX: 820,
  trainY: 85,
  rideClass: "ktc-train",
  clouds: [
    { x: 60, y: 112, s: 1.05 },
    { x: 470, y: 92, s: 1.3 },
    { x: 285, y: 182, s: 0.68, o: 0.8 },
    { x: 855, y: 196, s: 0.58, o: 0.7 },
  ],
  stars: [
    { cx: 120, cy: 150, r: 2.2, delay: "0s" },
    { cx: 260, cy: 176, r: 1.8, delay: ".7s" },
    { cx: 430, cy: 206, r: 2, delay: "1.4s" },
    { cx: 610, cy: 162, r: 1.7, delay: ".4s" },
    { cx: 770, cy: 226, r: 2.3, delay: "2s" },
    { cx: 900, cy: 186, r: 1.9, delay: "1.1s" },
    { cx: 330, cy: 254, r: 1.6, delay: "2.6s" },
    { cx: 690, cy: 244, r: 1.6, delay: ".2s" },
  ],
};

/**
 * 폰. 정거장 4개를 그대로 두되 **화면 폭을 460으로 좁혀** 모든 걸 2배로 키운다.
 *
 * x 값은 넓은 화면과 **같은 비율**(15% / 42% / 68% / 90%)로 맞췄다.
 * 누르는 자리(radio)는 % 로 한 벌만 얹는데, 비율이 어긋나면 폰에서 손가락이 빗나간다.
 */
const NARROW: Scene = {
  id: "n",
  w: 460,
  stations: [
    { x: 69, label: "DAY 1" },
    { x: 193, label: "DAY 2" },
    { x: 313, label: "DAY 3" },
    { x: 414, label: "DAY 4" },
  ],
  orbX: 385,
  trainY: 69,
  rideClass: "ktc-train-n",
  clouds: [
    { x: 12, y: 118, s: 0.85 },
    { x: 210, y: 92, s: 1.0 },
    { x: 118, y: 190, s: 0.58, o: 0.8 },
  ],
  stars: [
    { cx: 60, cy: 152, r: 2.2, delay: "0s" },
    { cx: 150, cy: 182, r: 1.8, delay: ".7s" },
    { cx: 244, cy: 216, r: 2, delay: "1.4s" },
    { cx: 340, cy: 166, r: 1.7, delay: ".4s" },
    { cx: 424, cy: 232, r: 2.3, delay: "2s" },
  ],
};

/**
 * 서울 전동차. 두 장면이 똑같은 그림을 쓴다.
 *
 * `y` 로 높이를 받는 이유: **DAY 글자 바로 위를 달려야 하는데**, 글자는 HTML 이 그리고
 * 그 간격이 px 로 고정돼 있다. 좌표계 폭이 다른 두 장면에서는 같은 px 이 서로 다른
 * 좌표값이 되므로, 장면마다 높이를 따로 준다.
 */
function Train({ y }: { y: number }) {
  return (
    <>
              {/* 그린 뒤에 키운다 — 좌표를 다 고치는 것보다 낫고, 세로 위치는 translate 로 맞춘다 */}
              <g transform={`translate(0,${y}) scale(1.25)`}>
              {/* ── 팬터그래프 (지붕 위 집전장치) ── */}
              <g stroke="#3D4A44" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M44 117 L57 105 L70 117" />
                <line x1="47" y1="117" x2="67" y2="117" />
                <line x1="45" y1="104" x2="69" y2="104" strokeWidth="2.2" />
              </g>
              {/* 지붕 냉방장치 */}
              <rect x="20" y="114" width="22" height="4" rx="1.5" fill="#B7C2C9" />
              <rect x="126" y="114" width="24" height="4" rx="1.5" fill="#B7C2C9" />
              <rect x="170" y="114" width="20" height="4" rx="1.5" fill="#B7C2C9" />

              {/* ── 대차와 바퀴 ── */}
              <g fill="#2A3D35">
                <rect x="14" y="147" width="22" height="6" rx="2" />
                <rect x="66" y="147" width="22" height="6" rx="2" />
                <rect x="120" y="147" width="22" height="6" rx="2" />
                <rect x="180" y="147" width="22" height="6" rx="2" />
              </g>
              <g fill="#12211C">
                {[19, 31, 71, 83, 125, 137, 185, 197].map((cx) => (
                  <circle key={cx} cx={cx} cy="152" r="3.2" />
                ))}
              </g>

              {/* ── 연결기 ── */}
              <rect x="99" y="132" width="10" height="5" rx="2" fill="#69707A" />

              {/* ── 뒷칸 ── */}
              <g>
                <rect x="4" y="118" width="96" height="30" rx="4" fill="#EDF1F3" stroke="#12211C" strokeWidth="1.8" />
                <rect x="7" y="118" width="90" height="3.5" rx="1.75" fill="#C8D2D8" />
                {/* 노선 색 띠 */}
                <rect x="5" y="138" width="94" height="5" fill="#00A84D" />
                {/* 창 — 출입문 사이사이 */}
                <g fill="#5E9FC9">
                  <rect x="25" y="124" width="15" height="11" rx="1.5" />
                  <rect x="44" y="124" width="15" height="11" rx="1.5" />
                  <rect x="82" y="124" width="14" height="11" rx="1.5" />
                </g>
                {/* 출입문 — 가운데가 갈라지는 두 짝 */}
                <g fill="#DCE4E8" stroke="#8B9299" strokeWidth="0.9">
                  <rect x="10" y="121" width="11" height="21" rx="1" />
                  <rect x="63" y="121" width="11" height="21" rx="1" />
                </g>
                <g stroke="#8B9299" strokeWidth="0.9">
                  <line x1="15.5" y1="121" x2="15.5" y2="142" />
                  <line x1="68.5" y1="121" x2="68.5" y2="142" />
                </g>
              </g>

              {/* ── 앞칸 (운전실) ── */}
              <g>
                <path
                  d="M108 122 Q108 118 112 118 H201 Q210 118 212 126 L213 140 Q213 148 205 148 H112 Q108 148 108 144 Z"
                  fill="#EDF1F3"
                  stroke="#12211C"
                  strokeWidth="1.8"
                />
                <rect x="111" y="118" width="88" height="3.5" rx="1.75" fill="#C8D2D8" />
                <rect x="109" y="138" width="101" height="5" fill="#00A84D" />
                {/* 행선 표시 */}
                <rect x="186" y="121" width="20" height="4" rx="1" fill="#12211C" />
                <rect x="188" y="122" width="16" height="2" rx="1" fill="#FFD52E" />
                {/* 창 */}
                <g fill="#5E9FC9">
                  <rect x="129" y="124" width="15" height="11" rx="1.5" />
                  <rect x="148" y="124" width="15" height="11" rx="1.5" />
                </g>
                {/* 운전실 창 — 더 크고 앞쪽으로 기울어 있다 */}
                <path d="M184 127 H204 L207 135 H184 Z" fill="#5E9FC9" />
                {/* 출입문 */}
                <g fill="#DCE4E8" stroke="#8B9299" strokeWidth="0.9">
                  <rect x="114" y="121" width="11" height="21" rx="1" />
                  <rect x="167" y="121" width="11" height="21" rx="1" />
                </g>
                <g stroke="#8B9299" strokeWidth="0.9">
                  <line x1="119.5" y1="121" x2="119.5" y2="142" />
                  <line x1="172.5" y1="121" x2="172.5" y2="142" />
                </g>
                {/* 전조등 */}
                <circle cx="204" cy="145" r="2.4" fill="#FFF6D0" stroke="#12211C" strokeWidth="0.8" />
                <circle cx="196" cy="145" r="2.4" fill="#FFF6D0" stroke="#12211C" strokeWidth="0.8" />
              </g>
              </g>
    </>
  );
}

function MetroScene({
  scene,
  sky,
  className,
}: {
  scene: Scene;
  sky: (typeof SKY)[keyof typeof SKY];
  className: string;
}) {
  const last = scene.stations.at(-1)!.label;
  return (
    <svg
      viewBox={`0 0 ${scene.w} 450`}
      className={className}
      role="img"
      aria-label={`A subway line. DAY 1 through ${last} are the stations, and a train runs along it. The sky matches the current time in Seoul.`}
    >
      <defs>
        <linearGradient id={`ktc-foot-${scene.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PAPER} stopOpacity="0" />
          <stop offset=".55" stopColor={PAPER} stopOpacity=".8" />
          <stop offset="1" stopColor={PAPER} stopOpacity="1" />
        </linearGradient>
        {/*
          하늘 한 장. **바탕색(크림)에서 시작해서** 파랑으로 넘어간다.
          전에는 파란 하늘 위에 크림색을 반투명으로 덮어 위쪽을 지웠는데,
          두 색이 알파로 섞이는 구간이 탁해지면서 오히려 경계가 도드라졌다.
          색을 직접 이어붙이면 섞이는 자리가 없고, 위쪽 글 영역과 한 면이 된다.
        */}
        <linearGradient id={`ktc-sky-${scene.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={PAPER} />
          <stop offset="0.30" stopColor={sky.top} />
          <stop offset="0.66" stopColor={sky.bottom} />
          <stop offset="1" stopColor={sky.bottom} />
        </linearGradient>
        <clipPath id={`ktc-cut-${scene.id}`}>
          <rect width={scene.w} height="450" />
        </clipPath>
      </defs>

      <g clipPath={`url(#ktc-cut-${scene.id})`}>
        <rect width={scene.w} height="450" fill={`url(#ktc-sky-${scene.id})`} />

        {sky.stars > 0 && (
          <g opacity={sky.stars} fill="#FFFFFF">
            {scene.stars.map((s) => (
              <circle
                key={`${s.cx}-${s.cy}`}
                className="ktc-star"
                cx={s.cx}
                cy={s.cy}
                r={s.r}
                style={{ animationDelay: s.delay }}
              />
            ))}
          </g>
        )}

        {/* 해 또는 달 */}
        <circle cx={scene.orbX} cy="150" r="30" fill={sky.orb} opacity={sky.orbOpacity} />

        {/*
          구름. 둥근 사각형을 쌓으면 뭉툭해 보여서, **덩어리 세 개와 아랫면**으로 그린다.
          겹쳐도 얼룩이 안 지는 이유는 투명도를 낱개가 아니라 g 에 한 번만 주기 때문이다.
        */}
        <g className="ktc-clouds" fill="#FFFFFF" opacity={0.62 + sky.haze * 0.38}>
          {scene.clouds.map((c) => (
            <g key={`${c.x}-${c.y}`} transform={`translate(${c.x},${c.y}) scale(${c.s})`} opacity={c.o}>
              <circle cx="28" cy="24" r="17" />
              <circle cx="58" cy="17" r="23" />
              <circle cx="88" cy="27" r="15" />
              <rect x="10" y="26" width="92" height="18" rx="9" />
            </g>
          ))}
        </g>

        {/* 아래쪽도 바탕색으로 녹여 아래 글과 한 면이 되게 한다 */}
        <rect y="354" width={scene.w} height="96" fill={`url(#ktc-foot-${scene.id})`} />

        {/*
          노선만 그린다. **정거장 동그라미와 DAY 글자는 SVG 가 아니라 위에 겹친 HTML 이 그린다.**
          누를 수 있어야 하고(라디오 버튼), 고른 역에 표시가 남아야 해서다.
          여기서 같이 그리면 글자가 두 겹으로 겹쳐 보인다 — 실제로 그렇게 났었다.
        */}
        <path d={`M0 309 L${scene.w} 309`} stroke="#00A84D" strokeWidth="10" strokeLinecap="round" />

        <g className={scene.rideClass}>
          <Train y={scene.trainY} />
        </g>
      </g>
    </svg>
  );
}


export default function Home() {
  const now = seoulNow();
  const sky = skyFor(now.hour);

  return (
    <div
      className={`${display.variable} flex-1 bg-[#F2EDE3] text-[#1B211E] font-[family-name:var(--font-geist-sans)] selection:bg-[#D8503C] selection:text-[#F2EDE3]`}
    >
      <style dangerouslySetInnerHTML={{ __html: MOTION }} />

      {/* ── 노선 띠. 역명판의 맨 윗줄이다 ──────────────── */}
      <div
        aria-hidden
        className="h-3 w-full"
        style={{
          background:
            "linear-gradient(90deg,#00A84D 0 40%,#EF7C1C 40% 72%,#0052A4 72% 100%)",
        }}
      />

      {/* ── 역명판 + 하늘 ─────────────────────────────── */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-8 md:grid-cols-[1.05fr_.95fr] md:items-center md:gap-14 md:pt-12">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-[#00A84D] text-center font-[family-name:var(--font-geist-mono)] text-[0.7rem] font-bold leading-tight text-white">
                DAY
                <br />1
              </span>
              <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.18em] text-[#4A5D54]">
                Before you fly
              </span>
            </div>

            <h1 className="mt-5 max-w-[15ch] font-[family-name:var(--font-display)] text-[clamp(2.75rem,7vw,5rem)] leading-[0.95] tracking-tight">
              Plan Korea like you know{" "}
              <span className="text-[#00A84D]">someone who lives here.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#3D4A44]">
              Tell us about your trip and we&apos;ll write you a free day-by-day draft — with one
              tip a guidebook won&apos;t give you.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Link
                href="/plan"
                className="inline-flex items-center rounded-full bg-[#12211C] px-8 py-3.5 text-base text-[#F2EDE3] transition-colors hover:bg-[#D8503C] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3E6FB0]"
              >
                Get your free draft
              </Link>
              <span className="rounded bg-[#FFD52E] px-2.5 py-1.5 font-[family-name:var(--font-geist-mono)] text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#12211C]">
                Free
              </span>
            </div>

            {/* 지금 서울 몇 시인지. 손님은 시차 반대편에 있다 */}
            <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-[#DDD5C6] bg-[#F8F5EE] py-1.5 pl-3 pr-4 text-sm text-[#3D4A44]">
              <span aria-hidden className="h-2 w-2 flex-none rounded-full bg-[#00A84D]" />
              It&apos;s{" "}
              <b className="font-semibold tabular-nums">{now.label}</b> in Seoul right now
            </p>
          </div>

          {/* 한옥의 결은 사진으로, 노선의 그래픽은 아래 SVG로 이어 붙인다. */}
          <figure className="relative mx-auto w-full max-w-[31rem] overflow-hidden rounded-[1.75rem] border-[3px] border-[#12211C] bg-[#12211C] shadow-[0_28px_70px_-28px_rgba(18,33,28,0.65)] md:justify-self-end">
            <div className="relative aspect-[4/5]">
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
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-[#F2EDE3] sm:p-7">
                <div>
                  <p className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[#C6D6CE]">
                    Seoul after six · 37.5665° N
                  </p>
                  <p className="mt-2 max-w-[12ch] font-[family-name:var(--font-display)] text-3xl leading-none sm:text-4xl">
                    Old roofs. New Seoul.
                  </p>
                </div>
                <span className="grid h-16 w-16 flex-none place-items-center rounded-full border-2 border-[#F2EDE3] bg-[#D8503C] text-lg font-bold tracking-[0.12em] shadow-lg">
                  서울
                </span>
              </figcaption>
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-[#F2EDE3]/90 px-3 py-2 font-[family-name:var(--font-geist-mono)] text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[#12211C] backdrop-blur-sm sm:left-7 sm:top-7">
                <span aria-hidden className="h-2 w-2 rounded-full bg-[#EF7C1C]" />
                Local view
              </div>
            </div>
          </figure>
        </div>

        <div className="ktc-route">
          {/* 누르는 자리를 그림 위에 겹쳐야 해서 relative 가 필요하다 */}
          <div className="relative">
            {/* ── 노선도. 넓은 화면과 폰이 서로 다른 장면을 쓴다 ── */}
            <MetroScene scene={NARROW} sky={sky} className="mt-4 block h-auto w-full md:hidden" />
            <MetroScene scene={WIDE} sky={sky} className="mt-4 hidden h-auto w-full md:block" />

            <fieldset className="absolute inset-0 m-0 border-0 p-0">
              <legend className="sr-only">Choose a day to preview its concierge tip</legend>
              {STATIONS.map((station) => (
                <label
                  key={station.day}
                  style={{ left: `${station.x / 10}%` }}
                  className="absolute top-[68.67%] h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <span className="absolute bottom-[calc(50%+1rem)] left-1/2 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-[0.55rem] font-bold text-[#12211C] sm:text-xs">
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
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-[#00A84D] bg-[#F2EDE3] transition-shadow peer-checked:ring-4 peer-checked:ring-[#EF7C1C] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#0052A4] sm:h-7 sm:w-7 sm:border-[7px]"
                  />
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
                className={`ktc-tip ktc-tip-${tip.day} overflow-hidden rounded-[1.5rem] border-[3px] border-[#12211C] bg-[#12211C] shadow-[0_24px_60px_-28px_rgba(18,33,28,0.6)] md:grid-cols-[.8fr_1.2fr]`}
              >
                <figcaption className="flex flex-col justify-between gap-8 bg-[#12211C] p-6 text-[#F2EDE3] sm:p-8">
                  <div>
                    <p className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[#EF9A55]">
                      Day {tip.day} · Transfer here
                    </p>
                    <p className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight sm:text-4xl">
                      {tip.headline}
                    </p>
                  </div>
                  <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.16em] text-[#A8C3B4]">
                    Concierge tip {String(tip.day).padStart(2, "0")}
                  </span>
                </figcaption>
                <div className="flex flex-col gap-5 bg-[#F8F5EE] p-6 sm:p-8">
                  <p className="font-[family-name:var(--font-display)] text-2xl leading-snug sm:text-3xl">
                    {tip.place}
                  </p>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex-none rounded bg-[#D8503C] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[0.6rem] font-bold uppercase tracking-wider text-white">
                      Don&apos;t
                    </span>
                    <span className="leading-relaxed text-[#8B9299] line-through">{tip.dont}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex-none rounded bg-[#3E6FB0] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[0.6rem] font-bold uppercase tracking-wider text-white">
                      Do
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
      <section className="border-t border-[#DDD5C6]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#4A5D54]">
            How it works
          </h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className="font-[family-name:var(--font-geist-mono)] text-xs text-[#D8503C]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight">
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-[#3D4A44]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── free vs paid ────────────────────────────────── */}
      <section className="border-t border-[#DDD5C6] bg-[#EDE7DB]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-display)] text-3xl leading-tight md:text-4xl">
            What&apos;s free, and what you&apos;re paying for
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[#4A5D54]">
                Free draft
              </p>
              <ul className="mt-4 space-y-3">
                {free.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span aria-hidden className="text-[#4A5D54]">
                      —
                    </span>
                    <span className="text-[#3D4A44]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[#D8503C]">
                Full plan · ₩150,000
              </p>
              <ul className="mt-4 space-y-3">
                {paid.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span aria-hidden className="text-[#D8503C]">
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* 우리는 여행사가 아니다. 이 선을 손님에게도 분명히 해둔다 (규칙 6번) */}
          <p className="mt-10 max-w-2xl leading-relaxed text-[#4A5D54]">
            We plan; you book. We don&apos;t make reservations for you or take payment for hotels,
            restaurants or tickets — we tell you exactly what to book and how.
          </p>
        </div>
      </section>

      {/* ── pricing + contact ───────────────────────────── */}
      <section id="pricing" className="scroll-mt-20 border-t border-[#DDD5C6]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#4A5D54]">
              Pricing
            </p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight md:text-4xl">
              The draft is free. The full plan is ₩150,000.
            </p>
            <p className="mt-4 max-w-md leading-relaxed text-[#3D4A44]">
              One price, however long your trip is. It&apos;s put together for you start to
              finish — so there&apos;s no call to book and nobody to wait on.
            </p>
          </div>
          <div id="contact" className="scroll-mt-20 md:justify-self-end">
            <Link
              href="/plan"
              className="inline-flex items-center rounded-full bg-[#12211C] px-8 py-3.5 text-base text-[#F2EDE3] transition-colors hover:bg-[#D8503C] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3E6FB0]"
            >
              Start with the free draft
            </Link>
            <p className="mt-5 leading-relaxed text-[#3D4A44]">
              Rather just ask a question first?{" "}
              <Link
                href="/contact"
                className="underline underline-offset-4 hover:text-[#D8503C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]"
              >
                Ask us anything
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#DDD5C6]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 font-[family-name:var(--font-geist-mono)] text-xs text-[#4A5D54] sm:flex-row sm:items-center sm:justify-between">
          <span>Korea Travel Consulting</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="underline-offset-4 hover:underline">
              Privacy
            </Link>
            <span>Seoul, Korea</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
