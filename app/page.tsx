import Link from "next/link";
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

const STATIONS = [
  { x: 150, label: "DAY 1" },
  { x: 420, label: "DAY 2" },
  { x: 680, label: "DAY 3" },
  { x: 900, label: "DAY 4" },
];

const STARS = [
  { cx: 120, cy: 44, r: 2.2, delay: "0s" },
  { cx: 260, cy: 26, r: 1.8, delay: ".7s" },
  { cx: 430, cy: 52, r: 2, delay: "1.4s" },
  { cx: 610, cy: 30, r: 1.7, delay: ".4s" },
  { cx: 770, cy: 58, r: 2.3, delay: "2s" },
  { cx: 900, cy: 34, r: 1.9, delay: "1.1s" },
  { cx: 330, cy: 88, r: 1.6, delay: "2.6s" },
  { cx: 690, cy: 94, r: 1.6, delay: ".2s" },
];

// 움직임은 CSS로만 준다. 자바스크립트가 없어도 그림은 그대로 나온다.
const MOTION = `
@keyframes ktc-drift { from { transform: translateX(-40px) } to { transform: translateX(60px) } }
@keyframes ktc-ride  { from { transform: translateX(-300px) } to { transform: translateX(1060px) } }
@keyframes ktc-tw    { 0%,100% { opacity:.2 } 50% { opacity:1 } }
.ktc-clouds { animation: ktc-drift 24s ease-in-out infinite alternate }
.ktc-train  { animation: ktc-ride 13s linear infinite }
.ktc-star   { animation: ktc-tw 3.4s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .ktc-clouds, .ktc-star { animation: none }
  .ktc-train { animation: none; transform: translateX(340px) }
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
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pt-8 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-14 md:pt-12">
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

          {/* ── 팁 판. 설명하는 대신 하나를 그냥 보여준다 ── */}
          <figure className="overflow-hidden rounded-2xl border-[3px] border-[#12211C] bg-[#12211C] shadow-[0_24px_60px_-24px_rgba(18,33,28,0.55)]">
            <figcaption className="px-5 py-3 font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[#A8C3B4]">
              Day 2 · Concierge tip
            </figcaption>
            <div className="flex flex-col gap-4 bg-[#F2EDE3] p-6 sm:p-7">
              <p className="font-[family-name:var(--font-display)] text-2xl leading-snug sm:text-3xl">
                Gyeongbokgung Palace
              </p>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex-none rounded bg-[#D8503C] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[0.6rem] font-bold uppercase tracking-wider text-white">
                  Don&apos;t
                </span>
                <span className="leading-relaxed text-[#8B9299] line-through">
                  Tuesday morning, 10:00 — start here.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex-none rounded bg-[#3E6FB0] px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[0.6rem] font-bold uppercase tracking-wider text-white">
                  Do
                </span>
                <span className="leading-relaxed">
                  It&apos;s closed on Tuesdays. Go Wednesday — and wear hanbok. The rental shops
                  are right outside the gate, and wearing it makes admission free.
                </span>
              </div>
            </div>
          </figure>
        </div>

        {/* ── 노선도 ─────────────────────────────────── */}
        <svg
          viewBox="0 0 1000 300"
          className="mt-4 block h-auto w-full"
          role="img"
          aria-label="A subway line. DAY 1 through DAY 4 are the stations, and a train runs along it. The sky matches the current time in Seoul."
        >
          <defs>
            <linearGradient id="ktc-head" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={PAPER} stopOpacity="1" />
              <stop offset=".5" stopColor={PAPER} stopOpacity=".55" />
              <stop offset="1" stopColor={PAPER} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ktc-foot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={PAPER} stopOpacity="0" />
              <stop offset=".55" stopColor={PAPER} stopOpacity=".8" />
              <stop offset="1" stopColor={PAPER} stopOpacity="1" />
            </linearGradient>
            <clipPath id="ktc-cut">
              <rect width="1000" height="300" />
            </clipPath>
          </defs>

          <g clipPath="url(#ktc-cut)">
            <rect width="1000" height="300" fill={sky.bottom} />
            <rect width="1000" height="152" fill={sky.top} />
            {/* 위쪽을 바탕색으로 녹인다. 글과 그림이 맞닿는 선이 안 생긴다 */}
            <rect width="1000" height="86" fill="url(#ktc-head)" />

            {sky.stars > 0 && (
              <g opacity={sky.stars} fill="#FFFFFF">
                {STARS.map((s) => (
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
            <circle cx="820" cy="72" r="30" fill={sky.orb} opacity={sky.orbOpacity} />

            <g className="ktc-clouds" fill="#FFFFFF" opacity={0.55 + sky.haze * 0.45}>
              <rect x="70" y="46" width="150" height="26" rx="13" />
              <rect x="104" y="28" width="86" height="26" rx="13" />
              <rect x="600" y="34" width="184" height="28" rx="14" />
              <rect x="648" y="16" width="98" height="26" rx="13" />
              <rect x="380" y="70" width="104" height="20" rx="10" opacity=".85" />
            </g>

            {/* 아래쪽도 바탕색으로 녹여 아래 글과 한 면이 되게 한다 */}
            <rect y="236" width="1000" height="64" fill="url(#ktc-foot)" />

            {/* 노선과 정거장 */}
            <path d="M0 206 L1000 206" stroke="#00A84D" strokeWidth="10" strokeLinecap="round" />
            <g fill={PAPER} stroke="#00A84D" strokeWidth="7">
              {STATIONS.map((s) => (
                <circle key={s.label} cx={s.x} cy="206" r="13" />
              ))}
            </g>
            <g
              fontFamily="ui-monospace,Menlo,monospace"
              fontSize="14"
              fontWeight="700"
              fill="#12211C"
            >
              {STATIONS.map((s) => (
                <text key={s.label} x={s.x} y="186" textAnchor="middle">
                  {s.label}
                </text>
              ))}
            </g>
            {/* 환승역 표시 — 팁이 붙는 자리 */}
            <circle cx="420" cy="206" r="20" fill="none" stroke="#EF7C1C" strokeWidth="4" />

            {/*
              지하철. 서울 전동차를 옆에서 본 모습이다 — 앞칸(오른쪽)에 운전실이 있고
              출입문과 창이 번갈아 오는 것, 지붕의 팬터그래프, 아래 대차가
              "진짜 전철"로 보이게 하는 부분이다.
              일부러 DAY 글자보다 위로 다니게 해서 정거장을 안 가린다.
            */}
            <g className="ktc-train">
              {/* 그린 뒤에 키운다 — 좌표를 다 고치는 것보다 낫고, 세로 위치는 translate 로 맞춘다 */}
              <g transform="translate(0,-32) scale(1.25)">
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
            </g>
          </g>
        </svg>

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
