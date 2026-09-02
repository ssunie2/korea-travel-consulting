import Link from "next/link";
import { notFound } from "next/navigation";
import { Instrument_Serif } from "next/font/google";
import { supabaseServer } from "@/lib/supabase-server";
import { t } from "@/lib/copy";
import type { FullItinerary, Plan, PlaceRecommendation } from "@/lib/types";

const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const dynamic = "force-dynamic";

const mono = "font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[var(--c-text-3)]";

function Places({ title, items }: { title: string; items: PlaceRecommendation[] }) {
  return (
    <div>
      <h3 className={mono}>{title}</h3>
      <ul className="mt-3 space-y-4">
        {items.map((p) => (
          <li key={p.name}>
            <p className="text-lg leading-tight">{p.name}</p>
            <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[0.7rem] uppercase tracking-widest text-[var(--c-text-3)]">
              {p.area} · {p.priceLevel}
            </p>
            <p className="mt-1 leading-relaxed text-[var(--c-text-2)]">{p.reason}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function FullPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await supabaseServer().from("plans").select("*").eq("id", id).maybeSingle();
  if (error || !data) notFound();

  const plan = data as Plan & { full_itinerary: FullItinerary | null };
  // 아직 만들지 않은 초안의 유료 주소는 존재하지 않는 것으로 취급한다.
  if (!plan.full_itinerary) notFound();

  const trip = plan.full_itinerary;

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
        <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[var(--c-accent)]">
          {t({ ko: "전체 일정", en: "Full plan" })}
        </span>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.02] tracking-tight">
          {trip.tripTitle}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--c-text-2)]">{trip.summary}</p>

        {/* ── 예산 — 우리가 파는 것 중 하나. 위에 둔다 ── */}
        <section className="mt-12 rounded-2xl bg-[var(--c-surface)] p-7 sm:p-9">
          <h2 className={mono}>{t({ ko: "비용 분해", en: "Your money" })}</h2>
          <p className="mt-3 text-lg leading-relaxed">{trip.costBreakdown.budgetFit}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {[
              [t({ ko: "총액", en: "Total" }), trip.costBreakdown.totalEstimate],
              [t({ ko: "숙소", en: "Stay" }), trip.costBreakdown.accommodation],
              [t({ ko: "식사", en: "Food" }), trip.costBreakdown.dining],
              [t({ ko: "교통", en: "Transport" }), trip.costBreakdown.transport],
              [t({ ko: "체험·입장", en: "Activities" }), trip.costBreakdown.activities],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-widest text-[var(--c-text-3)]">
                  {k}
                </dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-8 font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.15em] text-[var(--c-accent)]">
            {t({ ko: "같은 돈으로 더 나은 여행", en: "Same money, better trip" })}
          </h3>
          <ul className="mt-3 space-y-2">
            {trip.costBreakdown.valueMoves.map((m, i) => (
              <li key={i} className="flex gap-3 leading-relaxed">
                <span aria-hidden className="text-[var(--c-accent)]">
                  —
                </span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 일자별 ── */}
        <ol className="mt-16 space-y-16">
          {trip.days.map((day) => (
            <li key={day.dayNumber}>
              <div className="flex items-baseline gap-4">
                <span className="font-[family-name:var(--font-geist-mono)] text-xs text-[var(--c-accent)]">
                  {String(day.dayNumber).padStart(2, "0")}
                </span>
                <h2 className="font-[family-name:var(--font-display)] text-2xl leading-tight">{day.theme}</h2>
              </div>

              {/* 왜 이 순서인지 — 손님이 돈을 낸 이유 */}
              <p className="mt-3 border-l-2 border-[var(--c-focus)] pl-4 leading-relaxed text-[var(--c-text-2)]">
                <span className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-widest text-[var(--c-focus)]">
                  {day.area}
                </span>
                <br />
                {day.routeNote}
              </p>

              <ul className="mt-6 space-y-8 border-l border-[var(--c-line-2)] pl-6">
                {day.activities.map((a, i) => (
                  <li key={i}>
                    <p className="font-[family-name:var(--font-geist-mono)] text-[0.7rem] uppercase tracking-[0.15em] text-[var(--c-text-3)]">
                      {a.time}
                      {a.duration && ` · ${a.duration}`}
                      {a.estimatedCost && ` · ${a.estimatedCost}`}
                    </p>
                    <p className="mt-1 text-lg">{a.name}</p>
                    {a.gettingThere && (
                      <p className="mt-1 text-sm text-[var(--c-focus)]">↳ {a.gettingThere}</p>
                    )}
                    <p className="mt-2 leading-relaxed text-[var(--c-text-2)]">{a.description}</p>

                    <div className="mt-4 rounded-xl bg-[var(--c-deep)] p-5 text-[var(--c-text-on-deep)]">
                      <p className="leading-relaxed">{a.tips.highlight}</p>
                      <p className="mt-3 border-t border-[var(--c-line)] pt-3 leading-relaxed text-[var(--c-text-on-deep)]">
                        <span className="font-[family-name:var(--font-geist-mono)] text-[0.6rem] uppercase tracking-widest text-[var(--c-accent-on-deep)]">
                          {t({ ko: "피하실 것", en: "Avoid" })}
                        </span>
                        <br />
                        {a.tips.pitfall}
                      </p>
                      <p className="mt-3 border-t border-[var(--c-line)] pt-3 leading-relaxed">
                        <span className="font-[family-name:var(--font-geist-mono)] text-[0.6rem] uppercase tracking-widest text-[var(--c-focus-on-deep)]">
                          {t({ ko: "여기 사는 사람은 이렇게", en: "Local knows" })}
                        </span>
                        <br />
                        {a.tips.insiderSecret}
                      </p>
                      {a.tips.reservationRequired && (
                        <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-widest text-[var(--c-accent-on-deep)]">
                          {t({ ko: "미리 예약하세요", en: "Book ahead" })}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {day.photoSpot && (
                <p className="mt-6 leading-relaxed text-[var(--c-text-2)]">
                  <span className={mono}>{t({ ko: "사진", en: "Photo" })} · {day.photoSpot.name}</span>
                  <br />
                  {day.photoSpot.bestTime} — {day.photoSpot.advice}
                </p>
              )}
            </li>
          ))}
        </ol>

        {/* ── 추천 ── */}
        <section className="mt-16 grid gap-10 border-t border-[var(--c-line-2)] pt-12 sm:grid-cols-3 sm:gap-8">
          <Places title={t({ ko: "묵을 곳", en: "Where to stay" })} items={trip.picks.stay} />
          <Places title={t({ ko: "먹을 곳", en: "Where to eat" })} items={trip.picks.dining} />
          <Places title={t({ ko: "카페", en: "Cafes" })} items={trip.picks.cafes} />
        </section>

        {/* ── 날씨·짐 ── */}
        <section className="mt-14 grid gap-10 border-t border-[var(--c-line-2)] pt-12 sm:grid-cols-2">
          <div>
            <h2 className={mono}>{t({ ko: "입을 것", en: "What to wear" })}</h2>
            <p className="mt-3 leading-relaxed text-[var(--c-text-2)]">{trip.clothing.weatherSummary}</p>
            <ul className="mt-3 space-y-1">
              {trip.clothing.outfits.map((o, i) => (
                <li key={i} className="leading-relaxed">
                  {o}
                </li>
              ))}
            </ul>
            <p className="mt-3 leading-relaxed text-[var(--c-text-2)]">{trip.clothing.advice}</p>
          </div>
          <div>
            <h2 className={mono}>{t({ ko: "챙길 것", en: "Pack this" })}</h2>
            <ul className="mt-3 space-y-1">
              {trip.packingTips.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
