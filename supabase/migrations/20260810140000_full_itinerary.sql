-- 유료로 파는 전체 일정을 담는다.
-- 무료 초안(itinerary)과 따로 둔다. 손님이 무료를 먼저 받고 나중에 결제하는 흐름이라
-- 한 칸에 덮어쓰면 무료로 뭘 보여줬는지가 사라진다.
-- if not exists: 손으로 먼저 적용했더라도 다시 돌릴 수 있게 한다
alter table public.plans add column if not exists full_itinerary jsonb;
