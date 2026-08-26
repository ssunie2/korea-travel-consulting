import type { Metadata } from "next";
import { LANG, t } from "@/lib/copy";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: t({
    ko: "mohallae — 여기 사는 사람을 아는 것처럼, 한국을 여행하세요",
    en: "mohallae — Travel Korea like you know someone who lives here",
  }),
  description: t({
    ko: "도착하기 전에, 한국을 아는 사람과 일정을 짭니다.",
    en: "Plan your Korea trip with local experts before you arrive.",
  }),
  // 출시 전까지 색인 금지. robots.ts 는 크롤러가 지켜줄 때만 듣지만,
  // 이 헤더는 이미 들어온 크롤러에게도 "담지 마라"고 말한다. 둘 다 둔다.
  // 손님을 받을 때 이 두 줄을 지운다.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // 화면 낭독기가 어느 말로 읽을지 정한다. 한국어 글을 lang="en" 으로 두면
    // 영어 발음으로 읽어 알아들을 수 없다. LANG 을 따라가므로 출시 때 같이 넘어간다.
    <html
      lang={LANG}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
