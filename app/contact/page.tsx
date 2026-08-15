import Link from "next/link";
import { redirect } from "next/navigation";
import { Instrument_Serif } from "next/font/google";
import { supabaseServer } from "@/lib/supabase-server";

const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata = {
  title: "Contact — mohallae",
  description: "Ask us anything about planning your trip to Korea.",
};

const label = "font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[#4A5D54]";
const field =
  "mt-2 w-full rounded-lg border border-[#CFC6B4] bg-white px-4 py-3 text-base text-[#1B211E] focus:border-[#3E6FB0] focus:outline-2 focus:outline-offset-0 focus:outline-[#3E6FB0]";

/** 상담 신청(#11)과 같은 방식. 서버 액션이라 자바스크립트 없이도 문의가 들어온다. */
async function submit(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const message = String(formData.get("message") ?? "").trim().slice(0, 2000);

  // 화면에서만 막으면 서버를 직접 부르는 방법으로 뚫린다
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
    redirect("/contact?error=1");
  }

  const { error } = await supabaseServer().from("inquiries").insert({ email, message });

  if (error) {
    console.error("saving inquiry failed:", error);
    redirect("/contact?error=2");
  }

  redirect("/contact?sent=1");
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <div
      className={`${display.variable} flex-1 bg-[#F2EDE3] text-[#1B211E] font-[family-name:var(--font-geist-sans)] selection:bg-[#D8503C] selection:text-[#F2EDE3]`}
    >
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="-my-3 inline-flex min-h-11 items-center font-[family-name:var(--font-display)] text-xl tracking-tight underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]"
        >
          mohallae
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-24">
        {sent ? (
          <>
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight">
              Thanks — we&apos;ll get back to you.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#3D4A44]">
              We read everything and usually reply within one business day.
            </p>
            <p className="mt-8 leading-relaxed text-[#3D4A44]">
              In the meantime,{" "}
              <Link href="/plan" className="underline underline-offset-4 hover:text-[#D8503C]">
                get a free draft of your trip
              </Link>{" "}
              — it takes two minutes and costs nothing.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight">
              Ask us anything
            </h1>
            <p className="mt-5 leading-relaxed text-[#3D4A44]">
              Not ready to fill in a form about your trip? Just ask. Whether Korea in February is a
              mistake, whether four days is enough for Seoul and Busan, whether we can work around
              halal or a wheelchair — anything.
            </p>

            {error && (
              <p role="alert" className="mt-8 rounded-lg border border-[#D8503C] bg-[#F8E7E3] px-4 py-3 text-[#8E2C1B]">
                {error === "1"
                  ? "Please leave an email we can reply to, and a message."
                  : "We couldn't send that. Please try again."}
              </p>
            )}

            <form action={submit} className="mt-10 space-y-8">
              <label className="block">
                <span className={label}>Email *</span>
                <input type="email" name="email" required maxLength={200} className={field} />
              </label>

              <label className="block">
                <span className={label}>Your question *</span>
                <textarea name="message" required rows={6} maxLength={2000} className={field} />
              </label>

              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-[#12211C] px-8 py-3.5 text-base text-[#F2EDE3] transition-colors hover:bg-[#D8503C] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3E6FB0]"
              >
                Send
              </button>

              <p className="mt-4 text-sm leading-relaxed text-[#4A5D54]">
                By sending this you agree to our{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-[#D8503C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]"
                >
                  privacy policy
                </Link>
                . We only use your email to reply.
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
