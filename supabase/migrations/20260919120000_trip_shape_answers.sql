-- 일정의 짜임을 크게 바꾸는 답 일곱 개를 담을 칸을 만든다 (이슈 #75).
--
-- 전부 nullable 이다. 답하지 않고 넘어갈 수 있는 문항이고,
-- 이미 저장된 초안들에는 이 값이 없다.
--
-- 값은 화면에 보이는 영어 라벨을 그대로 넣는다 — 앞선 마이그레이션과 같은 방식이다.
-- 이 글자가 그대로 AI 프롬프트로 나간다.

alter table public.plans
  -- 시차. 도시가 아니라 방향만 받는다 — "첫날 오후에 무너지는가" 가 알고 싶은 것이다
  add column origin        text,
  -- 첫날·마지막날에 실제로 쓸 수 있는 시간.
  -- 나흘 여행이라도 밤에 도착해 아침에 떠나면 실제로 쓰는 건 이틀이다.
  -- 이게 없으면 AI 가 없는 시간에 일정을 채운다.
  add column first_day     text,
  add column last_day      text,
  -- 예산에 항공권이 들어 있는지. 같은 금액이 세 배로 벌어지는 자리다
  add column budget_scope  text,
  -- 숙소를 이미 잡았는지. 잡았으면 동선의 기점이 확정된다
  add column stay_booked   text,
  -- 잡았다면 어디에. 손님이 직접 적는다
  add column stay_place    text,
  -- 아이 나이. 두 살과 열세 살은 완전히 다른 일정이다.
  -- ⚠️ 아동 정보다. 개인정보 처리방침 7장(만 14세 미만)과 함께 본다.
  add column kids_ages     text;
