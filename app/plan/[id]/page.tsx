import Link from "next/link";
import { notFound } from "next/navigation";
import { Instrument_Serif } from "next/font/google";
import { supabaseServer } from "@/lib/supabase-server";
import type { FreeItinerary, Plan } from "@/lib/types";
import { t } from "@/lib/copy";
import { placeLabel } from "@/lib/places";
import CopyLinkButton from "@/components/CopyLinkButton";

// 표제용 서체. 랜딩(app/page.tsx)과 같은 방식으로 이 화면에서만 불러온다.
const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

// 주소를 열 때마다 DB에서 최신을 읽는다.
export const dynamic = "force-dynamic";

/**
 * 며칠째가 실제로 몇 월 며칠 무슨 요일인지.
 *
 * **AI 에게 시키지 않는다.** 출발일과 며칠째만 있으면 정확히 나오는 계산이고,
 * 맡기면 요일을 틀리게 쓴다. 요일이 중요한 이유는 **일요일에 문 닫는 곳이 많아서**다 —
 * 요일을 모르면 헛걸음한다.
 *
 * 시간대에 따라 하루가 밀리지 않도록 UTC 로만 센다.
 */
function dayLabel(startDate: string, dayNumber: number) {
  const d = new Date(`${startDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dayNumber - 1);
  const KO = ["일", "월", "화", "수", "목", "금", "토"];
  return t({
    ko: `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${KO[d.getUTCDay()]})`,
    en: d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short", timeZone: "UTC" }),
  });
}

function dateRange(startDate: string, days: number) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + days - 1);
  // 아래 dayLabel 과 같은 방식으로 직접 만든다. toLocaleDateString("ko-KR") 은
  // "2026. 10. 4." 처럼 점을 찍어서 우리 화면의 다른 날짜 표기와 어긋난다.
  return t({
    ko: `${start.getUTCFullYear()}년 ${start.getUTCMonth() + 1}월 ${start.getUTCDate()}일 – ${end.getUTCMonth() + 1}월 ${end.getUTCDate()}일`,
    en: (() => {
      const fmt = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
      return `${fmt(start)} – ${fmt(end)}, ${start.getUTCFullYear()}`;
    })(),
  });
}

/**
 * 맛보기 팁 하나. **이 화면에서 제일 중요한 부분이다.**
 *
 * 그 팁이 걸린 날 바로 아래에 붙인다 — 전에는 맨 끝에 있어서, 나흘치를 다 읽고 나서야
 * 1일차 팁을 봤다. 팁은 그 날의 이야기라 그 자리에서 읽혀야 한다.
 * 몇 일째인지 모르는 옛 초안은 지금처럼 맨 아래에 둔다.
 */
function ConciergeTip({ tip, className = "" }: { tip: FreeItinerary["sampleTip"]; className?: string }) {
  return (
      <figure className={`${className} rounded-2xl bg-[var(--c-deep)] p-7 text-[var(--c-text-on-deep)] shadow-[0_24px_60px_-24px_rgba(18,33,28,0.55)] sm:p-9`}>
        <figcaption className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--c-dim-on-deep)]">
          {t({ ko: "컨시어지 팁 하나", en: "One concierge tip" })} · {tip.activityName}
        </figcaption>
        <p className="mt-4 font-[family-name:var(--font-display)] text-2xl leading-snug">
          {tip.highlight}
        </p>

        <div className="mt-7 border-t border-[var(--c-line)] pt-5">
          <p className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.15em] text-[var(--c-accent-on-deep)]">
            {t({ ko: "피하실 것", en: "What to avoid" })}
          </p>
          <p className="mt-2 leading-relaxed text-[var(--c-text-on-deep)]">{tip.pitfall}</p>
        </div>

        <div className="mt-6 border-t border-[var(--c-line)] pt-5">
          <p className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.15em] text-[var(--c-focus-on-deep)]">
            {t({ ko: "여기 사는 사람이라면 이렇게 말합니다", en: "What someone here would tell you" })}
          </p>
          <p className="mt-2 leading-relaxed">{tip.insiderSecret}</p>
        </div>
      </figure>
  );
}

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await supabaseServer()
    .from("plans")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // 아이디를 찍어 맞춰서 들어온 경우도 여기로 떨어진다.
  if (error || !data) notFound();

  const plan = data as Plan;
  const trip = plan.itinerary;

  // AI 생성이 실패한 채 저장된 경우. 빈 화면 대신 다시 해볼 길을 준다.
  if (!trip) {
    return (
      <div className={`${display.variable} flex-1 bg-[var(--c-bg)] px-6 py-24 text-center text-[var(--c-text)]`}>
        <p className="font-[family-name:var(--font-display)] text-3xl">
          {t({ ko: "이 초안은 끝까지 만들어지지 못했습니다.", en: "This draft didn\u2019t finish." })}
        </p>
        <p className="mt-4 text-[var(--c-text-2)]">{t({ ko: "죄송합니다 — 다시 시작해 주세요. 2분이면 됩니다.", en: "Sorry — please start again, it only takes two minutes." })}</p>
        <Link href="/plan" className="mt-8 inline-flex rounded-full bg-[var(--c-text)] px-8 py-3.5 text-[var(--c-bg)]">
          {t({ ko: "다시 시작하기", en: "Start over" })}
        </Link>
      </div>
    );
  }

  /*
    팁이 걸린 날을 **먼저 찾아 둔다.** 전에는 그리는 자리에서 조건 둘을 따로 따졌는데
    (같은 날이면 그 날 아래 / dayNumber 가 없으면 맨 아래) **"날짜는 있는데 그 날이
    일정에 없는"** 경우가 둘 다 안 걸려 팁이 통째로 사라졌다. AI 가 4일 여행에
    dayNumber: 5 를 주거나 숫자 대신 글자 "3" 을 주면 그렇게 된다.

    팁이 안 보여도 아래 문구는 그대로 남는다 — "팁 하나를 보셨습니다." 손님은 보지도
    못한 것을 봤다고 하는 화면을 본다. 에러도 로그도 안 남는다.

    찾은 날이 있으면 그 날에 한 번, 없으면 맨 아래에 한 번. **어떤 값이 와도 정확히
    한 번 나온다.** 날짜(===)가 아니라 찾아낸 날 자체를 비교하므로 dayNumber 가
    겹쳐도 두 번 그려지지 않는다.
  */
  const tipDay = trip.days.find((d) => d.dayNumber === trip.sampleTip.dayNumber);

  return (
    <div
      className={`${display.variable} flex-1 bg-[var(--c-bg)] text-[var(--c-text)] font-[family-name:var(--font-geist-sans)] selection:bg-[var(--c-accent)] selection:text-[var(--c-bg)]`}
    >
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        {/* py/-my: 보이는 크기는 그대로 두고 손가락으로 누를 범위만 44px 로 넓힌다 */}
        <Link
          href="/"
          className="-my-2 py-2 font-[family-name:var(--font-geist-sans)] text-xl font-semibold tracking-[-0.02em] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]"
        >
          mohallae
        </Link>
        <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[var(--c-text-3)]">
          {t({ ko: "무료 초안", en: "Free draft" })}
        </span>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24">
        {/* ── 제목 ─────────────────────────────────────── */}
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[var(--c-text-3)]">
          {dateRange(plan.start_date, plan.duration_days)} · {plan.travelers}{" "}
          {t({ ko: "명", en: plan.travelers === 1 ? "traveler" : "travelers" })}
          {plan.destinations.length > 0 && ` · ${plan.destinations.map(placeLabel).join(", ")}`}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.02] tracking-tight">
          {trip.tripTitle}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--c-text-2)]">{trip.summary}</p>

        {/* ── 일자별 ───────────────────────────────────── */}
        <ol className="mt-14 space-y-12">
          {trip.days.map((day) => (
            <li key={day.dayNumber}>
              <div className="flex items-baseline gap-4">
                <span className="font-[family-name:var(--font-geist-mono)] text-xs text-[var(--c-accent)]">
                  {String(day.dayNumber).padStart(2, "0")}
                </span>
                <h2 className="font-[family-name:var(--font-display)] text-2xl leading-tight">
                  {day.theme}
                </h2>
              </div>
              {/*
                날짜·요일과 그날 머무는 도시. 제목 아래 한 줄로 붙인다.
                도시는 **여러 날에 걸쳐 같으면 굳이 반복하지 않고**, 바뀌는 날에만 눈에 띄면 되지만
                지금은 매일 적는다 — 빠뜨리는 것보다 낫고, 손님이 하루씩 떼어 봐도 어디인지 안다.
                city 가 없는 옛 초안도 있어서 있을 때만 그린다.
              */}
              <p className="ml-[calc(0.75rem+1rem)] mt-1 font-[family-name:var(--font-geist-mono)] text-[0.7rem] uppercase tracking-[0.14em] text-[var(--c-text-3)]">
                {dayLabel(plan.start_date, day.dayNumber)}
                {day.city && (
                  <>
                    <span aria-hidden className="mx-2 text-[var(--c-text-4)]">·</span>
                    <span className="text-[var(--c-accent-dim)]">{day.city}</span>
                  </>
                )}
              </p>
              <ul className="mt-5 space-y-5 border-l border-[var(--c-line-2)] pl-6">
                {day.activities.map((a, i) => (
                  <li key={i}>
                    {/*
                      앞 일정에서 여기까지 대략 얼마나 걸리는지. **동선이 말이 되는지**를 보여준다.
                      그날 첫 일정에는 없다(앞이 없다). 옛 초안에도 없어서 있을 때만 그린다.
                      자세한 길 안내는 유료다 — 여기서는 시간만.
                    */}
                    {a.travel && (
                      <p className="mb-2 flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[0.65rem] tracking-[0.1em] text-[var(--c-text-4)]">
                        <span aria-hidden>↓</span>
                        {a.travel}
                      </p>
                    )}
                    <p className="font-[family-name:var(--font-geist-mono)] text-[0.7rem] uppercase tracking-[0.15em] text-[var(--c-text-3)]">
                      {a.time}
                    </p>
                    <p className="mt-1 text-lg">{a.name}</p>
                    <p className="mt-1 leading-relaxed text-[var(--c-text-2)]">{a.note}</p>
                  </li>
                ))}
              </ul>

              {/* 이 날의 팁이면 바로 아래에 붙인다 */}
              {tipDay === day && <ConciergeTip tip={trip.sampleTip} className="mt-8" />}
            </li>
          ))}
        </ol>

        {/* 걸릴 날을 못 찾은 팁은 여기(맨 아래)에 그린다 — 옛 초안, 그리고 엉뚱한 날짜 */}
        {!tipDay && <ConciergeTip tip={trip.sampleTip} className="mt-16" />}

        {/* ── 숙소·식당·예산 ───────────────────────────── */}
        <dl className="mt-14 grid gap-8 border-t border-[var(--c-line-2)] pt-10 sm:grid-cols-3">
          <div>
            <dt className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[var(--c-text-3)]">
              {t({ ko: "묵을 곳", en: "Where to stay" })}
            </dt>
            <dd className="mt-2 text-lg">{trip.picks.stay}</dd>
          </div>
          <div>
            <dt className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[var(--c-text-3)]">
              {t({ ko: "먹을 곳", en: "Where to eat" })}
            </dt>
            <dd className="mt-2 text-lg">{trip.picks.dining}</dd>
          </div>
          <div>
            <dt className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[var(--c-text-3)]">
              {t({ ko: "예상 총액", en: "Estimated total" })}
            </dt>
            <dd className="mt-2 text-lg">{trip.totalEstimate}</dd>
          </div>
        </dl>

        {/* ── 여기서부터가 유료 ────────────────────────── */}
        <section className="mt-16 rounded-2xl bg-[var(--c-surface)] p-7 sm:p-9">
          <h2 className="font-[family-name:var(--font-display)] text-3xl leading-tight">
            {t({ ko: "팁 하나를 보셨습니다. 모든 정거장에 하나씩 있습니다.", en: "That\u2019s one tip. Every stop has one." })}
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-[var(--c-text-2)]">
            {t({
              ko: "위 초안은 여행의 뼈대입니다. 전체 일정이 그 안을 채웁니다 — 모든 정거장의 팁, 예산에 맞춘 숙소 다섯 곳과 식당 다섯 곳, 비용 분해, 그리고 무엇을 언제 예약하면 되는지. 한국 전화로만 받는 곳까지 알려드립니다.",
              en: "The draft above is the shape of your trip. The full plan fills it in — a tip at every stop, five stays and five restaurants chosen for your budget, costs broken down, and exactly what to book and when, including the places that only take Korean phone reservations.",
            })}
          </p>
          <Link
            href={`/plan/${plan.id}/consult`}
            className="mt-8 inline-flex items-center rounded-full bg-[var(--c-accent)] px-8 py-3.5 text-base text-white transition-colors hover:bg-[var(--c-text)] hover:text-[var(--c-bg)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--c-focus)]"
          >
            {t({ ko: "전체 일정 받기", en: "Get the full plan" })}
          </Link>
          <CopyLinkButton />
        </section>
      </main>
    </div>
  );
}
