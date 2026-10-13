// 실행: node --test app/mohallae/plan/flow.test.ts
// (npm test 는 지금 lib/ 만 본다 — 뮤조가 #82 리뷰에서 짚은 것과 같은 이유로, 넓히는 건 package.json PR 에서)
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  AIRPORTS, AREAS, BUDGETS, BUYS, CHILDREN, COMPANIONS, CURATED, ENDS, FOODS, INITIAL_STATE, INTERESTS, OPEN_PLACES, RIDES, STARTS, STEPS, TRANSPORTS, VIBES,
  autoAdvance, flowReducer, optionsFor, pack, panelPhotos, stepError, stepOrder, toPlanRequest, visibleFields,
} from "./flow.ts";
import type { Answers, FlowState, PlanRequest, StepId } from "./flow.ts";

const TODAY = "2026-10-13";
const choose = (s: FlowState, field: string, value: string) => flowReducer(s, { type: "choose", field, value });
const next = (s: FlowState) => flowReducer(s, { type: "next", from: s.step });
const back = (s: FlowState) => flowReducer(s, { type: "back" });
const dates = (s: FlowState, a: string, b: string) => flowReducer(s, { type: "input", field: "dates", values: [a, b] });
const people = (s: FlowState, n: number) => flowReducer(s, { type: "input", field: "travelers", values: [String(n)] });
const other = (s: FlowState, field: string, text: string | null) => flowReducer(s, { type: "other", field, text });
const goto = (s: FlowState, to: StepId) => flowReducer(s, { type: "goto", to });
const resume = (s: FlowState, from?: StepId) => flowReducer(s, { type: "resume", from });
/** 한 줄짜리 질문: 고르고 다음으로 (화면에서는 고르면 저절로 넘어간다) */
const pick = (s: FlowState, field: string, value: string) => next(choose(s, field, value));

/** 러프로 확인 화면까지: 먹방, 성수, 먹거리·야경(1순위 야경), 3박 4일, 오후 도착·밤 출발, 친구 3명 … 고르지 않아도 되는 건 건너뛴다 */
function roughToReview() {
  let s = pick(INITIAL_STATE, "mode", "rough");
  s = pick(s, "vibe", "eat");
  s = next(choose(s, "area", "seongsu"));
  s = next(choose(choose(s, "interests", "food"), "interests", "night"));
  s = pick(s, "must", "night");
  s = next(s); // 꼭 — 건너뛰기
  s = next(dates(s, "2100-10-14", "2100-10-17"));
  s = next(choose(choose(s, "arrive", "afternoon"), "leave", "night"));
  s = pick(s, "who", "friends");
  s = next(people(s, 3));
  s = pick(s, "visited", "first");
  s = pick(s, "stay", "open");
  s = pick(s, "budget", "250to350");
  s = next(choose(choose(s, "adventure", "some"), "spicy", "likes"));
  s = next(s); // 맞춰야 할 것 — 건너뛰기
  s = pick(s, "pace", "balanced");
  s = next(s); // 빼고 싶은 것 — 건너뛰기
  assert.equal(s.step, "review");
  return s;
}

/** 서버(lib/validate.ts)가 받는 한도 — 넘치면 서버가 잘라 버려서 손님이 고른 것이 사라진다 */
function withinLimits(req: PlanRequest) {
  assert.ok(req.styles.length <= 13, `styles ${req.styles.length}줄`);
  for (const x of req.styles) assert.ok(x.length <= 40, `styles: ${x}`);
  assert.ok(!req.budgetRange || req.budgetRange.length <= 60, `budgetRange: ${req.budgetRange}`);
  for (const k of ["audience", "pace", "visitedBefore", "transport", "stayArea", "dayRhythm", "occasion"] as const) {
    const v = req[k];
    assert.ok(v === undefined || v.length <= 40, `${k}: ${v}`);
  }
  assert.ok(req.avoid.length <= 8);
  for (const x of req.avoid) assert.ok(x.length <= 40, `avoid: ${x}`);
  assert.ok(req.dietary.length <= 12);
  for (const x of req.dietary) assert.ok(x.length <= 40, `dietary: ${x}`);
  assert.ok(Number.isInteger(req.travelers) && req.travelers >= 1 && req.travelers <= 20, `travelers ${req.travelers}`);
  assert.ok(req.durationDays >= 1 && req.durationDays <= 30);
  assert.deepEqual(req.destinations, ["Seoul"]);
}

test("첫 질문은 러프·디테일 — 러프만 '한 단어로', 디테일만 하루 시간·이동·공항·한복·살 것을 묻는다", () => {
  const common = stepOrder({});
  assert.equal(common[0], "mode");
  assert.ok(!common.includes("vibe") && !common.includes("hours"), "고르기 전에는 둘 다에 있는 질문만");
  const rough = stepOrder({ mode: ["rough"] });
  const detail = stepOrder({ mode: ["detail"] });
  assert.ok(rough.includes("vibe"));
  for (const st of ["hours", "move", "airport", "hanbok"] as StepId[]) {
    assert.ok(!rough.includes(st), st);
    assert.ok(detail.includes(st), st);
  }
  assert.ok(!detail.includes("vibe"));
  assert.ok(!detail.includes("buy"), "쇼핑을 고르지 않았으면 살 것은 묻지 않는다");
  assert.ok(stepOrder({ mode: ["detail"], interests: ["shopping"] }).includes("buy"));
  assert.ok(!stepOrder({ mode: ["rough"], interests: ["shopping"] }).includes("buy"));
  assert.equal(rough.at(-1), "review");
});

test("러프 한 바퀴: 보내는 값", () => {
  const req = toPlanRequest(roughToReview().answers, "en");
  assert.deepEqual(req, {
    destinations: ["Seoul"],
    startDate: "2100-10-14",
    durationDays: 4,
    travelers: 3,
    budgetRange: "Whole trip, excl. stay & flights: 250,000–350,000 KRW",
    budgetCurrency: "USD",
    styles: [
      "Plan: rough outline, key spots only",
      "Top priority: night views",
      "Areas: Seongsu/Seoul Forest",
      "Into: food, night views",
      "Arrives afternoon, leaves night",
      "Food: tries a little, likes spicy",
      "Trip mood: eating everything",
    ],
    audience: "Friends",
    pace: "Balanced: 3–4 stops a day",
    visitedBefore: "First time",
    transport: undefined,
    stayArea: "Not booked yet, suggest an area",
    dayRhythm: undefined,
    occasion: undefined,
    avoid: [],
    dietary: [],
    language: "en",
  });
  withinLimits(req);
});

test("디테일 한 바퀴: 보내는 값", () => {
  let s = pick(INITIAL_STATE, "mode", "detail");
  assert.equal(s.step, "area", "디테일은 '한 단어로'를 묻지 않는다");
  s = next(choose(choose(s, "area", "bukchon"), "area", "euljiro"));
  s = next(choose(choose(s, "interests", "shopping"), "interests", "history"));
  s = pick(s, "must", "history");
  s = flowReducer(s, { type: "text", field: "place", text: "경복궁, 광장시장" });
  s = next(choose(choose(s, "foods", "bbq"), "foods", "naengmyeon"));
  s = next(dates(s, "2100-05-01", "2100-05-03"));
  s = next(choose(choose(s, "arrive", "late"), "leave", "early"));
  s = pick(s, "who", "family");
  s = next(choose(choose(s, "kids", "young"), "kids", "teen"));
  s = next(people(s, 4));
  s = pick(s, "visited", "again");
  s = pick(s, "stay", "booked");
  s = pick(s, "stayArea", "myeongdong");
  s = flowReducer(s, { type: "set", key: "currency", value: "EUR" });
  s = pick(s, "budget", "undecided");
  s = next(choose(choose(s, "adventure", "familiar"), "spicy", "none"));
  s = next(choose(choose(s, "needs", "allergy"), "needs", "stroller"));
  s = next(other(choose(s, "allergy", "shellfish"), "allergy", "kiwi"));
  s = pick(s, "pace", "slow");
  s = next(choose(s, "avoid", "crowds"));
  assert.equal(s.step, "hours");
  s = next(choose(choose(s, "start", "10"), "end", "21"));
  s = next(choose(choose(s, "transport", "transit"), "subway", "new"));
  s = next(choose(choose(s, "airport", "icn"), "ride", "arex"));
  s = pick(s, "hanbok", "yes");
  s = next(choose(choose(s, "buy", "cosmetics"), "buy", "snacks"));
  assert.equal(s.step, "review");

  const req = toPlanRequest(s.answers, "ko");
  assert.deepEqual(req, {
    destinations: ["Seoul"],
    startDate: "2100-05-01",
    durationDays: 3,
    travelers: 4,
    budgetRange: undefined,
    budgetCurrency: "EUR",
    styles: [
      "Plan: detailed, hour by hour",
      "Top priority: history & palaces",
      "Areas: Bukchon/Seochon/Ikseon-dong",
      "Areas: Euljiro/Gwangjang Market",
      "Into: shopping, history & palaces",
      "Must visit: 경복궁, 광장시장",
      "Must eat: Korean BBQ, naengmyeon",
      "Arrives late night, leaves early morning",
      "Food: familiar food only",
      "Airport: Incheon (ICN) → AREX train",
      "Wants to wear hanbok",
      "Shopping: cosmetics, snacks & food",
    ],
    audience: "Family with kids (under 6, 13–18)",
    pace: "Relaxed: about 2 stops a day",
    visitedBefore: "Been before",
    transport: "Subway and bus, new to the subway",
    stayArea: "Booked near Myeongdong/Namsan",
    dayRhythm: "Starts 10am, ends 9pm",
    occasion: undefined,
    avoid: ["Crowded places"],
    // 알레르기를 자세히 골랐으니 'Food allergy' 대신 그것을, 맨 앞에. 매운 걸 못 먹으면 식단으로
    dietary: ["Shellfish allergy", "Allergy: kiwi", "Stroller", "No spicy food"],
    language: "ko",
  });
  withinLimits(req);
});

test("동네: '잘 모르겠어요'는 혼자 고른다 — 고르면 취향 두 줄을 묻고, 동네를 고르면 취향 답은 지운다", () => {
  let s = pick(pick(INITIAL_STATE, "mode", "rough"), "vibe", "heal");
  assert.equal(s.step, "area");
  s = choose(choose(s, "area", "seongsu"), "area", "unsure");
  assert.deepEqual(s.answers.area, ["unsure"]);
  s = choose(s, "area", "jamsil");
  assert.deepEqual(s.answers.area, ["jamsil"], "동네를 고르면 '잘 모르겠어요'가 풀린다");
  s = other(choose(s, "area", "unsure"), "area", "Mangwon market");
  assert.deepEqual(s.answers.area, [], "직접 적기를 열면 '잘 모르겠어요'가 풀린다");
  assert.deepEqual(s.answers["area:other"], ["Mangwon market"]);
  s = choose(s, "area", "unsure");
  assert.equal(s.answers["area:other"], undefined, "'잘 모르겠어요'를 고르면 직접 적은 것은 닫힌다");

  s = next(s);
  assert.equal(s.step, "taste");
  s = choose(s, "famous", "local");
  assert.ok(stepError(s), "두 줄 모두 골라야 한다");
  s = next(choose(s, "era", "new"));
  assert.equal(s.step, "interests");
  const styles = toPlanRequest(s.answers, "en").styles;
  assert.ok(styles.includes("Areas: please suggest"));
  assert.ok(styles.includes("Taste: local neighbourhoods"));
  assert.ok(styles.includes("Taste: new Seoul (cafes, boutiques)"));

  s = goto(s, "area");
  s = choose(s, "area", "jamsil");
  assert.equal(s.answers.famous, undefined);
  assert.equal(s.answers.era, undefined);
  assert.ok(!stepOrder(s.answers).includes("taste"));
  assert.equal(next(s).step, "interests");
});

test("1순위: 관심사가 하나면 묻지 않고, 둘 이상이면 고른 것 중에서 묻는다. 1순위를 빼면 다시 묻는다", () => {
  let s = pick(pick(INITIAL_STATE, "mode", "rough"), "vibe", "photo");
  s = next(choose(s, "area", "yeouido"));
  s = next(choose(s, "interests", "night"));
  assert.equal(s.step, "wish", "하나만 골랐으면 그게 1순위");
  s = back(s);
  assert.equal(s.step, "interests");
  s = next(choose(choose(s, "interests", "food"), "interests", "cafe"));
  assert.equal(s.step, "must");
  assert.deepEqual(optionsFor(visibleFields("must", s.answers)[0], s.answers).map((o) => o.id), ["food", "cafe", "night"]);
  s = pick(s, "must", "cafe");
  assert.equal(s.step, "wish");
  s = choose(goto(s, "interests"), "interests", "cafe"); // 1순위를 뺀다
  assert.deepEqual(s.answers.must, []);
  assert.equal(next(s).step, "must", "다시 묻는다");
  s = choose(s, "interests", "food"); // 이제 야경 하나
  assert.equal(s.answers.must, undefined);
  assert.ok(!stepOrder(s.answers).includes("must"));
});

test("줄이 둘인 질문은 두 줄 다 골라야 넘어간다. 지하철·공항 줄은 고른 것에 따라 생기고, 바꾸면 지워진다", () => {
  const base: Answers = { mode: ["detail"] };
  const at = (step: StepId, answers: Answers): FlowState => ({ step, answers, reviewed: false });
  assert.ok(stepError(at("times", { ...base, arrive: ["morning"] }), TODAY));
  assert.equal(stepError(at("times", { ...base, arrive: ["morning"], leave: ["unknown"] }), TODAY), null, "몰라요도 답이다");

  let s = at("move", base);
  s = choose(s, "transport", "taxi");
  assert.equal(visibleFields("move", s.answers).length, 1);
  assert.equal(stepError(s, TODAY), null);
  s = choose(s, "transport", "transit");
  assert.equal(visibleFields("move", s.answers).length, 2);
  assert.ok(stepError(s, TODAY), "지하철·버스면 익숙한지도 묻는다");
  s = choose(s, "subway", "new");
  assert.equal(stepError(s, TODAY), null);
  s = choose(s, "transport", "walk");
  assert.equal(s.answers.subway, undefined, "지하철을 안 타면 그 답은 지운다");

  s = at("airport", base);
  s = choose(s, "airport", "none");
  assert.equal(visibleFields("airport", s.answers).length, 1);
  s = choose(s, "airport", "gmp");
  assert.ok(stepError(s, TODAY), "김포·인천이면 공항에서 숙소까지를 묻는다");
  s = choose(s, "ride", "compare");
  assert.equal(stepError(s, TODAY), null);
  s = choose(s, "airport", "unknown");
  assert.equal(s.answers.ride, undefined);
});

test("고르면 넘어가는 질문과 '다음' 단추를 쓰는 질문", () => {
  const a: Answers = { mode: ["detail"], who: ["family"], interests: ["food", "shopping"], needs: ["allergy"], area: ["unsure"], stay: ["booked"] };
  const auto: StepId[] = ["mode", "vibe", "taste", "must", "times", "who", "visited", "stay", "stayArea", "budget", "food", "pace", "hours", "move", "airport", "hanbok"];
  const withButton: StepId[] = ["area", "interests", "wish", "dates", "kids", "travelers", "needs", "allergy", "avoid", "buy", "review"];
  for (const st of auto) assert.equal(autoAdvance(st, a), true, st);
  for (const st of withButton) assert.equal(autoAdvance(st, a), false, st);
  assert.equal(new Set([...auto, ...withButton]).size, STEPS.length, "모든 질문을 둘 중 하나로 확인했다");
  // 숙소 동네에서 '그 외'를 열면 적고 '다음'을 눌러야 한다
  assert.equal(autoAdvance("stayArea", { ...a, "stayArea:other": [""] }), false);
});

test("누구와: 혼자·둘이는 인원을 묻지 않고, 아이와 함께면 나이를 여럿 고른다. 바꾸면 새로 생긴 질문에서 멈춘다", () => {
  let s = roughToReview(); // 친구 3명
  s = goto(s, "who");
  s = choose(s, "who", "solo");
  assert.equal(s.answers.travelers, undefined);
  assert.ok(!stepOrder(s.answers).includes("travelers"));
  s = resume(s, "who");
  assert.equal(s.step, "review");
  assert.equal(toPlanRequest(s.answers, "en").travelers, 1);
  assert.equal(toPlanRequest(s.answers, "en").audience, "Solo");

  s = resume(choose(goto(s, "who"), "who", "couple"), "who");
  assert.equal(s.step, "review");
  assert.equal(toPlanRequest(s.answers, "en").travelers, 2);

  // 둘이 → 아이와 함께: 나이와 인원을 거쳐 돌아온다
  s = resume(choose(goto(s, "who"), "who", "family"), "who");
  assert.equal(s.step, "kids");
  s = resume(choose(s, "kids", "school"));
  assert.equal(s.step, "travelers");
  assert.ok(stepError(people(s, 1), TODAY), "본인 포함 2명부터");
  s = resume(people(s, 3));
  assert.equal(s.step, "review");
  const req = toPlanRequest(s.answers, "en");
  assert.equal(req.audience, "Family with kids (6–12)");
  assert.equal(req.travelers, 3);
});

test("러프 ↔ 디테일을 바꾸면 그쪽에만 있는 질문의 답만 지우고, 새로 생긴 질문에서 멈춘다", () => {
  let s = roughToReview();
  s = choose(goto(s, "mode"), "mode", "detail");
  assert.equal(s.answers.vibe, undefined);
  for (const key of ["area", "interests", "must", "dates", "arrive", "who", "travelers", "budget", "pace"]) assert.ok(s.answers[key]?.length, key);
  s = resume(s, "mode");
  assert.equal(s.step, "hours");
  s = choose(choose(s, "start", "9"), "end", "18");
  s = choose(goto(s, "mode"), "mode", "rough");
  assert.equal(s.answers.start, undefined);
  assert.equal(s.answers.end, undefined);
  assert.equal(resume(s, "mode").step, "vibe");
});

test("확인 화면을 본 뒤 고치러 가면 곧장 돌아오고, 비워 두면 못 간다", () => {
  let s = roughToReview();
  assert.equal(s.reviewed, true);
  s = goto(s, "dates");
  s = resume(dates(s, "2100-10-20", "2100-10-24"));
  assert.equal(s.step, "review");
  s = goto(s, "dates");
  assert.equal(resume(dates(s, "2100-10-20", "")).step, "dates");
  assert.equal(resume(pick(INITIAL_STATE, "mode", "rough")).step, "vibe", "확인 화면 전에는 아무 일도 없다");
});

test("오른쪽 판에서 고치러 가기: 확인 화면 전에는 앞으로 못 건너뛰고, 본 뒤에는 앞쪽 질문으로도 간다", () => {
  const early = pick(INITIAL_STATE, "mode", "rough");
  assert.equal(goto(early, "budget").step, "vibe", "확인 화면 전");
  assert.equal(goto(early, "mode").step, "mode", "뒤로는 언제나");
  const atArea = goto(roughToReview(), "area");
  assert.equal(goto(atArea, "budget").step, "budget", "확인 화면을 본 뒤");
  const emptied = choose(atArea, "area", "seongsu"); // 하나뿐인 동네를 풀었다
  assert.deepEqual(emptied.answers.area, []);
  assert.equal(goto(emptied, "budget").step, "area", "지금 화면이 비어 있으면 못 간다");
});

test("늦게 들어온 이전 화면의 클릭은 두 칸을 건너뛰지 않는다 (next·resume 모두)", () => {
  const moved = next(choose(INITIAL_STATE, "mode", "rough"));
  assert.equal(moved.step, "vibe");
  assert.equal(flowReducer(moved, { type: "next", from: "mode" }).step, "vibe");

  let s = choose(goto(roughToReview(), "pace"), "pace", "full");
  // 고른 뒤 잠깐 사이에 '이전'을 눌렀다 — 속도 화면에서 걸어 둔 resume 은 지금 화면에서 아무 일도 안 한다
  s = back(s);
  assert.equal(s.step, "needs");
  assert.equal(resume(s, "pace").step, "needs");
  assert.equal(resume(choose(s, "needs", "none"), "needs").step, "review");
});

test("지금 화면에 없는 줄에는 답할 수 없다", () => {
  assert.equal(choose(INITIAL_STATE, "who", "solo"), INITIAL_STATE);
  assert.equal(choose(INITIAL_STATE, "mode", "nope"), INITIAL_STATE);
  assert.equal(other(INITIAL_STATE, "mode", "x"), INITIAL_STATE, "'그 외'가 없는 줄");
});

test("식단: '없어요'는 혼자 고른다. 알레르기를 고르면 무엇인지 묻고(고르지 않아도 됨), 풀면 그 답도 지운다", () => {
  let s = goto(roughToReview(), "needs");
  s = choose(choose(s, "needs", "vegan"), "needs", "none");
  assert.deepEqual(s.answers.needs, ["none"]);
  s = choose(s, "needs", "allergy");
  assert.deepEqual(s.answers.needs, ["allergy"]);
  assert.ok(stepOrder(s.answers).includes("allergy"));
  s = resume(s, "needs");
  assert.equal(s.step, "review", "알레르기 종류는 고르지 않아도 된다");
  assert.deepEqual(toPlanRequest(s.answers, "en").dietary, ["Food allergy"]);
  s = other(choose(goto(s, "allergy"), "allergy", "egg"), "allergy", "kiwi");
  assert.deepEqual(toPlanRequest(s.answers, "en").dietary, ["Egg allergy", "Allergy: kiwi"]);
  s = choose(goto(s, "needs"), "needs", "allergy");
  assert.equal(s.answers.allergy, undefined);
  assert.equal(s.answers["allergy:other"], undefined);
  // 매운 걸 못 먹으면 식단으로 — Food 줄에는 넣지 않는다
  s = choose(goto(s, "food"), "spicy", "none");
  const req = toPlanRequest(s.answers, "en");
  assert.deepEqual(req.dietary, ["No spicy food"]);
  assert.ok(req.styles.includes("Food: tries a little"));
});

test("숙소: 정했으면 동네를 묻고(직접 적기도), 아직이면 묻지 않는다", () => {
  let s = roughToReview();
  assert.equal(toPlanRequest(s.answers, "en").stayArea, "Not booked yet, suggest an area");
  s = resume(choose(goto(s, "stay"), "stay", "booked"), "stay");
  assert.equal(s.step, "stayArea");
  s = other(s, "stayArea", "");
  assert.ok(stepError(s, TODAY), "그 외를 열고 비워 두면 못 간다");
  s = resume(other(s, "stayArea", "Mapo-gu, near Hapjeong station"));
  assert.equal(s.step, "review");
  assert.equal(toPlanRequest(s.answers, "en").stayArea, "Booked near Mapo-gu, near Hapjeong station".slice(0, 40), "40자에서 자른다");
  s = choose(goto(s, "stayArea"), "stayArea", "hongdae");
  assert.equal(s.answers["stayArea:other"], undefined, "보기를 고르면 직접 적은 것은 닫힌다");
  assert.equal(toPlanRequest(s.answers, "en").stayArea, "Booked near Hongdae/Yeonnam/Mangwon");
  s = choose(goto(s, "stay"), "stay", "open");
  assert.equal(s.answers.stayArea, undefined);
});

test("날짜 검사: 지난 날짜, 30일 넘는 여행", () => {
  const s = goto(roughToReview(), "dates");
  assert.ok(stepError(dates(s, "2026-10-01", "2026-10-03"), TODAY), "지난 날짜");
  assert.ok(stepError(dates(s, "2026-11-01", "2026-12-01"), TODAY), "31일");
  assert.equal(stepError(dates(s, "2026-11-01", "2026-11-30"), TODAY), null, "30일은 된다");
  assert.ok(stepError(dates(s, "2026-11-03", "2026-11-01"), TODAY), "오는 날이 앞");
});

test("pack: 머리말을 붙여 40자 안으로 나눈다", () => {
  assert.deepEqual(pack("Into: ", ["food", "night views"]), ["Into: food, night views"]);
  assert.deepEqual(pack("Areas: ", ["Bukchon/Seochon/Ikseon-dong", "Jamsil"]), ["Areas: Bukchon/Seochon/Ikseon-dong", "Areas: Jamsil"]);
  for (const line of pack("Must visit: ", ["a".repeat(60), "b"])) assert.ok(line.length <= 40, line);
  assert.deepEqual(pack("X: ", ["", "  "]), []);
});

test("어떤 보기를 골라도 보내는 값은 서버 한도 안이다", () => {
  // 디테일 + 다 고른 경우
  const all = (list: { id: string }[]) => list.map((o) => o.id);
  const max: Answers = {
    mode: ["detail"], area: all(AREAS), "area:other": ["x".repeat(40)], interests: all(INTERESTS), must: ["hands"],
    place: ["경복궁, 창덕궁, 덕수궁, 북촌 한옥마을, 성수동 카페거리, 망원시장, 남산, 잠실 전망대, 한강공원, 익선동"],
    foods: ["bbq", "chicken", "tteokbokki", "bibimbap", "naengmyeon", "gukbap", "street", "hanjeongsik"],
    dates: ["2100-01-01", "2100-01-30"], arrive: ["late"], leave: ["early"], who: ["family"], kids: all(CHILDREN), travelers: ["20"],
    visited: ["again"], stay: ["booked"], stayArea: [], "stayArea:other": ["y".repeat(40)], budget: ["350to500"],
    adventure: ["some"], spicy: ["hot"], needs: ["halal", "vegetarian", "vegan", "allergy", "wheelchair", "stroller", "walk"],
    allergy: ["nut", "shellfish", "dairy", "wheat", "egg"], "allergy:other": ["z".repeat(40)], pace: ["full"],
    avoid: ["crowds", "stairs", "long", "late", "queues", "touristy"], "avoid:other": ["w".repeat(40)],
    start: ["11"], end: ["late"], transport: ["transit"], subway: ["new"], airport: ["icn"], ride: ["compare"], hanbok: ["yes"],
    buy: ["cosmetics", "clothes", "souvenirs", "electronics", "snacks", "books"],
  };
  withinLimits(toPlanRequest(max, "en"));
  // 보기 하나하나 (머리말을 붙인 값까지)
  for (const st of STEPS) for (const f of st.fields) {
    if (!Array.isArray(f.options)) continue;
    for (const o of f.options) withinLimits(toPlanRequest({ ...max, [f.key]: [o.id] }, "en"));
  }
  for (const o of [...AREAS]) withinLimits(toPlanRequest({ ...max, stayArea: [o.id], "stayArea:other": undefined }, "en"));
  for (const v of VIBES) withinLimits(toPlanRequest({ ...max, mode: ["rough"], vibe: [v.id] }, "en"));
  for (const o of INTERESTS) withinLimits(toPlanRequest({ ...max, must: [o.id] }, "en"));
  for (const a of STARTS) for (const b of ENDS) withinLimits(toPlanRequest({ ...max, start: [a.id], end: [b.id] }, "en"));
  for (const a of AIRPORTS) for (const r of RIDES) withinLimits(toPlanRequest({ ...max, airport: [a.id], ride: [r.id] }, "en"));
  for (const tr of TRANSPORTS) withinLimits(toPlanRequest({ ...max, transport: [tr.id] }, "en"));
  for (const w of COMPANIONS) withinLimits(toPlanRequest({ ...max, who: [w.id] }, "en"));
  for (const b of BUDGETS) assert.ok(b.value.length <= 60, b.value);
});

test("많이 골라도 13줄 안에서 고른 것마다 적어도 한 줄은 들어간다 (긴 목록은 뒤쪽이 잘린다)", () => {
  const all = (list: { id: string }[]) => list.map((o) => o.id);
  const heavy: Answers = {
    mode: ["detail"], area: all(AREAS), interests: all(INTERESTS), must: ["food"],
    place: ["경복궁, 창덕궁, 덕수궁, 북촌, 망원시장, 남산, 서울숲"], foods: all(FOODS),
    dates: ["2100-03-01", "2100-03-05"], arrive: ["late"], leave: ["early"], who: ["solo"], visited: ["first"], stay: ["open"],
    budget: ["150to250"], adventure: ["familiar"], spicy: ["mild"], pace: ["full"], start: ["9"], end: ["21"],
    transport: ["taxi"], airport: ["icn"], ride: ["bus"], hanbok: ["yes"], buy: all(BUYS),
  };
  const styles = toPlanRequest(heavy, "en").styles;
  assert.equal(styles.length, 13);
  for (const prefix of ["Plan:", "Top priority:", "Areas:", "Into:", "Must visit:", "Must eat:", "Arrives", "Food:", "Airport:", "Wants to wear hanbok", "Shopping:"]) {
    assert.ok(styles.some((x) => x.startsWith(prefix)), prefix);
  }
  assert.equal(styles[2], "Areas: Gwanghwamun, Bukchon, Myeongdong", "동네가 많으면 짧은 이름으로, 먼저 고른 것부터");
  assert.ok(styles.includes("Food: familiar food only, mild spice ok"));
});

test("질문 글: 모든 질문·보기에 한국어·영어가 있고, 쓰지 않기로 한 말(규칙 3장)이 없다", () => {
  const banned = [/we book/i, /we arrange/i, /on your behalf/i, /예약해\s?드/, /통역/, /현지에서 도와/];
  const texts: string[] = [];
  const keys = STEPS.flatMap((st) => st.fields.map((f) => f.key));
  assert.equal(new Set(keys).size, keys.length, "줄 이름(key)이 겹친다");
  for (const st of STEPS) {
    assert.ok(st.q.ko && st.q.en && st.help.ko && st.help.en, st.id);
    texts.push(st.q.ko, st.q.en, st.help.ko, st.help.en);
    for (const f of st.fields) {
      if (f.label) texts.push(f.label.ko, f.label.en);
      if (f.text) texts.push(f.text.placeholder.ko, f.text.placeholder.en);
      if (!Array.isArray(f.options)) continue;
      assert.equal(new Set(f.options.map((o) => o.id)).size, f.options.length, `${f.key}: 같은 id`);
      for (const o of f.options) {
        assert.ok(o.title.ko && o.title.en, `${f.key}:${o.id}`);
        texts.push(o.title.ko, o.title.en, o.description?.ko ?? "", o.description?.en ?? "", o.value);
      }
    }
  }
  for (const text of texts) for (const b of banned) assert.ok(!b.test(text), text);
});

/* ── 사진 (15개 도시 — 지금은 서울 엽서만 쓰지만 다시 열 때를 위해 그대로 확인한다) ── */

test("엽서 사진: 도시마다 번갈아, 사진 없는 곳은 건너뛰고, 아무 데도 없으면 지금 열어 둔 서울", () => {
  const seoul = CURATED.Seoul.photos;
  const busan = CURATED.Busan.photos;
  assert.deepEqual(panelPhotos(["Seoul"]), seoul);
  assert.deepEqual(panelPhotos(["Seoul", "Busan"]), [seoul[0], busan[0], seoul[1], busan[1], seoul[2]]);
  assert.deepEqual(panelPhotos(["Ulsan", "Mokpo"]), CURATED.Mokpo.photos);
  assert.deepEqual(OPEN_PLACES, ["Seoul"]);
  assert.deepEqual(panelPhotos([]), seoul, "빈 엽서 없음");
});

// lib/places.ts 의 DESTINATIONS 와 같은 목록 (그 파일은 확장자 없는 import 를 써서 node --test 로 바로 못 불러온다)
const DESTINATIONS = ["Seoul", "Incheon", "Chuncheon", "Gangneung", "Sokcho", "Gyeongju", "Andong", "Pohang",
  "Daegu", "Busan", "Tongyeong", "Jeonju", "Yeosu", "Mokpo", "Jeju"];

test("목록의 모든 도시에 사진 카드 4장과 엽서 사진이 있고, 사진 파일이 실제로 있다", () => {
  assert.deepEqual(Object.keys(CURATED).sort(), [...DESTINATIONS].sort());
  for (const [place, city] of Object.entries(CURATED)) {
    assert.equal(city.experiences.length, 4, place);
    assert.equal(new Set(city.experiences.map((e) => e.id)).size, 4, `${place}: 같은 id`);
    assert.ok(city.photos.length >= 2, `${place}: 엽서 사진`);
    for (const src of [...city.experiences.map((e) => e.image), ...city.photos]) {
      assert.ok(existsSync(new URL(`../../../public${src}`, import.meta.url)), `${place}: public${src} 이 없다`);
    }
  }
});

test("엽서 사진은 그 도시의 사진 카드와 겹치지 않는다 (같은 사진이 옆에 또 보이지 않게)", () => {
  for (const [place, city] of Object.entries(CURATED)) {
    const cards = new Set(city.experiences.map((e) => e.image));
    for (const photo of panelPhotos([place])) assert.ok(!cards.has(photo), `${place}: ${photo}`);
  }
});
