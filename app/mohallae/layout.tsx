import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { t } from "@/lib/copy";

/**
 * 새 버전(/mohallae)의 바깥 틀. 기존 사이트와 **나란히 비교하려고** 따로 만든다 (이슈 #86).
 *
 * - 공용 파일(app/layout.tsx, app/globals.css)은 건드리지 않는다. 기존 사이트는 어두운 초록 바탕이라
 *   이 틀이 흰 바탕·글자색·글꼴을 **자기 안에서만** 다시 정한다.
 * - 글꼴 Figtree 는 승인한 시안 ②의 제목 글자와 가장 가깝게 맞는 서체다 (시안 측정으로 골랐다).
 *   한글 글자는 Figtree 에 없어서 기기의 한글 글꼴(애플 산돌고딕 Neo 등)로 이어진다.
 * - 검색 차단(robots)은 바깥 틀(app/layout.tsx)의 설정을 그대로 물려받는다.
 */
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: t({
    ko: "mohallae — 한국에 아는 사람 있는 것처럼 여행하세요",
    en: "mohallae — Plan Korea like you know someone who lives here",
  }),
};

export default function MohallaeLayout({ children }: LayoutProps<"/mohallae">) {
  return <div className={`${figtree.variable} flex flex-1 flex-col`}>{children}</div>;
}
