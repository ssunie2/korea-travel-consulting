// 실행: node --test app/mohallae/plan/flow.test.ts
// (npm test 는 지금 lib/ 만 본다 — 뮤조가 #82 리뷰에서 짚은 것과 같은 이유로, 넓히는 건 package.json PR 에서)
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { CURATED, INITIAL_STATE, OPTIONAL, choicesFor, flowReducer, panelPhotos, pickedPlaces, stepError, stepOrder, toPlanRequest } from "./flow.ts";
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

test("도시마다 '하고 싶은 것'을 한 번씩만 묻고(두 번째 질문 없음), 보기가 없는 곳은 관심사를 한 번 묻는다", () => {
  let s = choose(choose(INITIAL_STATE, "Seoul"), "Busan");
  s = next(flowReducer(s, { type: "other", text: "Ulsan" }));
  assert.equal(s.step, "do:Seoul");
  s = next(choose(choose(s, "heritage"), "food"));
  assert.equal(s.step, "do:Busan");
  s = pick(s, "coast");
  assert.equal(s.step, "interests"); // 직접 적은 울산 몫
  s = next(choose(s, "beaches"));
  assert.equal(s.step, "who");
});

test("모든 도시의 '하고 싶은 것'이 확인 화면까지 이어지고, 도시 이름을 붙여 보낸다", () => {
  for (const [place, city] of Object.entries(CURATED)) for (const exp of city.experiences) {
    let s = pick(INITIAL_STATE, place);
    s = pick(s, exp.id);
    s = core(s);
    assert.equal(s.step, "visited");
    s = until(s, "review", next); // 세부는 건너뛸 수 있다
    assert.deepEqual(toPlanRequest(s.answers, "en").styles, [`${place}: ${exp.ai}`]);
  }
});

test("도시나 활동을 풀면 그 아래 답만 지워지고 다른 답은 남는다", () => {
  let s = next(choose(choose(INITIAL_STATE, "Seoul"), "Busan"));
  s = pick(s, "food");
  assert.equal(s.step, "do:Busan");
  s = pick(s, "night");
  assert.equal(s.step, "who");
  s = until(s, "where", back);
  s = choose(s, "Busan"); // 부산을 뺀다
  assert.equal(s.answers["do:Busan"], undefined);
  assert.deepEqual(s.answers["do:Seoul"], ["food"]);
  assert.deepEqual(stepOrder(s.answers).slice(0, 3), ["where", "do:Seoul", "who"]);
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
  s = core(s);
  assert.ok(OPTIONAL.includes(s.step));
  s = flowReducer(s, { type: "goto", to: "review" });
  assert.equal(s.step, "review");
  s = flowReducer(s, { type: "goto", to: "dates" }); // 확인 화면에서 고치러 가기
  assert.equal(s.step, "dates");
});

test("확인 화면을 본 뒤 고치러 가면 곧장 돌아오고, 새로 생긴 필수 질문에서는 멈춘다", () => {
  const resume = (st: FlowState) => flowReducer(st, { type: "resume" });
  let s = pick(INITIAL_STATE, "Busan");
  s = pick(s, "coast");
  s = core(s);
  assert.equal(resume(s).step, s.step, "확인 화면 전에는 아무 일도 없다");
  s = flowReducer(s, { type: "goto", to: "review" });
  assert.equal(s.reviewed, true);

  // 날짜만 고치고 곧장 확인으로
  s = flowReducer(s, { type: "goto", to: "dates" });
  s = input(s, ["2100-10-20", "2100-10-24"]);
  s = resume(s);
  assert.equal(s.step, "review");

  // 고치다 비워 두면 못 간다
  s = flowReducer(s, { type: "goto", to: "dates" });
  assert.equal(resume(input(s, ["2100-10-20", ""])).step, "dates");

  // 서울을 더하면 서울의 '하고 싶은 것'을 거쳐서 돌아온다
  s = flowReducer(input(s, ["2100-10-20", "2100-10-24"]), { type: "goto", to: "where" });
  s = choose(s, "Seoul");
  s = resume(s);
  assert.equal(s.step, "do:Seoul");
  s = resume(choose(s, "heritage"));
  assert.equal(s.step, "review");

  // 혼자 → 친구들과: 인원을 다시 세야 하므로 인원에서 멈춘다
  s = flowReducer(s, { type: "goto", to: "who" });
  s = resume(choose(s, "friends"));
  assert.equal(s.step, "travelers");
  s = resume(input(s, ["3"]));
  assert.equal(s.step, "review");
});

test("엽서 사진: 도시마다 번갈아, 사진 없는 곳(직접 적은 곳)은 건너뛴다", () => {
  const seoul = CURATED.Seoul.photos;
  const busan = CURATED.Busan.photos;
  assert.deepEqual(panelPhotos(["Seoul"]), seoul);
  assert.deepEqual(panelPhotos(["Seoul", "Busan"]), [seoul[0], busan[0], seoul[1], busan[1], seoul[2]]);
  assert.deepEqual(panelPhotos(["Ulsan"]), [], "직접 적은 곳");
  assert.deepEqual(panelPhotos(["Ulsan", "Mokpo"]), CURATED.Mokpo.photos);
});

test("아직 아무 데도 고르지 않았으면 엽서에 도시마다 첫 장씩 나온다 (빈 엽서 없음)", () => {
  const tour = panelPhotos([]);
  assert.equal(tour.length, Object.keys(CURATED).length);
  assert.equal(new Set(tour).size, tour.length, "같은 사진 두 번");
  assert.equal(tour[0], CURATED.Seoul.photos[0]);
  // 첫 화면에서 도시를 고르면 그 도시 사진으로 바뀐다
  const s = choose(INITIAL_STATE, "Jeonju");
  assert.deepEqual(panelPhotos(pickedPlaces(s.answers)), CURATED.Jeonju.photos);
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
    const cards = new Set(city.experiences.map((e) => e.image).filter(Boolean));
    for (const photo of panelPhotos([place])) assert.ok(!cards.has(photo), `${place}: ${photo}`);
  }
});

test("늦게 들어온 이전 화면의 클릭은 두 칸을 건너뛰지 않는다", () => {
  const s = choose(INITIAL_STATE, "Seoul");
  const moved = next(s);
  assert.equal(flowReducer(moved, { type: "next", from: "where" }).step, moved.step);
});

test("보내는 값은 지금 폼과 같은 모양이다", () => {
  let s = choose(INITIAL_STATE, "Seoul");
  s = next(flowReducer(s, { type: "other", text: "Ulsan" }));
  s = next(choose(choose(s, "heritage"), "food"));
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
    destinations: ["Seoul", "Ulsan"],
    startDate: "2100-10-14",
    durationDays: 4,
    travelers: 3,
    budgetRange: undefined,
    budgetCurrency: "EUR",
    styles: ["Seoul: palaces & hanok", "Seoul: markets & street food", "Culture & history"],
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

test("모든 '하고 싶은 것' 값은 도시 이름을 붙여도 서버 한도(40자) 안이다", () => {
  for (const place of Object.keys(CURATED)) {
    for (const c of choicesFor(`do:${place}`)) assert.ok(`${place}: ${c.value}`.length <= 40, `${place}: ${c.value}`);
  }
});
