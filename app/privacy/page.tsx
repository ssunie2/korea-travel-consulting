import Link from "next/link";
import { Instrument_Serif } from "next/font/google";

const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

// TODO(출시 전): 사업자등록이 끝나면 상호·대표자·사업자등록번호·주소를 채운다.
// TODO(출시 전): CONTACT 를 실제 이메일로 바꾼다. 지금은 placeholder라 문의가 도착하지 않는다.
const CONTACT = "hello@example.com";
const UPDATED = "12 August 2026";

export const metadata = {
  title: "Privacy Policy — mohallae",
  description: "What we collect, why, how long we keep it, and how to have it deleted.",
};

const collected = [
  {
    when: "When you ask for a free draft",
    where: "/plan",
    items: [
      "Where in Korea you want to go, your start date, how many days, how many travellers",
      "Budget per person and currency, travel styles, who you're travelling with, interests",
      "Dietary or accessibility notes, if you give them",
      "The language you want the draft written in",
      "The draft itself, once it is generated",
    ],
    note: "We do not ask for your name or contact details at this step. A draft is not linked to you.",
  },
  {
    when: "When you request a consultation",
    where: "/plan/[id]/consult",
    items: [
      "Your name and email address",
      "A messenger ID (KakaoTalk, WhatsApp or LINE), if you give one",
      "Anything you write in the message box",
      "A reference to the draft you were looking at",
    ],
  },
  {
    when: "When you send us a question",
    where: "/contact",
    items: ["Your email address", "Anything you write in the message box"],
  },
];

const processors = [
  {
    name: "Supabase",
    role: "Stores everything above in a database",
    where: "Seoul, South Korea",
  },
  {
    name: "Vercel",
    role: "Runs and serves this website",
    where: "Seoul, South Korea (server functions)",
  },
  {
    name: "Google (Gemini API)",
    role: "Writes your draft itinerary from the trip details you submit",
    where: "Outside Korea",
  },
];

export default function PrivacyPolicy() {
  return (
    <div
      className={`${display.variable} flex-1 bg-[#F2EDE3] text-[#1B211E] font-[family-name:var(--font-geist-sans)] selection:bg-[#D8503C] selection:text-[#F2EDE3]`}
    >
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="-my-2 py-2 font-[family-name:var(--font-display)] text-xl tracking-tight underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]"
        >
          mohallae
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-24">
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.2em] text-[#4A5D54]">
          Last updated {UPDATED}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[#3D4A44]">
          This page explains what we collect, why we collect it, who else sees it, how long we
          keep it, and how to have it deleted. If anything here is unclear, email us at{" "}
          <a
            href={`mailto:${CONTACT}`}
            className="underline underline-offset-4 hover:text-[#D8503C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]"
          >
            {CONTACT}
          </a>
          .
        </p>

        {/* 1 */}
        <section className="mt-12 border-t border-[#DDD5C6] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            1. What we collect
          </h2>
          <div className="mt-6 flex flex-col gap-8">
            {collected.map((group) => (
              <div key={group.when}>
                <p className="font-semibold">{group.when}</p>
                <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-xs text-[#4A5D54]">
                  {group.where}
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-3 leading-relaxed text-[#3D4A44]">
                      <span aria-hidden className="text-[#4A5D54]">
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {group.note ? (
                  <p className="mt-3 text-sm leading-relaxed text-[#4A5D54]">{group.note}</p>
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-6 leading-relaxed text-[#3D4A44]">
            We do not use cookies for advertising, we do not run analytics or tracking scripts,
            and we do not sell or share your details with anyone for marketing.
          </p>
        </section>

        {/* 2 — 민감정보 */}
        <section className="mt-12 border-t border-[#DDD5C6] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            2. Dietary and accessibility notes
          </h2>
          <p className="mt-4 leading-relaxed text-[#3D4A44]">
            The trip form has an optional box for dietary or accessibility needs. What you write
            there may reveal your religion (for example halal) or your health (for example a nut
            allergy or using a wheelchair). Both are treated as sensitive information under Korean
            and European law, so we handle that box differently:
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {[
              "It is optional. You can leave it empty and still get a draft.",
              "By filling it in, you are asking us to use it — that is the only reason we hold it.",
              "It is sent to Google's Gemini API so your draft can work around it. Nothing else receives it.",
              "It is never used for anything other than writing your itinerary.",
            ].map((item) => (
              <li key={item} className="flex gap-3 leading-relaxed text-[#3D4A44]">
                <span aria-hidden className="text-[#D8503C]">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-[#3D4A44]">
            If you would rather not write it down, leave the box empty and tell us over email once
            we are in touch.
          </p>
        </section>

        {/* 3 */}
        <section className="mt-12 border-t border-[#DDD5C6] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            3. Who else sees it
          </h2>
          <p className="mt-4 leading-relaxed text-[#3D4A44]">
            We use three companies to run this service. They only handle your details in order to
            provide their part of it.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#DDD5C6]">
                  <th className="py-2 pr-4 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#4A5D54]">
                    Company
                  </th>
                  <th className="py-2 pr-4 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#4A5D54]">
                    What it does
                  </th>
                  <th className="py-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#4A5D54]">
                    Where
                  </th>
                </tr>
              </thead>
              <tbody>
                {processors.map((p) => (
                  <tr key={p.name} className="border-b border-[#E7E0D2] align-top">
                    <td className="py-3 pr-4 font-semibold">{p.name}</td>
                    <td className="py-3 pr-4 text-[#3D4A44]">{p.role}</td>
                    <td className="py-3 text-[#3D4A44]">{p.where}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 leading-relaxed text-[#3D4A44]">
            Your trip details leave Korea when Google writes your draft. Your name, email and
            messenger ID are never sent to Google — they are only stored in our database in Seoul.
          </p>
        </section>

        {/* 4 */}
        <section className="mt-12 border-t border-[#DDD5C6] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            4. How long we keep it
          </h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <tbody>
                {[
                  ["Free drafts", "12 months from the day it was created"],
                  ["Consultation requests", "3 years after we last spoke"],
                  ["Questions sent through the contact form", "1 year"],
                ].map(([what, how]) => (
                  <tr key={what} className="border-b border-[#E7E0D2] align-top">
                    <td className="py-3 pr-4 font-semibold">{what}</td>
                    <td className="py-3 text-[#3D4A44]">{how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 leading-relaxed text-[#3D4A44]">
            After that we delete it. If the law requires us to keep a record of a paid
            transaction for longer, we keep only that record and nothing else.
          </p>
        </section>

        {/* 5 */}
        <section className="mt-12 border-t border-[#DDD5C6] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            5. What you can ask us to do
          </h2>
          <p className="mt-4 leading-relaxed text-[#3D4A44]">
            Email{" "}
            <a
              href={`mailto:${CONTACT}`}
              className="underline underline-offset-4 hover:text-[#D8503C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]"
            >
              {CONTACT}
            </a>{" "}
            and we will do any of these, free, within 30 days:
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {[
              "Send you a copy of everything we hold about you",
              "Correct anything that is wrong",
              "Delete everything we hold about you",
              "Stop using your details and keep them only where the law says we must",
            ].map((item) => (
              <li key={item} className="flex gap-3 leading-relaxed text-[#3D4A44]">
                <span aria-hidden className="text-[#4A5D54]">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-[#3D4A44]">
            To delete a free draft you do not need to email us — just stop using the link. It is
            deleted automatically after 12 months and is not connected to your name.
          </p>
        </section>

        {/* 6 */}
        <section className="mt-12 border-t border-[#DDD5C6] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            6. Keeping it safe
          </h2>
          <p className="mt-4 leading-relaxed text-[#3D4A44]">
            The database can only be reached by our own server, never from your browser. Our admin
            screen is behind a password. Everything travels over an encrypted connection. If
            something goes wrong and your details are exposed, we will tell you and the Korean
            authorities without delay.
          </p>
        </section>

        {/* 7 */}
        <section className="mt-12 border-t border-[#DDD5C6] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            7. Children
          </h2>
          <p className="mt-4 leading-relaxed text-[#3D4A44]">
            This service is for adults. We do not knowingly collect details from anyone under 14.
            If you believe a child has sent us their details, email us and we will delete them.
          </p>
        </section>

        {/* 8 */}
        <section className="mt-12 border-t border-[#DDD5C6] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            8. Who to contact
          </h2>
          {/* TODO(출시 전): 사업자등록 후 상호·대표자·등록번호·주소를 여기에 넣는다. */}
          <p className="mt-4 leading-relaxed text-[#3D4A44]">
            mohallae —{" "}
            <a
              href={`mailto:${CONTACT}`}
              className="underline underline-offset-4 hover:text-[#D8503C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]"
            >
              {CONTACT}
            </a>
          </p>
          <p className="mt-4 leading-relaxed text-[#3D4A44]">
            If we do not resolve your concern, you can complain to the Korea Internet &amp;
            Security Agency Privacy Center (privacy.go.kr, 118) or, if you are in Europe or the
            UK, to your national data protection authority.
          </p>
        </section>

        <section className="mt-12 border-t border-[#DDD5C6] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug">
            9. Changes
          </h2>
          <p className="mt-4 leading-relaxed text-[#3D4A44]">
            If we change how we handle your details, we will update this page and change the date
            at the top. If the change is significant and we have your email, we will tell you.
          </p>
        </section>

        <p className="mt-12 border-t border-[#DDD5C6] pt-8">
          <Link
            href="/"
            className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E6FB0]"
          >
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
