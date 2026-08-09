import Link from "next/link";
import { Instrument_Serif } from "next/font/google";

// 표제용 서체. layout.tsx 를 건드리지 않으려고 이 화면에서만 불러온다.
const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

const steps = [
  {
    title: "Tell us about your trip",
    body: "Dates, how long, who's coming, what you're into. Two minutes.",
  },
  {
    title: "Get a free draft",
    body: "A day-by-day outline, plus one concierge tip so you can judge the rest.",
  },
  {
    title: "Book a consultation",
    body: "We turn the outline into a real plan and handle the bookings that need Korean.",
  },
];

const free = [
  "Day-by-day themes, three activities a day",
  "One concierge tip, in full",
  "One place to stay, one place to eat",
  "A total budget estimate",
];

const paid = [
  "A tip on every stop — what to skip, what locals do",
  "Five stays and five restaurants, with reasons",
  "Costs broken down, routes and timing adjusted",
  "Reservations, translation, changes while you're here",
];

export default function Home() {
  return (
    <div
      className={`${display.variable} flex-1 bg-[#F2EDE3] text-[#1B211E] font-[family-name:var(--font-geist-sans)] selection:bg-[#D8503C] selection:text-[#F2EDE3]`}
    >
      {/* ── nav ─────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-[family-name:var(--font-display)] text-xl tracking-tight">
          Korea Travel Consulting
        </span>
        <nav className="flex items-center gap-6 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest">
          <a href="#pricing" className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]">
            Pricing
          </a>
          <a href="#contact" className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]">
            Contact
          </a>
        </nav>
      </header>

      {/* ── hero ────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-8 pb-20 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-16 md:pt-16">
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#4A5D54]">
            Before you fly
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.75rem,7vw,4.5rem)] leading-[0.95] tracking-tight">
            Plan Korea like
            <br />
            you know someone
            <br />
            <em className="italic">who lives here.</em>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#3D4A44]">
            Tell us about your trip and get a free day-by-day draft — including one
            tip a guidebook won&apos;t give you. Book a consultation when you want
            the rest.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/plan"
              className="inline-flex items-center rounded-full bg-[#12211C] px-8 py-3.5 text-base text-[#F2EDE3] transition-colors hover:bg-[#D8503C] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3E6FB0]"
            >
              Get your free draft
            </Link>
            <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#4A5D54]">
              No account needed
            </span>
          </div>
        </div>

        {/* ── signature: the concierge tip, shown not described ── */}
        <figure className="relative rounded-2xl bg-[#12211C] p-7 text-[#E8E2D6] shadow-[0_24px_60px_-24px_rgba(18,33,28,0.55)] sm:p-9">
          <span
            aria-hidden
            className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-[#A8C3B4] to-transparent sm:inset-x-9"
          />
          <figcaption className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-[#A8C3B4]">
            Sample concierge tip
          </figcaption>
          <p className="mt-4 font-[family-name:var(--font-display)] text-2xl leading-snug">
            Gyeongbokgung Palace
          </p>

          <div className="mt-7 border-t border-[#2A3D35] pt-5">
            <p className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.15em] text-[#D8503C]">
              What most itineraries say
            </p>
            <p className="mt-2 text-[#8FA093] line-through decoration-[#D8503C] decoration-1">
              Tuesday morning, 10:00 — start here.
            </p>
          </div>

          <div className="mt-6 border-t border-[#2A3D35] pt-5">
            <p className="font-[family-name:var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.15em] text-[#7FA8DC]">
              What someone here would tell you
            </p>
            <p className="mt-2 leading-relaxed">
              It&apos;s closed on Tuesdays. Go Wednesday — and wear hanbok. The
              rental shops are right outside the gate, and wearing it makes
              admission free.
            </p>
          </div>
        </figure>
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
                Consultation
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
        </div>
      </section>

      {/* ── pricing + contact ───────────────────────────── */}
      <section
        id="pricing"
        className="border-t border-[#DDD5C6] scroll-mt-20"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#4A5D54]">
              Pricing
            </p>
            {/* TODO(#7): 상담 가격이 정해지면 이 문단을 실제 금액으로 교체한다. */}
            <p className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight md:text-4xl">
              The draft is free. Consultations are priced per trip.
            </p>
            <p className="mt-4 max-w-md leading-relaxed text-[#3D4A44]">
              Length and how much booking you want us to handle change the price.
              Ask and we&apos;ll quote it before you commit to anything.
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
              {/* TODO(#12): A10 문의하기 화면이 생기면 /contact 로 바꾼다. */}
              <a
                href="mailto:hello@example.com"
                className="underline underline-offset-4 hover:text-[#D8503C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]"
              >
                Email us
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#DDD5C6]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 font-[family-name:var(--font-geist-mono)] text-xs text-[#4A5D54] sm:flex-row sm:items-center sm:justify-between">
          <span>Korea Travel Consulting</span>
          <span>Seoul, Korea</span>
        </div>
      </footer>
    </div>
  );
}
