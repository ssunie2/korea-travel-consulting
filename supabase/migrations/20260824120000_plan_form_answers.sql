-- 폼에 객관식 문항을 늘리면서 그 답을 담을 칸을 만든다 (선경 요청, 2026-08-24).
--
-- 전부 nullable 이다. 손님이 답하지 않고 넘어갈 수 있는 문항이고,
-- 이미 저장된 초안들에는 이 값이 없다.
--
-- 한 개만 고르는 것은 text, 여러 개 고르는 것은 text[] 로 둔다.
-- 값은 화면에 보이는 영어 라벨을 그대로 넣는다 — 코드값을 따로 두면
-- 폼과 DB 를 양쪽 다 고쳐야 하고, 이 값들은 결국 AI 프롬프트로 나가는 글자다.

alter table public.plans
  -- 하루에 넣는 일정 개수가 달라진다
  add column pace           text,
  -- 처음이면 대표 명소, 다시 오면 덜 알려진 곳
  add column visited_before text,
  -- 추천 동선이 통째로 달라진다
  add column transport      text,
  -- 숙소를 고르는 기준
  add column stay_area      text,
  -- 시간표의 첫 시각
  add column day_rhythm     text,
  -- 생일·기념일·신혼여행
  add column occasion       text,
  -- 빼 달라는 것들 (사람 많은 곳, 계단, 긴 이동…)
  add column avoid          text[],
  -- 할랄·비건·알레르기·휠체어.
  -- ⚠️ 건강·종교 정보다. AI 무료 등급에서는 학습에 쓰이고 사람이 볼 수 있다.
  --    손님을 받기 전에 유료 등급으로 올려야 한다.
  add column dietary        text[];

-- 옛 자유 입력 칸(dietary_notes, interests)은 지우지 않는다.
-- 지금은 안 쓰지만 이미 들어온 값이 있을 수 있고, 지우면 되돌릴 수 없다.
