import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Instrument_Serif } from "next/font/google";
import { supabaseServer } from "@/lib/supabase-server";
import type { Plan } from "@/lib/types";

const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const dynamic = "force-dynamic";

const label = "font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[#4A5D54]";
const field =
  "mt-2 w-full rounded-lg border border-[#CFC6B4] bg-white px-4 py-3 text-base text-[#1B211E] focus:border-[#3E6FB0] focus:outline-2 focus:outline-offset-0 focus:outline-[#3E6FB0]";

/**
 * 신청을 받는다.
 *
 * 서버 액션으로 처리해서 **자바스크립트가 안 돌아도 신청이 들어온다.**
 * 여기가 돈이 시작되는 지점이라 브라우저 사정으로 새면 안 된다.
 */
async function submit(formData: FormData) {
  "use server";

  const planId = String(formData.get("planId"));
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const messenger = String(formData.get("messenger") ?? "").trim().slice(0, 80);
  const message = String(formData.get("message") ?? "").trim().slice(0, 2000);

  // 브라우저가 막아주는 것과 별개로 서버에서 다시 본다
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(`/plan/${planId}/consult?error=1`);
  }

  const { error } = await supabaseServer().from("consultations").insert({
    plan_id: planId,
    name,
    email,
    messenger: messenger || null,
    message: message || null,
  });

  if (error) {
    console.error("saving consultation failed:", error);
    redirect(`/plan/${planId}/consult?error=2`);
  }

  redirect(`/plan/${planId}/consult?sent=1`);
}

export default async function ConsultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { id } = await params;
  const { sent, error } = await searchParams;

  const { data } = await supabaseServer().from("plans").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const plan = data as Plan;

  const shell = (children: React.ReactNode) => (
    <div
      className={`${display.variable} flex-1 bg-[#F2EDE3] text-[#1B211E] font-[family-name:var(--font-geist-sans)] selection:bg-[#D8503C] selection:text-[#F2EDE3]`}
    >
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="-my-2 py-2 font-[family-name:var(--font-display)] text-xl tracking-tight underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]"
        >
          Korea Travel Consulting
        </Link>
        {/* min-h-11: 손가락으로 누를 수 있는 최소 크기(44px)를 보장한다 */}
        <Link
          href={`/plan/${plan.id}`}
          className="-my-3 inline-flex min-h-11 items-center font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#4A5D54] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]"
        >
          Back to draft
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-6 pb-24">{children}</main>
    </div>
  );

  if (sent) {
    return shell(
      <>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight">
          We&apos;ve got it.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[#3D4A44]">
          We&apos;ll email you within one business day with what we can do for this trip and what
          it costs. Nothing is charged until you say yes.
        </p>
        <p className="mt-8 leading-relaxed text-[#3D4A44]">
          Your free draft stays where it is —{" "}
          <Link href={`/plan/${plan.id}`} className="underline underline-offset-4 hover:text-[#D8503C]">
            keep this link
          </Link>
          .
        </p>
      </>
    );
  }

  return shell(
    <>
      <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight">
        Get the full plan
      </h1>
      <p className="mt-5 leading-relaxed text-[#3D4A44]">
        We take what you told us and work out the route that wastes the least time, and where your
        money goes furthest. A tip at every stop, five places to stay and five to eat, costs broken
        down, and exactly what to book and when — including the places that only take Korean phone
        reservations.
      </p>
      <p className="mt-3 leading-relaxed text-[#3D4A44]">
        Leave your details and we&apos;ll reply within one business day with the price for this
        trip. <strong>Nothing is charged until you agree.</strong>
      </p>
      {/* 우리는 여행업자가 아니다. 예약은 손님이 직접 한다 — 이 선을 손님에게도 분명히 해둔다 */}
      <p className="mt-3 leading-relaxed text-[#4A5D54]">
        We plan; you book. We don&apos;t make reservations for you or take payment for hotels,
        restaurants or tickets — we tell you exactly what to book and how.
      </p>

      {error && (
        <p role="alert" className="mt-8 rounded-lg border border-[#D8503C] bg-[#F8E7E3] px-4 py-3 text-[#8E2C1B]">
          {error === "1"
            ? "Please check your name and email."
            : "We couldn't save that. Please try again."}
        </p>
      )}

      <form action={submit} className="mt-10 space-y-8">
        <input type="hidden" name="planId" value={plan.id} />

        <label className="block">
          <span className={label}>Your name *</span>
          <input name="name" required maxLength={80} className={field} />
        </label>

        <label className="block">
          <span className={label}>Email *</span>
          <input type="email" name="email" required maxLength={200} className={field} />
        </label>

        <label className="block">
          <span className={label}>KakaoTalk / WhatsApp / LINE ID</span>
          <input name="messenger" maxLength={80} placeholder="Optional — often faster than email" className={field} />
        </label>

        <label className="block">
          <span className={label}>Anything else we should know?</span>
          <textarea name="message" rows={4} maxLength={2000} className={field} />
        </label>

        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-[#12211C] px-8 py-3.5 text-base text-[#F2EDE3] transition-colors hover:bg-[#D8503C] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3E6FB0]"
        >
          Send my request
        </button>
      </form>
    </>
  );
}
