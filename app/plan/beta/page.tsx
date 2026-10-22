import type { Metadata } from "next";
import { BackgroundMotifs } from "@/components/DayPattern";
import BetaFlow from "./BetaFlow";

export const metadata: Metadata = {
  title: "나만의 여행 발견 · 베타 — mohallae",
  description: "끌리는 장면을 고르며 나만의 한국 여행 취향을 발견해 보세요.",
  robots: { index: false, follow: false },
};

export default function BetaPage() {
  return <><BackgroundMotifs /><BetaFlow /></>;
}
