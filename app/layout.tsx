import type { Metadata } from "next";
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
  title: "Korea Travel Consulting",
  description: "Plan your Korea trip with local experts before you arrive.",
  // 출시 전까지 색인 금지. robots.ts 는 크롤러가 지켜줄 때만 듣지만,
  // 이 헤더는 이미 들어온 크롤러에게도 "담지 마라"고 말한다. 둘 다 둔다.
  // 손님을 받을 때 이 두 줄을 지운다.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
