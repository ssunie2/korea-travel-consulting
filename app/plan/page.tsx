"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { t } from "@/lib/copy";
import DateRangePicker, { nightsBetween } from "@/components/DateRangePicker";
import Select from "@/components/Select";

// 표제용 서체. 랜딩·결과 화면과 같은 방식으로 이 화면에서만 불러온다.
const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

/** 값은 영어로 보낸다 — AI 가 읽는 건 이 값이다. 화면에 보이는 이름만 언어를 따른다. */
/**
 * 고를 수 있는 여행지. **가까운 곳끼리 붙여 뒀다** — 손님은 지도를 그리며 고르지
 * 가나다순으로 찾지 않는다. 서울 옆에 인천(공항 도시), 강원끼리, 남해안끼리 묶었다.
 *
 * 여기 없는 곳은 아래 "그 외" 를 눌러 직접 적는다.
 */
const DESTINATIONS = [
  { v: "Seoul", ko: "서울" }, { v: "Incheon", ko: "인천" },
  { v: "Chuncheon", ko: "춘천" }, { v: "Gangneung", ko: "강릉" }, { v: "Sokcho", ko: "속초" },
  { v: "Gyeongju", ko: "경주" }, { v: "Andong", ko: "안동" }, { v: "Pohang", ko: "포항" },
  { v: "Daegu", ko: "대구" }, { v: "Busan", ko: "부산" }, { v: "Tongyeong", ko: "통영" },
  { v: "Jeonju", ko: "전주" }, { v: "Yeosu", ko: "여수" }, { v: "Mokpo", ko: "목포" },
  { v: "Jeju", ko: "제주" },
];
/**
 * 관심사. **비슷한 것끼리 붙여 뒀다** — 먹고 보는 것, 한국다운 것, 밖에서 노는 것,
 * 실내에서 보는 것, 사고 노는 것 순이다. 여기 없는 것은 "그 외" 에 적는다.
 */
const STYLES = [
  { v: "Food", ko: "먹거리" }, { v: "Culture & history", ko: "문화·역사" },
  { v: "K-culture", ko: "K-컬처" }, { v: "Hanbok", ko: "한복 체험" },
  { v: "Nature & hiking", ko: "자연·등산" }, { v: "Beaches", ko: "바다·해변" },
  { v: "Hot springs & jjimjilbang", ko: "온천·찜질방" }, { v: "Theme parks", ko: "테마파크" },
  { v: "Art & exhibitions", ko: "미술관·전시" }, { v: "Shopping", ko: "쇼핑" },
  { v: "Nightlife", ko: "밤 문화" }, { v: "Photo spots", ko: "사진 명소" },
];
const AUDIENCES = [
  { v: "Solo", ko: "혼자" }, { v: "Couple", ko: "커플" }, { v: "Friends", ko: "친구" },
  { v: "Family with kids", ko: "아이와 함께" }, { v: "With parents", ko: "부모님과" },
];
/**
 * 아래 목록들은 **문서의 짜임을 바꾸는 답**이다. 같은 도시라도 이 값에 따라
 * 하루에 넣는 일정 수, 동선, 시작 시각이 달라진다. 값(v)은 영어 라벨을 그대로 쓴다 —
 * 이 글자가 그대로 AI 프롬프트로 나가기 때문에 코드값을 따로 두면 번역을 한 번 더 해야 한다.
 */
const PACES = [
  { v: "Packed", ko: "빡빡하게 — 많이 보고 싶어요" },
  { v: "Balanced", ko: "보통" },
  { v: "Relaxed", ko: "여유롭게 — 쉬엄쉬엄" },
];
const VISITS = [
  { v: "First time", ko: "처음이에요" },
  { v: "Been before", ko: "와본 적 있어요" },
];
const TRANSPORTS = [
  { v: "Subway and bus", ko: "지하철·버스" },
  { v: "Rental car", ko: "렌터카" },
  { v: "Mostly taxi", ko: "택시 위주" },
];
const STAY_AREAS = [
  { v: "City centre", ko: "도심 한가운데" },
  { v: "Quiet neighbourhood", ko: "조용한 동네" },
];
const RHYTHMS = [
  { v: "Early start", ko: "일찍 시작할게요" },
  { v: "Late start", ko: "늦게 시작할게요" },
];
const OCCASIONS = [
  { v: "Birthday", ko: "생일" },
  { v: "Anniversary", ko: "기념일" },
  { v: "Honeymoon", ko: "신혼여행" },
  { v: "Graduation", ko: "졸업·합격" },
];
/** 여러 개 고르는 것 */
const DIETARY = [
  { v: "Halal", ko: "할랄" }, { v: "Vegetarian", ko: "채식" }, { v: "Vegan", ko: "비건" },
  { v: "Nut allergy", ko: "견과류 알레르기" }, { v: "Dairy allergy", ko: "유제품 알레르기" },
  { v: "Seafood allergy", ko: "해산물 알레르기" }, { v: "No spicy food", ko: "매운 음식 못 먹음" },
  { v: "Wheelchair access", ko: "휠체어 접근" }, { v: "Stroller", ko: "유아차" },
  { v: "Hard to walk far", ko: "오래 걷기 어려움" },
];
const AVOIDS = [
  { v: "Crowded places", ko: "사람 많은 곳" }, { v: "Lots of stairs", ko: "계단 많은 곳" },
  { v: "Spicy food", ko: "매운 음식" }, { v: "Late nights", ko: "늦은 밤 일정" },
  { v: "Long travel legs", ko: "긴 이동" }, { v: "Drinking", ko: "술자리" },
];
/**
 * 1인 예산 구간. **여행 전체 기준이다** — 하루치가 아니다.
 * 처음에는 하루치처럼 낮게 잡았는데, 최소 2박은 하는 여행이라 액수가 턱없이 적었다.
 *
 * **숫자를 직접 적게 하면 손님이 멈춘다** — 한국 물가를 모르니 얼마를 적어야 할지
 * 감이 없다. 보기에서 고르면 그 자리에서 넘어간다.
 *
 * 원화 옆에 달러를 같이 적는다. 손님은 해외 여행객이라 원화 감각이 없고,
 * 달러만 적으면 우리가 실제로 짤 예산과 어긋난다. (1달러 ≈ 1,350원으로 어림한 값)
 * 보기에 없으면 '기타' 로 직접 적는다.
 */
const BUDGETS = [
  { v: "Under 150,000 KRW (about $110) for the whole trip", ko: "15만원 미만 (약 $110)" },
  { v: "150,000–250,000 KRW (about $110–185) for the whole trip", ko: "15–25만원 (약 $110–185)" },
  { v: "250,000–350,000 KRW (about $185–260) for the whole trip", ko: "25–35만원 (약 $185–260)" },
  { v: "350,000–500,000 KRW (about $260–370) for the whole trip", ko: "35–50만원 (약 $260–370)" },
  { v: "Over 500,000 KRW (about $370) for the whole trip", ko: "50만원 이상 (약 $370)" },
];
const CURRENCIES = ["KRW", "USD", "EUR", "JPY"];
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ko", label: "한국어" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

const label = "font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[var(--c-text-3)]";
const field =
  "mt-2 w-full rounded-lg border border-[var(--c-line)] bg-[var(--c-surface)] px-4 py-3 text-base text-[var(--c-text)] focus:border-[var(--c-focus)] focus:outline-2 focus:outline-offset-0 focus:outline-[var(--c-focus)]";

// 서버가 돌려주는 문장은 개발자용이라 손님에게 그대로 보이면 안 된다.
const MESSAGES: Record<number, string> = {
  400: t({ ko: "적어주신 값 중에 이상한 게 있습니다. 날짜와 숫자를 확인해 주세요.", en: "Something in the form doesn't look right. Please check the dates and numbers." }),
  429: t({ ko: "초안을 이미 여러 번 만드셨습니다. 한 시간 뒤에 다시 시도해 주세요.", en: "You've made a few drafts already. Please try again in an hour." }),
  502: t({ ko: "지금 초안을 못 쓰고 있습니다. 다시 시도해 주세요.", en: "Our writer is having a moment. Please try again." }),
};
const FALLBACK = t({ ko: "초안을 만들지 못했습니다. 다시 시도해 주세요.", en: "We couldn't create your draft. Please try again." });
const TIMEOUT_MS = 60_000;

export default function PlanForm() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<string[]>([]);
  // "그 외" — 목록에 없는 곳을 직접 적는 칸. 눌렀을 때만 칸이 나온다.
  const [otherOn, setOtherOn] = useState(false);
  const [otherPlace, setOtherPlace] = useState("");
  // 관심사 쪽 "그 외". 여행지와 같은 방식이다.
  const [styleOtherOn, setStyleOtherOn] = useState(false);
  const [otherStyle, setOtherStyle] = useState("");
  // 달력에서 고른 두 날짜. 기간은 이 둘에서 계산한다.
  const [dateStart, setDateStart] = useState<string | null>(null);
  const [dateEnd, setDateEnd] = useState<string | null>(null);
  // 여러 개 고르는 문항들
  const [dietary, setDietary] = useState<string[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [dietOtherOn, setDietOtherOn] = useState(false);
  const [otherDiet, setOtherDiet] = useState("");
  const [avoidOtherOn, setAvoidOtherOn] = useState(false);
  const [otherAvoid, setOtherAvoid] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 누르는 칸의 생김새. 고른 것은 채우고, '그 외' 는 점선으로 둬서
   * **보기와 직접 적는 칸이 다르다는 걸 눈으로 구분**하게 한다.
   */
  const chip = (on: boolean, dashed = false) =>
    `rounded-full border px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)] ${
      on
        ? "border-[var(--c-deep)] bg-[var(--c-text)] text-[var(--c-bg)]"
        : `${dashed ? "border-dashed" : ""} border-[var(--c-line)] bg-[var(--c-surface)] hover:border-[var(--c-text-3)]`
    }`;

  // 반드시 이전 값을 받아서 계산한다.
  // `list` 를 그대로 쓰면 빠르게 두 번 연속 누를 때 두 번째가 첫 번째를 지운다 (실제로 겪었다).
  function toggle(value: string, set: React.Dispatch<React.SetStateAction<string[]>>) {
    set((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // 직접 적은 곳도 고른 것으로 친다. 앞뒤 공백은 떼고 보낸다.
    const typed = otherOn ? otherPlace.trim() : "";
    const picked = typed ? [...destinations, typed] : destinations;

    if (picked.length === 0) {
      setError(t({ ko: "가고 싶은 곳을 하나 이상 골라주세요.", en: "Pick at least one place you want to visit." }));
      return;
    }
    // "그 외" 를 눌러 놓고 비워 두면 무엇을 원하는지 알 수 없다
    if (otherOn && !typed) {
      setError(t({ ko: "그 외를 고르셨습니다 — 어디인지 적어주세요.", en: "You picked Somewhere else — please type where." }));
      return;
    }

    const typedStyle = styleOtherOn ? otherStyle.trim() : "";
    const pickedStyles = typedStyle ? [...styles, typedStyle] : styles;
    if (styleOtherOn && !typedStyle) {
      setError(t({ ko: "관심사에 그 외를 고르셨습니다 — 무엇인지 적어주세요.", en: "You picked Something else — please type what." }));
      return;
    }

    if (!dateStart || !dateEnd) {
      setError(t({ ko: "가는 날과 오는 날을 골라주세요.", en: "Pick your check-in and check-out dates." }));
      return;
    }

    const dietTyped = dietOtherOn ? otherDiet.trim() : "";
    const avoidTyped = avoidOtherOn ? otherAvoid.trim() : "";

    setError(null);
    setSubmitting(true);

    const f = new FormData(e.currentTarget);

    // 시간 제한이 없으면 서버가 응답을 안 줄 때 버튼이 잠긴 채로 영원히 멈춘다.
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        signal: abort.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinations: picked,
          styles: pickedStyles,
          startDate: dateStart,
          // 9/13 에 와서 9/15 에 간다면 이틀 밤, 사흘치 일정이다
          durationDays: nightsBetween(dateStart, dateEnd) + 1,
          travelers: Number(f.get("travelers")),
          budgetRange: f.get("budgetRange") || undefined,
          budgetCurrency: f.get("budgetCurrency"),
          audience: f.get("audience") || undefined,
          pace: f.get("pace") || undefined,
          visitedBefore: f.get("visitedBefore") || undefined,
          transport: f.get("transport") || undefined,
          stayArea: f.get("stayArea") || undefined,
          dayRhythm: f.get("dayRhythm") || undefined,
          occasion: f.get("occasion") || undefined,
          dietary: dietTyped ? [...dietary, dietTyped] : dietary,
          avoid: avoidTyped ? [...avoid, avoidTyped] : avoid,
          dietaryNotes: f.get("dietaryNotes") || undefined,
          interests: f.get("interests") || undefined,
          language: f.get("language"),
        }),
      });

      if (!res.ok) {
        // 서버가 왜 거절했는지는 로그에만 남기고, 손님에게는 우리 문장을 보여준다
        console.error("plan request failed:", res.status, await res.text());
        setError(MESSAGES[res.status] ?? FALLBACK);
        setSubmitting(false);
        return;
      }

      const body = await res.json();
      router.push(`/plan/${body.id}`);
    } catch (err) {
      setError(
        err instanceof DOMException && err.name === "AbortError"
          ? t({ ko: "평소보다 오래 걸리고 있습니다. 다시 시도해 주세요.", en: "This is taking longer than usual. Please try again." })
          : FALLBACK
      );
      setSubmitting(false); // 성공하면 화면이 넘어가므로 실패했을 때만 다시 열어준다
    } finally {
      clearTimeout(timer);
    }
  }

  return (
    <div
      className={`${display.variable} flex-1 bg-[var(--c-bg)] text-[var(--c-text)] font-[family-name:var(--font-geist-sans)] selection:bg-[var(--c-accent)] selection:text-[var(--c-bg)]`}
    >
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="-my-2 py-2 font-[family-name:var(--font-geist-sans)] text-xl font-semibold tracking-[-0.02em] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-focus)]"
        >
          mohallae
        </Link>
        <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[var(--c-text-3)]">
          {t({ ko: "무료 초안", en: "Free draft" })}
        </span>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-24">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-tight tracking-tight">
          {t({ ko: "여행에 대해 알려주세요", en: "Tell us about your trip" })}
        </h1>
        {/*
          두 도막으로 끊는다. **앞은 얼마나 드는지, 뒤는 무엇을 받는지** 라 성격이 다르다.
          PC 는 칸이 넓어 한 줄로 이어지는데, 그러면 "받으십니다" 가 문장 끝에 묻힌다.
          block 이라 폰·PC 어디서나 아랫줄로 내려간다.
        */}
        <p className="mt-4 leading-relaxed text-[var(--c-text-2)]">
          <span className="block">
            {t({ ko: "2분이면 됩니다. 가입도 카드도 필요 없습니다.", en: "Two minutes. No account, no card." })}
          </span>
          <span className="mt-1 block">
            {t({
              ko: "일자별 개요와 가이드북에 없는 팁 하나를 받으십니다.",
              en: "You'll get a day-by-day outline and one tip a guidebook won't give you.",
            })}
          </span>
        </p>

        <form onSubmit={onSubmit} className="mt-12 space-y-10">
          {/* 목적지 — 여러 도시를 도는 여행이 많다 */}
          <fieldset>
            <legend className={label}>{t({ ko: "어디로 가시나요? *", en: "Where are you going? *" })}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {DESTINATIONS.map((d) => {
                const on = destinations.includes(d.v);
                return (
                  <button
                    key={d.v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(d.v, setDestinations)}
                    className={`rounded-full border px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)] ${
                      on
                        ? "border-[var(--c-deep)] bg-[var(--c-text)] text-[var(--c-bg)]"
                        : "border-[var(--c-line)] bg-[var(--c-surface)] hover:border-[var(--c-text-3)]"
                    }`}
                  >
                    {t({ ko: d.ko, en: d.v })}
                  </button>
                );
              })}

              {/* 그 외 — 누르면 아래에 적는 칸이 나온다 */}
              <button
                type="button"
                aria-pressed={otherOn}
                onClick={() => setOtherOn((v) => !v)}
                className={`rounded-full border px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)] ${
                  otherOn
                    ? "border-[var(--c-deep)] bg-[var(--c-text)] text-[var(--c-bg)]"
                    : "border-dashed border-[var(--c-line)] bg-[var(--c-surface)] hover:border-[var(--c-text-3)]"
                }`}
              >
                {t({ ko: "그 외", en: "Somewhere else" })}
              </button>
            </div>

            {otherOn && (
              <label className="mt-3 block">
                <span className="sr-only">{t({ ko: "어디인가요?", en: "Where?" })}</span>
                {/*
                  maxLength — 길이를 막지 않으면 아주 긴 글이 그대로 AI 로 넘어간다.
                  지명 하나를 받는 칸이라 40자면 넉넉하다.
                */}
                <input
                  type="text"
                  value={otherPlace}
                  onChange={(e) => setOtherPlace(e.target.value)}
                  maxLength={40}
                  autoFocus
                  placeholder={t({ ko: "가고 싶은 지역을 적어주세요 — 예: 남해, 울릉도", en: "Type a place — e.g. Namhae, Ulleungdo" })}
                  className={field}
                />
              </label>
            )}
          </fieldset>

          {/*
            날짜는 달력에서 고른다. 전에는 `출발일` 과 `기간(일)` 두 칸이었는데,
            손님은 달력을 보고 고르지 며칠짜리인지를 먼저 세지 않는다.
            기간은 고른 두 날짜에서 계산한다 — 손님이 따로 적을 필요가 없다.
            지나간 날짜는 달력이 막고, 서버(lib/validate.ts)에서 한 번 더 막는다.
          */}
          <fieldset>
            <legend className={label}>{t({ ko: "언제 가시나요? *", en: "When are you going? *" })}</legend>
            <div className="mt-3">
              <DateRangePicker start={dateStart} end={dateEnd} onChange={(v) => { setDateStart(v.start); setDateEnd(v.end); }} />
            </div>
          </fieldset>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className={label}>{t({ ko: "인원 *", en: "Travelers *" })}</span>
              <input type="number" name="travelers" required min={1} max={20} defaultValue={2} className={field} />
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Select
              label={t({ ko: "1인 예산 (여행 전체)", en: "Budget per person (whole trip)" })}
              name="budgetRange"
              options={BUDGETS.map((o) => ({ value: o.v, label: t({ ko: o.ko, en: o.v }) }))}
              placeholder={t({ ko: "고르세요", en: "Choose one" })}
              allowOther
            />
            {/*
              통화는 이제 '얼마인가' 가 아니라 **'비용을 어느 돈으로 보여드릴까'** 를 묻는다.
              예산은 위에서 구간으로 받으므로 여기서 금액을 겹쳐 묻지 않는다.
            */}
            <Select
              label={t({ ko: "비용을 어느 통화로 볼까요", en: "Show costs in" })}
              name="budgetCurrency"
              defaultValue="USD"
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
              placeholder="USD"
            />
          </div>

          <fieldset>
            <legend className={label}>{t({ ko: "무엇에 관심 있으세요?", en: "What are you into?" })}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {STYLES.map((st) => {
                const on = styles.includes(st.v);
                return (
                  <button
                    key={st.v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(st.v, setStyles)}
                    className={`rounded-full border px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)] ${
                      on
                        ? "border-[var(--c-deep)] bg-[var(--c-text)] text-[var(--c-bg)]"
                        : "border-[var(--c-line)] bg-[var(--c-surface)] hover:border-[var(--c-text-3)]"
                    }`}
                  >
                    {t({ ko: st.ko, en: st.v })}
                  </button>
                );
              })}

              <button
                type="button"
                aria-pressed={styleOtherOn}
                onClick={() => setStyleOtherOn((v) => !v)}
                className={`rounded-full border px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-focus)] ${
                  styleOtherOn
                    ? "border-[var(--c-deep)] bg-[var(--c-text)] text-[var(--c-bg)]"
                    : "border-dashed border-[var(--c-line)] bg-[var(--c-surface)] hover:border-[var(--c-text-3)]"
                }`}
              >
                {t({ ko: "그 외", en: "Something else" })}
              </button>
            </div>

            {styleOtherOn && (
              <label className="mt-3 block">
                <span className="sr-only">{t({ ko: "무엇에 관심 있으세요?", en: "What else?" })}</span>
                <input
                  type="text"
                  value={otherStyle}
                  onChange={(e) => setOtherStyle(e.target.value)}
                  maxLength={40}
                  autoFocus
                  placeholder={t({ ko: "관심사를 적어주세요 — 예: 서핑, 도자기 체험", en: "Type an interest — e.g. surfing, pottery" })}
                  className={field}
                />
              </label>
            )}
          </fieldset>

          <Select
              label={t({ ko: "누구와 가시나요", en: "Who\u2019s coming" })}
              name="audience"
              options={AUDIENCES.map((a) => ({ value: a.v, label: t({ ko: a.ko, en: a.v }) }))}
              placeholder={t({ ko: "고르세요", en: "Choose one" })}
            />

          {/*
            여기부터는 **일정의 짜임을 정하는 답들**이다. 한 개만 고르는 것은 목록 상자로,
            여러 개 고르는 것은 누르는 칸으로 뒀다. 문항이 일곱이라 전부 칸으로 두면
            화면이 칸으로만 가득 찬다.

            전부 답하지 않아도 된다 — 답 안 한 항목은 AI 에게 아예 전하지 않는다.
            'not specified' 를 잔뜩 보내면 AI 가 그 빈칸을 지어내 채운다(lib/prompt.ts 의 shape()).
          */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Select
                label={t({ ko: "여행 속도", en: "Pace" })}
                name="pace"
                options={PACES.map((o) => ({ value: o.v, label: t({ ko: o.ko, en: o.v }) }))}
                placeholder={t({ ko: "고르세요", en: "Choose one" })}
              />

            <Select
                label={t({ ko: "한국은 처음이신가요?", en: "First time in Korea?" })}
                name="visitedBefore"
                options={VISITS.map((o) => ({ value: o.v, label: t({ ko: o.ko, en: o.v }) }))}
                placeholder={t({ ko: "고르세요", en: "Choose one" })}
                allowOther
              />

            <Select
                label={t({ ko: "어떻게 다니실 건가요?", en: "How will you get around?" })}
                name="transport"
                options={TRANSPORTS.map((o) => ({ value: o.v, label: t({ ko: o.ko, en: o.v }) }))}
                placeholder={t({ ko: "고르세요", en: "Choose one" })}
              />

            <Select
                label={t({ ko: "숙소는 어디쯤이 좋으세요?", en: "Where would you rather stay?" })}
                name="stayArea"
                options={STAY_AREAS.map((o) => ({ value: o.v, label: t({ ko: o.ko, en: o.v }) }))}
                placeholder={t({ ko: "고르세요", en: "Choose one" })}
              />

            <Select
                label={t({ ko: "하루를 언제 시작하세요?", en: "When do you start your day?" })}
                name="dayRhythm"
                options={RHYTHMS.map((o) => ({ value: o.v, label: t({ ko: o.ko, en: o.v }) }))}
                placeholder={t({ ko: "고르세요", en: "Choose one" })}
              />

            {/*
              전에는 안 고른 상태를 '아니요' 라고 적었다. 첫 줄부터 부정으로 시작하면
              답하기도 전에 닫히는 느낌이 든다. 안 고르고 넘어가면 그냥 특별한 날이
              아닌 것으로 친다 — 굳이 아니라고 말하게 할 이유가 없다.
            */}
            <Select
              label={t({ ko: "특별한 날인가요?", en: "Any special occasion?" })}
              name="occasion"
              options={OCCASIONS.map((o) => ({ value: o.v, label: t({ ko: o.ko, en: o.v }) }))}
              placeholder={t({ ko: "고르세요", en: "Choose one" })}
              allowOther
            />
          </div>

          {/* 제약사항 — 무슬림·채식 손님에게는 여행의 성패고, 이걸 챙기는 게 우리가 돈 받는 이유에 가깝다 */}
          <fieldset>
            <legend className={label}>{t({ ko: "꼭 맞춰야 할 것이 있나요?", en: "Anything we must work around?" })}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {DIETARY.map((o) => {
                const on = dietary.includes(o.v);
                return (
                  <button key={o.v} type="button" aria-pressed={on} onClick={() => toggle(o.v, setDietary)} className={chip(on)}>
                    {t({ ko: o.ko, en: o.v })}
                  </button>
                );
              })}
              <button type="button" aria-pressed={dietOtherOn} onClick={() => setDietOtherOn((v) => !v)} className={chip(dietOtherOn, true)}>
                {t({ ko: "그 외", en: "Something else" })}
              </button>
            </div>
            {dietOtherOn && (
              <label className="mt-3 block">
                <span className="sr-only">{t({ ko: "무엇을 맞춰야 하나요?", en: "What else?" })}</span>
                <input type="text" value={otherDiet} onChange={(e) => setOtherDiet(e.target.value)} maxLength={40} autoFocus
                  placeholder={t({ ko: "적어주세요 — 예: 글루텐 프리", en: "Type it — e.g. gluten free" })} className={field} />
              </label>
            )}
          </fieldset>

          <fieldset>
            <legend className={label}>{t({ ko: "빼고 싶은 것이 있나요?", en: "Anything to leave out?" })}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {AVOIDS.map((o) => {
                const on = avoid.includes(o.v);
                return (
                  <button key={o.v} type="button" aria-pressed={on} onClick={() => toggle(o.v, setAvoid)} className={chip(on)}>
                    {t({ ko: o.ko, en: o.v })}
                  </button>
                );
              })}
              <button type="button" aria-pressed={avoidOtherOn} onClick={() => setAvoidOtherOn((v) => !v)} className={chip(avoidOtherOn, true)}>
                {t({ ko: "그 외", en: "Something else" })}
              </button>
            </div>
            {avoidOtherOn && (
              <label className="mt-3 block">
                <span className="sr-only">{t({ ko: "무엇을 뺄까요?", en: "What else?" })}</span>
                <input type="text" value={otherAvoid} onChange={(e) => setOtherAvoid(e.target.value)} maxLength={40} autoFocus
                  placeholder={t({ ko: "적어주세요 — 예: 이른 아침 일정", en: "Type it — e.g. early mornings" })} className={field} />
              </label>
            )}
          </fieldset>

          <Select
              label={t({ ko: "초안을 받을 언어 *", en: "Language for your draft *" })}
              name="language"
              defaultValue="en"
              options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
              placeholder="English"
            />

          {error && (
            <p role="alert" className="rounded-lg border border-[var(--c-accent)] bg-[var(--c-error-bg)] px-4 py-3 text-[var(--c-error-text)]">
              {error}
            </p>
          )}

          {/* 누른 뒤 버튼을 잠근다. 반응이 없으면 손님이 여러 번 누르고 그때마다 AI 요금이 나간다 */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-full bg-[var(--c-text)] px-8 py-3.5 text-base text-[var(--c-bg)] transition-colors hover:bg-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--c-focus)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--c-text)]"
            >
              {submitting ? t({ ko: "초안을 쓰는 중…", en: "Writing your draft…" }) : t({ ko: "무료 초안 받기", en: "Get your free draft" })}
            </button>
            <span aria-live="polite" className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[var(--c-text-3)]">
              {submitting ? t({ ko: "몇 초 걸립니다", en: "This takes a few seconds" }) : t({ ko: "가입 필요 없음", en: "No account needed" })}
            </span>
          </div>
        </form>
      </main>
    </div>
  );
}
