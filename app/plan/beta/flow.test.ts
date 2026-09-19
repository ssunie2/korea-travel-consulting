import test from "node:test";
import assert from "node:assert/strict";
import { CITIES, INITIAL_STATE, choicesFor, flowReducer, selectedTrip, stepOrder } from "./flow.ts";
import type { FlowState } from "./flow.ts";

const choose = (state: FlowState, value: string) => flowReducer(state, { type: "choose", value });
const back = (state: FlowState) => flowReducer(state, { type: "back" });

test("도시를 고르면 그 도시의 카테고리만 나온다", () => {
  for (const city of CITIES) {
    const state = choose(INITIAL_STATE, city.id);
    assert.equal(state.step, "experience");
    assert.deepEqual(choicesFor(state).map((item) => item.id), city.experiences.map((item) => item.id));
  }
  assert.notDeepEqual(choicesFor(choose(INITIAL_STATE, "seoul")), choicesFor(choose(INITIAL_STATE, "busan")));
});

test("모든 도시·카테고리·세부 취향이 자기 답으로 요약까지 이어진다", () => {
  for (const city of CITIES) for (const experience of city.experiences) for (const detail of experience.details) {
    let state = choose(INITIAL_STATE, city.id);
    state = choose(state, experience.id);
    assert.equal(state.step, "detail");
    assert.equal(selectedTrip(state.answers).experience?.question, experience.question);
    state = choose(state, detail.id);
    state = choose(state, "solo");
    assert.equal(state.step, "pace");
    state = choose(state, "slow");
    assert.equal(state.step, "summary");
    assert.equal(selectedTrip(state.answers).detail?.title, detail.title);
  }
});

test("아이와 함께를 고른 사람에게만 추가 질문을 보여준다", () => {
  let state = choose(choose(choose(INITIAL_STATE, "seoul"), "food"), "market");
  state = choose(state, "children");
  assert.equal(state.step, "children");
  assert.equal(stepOrder(state.answers).length, 7);
  state = choose(choose(state, "school"), "balanced");
  assert.equal(state.step, "summary");
  assert.equal(selectedTrip(state.answers).children?.title, "초등학생");
  state = back(back(back(state)));
  assert.equal(state.step, "company");
  state = choose(state, "friends");
  assert.equal(state.step, "pace");
  assert.equal(state.answers.children, undefined);
  assert.equal(state.answers.pace, undefined);
});

test("뒤로 가면 기존 답이 보이고, 도시를 다시 고르면 이전 도시 답을 지운다", () => {
  let state = choose(choose(choose(choose(choose(INITIAL_STATE, "seoul"), "neighbourhood"), "quiet"), "solo"), "slow");
  while (state.step !== "city") state = back(state);
  assert.equal(state.answers.detail, "quiet");
  state = choose(state, "busan");
  assert.deepEqual(state.answers, { city: "busan" });
  assert.equal(state.step, "experience");
});

test("다른 분기의 값이나 없는 답은 무시한다", () => {
  assert.equal(choose(INITIAL_STATE, "unknown"), INITIAL_STATE);
  const state = choose(choose(INITIAL_STATE, "seoul"), "heritage");
  assert.equal(choose(state, "market"), state);
});

test("첫 화면에서 뒤로 가기는 안전하고 다시 시작하면 모든 답이 지워진다", () => {
  assert.deepEqual(back(INITIAL_STATE), INITIAL_STATE);
  assert.deepEqual(flowReducer(choose(INITIAL_STATE, "jeju"), { type: "reset" }), INITIAL_STATE);
});
