import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import type { FreeItinerary } from "@/lib/types";
import base from "../../mohallae.module.css";
import styles from "./plan.module.css";
import { draftCopy } from "./copy";
import { keepNumberWithWord, placeName, tripDates } from "./format";
import { langFrom, samples } from "../../content";
import TopBar from "./_components/TopBar";
import DayColumn from "./_components/DayColumn";
import LocalTip from "./_components/LocalTip";
import ClosingBand from "./_components/ClosingBand";
import TipReveal from "./_components/TipReveal";

/**
 * 새 결과 화면 — 무료 초안 (이슈 #86, 승인 시안 result-comp-3 "날짜별 기둥").
 *
 * 예전 결과 화면(app/plan/[id])은 그대로 두고, **같은 초안을 새 모양으로** 보여 준다.
 * DB·AI·신청 화면은 바꾸지 않는다. 새 랜딩의 샘플 카드가 여기로 온다.
 */

// 주소를 열 때마다 DB에서 최신을 읽는다 (예전 화면과 같다)
export const dynamic = "force-dynamic";

type DraftRow = {
  id: string;
  start_date: string;
  duration_days: number;
  travelers: number;
  destinations: string[];
  itinerary: FreeItinerary | null;
};

/**
 * 초안 한 줄을 읽는다. **이 화면에 필요한 칸만** 읽는다 — 손님이 적은 다른 정보(식단 등)는 여기서 쓰지 않는다.
 * 제목(메타데이터)과 화면이 같은 요청 안에서 두 번 읽지 않도록 cache 로 묶었다.
 * 아이디를 찍어 맞춰 들어온 경우, DB가 잠든 경우(#71)도 null 이 되어 404 로 간다.
 */
const getDraft = cache(async (id: string) => {
  const { data, error } = await supabaseServer()
    .from("plans")
    .select("id, start_date, duration_days, travelers, destinations, itinerary")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as DraftRow;
});

export async function generateMetadata({ params }: PageProps<"/mohallae/plan/[id]">): Promise<Metadata> {
  const draft = await getDraft((await params).id);
  return draft?.itinerary ? { title: `${draft.itinerary.tripTitle} — mohallae` } : {};
}

export default async function DraftPage({ params, searchParams }: PageProps<"/mohallae/plan/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const lang = langFrom(query.lang);
  const draft = await getDraft(id);
  if (!draft) notFound();

  const trip = draft.itinerary;

  // 랜딩의 샘플 카드로 들어온 남의 초안인지. 그렇다면 '무료 초안'·링크 보관·$25 버튼 대신
  // '샘플 초안' 표시와 '무료 초안 받기'(내 여행으로)를 보여 준다 — 남의 여행으로 신청이 들어가지 않게.
  const isSample = samples.items.some((s) => s.id === draft.id);

  // AI 생성이 실패한 채 저장된 경우. 빈 화면 대신 다시 해 볼 길을 준다 (예전 화면과 같은 글).
  if (!trip) {
    return (
      <div lang={lang} className={`${base.page} flex flex-1 flex-col`}>
        <TopBar lang={lang} planId={draft.id} isSample={isSample} />
        <main className={`${styles.wrap} ${styles.failed}`}>
          <h1>{draftCopy.failedTitle[lang]}</h1>
          <p>{draftCopy.failedBody[lang]}</p>
          <Link href="/plan" className={`${base.pillDark} mt-8 h-[46px] px-7 text-[16px]`}>
            {draftCopy.startOver[lang]}
          </Link>
        </main>
      </div>
    );
  }

  /*
    팁이 걸린 날을 먼저 찾아 둔다 (예전 화면의 규칙 그대로): 그날 기둥 안에 한 번, 못 찾으면 기둥들 아래에 한 번.
    AI 가 4일 여행에 dayNumber: 5 를 주거나 숫자 대신 글자 "3" 을 줘도 팁이 사라지지 않는다.
    찾아낸 날 자체를 비교하므로 dayNumber 가 겹쳐도 두 번 그려지지 않는다. 정거장이 없는 날에는 걸지 않는다.
  */
  const tipDay = trip.days.find((d) => d.dayNumber === trip.sampleTip.dayNumber && d.activities.length > 0);

  // 도시가 실제로 바뀌는 여행에서만 날마다 도시를 적는다 (빈 값은 세지 않는다)
  const multiCity = new Set(trip.days.map((d) => d.city).filter(Boolean)).size > 1;

  // 써니 요청: 칸을 줄이지 않는다. 1일=한 칸, 2·4일=두 칸씩(4일은 2×2), 그 밖=세 칸씩
  const count = trip.days.length;
  const cols = count === 1 ? "1" : count === 2 || count === 4 ? "2" : "3";

  const meta = [
    tripDates(lang, draft.start_date, draft.duration_days),
    draftCopy.travelers[lang](draft.travelers),
    draft.destinations.map((d) => placeName(lang, d)).join(", "),
  ].filter(Boolean);

  return (
    <div lang={lang} className={`${base.page} flex flex-1 flex-col`}>
      <TopBar lang={lang} planId={draft.id} isSample={isSample} />

      <main className="flex flex-1 flex-col">
        <div className={styles.wrap}>
          <div className={styles.head}>
            <div className={styles.headMain}>
              <p className={styles.meta}>
                {meta.map((part, i) => (
                  <span key={i}>
                    {i > 0 && (
                      <span aria-hidden="true" className={styles.sep}>
                        ·
                      </span>
                    )}
                    {i > 0 && <span className="sr-only">, </span>}
                    {part}
                  </span>
                ))}
              </p>
              <h1 className={styles.title}>{keepNumberWithWord(trip.tripTitle)}</h1>
            </div>
            <p className={styles.summary}>{trip.summary}</p>
          </div>

          <ol className={styles.days} data-cols={cols}>
            {trip.days.map((day, i) => (
              <DayColumn
                key={`${i}-${day.dayNumber}`}
                day={day}
                startDate={draft.start_date}
                showCity={multiCity}
                lang={lang}
                tip={day === tipDay ? trip.sampleTip : undefined}
              />
            ))}
          </ol>

          {/* 걸릴 날을 못 찾은 팁 — 옛 초안, 그리고 엉뚱한 날짜 */}
          {!tipDay && (
            <TipReveal>
              <LocalTip
                tip={trip.sampleTip}
                lang={lang}
                place={trip.sampleTip.activityName}
                className={`${styles.looseTip} ${styles.tipReveal}`}
              />
            </TipReveal>
          )}
        </div>

        <ClosingBand planId={draft.id} trip={trip} lang={lang} isSample={isSample} />
      </main>
    </div>
  );
}
