-- PR #14 리뷰 반영 3가지.

-- ── ① RLS 자동 켜기 안전장치를 마이그레이션에 넣는다 ──────────────
-- DB에는 이미 있는데 파일에는 없던 것이다. 그러면 새 환경(선경 로컬 등)에는 안 생긴다.
-- 여기서 다시 정의해서 이 파일이 원본이 되게 한다.
--
-- 하는 일: public 스키마에 새 테이블이 생기면 RLS(줄 단위 차단)를 자동으로 켠다.
-- 앞으로 누가 테이블을 만들면서 RLS 켜는 걸 잊어도 손님 데이터가 열려 있지 않게 하는 그물이다.

create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  obj record;
begin
  for obj in
    select * from pg_event_trigger_ddl_commands()
    where command_tag = 'CREATE TABLE' and schema_name = 'public'
  loop
    execute format('alter table %s enable row level security', obj.object_identity);
  end loop;
end;
$$;

-- 손님(anon)·로그인 사용자에게는 이 함수를 실행할 권한을 주지 않는다.
-- 직접 부르면 어차피 에러가 나지만, Supabase 보안 검사 경고를 없애고 의도를 분명히 한다.
revoke execute on function public.rls_auto_enable() from anon, authenticated;

drop event trigger if exists ensure_rls;
create event trigger ensure_rls
  on ddl_command_end
  when tag in ('CREATE TABLE')
  execute function public.rls_auto_enable();

-- ── ② 목적지·제약사항·통화 ────────────────────────────────────
-- 목적지: 한국 어디를 가는지 모르면 AI가 일정을 만들 수 없다. 빠져 있었다.
--         여러 도시를 도는 여행이 많아서 배열로 받는다.
-- 제약사항: 할랄·비건·알레르기·휠체어. 이걸 챙기는 것이 우리가 돈을 받는 이유에 가깝다.
-- 통화: 손님은 해외 여행객이라 달러·유로로 생각한다. 원화로 박아두면 나중에 뒤집어야 한다.

alter table public.plans
  add column destinations    text[] not null default '{}',
  add column dietary_notes   text,
  add column budget_currency text   not null default 'KRW';

-- ── ③ 상담 상태에 '취소' 추가 ─────────────────────────────────
-- 손님이 취소하거나 연락이 끊긴 건을 닫을 방법이 없어서 목록에 영원히 '진행중'으로 남는다.

alter table public.consultations drop constraint consultations_status_check;

alter table public.consultations add constraint consultations_status_check
  check (status in ('received', 'in_progress', 'done', 'cancelled'));
