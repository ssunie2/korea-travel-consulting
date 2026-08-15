import Link from "next/link";
import { notFound } from "next/navigation";
import { Instrument_Serif } from "next/font/google";
import { supabaseServer } from "@/lib/supabase-server";
import type { Plan } from "@/lib/types";

// 표제용 서체. 랜딩(app/page.tsx)과 같은 방식으로 이 화면에서만 불러온다.
const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

// 주소를 열 때마다 DB에서 최신을 읽는다.
export const dynamic = "force-dynamic";

function dateRange(startDate: string, days: number) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + days - 1);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt(start)} – ${fmt(end)}, ${start.getUTCFullYear()}`;
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
      <div className={`${display.variable} flex-1 bg-[#F2EDE3] px-6 py-24 text-center text-[#1B211E]`}>
        <p className="font-[family-name:var(--font-display)] text-3xl">
          This draft didn&apos;t finish.
        </p>
        <p className="mt-4 text-[#3D4A44]">Sorry — please start again, it only takes two minutes.</p>
        <Link href="/plan" className="mt-8 inline-flex rounded-full bg-[#12211C] px-8 py-3.5 text-[#F2EDE3]">
          Start over
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`${display.variable} flex-1 bg-[#F2EDE3] text-[#1B211E] font-[family-name:var(--font-geist-sans)] selection:bg-[#D8503C] selection:text-[#F2EDE3]`}
    >
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        {/* py/-my: 보이는 크기는 그대로 두고 손가락으로 누를 범위만 44px 로 넓힌다 */}
        <Link
          href="/"
          className="-my-2 py-2 font-[family-name:var(--font-display)] text-xl tracking-tight underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]"
        >
          mohallae
        </Link>
        <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#4A5D54]">
          Free draft
        </span>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24">
        {/* ── 제목 ─────────────────────────────────────── */}
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#4A5D54]">
          {dateRange(plan.start_date, plan.duration_days)} · {plan.travelers}{" "}
          {plan.travelers === 1 ? "traveler" : "travelers"}
          {plan.destinations.length > 0 && ` · ${plan.destinations.join(", ")}`}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.02] tracking-tight">
          {trip.tripTitle}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[#3D4A44]">{trip.summary}</p>

        {/* ── 일자별 ───────────────────────────────────── */}
        <ol className="mt-14 space-y-12">
          {trip.days.map((day) => (
            <li key={day.dayNumber}>
              <div className="flex items-baseline gap-4">
                <span className="font-[family-name:var(--font-geist-mono)] text-xs text-[#D8503C]">
                  {String(day.dayNumber).padStart(2, "0")}
                </span>
                <h2 className="font-[family-name:var(--font-display)] text-2xl leading-tight">
                  {day.theme}
                </h2>
              </div>
              <ul className="mt-5 space-y-5 border-l border-[#DDD5C6] pl-6">
                {day.activities.map((a, i) => (
                  <li key={i}>
                    <p className="font-[family-name:var(--font-geist-mono)] text-[0.7rem] uppercase tracking-[0.15em] text-[#4A5D54]">
                      {a.time}
                    </p>
                    <p className="mt-1 text-lg">{a.name}</p>
                    <p className="mt-1 leading-relaxed text-[#3D4A44]">{a.note}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        {/* ── 맛보기 팁 하나. 이 화면에서 제일 중요한 부분이다 ── */}
        <figure className="mt-16 rounded-2xl bg-[#12211C] p-7 text-[#E8E2D6] shadow-[0_24px_60px_-24px_rgba(18,33,28,0.55)] sm:p-9">
          <figcaption className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[#A8C3B4]">
            One concierge tip · {trip.sampleTip.activityName}
          </figcaption>
          <p className="mt-4 font-[family-name:var(--font-display)] text-2xl leading-snug">
            {trip.sampleTip.highlight}
          </p>

          <div className="mt-7 border-t border-[#2A3D35] pt-5">
            <p className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.15em] text-[#D8503C]">
              What to avoid
            </p>
            <p className="mt-2 leading-relaxed text-[#C9CFC6]">{trip.sampleTip.pitfall}</p>
          </div>

          <div className="mt-6 border-t border-[#2A3D35] pt-5">
            <p className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.15em] text-[#7FA8DC]">
              What someone here would tell you
            </p>
            <p className="mt-2 leading-relaxed">{trip.sampleTip.insiderSecret}</p>
          </div>
        </figure>

        {/* ── 숙소·식당·예산 ───────────────────────────── */}
        <dl className="mt-14 grid gap-8 border-t border-[#DDD5C6] pt-10 sm:grid-cols-3">
          <div>
            <dt className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[#4A5D54]">
              Where to stay
            </dt>
            <dd className="mt-2 text-lg">{trip.picks.stay}</dd>
          </div>
          <div>
            <dt className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[#4A5D54]">
              Where to eat
            </dt>
            <dd className="mt-2 text-lg">{trip.picks.dining}</dd>
          </div>
          <div>
            <dt className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[#4A5D54]">
              Estimated total
            </dt>
            <dd className="mt-2 text-lg">{trip.totalEstimate}</dd>
          </div>
        </dl>

        {/* ── 여기서부터가 유료 ────────────────────────── */}
        <section className="mt-16 rounded-2xl bg-[#EDE7DB] p-7 sm:p-9">
          <h2 className="font-[family-name:var(--font-display)] text-3xl leading-tight">
            That&apos;s one tip. Every stop has one.
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-[#3D4A44]">
            The draft above is the shape of your trip. The full plan fills it in — a tip at every
            stop, five stays and five restaurants chosen for your budget, costs broken down, and
            exactly what to book and when, including the places that only take Korean phone
            reservations.
          </p>
          {/* TODO(#11): A6 상담 신청 화면이 생기면 이 주소로 연결된다. 아직 없다. */}
          <Link
            href={`/plan/${plan.id}/consult`}
            className="mt-8 inline-flex items-center rounded-full bg-[#12211C] px-8 py-3.5 text-base text-[#F2EDE3] transition-colors hover:bg-[#D8503C] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3E6FB0]"
          >
            Get the full plan
          </Link>
          <p className="mt-5 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#4A5D54]">
            Keep this link — your draft stays here
          </p>
        </section>
      </main>
    </div>
  );
}
