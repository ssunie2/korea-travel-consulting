import Link from "next/link";
import { redirect } from "next/navigation";
import { Instrument_Serif } from "next/font/google";
import { supabaseServer } from "@/lib/supabase-server";
import { t } from "@/lib/copy";

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

const label = "font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[var(--c-text-3)]";
const field =
  "mt-2 w-full rounded-lg border border-[var(--c-line)] bg-[var(--c-surface)] px-4 py-3 text-base text-[var(--c-text)] focus:border-[var(--c-focus)] focus:outline-2 focus:outline-offset-0 focus:outline-[var(--c-focus)]";

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
      className={`${display.variable} flex-1 bg-[var(--c-bg)] text-[var(--c-text)] font-[family-name:var(--font-geist-sans)] selection:bg-[var(--c-accent)] selection:text-[var(--c-bg)]`}
    >
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="-my-3 inline-flex min-h-11 items-center font-[family-name:var(--font-geist-sans)] text-xl font-semibold tracking-[-0.02em] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]"
        >
          mohallae
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-24">
        {sent ? (
          <>
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight">
              {t({ ko: "받았습니다.", en: "Thanks — we\u2019ve got it." })}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[var(--c-text-2)]">
              {t({
                ko: "보내주신 내용은 전부 읽습니다. 답이 필요한 질문이면 이메일로 알려드리겠습니다.",
                en: "We read everything. If your question needs an answer, we'll email you back.",
              })}
            </p>
            <p className="mt-8 leading-relaxed text-[var(--c-text-2)]">
              {t({ ko: "그동안", en: "In the meantime," })}{" "}
              <Link href="/plan" className="underline underline-offset-4 hover:text-[var(--c-accent)]">
                {t({ ko: "여행 초안을 무료로 받아보세요", en: "get a free draft of your trip" })}
              </Link>{" "}
              {t({ ko: "— 2분이면 되고 값은 들지 않습니다.", en: "— it takes two minutes and costs nothing." })}
            </p>
          </>
        ) : (
          <>
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight">
              {t({ ko: "무엇이든 물어보세요", en: "Ask us anything" })}
            </h1>
            <p className="mt-5 leading-relaxed text-[var(--c-text-2)]">
              {t({
                ko: "여행 정보를 다 적기엔 아직 이르신가요? 그냥 물어보셔도 됩니다. 2월 한국이 무리인지, 서울과 부산에 나흘이면 되는지, 할랄이나 휠체어를 맞출 수 있는지 — 무엇이든요.",
                en: "Not ready to fill in a form about your trip? Just ask. Whether Korea in February is a mistake, whether four days is enough for Seoul and Busan, whether we can work around halal or a wheelchair — anything.",
              })}
            </p>

            {error && (
              <p role="alert" className="mt-8 rounded-lg border border-[var(--c-accent)] bg-[var(--c-error-bg)] px-4 py-3 text-[var(--c-error-text)]">
                {error === "1"
                  ? t({ ko: "답장받으실 이메일과 내용을 적어주세요.", en: "Please leave an email we can reply to, and a message." })
                  : t({ ko: "보내지 못했습니다. 다시 시도해 주세요.", en: "We couldn't send that. Please try again." })}
              </p>
            )}

            <form action={submit} className="mt-10 space-y-8">
              <label className="block">
                <span className={label}>{t({ ko: "이메일 *", en: "Email *" })}</span>
                <input type="email" name="email" required maxLength={200} className={field} />
              </label>

              <label className="block">
                <span className={label}>{t({ ko: "질문 *", en: "Your question *" })}</span>
                <textarea name="message" required rows={6} maxLength={2000} className={field} />
              </label>

              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-[var(--c-text)] px-8 py-3.5 text-base text-[var(--c-bg)] transition-colors hover:bg-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--c-focus)]"
              >
                {t({ ko: "보내기", en: "Send" })}
              </button>

              <p className="mt-4 text-sm leading-relaxed text-[var(--c-text-3)]">
                {t({ ko: "보내시면", en: "By sending this you agree to our" })}{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]"
                >
                  {t({ ko: "개인정보 처리방침", en: "privacy policy" })}
                </Link>
                {t({ ko: "에 동의하시는 것으로 봅니다. 이메일은 답장에만 씁니다.", en: ". We only use your email to reply." })}
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
