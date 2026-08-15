import Link from "next/link";
import Image from "next/image";
import { Instrument_Serif } from "next/font/google";
import { seoulWeather } from "@/lib/weather";

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

// 움직임은 CSS로만 준다. 자바스크립트가 없어도 그림은 그대로 나온다.
const MOTION = `
@keyframes ktc-ride  { from { transform: translateX(-130px) } to { transform: translateX(1060px) } }
@keyframes ktc-ride-n { from { transform: translateX(-130px) } to { transform: translateX(500px) } }
.ktc-train   { animation: ktc-ride 13s linear infinite }
.ktc-train-n { animation: ktc-ride-n 9s linear infinite }
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
  .ktc-train   { animation: none; transform: translateX(430px) }
  .ktc-train-n { animation: none; transform: translateX(180px) }
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
  { day: 1, x: 150, en: "INCHEON", ko: "인천공항" },
  { day: 2, x: 420, en: "GYEONGBOKGUNG", ko: "경복궁" },
  { day: 3, x: 680, en: "BUKCHON", ko: "북촌" },
  { day: 4, x: 900, en: "NAMSAN", ko: "남산" },
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
 * 장면 한 벌. 넓은 화면과 폰이 좌표계 폭만 다르게 쓴다.
 *
 * 폭을 460 으로 좁히면 같은 높이에 담기는 가로 범위가 줄어, 폰에서 선과 글자가 커진다.
 * 정거장 x 는 두 장면이 **같은 비율**(15 / 42 / 68 / 90%)이다. 누르는 자리는 % 로
 * 한 벌만 얹기 때문에, 비율이 어긋나면 폰에서 손가락이 빗나간다.
 */
type Scene = {
  id: string;
  w: number;
  rideClass: string;
};

const WIDE: Scene = { id: "w", w: 1000, rideClass: "ktc-train" };
const NARROW: Scene = { id: "n", w: 460, rideClass: "ktc-train-n" };

/**
 * 노선. **그림을 그리지 않는다.**
 *
 * 해·구름·전동차를 빼고 선 하나와 지나가는 빛만 남겼다. 지하철 안내 표지가 하는 방식이고,
 * 역 이름과 지역명은 그림이 아니라 **글자**가 맡는다(아래 HTML 이 그린다).
 * 시간대와 날씨는 배경 톤과 빗줄기로만 아주 옅게 남는다.
 */
function MetroScene({ scene, className }: { scene: Scene; className: string }) {
  return (
    <svg
      viewBox={`0 0 ${scene.w} 220`}
      className={className}
      role="img"
      aria-label="A subway line. DAY 1 through DAY 4 are the stations, and a train passes along it."
    >
      <defs>
        <linearGradient id={`ktc-trail-${scene.id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E86B54" stopOpacity="0" />
          <stop offset="1" stopColor="#E86B54" stopOpacity=".5" />
        </linearGradient>
        <clipPath id={`ktc-cut-${scene.id}`}>
          <rect width={scene.w} height="220" />
        </clipPath>
      </defs>

      <g clipPath={`url(#ktc-cut-${scene.id})`}>
        {/* 열차. 차체를 그리지 않고 **지나가는 빛과 잔상**으로 암시한다 */}
        <g className={scene.rideClass}>
          <rect x="0" y="75" width="86" height="6" rx="3" fill={`url(#ktc-trail-${scene.id})`} />
          <rect x="78" y="72" width="30" height="12" rx="6" fill="#E86B54" />
        </g>

        {/* 노선 — 10px 이던 것을 2.5px 로. 굵기가 유아틱함의 절반이었다 */}
        <line x1="0" y1="120" x2={scene.w} y2="120" stroke="#E8EAEB" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

export default async function Home() {
  const now = seoulNow();
  const weather = await seoulWeather();

  return (
    <div
      className={`${display.variable} flex-1 bg-[#12171A] text-[#E8EAEB] font-[family-name:var(--font-geist-sans)] selection:bg-[#E86B54] selection:text-[#12171A]`}
    >
      <style dangerouslySetInnerHTML={{ __html: MOTION }} />


      {/* ── 역명판 + 하늘 ─────────────────────────────── */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-8 md:grid-cols-[1.05fr_.95fr] md:items-center md:gap-14 md:pt-12">
          <div>
            {/* 상호. 역명판의 역명 자리다 — 동그라미(역번호)는 빼고 이름만 남겼다 */}
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-[1.35rem] lowercase leading-none tracking-[-0.02em] text-[#E8EAEB]">
                mohallae
              </p>
              <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[0.65rem] tracking-[0.18em] text-[#8B9691]">
                모할래 <span aria-hidden className="mx-1 text-[#4A5450]">·</span>
                <span className="uppercase">Before you fly</span>
              </p>
            </div>

            <h1 className="mt-5 max-w-[15ch] font-[family-name:var(--font-display)] text-[clamp(2.75rem,7vw,5rem)] leading-[0.95] tracking-tight">
              Plan Korea like you know{" "}
              <span className="text-[#E86B54]">someone who lives here.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#A6B0AC]">
              Tell us about your trip and we&apos;ll write you a free day-by-day draft — with one
              tip a guidebook won&apos;t give you.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Link
                href="/plan"
                className="inline-flex items-center rounded-full bg-[#E8EAEB] px-8 py-3.5 text-base text-[#12171A] transition-colors hover:bg-[#E86B54] hover:text-[#12171A] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#7FA8DC]"
              >
                Get your free draft
              </Link>
              <span className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.18em] text-[#8B9691]">
                No account · Free
              </span>
            </div>

            {/* 지금 서울 몇 시인지. 손님은 시차 반대편에 있다 */}
            <p className="mt-7 inline-flex items-center gap-2 border-t border-[#2A3330] pt-3 font-[family-name:var(--font-geist-mono)] text-[0.7rem] tracking-[0.1em] text-[#8B9691]">
              Seoul <b className="font-semibold tabular-nums text-[#E8EAEB]">{now.label}</b>
              <span aria-hidden>·</span> 37.5665° N
            </p>
          </div>

          {/* 한옥의 결은 사진으로, 노선의 그래픽은 아래 SVG로 이어 붙인다. */}
          <figure className="relative mx-auto w-full max-w-[31rem] overflow-hidden rounded-[1.75rem] border border-[#2A3330] bg-[#0E1316] shadow-[0_28px_70px_-28px_rgba(0,0,0,0.7)] md:justify-self-end">
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
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-[#F2EDE3] sm:p-7">
                <div>
                  <p className="max-w-[12ch] font-[family-name:var(--font-display)] text-3xl leading-none sm:text-4xl">
                    Old roofs. New Seoul.
                  </p>
                </div>
                <span className="grid h-16 w-16 flex-none place-items-center rounded-full border-2 border-[#12171A] bg-[#E86B54] text-lg font-bold tracking-[0.12em] shadow-lg">
                  서울
                </span>
              </figcaption>
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-[#12171A]/90 px-3 py-2 font-[family-name:var(--font-geist-mono)] text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[#E8EAEB] backdrop-blur-sm sm:left-7 sm:top-7">
                <span aria-hidden className="h-2 w-2 rounded-full bg-[#E86B54]" />
                Local view
              </div>
            </div>
          </figure>
        </div>

        <div className="ktc-route mt-14">
          {/* 안내 표지의 머리줄. 노선 이름과 **지금 서울 상태**가 여기 한 줄에 온다 */}
          <div className="mx-auto max-w-6xl px-6">
            <p className="whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-[0.6rem] uppercase tracking-[0.14em] text-[#8B9691] sm:text-[0.72rem] sm:tracking-[0.3em]">
              Seoul Metro · 4 Days
              {weather.tempC !== null && (
                <>
                  <span aria-hidden className="mx-2 text-[#4A5450]">·</span>
                  {weather.tempC}°
                </>
              )}
              <span aria-hidden className="mx-2 text-[#4A5450]">·</span>
              {weather.sky === "clear"
                ? "Clear"
                : weather.sky === "cloud"
                  ? "Cloudy"
                  : weather.sky === "rain"
                    ? "Rain"
                    : "Snow"}
            </p>
          </div>
          <div aria-hidden className="mt-3 h-px w-full bg-[#2A3330]" />

          {/* 누르는 자리를 그림 위에 겹쳐야 해서 relative 가 필요하다 */}
          <div className="relative">
            <MetroScene scene={NARROW} className="block h-auto w-full md:hidden" />
            <MetroScene scene={WIDE} className="hidden h-auto w-full md:block" />

            <fieldset className="absolute inset-0 m-0 border-0 p-0">
              <legend className="sr-only">Choose a day to preview its concierge tip</legend>
              {STATIONS.map((station) => (
                <label
                  key={station.day}
                  style={{ left: `${station.x / 10}%` }}
                  className="group absolute top-[54.5%] h-14 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer sm:w-28"
                >
                  {/* 날짜 — 점 위 */}
                  <span className="absolute bottom-[calc(50%+0.65rem)] left-1/2 -translate-x-1/2 whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-[0.62rem] font-bold tracking-[0.16em] text-[#E8EAEB] group-has-[:checked]:text-[#E86B54] sm:text-[0.8rem] sm:tracking-[0.2em]">
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
                    className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E8EAEB] peer-checked:bg-[#E86B54] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#7FA8DC] sm:h-3 sm:w-3"
                  />

                  {/* 지역 — 점 아래. 그림 대신 글자가 일하는 자리다 */}
                  <span className="absolute top-[calc(50%+0.8rem)] left-1/2 -translate-x-1/2 whitespace-nowrap text-center font-[family-name:var(--font-geist-mono)] text-[0.5rem] tracking-[0.1em] text-[#8B9691] sm:text-[0.65rem] sm:tracking-[0.14em]">
                    {station.en}
                  </span>
                  <span className="absolute top-[calc(50%+1.7rem)] left-1/2 -translate-x-1/2 whitespace-nowrap text-center font-[family-name:var(--font-geist-mono)] text-[0.5rem] text-[#69736F] sm:text-[0.6rem]">
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
                className={`ktc-tip ktc-tip-${tip.day} overflow-hidden rounded-[3px] border border-[#2A3330] bg-[#171D21] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.6)] md:grid-cols-[.8fr_1.2fr]`}
              >
                <figcaption className="flex flex-col justify-between gap-8 bg-[#1B2328] p-6 text-[#E8EAEB] sm:p-8">
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
                <div className="flex flex-col gap-5 bg-[#12171A] p-6 sm:p-8">
                  <p className="font-[family-name:var(--font-display)] text-2xl leading-snug sm:text-3xl">
                    {tip.place}
                  </p>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex-none rounded bg-[#E86B54] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[0.6rem] font-bold uppercase tracking-wider text-white">
                      Don&apos;t
                    </span>
                    <span className="leading-relaxed text-[#69736F] line-through">{tip.dont}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex-none rounded bg-[#7FA8DC] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[0.6rem] font-bold uppercase tracking-wider text-white">
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
      <section className="border-t border-[#2A3330]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#8B9691]">
            How it works
          </h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className="font-[family-name:var(--font-geist-mono)] text-xs text-[#E86B54]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-tight">
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-[#A6B0AC]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── free vs paid ────────────────────────────────── */}
      <section className="border-t border-[#2A3330] bg-[#171D21]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="font-[family-name:var(--font-display)] text-3xl leading-tight md:text-4xl">
            What&apos;s free, and what you&apos;re paying for
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[#8B9691]">
                Free draft
              </p>
              <ul className="mt-4 space-y-3">
                {free.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span aria-hidden className="text-[#8B9691]">
                      —
                    </span>
                    <span className="text-[#A6B0AC]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[#E86B54]">
                Full plan · ₩150,000
              </p>
              <ul className="mt-4 space-y-3">
                {paid.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span aria-hidden className="text-[#E86B54]">
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* 우리는 여행사가 아니다. 이 선을 손님에게도 분명히 해둔다 (규칙 6번) */}
          <p className="mt-10 max-w-2xl leading-relaxed text-[#8B9691]">
            We plan; you book. We don&apos;t make reservations for you or take payment for hotels,
            restaurants or tickets — we tell you exactly what to book and how.
          </p>
        </div>
      </section>

      {/* ── pricing + contact ───────────────────────────── */}
      <section id="pricing" className="scroll-mt-20 border-t border-[#2A3330]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#8B9691]">
              Pricing
            </p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight md:text-4xl">
              The draft is free. The full plan is ₩150,000.
            </p>
            <p className="mt-4 max-w-md leading-relaxed text-[#A6B0AC]">
              One price, however long your trip is. It&apos;s put together for you start to
              finish — so there&apos;s no call to book and nobody to wait on.
            </p>
          </div>
          <div id="contact" className="scroll-mt-20 md:justify-self-end">
            <Link
              href="/plan"
              className="inline-flex items-center rounded-full bg-[#E8EAEB] px-8 py-3.5 text-base text-[#12171A] transition-colors hover:bg-[#E86B54] hover:text-[#12171A] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#7FA8DC]"
            >
              Start with the free draft
            </Link>
            <p className="mt-5 leading-relaxed text-[#A6B0AC]">
              Rather just ask a question first?{" "}
              <Link
                href="/contact"
                className="underline underline-offset-4 hover:text-[#E86B54] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7FA8DC]"
              >
                Ask us anything
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#2A3330]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 font-[family-name:var(--font-geist-mono)] text-xs text-[#8B9691] sm:flex-row sm:items-center sm:justify-between">
          <span>mohallae</span>
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
