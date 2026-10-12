// 실행: node --test app/mohallae/plan/flow.test.ts
// (npm test 는 지금 lib/ 만 본다 — 뮤조가 #82 리뷰에서 짚은 것과 같은 이유로, 넓히는 건 package.json PR 에서)
import test from "node:test";
import assert from "node:assert/strict";
import { CURATED, INITIAL_STATE, OPTIONAL, choicesFor, flowReducer, stepError, stepOrder, toPlanRequest } from "./flow.ts";
import type { FlowState, Step } from "./flow.ts";

const choose = (s: FlowState, value: string) => flowReducer(s, { type: "choose", value });
const next = (s: FlowState) => flowReducer(s, { type: "next", from: s.step });
const back = (s: FlowState) => flowReducer(s, { type: "back" });
const input = (s: FlowState, values: string[]) => flowReducer(s, { type: "input", values });
const pick = (s: FlowState, value: string) => next(choose(s, value));
const until = (s: FlowState, step: Step, move: (s: FlowState) => FlowState) => {
  for (let i = 0; i < 60 && s.step !== step; i++) s = move(s);
  assert.equal(s.step, step);
  return s;
};
const TODAY = "2026-10-12";

/** 핵심 질문까지 한 바퀴: 혼자, 천천히, 3일, 25–35만원 */
function core(s: FlowState) {
  s = pick(s, "solo");
  s = pick(s, "slow");
  assert.equal(s.step, "dates");
  s = next(input(s, ["2100-10-14", "2100-10-16"]));
  assert.equal(s.step, "travelers");
  s = next(s); // 혼자는 1명이 채워져 있다
  s = pick(s, "250to350");
  return s;
}

test("서울은 베타처럼 하고 싶은 것 → 장면을 묻고, 그 밖의 도시는 관심사를 한 번 묻는다", () => {
  let s = next(choose(choose(INITIAL_STATE, "Seoul"), "Gangneung"));
  assert.equal(s.step, "do:Seoul");
  s = next(choose(choose(s, "heritage"), "food"));
  assert.equal(s.step, "scene:Seoul:heritage");
  s = pick(s, "palace");
  assert.equal(s.step, "scene:Seoul:food");
  s = pick(s, "market");
  assert.equal(s.step, "interests"); // 강릉 몫
  s = next(choose(s, "beaches"));
  assert.equal(s.step, "who");
});

test("네 도시의 모든 활동·장면이 확인 화면까지 이어진다", () => {
  for (const [place, city] of Object.entries(CURATED)) for (const exp of city.experiences) for (const scene of exp.scenes) {
    let s = pick(INITIAL_STATE, place);
    s = pick(s, exp.id);
    s = pick(s, scene.id);
    s = core(s);
    assert.equal(s.step, "visited");
    s = until(s, "review", next); // 세부는 건너뛸 수 있다
    assert.deepEqual(s.answers[`scene:${place}:${exp.id}`], [scene.id]);
  }
});

test("도시나 활동을 풀면 그 아래 답만 지워지고 다른 답은 남는다", () => {
  let s = next(choose(choose(INITIAL_STATE, "Seoul"), "Busan"));
  s = next(choose(s, "food"));
  s = pick(s, "dessert");
  assert.equal(s.step, "do:Busan");
  s = pick(s, "night");
  s = pick(s, "quiet");
  assert.equal(s.step, "who");
  s = until(s, "where", back);
  s = choose(s, "Busan"); // 부산을 뺀다
  assert.equal(s.answers["do:Busan"], undefined);
  assert.equal(s.answers["scene:Busan:night"], undefined);
  assert.deepEqual(s.answers["scene:Seoul:food"], ["dessert"]);
  assert.deepEqual(stepOrder(s.answers).slice(0, 3), ["where", "do:Seoul", "scene:Seoul:food"]);
});

test("직접 적은 곳은 장면 질문 대신 관심사로 가고, 비워 두면 못 넘어간다", () => {
  let s = flowReducer(INITIAL_STATE, { type: "other", text: "" });
  assert.ok(stepError(s, TODAY));
  s = next(s);
  assert.equal(s.step, "where");
  s = flowReducer(s, { type: "other", text: "Ulsan" });
  s = next(s);
  assert.equal(s.step, "interests");
  s = flowReducer(s, { type: "other", text: "whale watching" });
  s = next(s);
  assert.equal(s.step, "who");
});

test("아이와 함께면 나이를 묻고, '누구와'를 바꾸면 그 질문과 인원이 정리된다", () => {
  let s = pick(INITIAL_STATE, "Jeju");
  s = pick(s, "rest");
  s = pick(s, "view");
  s = pick(s, "family");
  assert.equal(s.step, "kids");
  s = choose(s, "young");
  s = until(s, "who", back);
  s = choose(s, "couple");
  assert.equal(s.answers.kids, undefined);
  assert.deepEqual(s.answers.travelers, ["2"]);
});

test("날짜·인원 검사: 지난 날짜, 30일 넘는 여행, 혼자인데 2명", () => {
  let s = pick(INITIAL_STATE, "Seoul");
  s = pick(s, "heritage");
  s = pick(s, "hanbok");
  s = pick(s, "solo");
  s = pick(s, "full");
  assert.ok(stepError(input(s, ["2026-10-01", "2026-10-03"]), TODAY), "지난 날짜");
  assert.ok(stepError(input(s, ["2026-11-01", "2026-12-01"]), TODAY), "31일");
  assert.equal(stepError(input(s, ["2026-11-01", "2026-11-30"]), TODAY), null, "30일은 된다");
  s = next(input(s, ["2100-11-01", "2100-11-03"]));
  assert.ok(stepError(input(s, ["2"]), TODAY), "혼자인데 2명");
});

test("필수 질문은 건너뛸 수 없고, 세부에서만 바로 확인으로 갈 수 있다", () => {
  let s = pick(INITIAL_STATE, "Busan");
  assert.equal(flowReducer(s, { type: "goto", to: "review" }).step, "do:Busan", "필수 질문에서 건너뛰기");
  s = pick(s, "coast");
  s = pick(s, "cafe");
  s = core(s);
  assert.ok(OPTIONAL.includes(s.step));
  s = flowReducer(s, { type: "goto", to: "review" });
  assert.equal(s.step, "review");
  s = flowReducer(s, { type: "goto", to: "dates" }); // 확인 화면에서 고치러 가기
  assert.equal(s.step, "dates");
});

test("늦게 들어온 이전 화면의 클릭은 두 칸을 건너뛰지 않는다", () => {
  const s = choose(INITIAL_STATE, "Seoul");
  const moved = next(s);
  assert.equal(flowReducer(moved, { type: "next", from: "where" }).step, moved.step);
});

test("보내는 값은 지금 폼과 같은 모양이다", () => {
  let s = next(choose(choose(INITIAL_STATE, "Seoul"), "Andong"));
  s = next(choose(choose(s, "heritage"), "food"));
  s = pick(s, "palace");
  s = pick(s, "market");
  s = next(choose(s, "culture"));
  s = pick(s, "family");
  s = pick(s, "school");
  s = pick(s, "balanced");
  s = next(input(s, ["2100-10-14", "2100-10-17"]));
  s = next(input(s, ["3"]));
  s = flowReducer(s, { type: "set", key: "budget:currency", value: "EUR" });
  s = pick(s, "undecided");
  s = pick(s, "again"); // 재방문
  s = pick(s, "transit");
  s = next(s); // 숙소는 건너뛴다
  s = next(s); // 리듬도
  s = next(s); // 기념일도
  s = next(choose(s, "stairs"));
  s = next(choose(s, "vegetarian"));
  assert.equal(s.step, "review");
  const req = toPlanRequest(s.answers, "en");
  assert.deepEqual(req, {
    destinations: ["Seoul", "Andong"],
    startDate: "2100-10-14",
    durationDays: 4,
    travelers: 3,
    budgetRange: undefined,
    budgetCurrency: "EUR",
    styles: ["Seoul: palace walks", "Seoul: market food stalls", "Culture & history"],
    audience: "Family with kids (primary school)",
    pace: "Balanced",
    visitedBefore: "Been before",
    transport: "Subway and bus",
    stayArea: undefined,
    dayRhythm: undefined,
    occasion: undefined,
    avoid: ["Lots of stairs"],
    dietary: ["Vegetarian"],
    language: "en",
  });
  for (const style of req.styles) assert.ok(style.length <= 40, style);
});

test("모든 장면 값은 도시 이름을 붙여도 서버 한도(40자) 안이다", () => {
  for (const [place, city] of Object.entries(CURATED)) for (const exp of city.experiences) {
    for (const c of choicesFor(`scene:${place}:${exp.id}`)) assert.ok(`${place}: ${c.value}`.length <= 40, `${place}: ${c.value}`);
  }
});
