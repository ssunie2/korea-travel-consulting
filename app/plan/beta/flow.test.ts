import test from "node:test";
import assert from "node:assert/strict";
import { CITIES, INITIAL_STATE, choicesFor, flowReducer, stepContext, stepError, stepOrder } from "./flow.ts";
import type { FlowState, Step } from "./flow.ts";

const choose = (state: FlowState, value: string) => flowReducer(state, { type: "choose", value });
const next = (state: FlowState) => flowReducer(state, { type: "next", from: state.step });
const back = (state: FlowState) => flowReducer(state, { type: "back" });
const input = (state: FlowState, values: string[]) => flowReducer(state, { type: "input", values });
const pick = (state: FlowState, value: string) => next(choose(state, value));
const goBack = (state: FlowState, step: Step) => {
  for (let i = 0; i < 40 && state.step !== step; i++) state = back(state);
  assert.equal(state.step, step);
  return state;
};

test("여러 도시를 선택·해제할 수 있고 다음을 눌러야 이동한다", () => {
  let state = choose(choose(INITIAL_STATE, "seoul"), "busan");
  assert.equal(state.step, "city");
  assert.deepEqual(state.answers.city, ["seoul", "busan"]);
  state = choose(state, "seoul");
  assert.deepEqual(state.answers.city, ["busan"]);
  state = next(state);
  assert.equal(state.step, "experience:busan");
  assert.deepEqual(choicesFor(state), CITIES[1].experiences);
});

test("모든 도시·활동·세부 취향이 기본 정보와 요약까지 이어진다", () => {
  for (const city of CITIES) for (const experience of city.experiences) for (const detail of experience.details) {
    let state = pick(INITIAL_STATE, city.id);
    state = pick(state, experience.id);
    assert.equal(stepContext(state).experience?.question, experience.question);
    state = pick(state, detail.id);
    state = pick(state, "solo");
    state = pick(state, "slow");
    assert.equal(state.step, "dates");
    state = next(input(state, ["2100-10-01", "2100-10-06"]));
    assert.equal(state.step, "travelers");
    state = next(state);
    assert.equal(state.step, "budget");
    state = pick(state, "250to350");
    assert.equal(state.step, "summary");
    assert.deepEqual(state.answers[`detail:${city.id}:${experience.id}`], [detail.id]);
  }
});

test("도시별 복수 활동·복수 세부 취향이 서로 섞이지 않는다", () => {
  let state = next(choose(choose(INITIAL_STATE, "seoul"), "busan"));
  state = next(choose(choose(state, "neighbourhood"), "food"));
  assert.equal(state.step, "detail:seoul:neighbourhood");
  state = next(choose(choose(state, "quiet"), "local"));
  assert.equal(state.step, "detail:seoul:food");
  state = pick(state, "dessert");
  assert.equal(state.step, "experience:busan");
  state = pick(state, "food");
  state = pick(state, "seafood");
  assert.equal(state.step, "company");
  assert.deepEqual(state.answers["detail:seoul:neighbourhood"], ["quiet", "local"]);
  assert.deepEqual(state.answers["detail:seoul:food"], ["dessert"]);
  assert.deepEqual(state.answers["detail:busan:food"], ["seafood"]);

  state = goBack(state, "experience:seoul");
  state = choose(state, "food");
  assert.equal(state.answers["detail:seoul:food"], undefined);
  assert.deepEqual(state.answers["detail:busan:food"], ["seafood"]);
  state = goBack(state, "city");
  state = choose(state, "seoul");
  assert.equal(state.answers["detail:seoul:neighbourhood"], undefined);
  assert.deepEqual(state.answers["detail:busan:food"], ["seafood"]);
  assert.equal(next(state).step, "experience:busan");
});

test("아이 질문은 해당 동행에게만 나오고 다른 답은 유지한다", () => {
  let state = pick(pick(pick(INITIAL_STATE, "seoul"), "food"), "market");
  state = pick(state, "children");
  assert.equal(state.step, "children");
  state = pick(state, "school");
  state = pick(state, "balanced");
  state = goBack(state, "company");
  assert.deepEqual(state.answers.children, ["school"]);
  state = pick(state, "solo");
  assert.equal(state.step, "pace");
  assert.equal(state.answers.children, undefined);
  assert.deepEqual(state.answers.pace, ["balanced"]);
  assert.deepEqual(state.answers.travelers, ["1"]);
  assert.ok(!stepOrder(state.answers).includes("children"));
});

test("빈 선택·다른 분기의 값·오래된 다음 클릭을 무시한다", () => {
  assert.equal(next(INITIAL_STATE), INITIAL_STATE);
  assert.equal(choose(INITIAL_STATE, "unknown"), INITIAL_STATE);
  assert.equal(input(INITIAL_STATE, ["seoul"]), INITIAL_STATE);
  let state = choose(INITIAL_STATE, "seoul");
  state = next(state);
  assert.equal(flowReducer(state, { type: "next", from: "city" }), state);
  state = pick(state, "heritage");
  assert.equal(choose(state, "market"), state);
  state = choose(choose(state, "palace"), "palace");
  assert.equal(next(state), state);
});

test("날짜·인원은 빈 값, 잘못된 값, 범위를 검사한다", () => {
  const dates = (values: string[]) => stepError({ step: "dates", answers: { dates: values } }, "2026-09-19");
  for (const values of [[], ["", ""], ["2026-09-18", "2026-09-20"], ["2026-09-21", "2026-09-20"], ["2026-02-30", "2026-03-02"], ["2026-10-01", "2026-10-31"], ["nonsense", "2026-10-02"]]) assert.ok(dates(values));
  assert.equal(dates(["2026-09-19", "2026-09-19"]), null);
  assert.equal(dates(["2026-10-01", "2026-10-30"]), null);
  assert.equal(dates(["2028-02-29", "2028-03-01"]), null);
  for (const value of ["", "0", "21", "1.5", "abc"]) assert.ok(stepError({ step: "travelers", answers: { travelers: [value] } }));
  assert.equal(stepError({ step: "travelers", answers: { company: ["friends"], travelers: ["20"] } }), null);
  assert.ok(stepError({ step: "travelers", answers: { company: ["solo"], travelers: ["2"] } }));
  assert.ok(stepError({ step: "travelers", answers: { company: ["children"], travelers: ["1"] } }));
});

test("앞으로 다시 이동해도 답은 남고, 다시 시작하면 초기화된다", () => {
  let state = pick(pick(pick(INITIAL_STATE, "jeju"), "rest"), "view");
  const answers = state.answers;
  state = goBack(state, "city");
  state = next(next(next(state)));
  assert.deepEqual(state.answers, answers);
  assert.deepEqual(back(INITIAL_STATE), INITIAL_STATE);
  assert.deepEqual(flowReducer(state, { type: "reset" }), INITIAL_STATE);
});
