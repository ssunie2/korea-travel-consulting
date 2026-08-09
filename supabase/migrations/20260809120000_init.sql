-- 1차(MVP) 테이블 3개
-- 손님 개인정보가 들어가므로 브라우저에서 DB에 직접 붙지 못하게 잠근다.
-- 서버(app/api/)만 service_role 키로 접근한다.

-- ── 무료 초안 ────────────────────────────────────────────────
-- 손님이 폼에 넣은 값 + AI가 만들어준 초안을 한 줄에 같이 담는다.
create table public.plans (
  id                uuid primary key default gen_random_uuid(),  -- 추측 불가능한 아이디 (결과 링크 주소로 쓴다)
  created_at        timestamptz not null default now(),

  -- 손님이 넣은 값
  start_date        date        not null,
  duration_days     smallint    not null check (duration_days between 1 and 30),
  travelers         smallint    not null check (travelers between 1 and 20),
  budget_per_person integer     check (budget_per_person >= 0),   -- 1인 예산 (원)
  styles            text[]      not null default '{}',            -- 여행 스타일 (복수 선택)
  audience          text,                                          -- 혼자 / 커플 / 친구 / 가족
  interests         text,
  language          text        not null default 'en',

  -- AI가 만든 무료 초안 (모양은 lib/types.ts 의 FreeItinerary)
  itinerary         jsonb
);

-- ── 상담 신청 ────────────────────────────────────────────────
create table public.consultations (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  plan_id    uuid references public.plans(id) on delete set null,  -- 어떤 초안을 보고 신청했는지
  name       text not null,
  email      text not null,
  messenger  text,
  message    text,
  status     text not null default 'received'
             check (status in ('received', 'in_progress', 'done'))
);

-- ── 문의 ─────────────────────────────────────────────────────
create table public.inquiries (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email      text not null,
  message    text not null
);

-- ── 잠금 ─────────────────────────────────────────────────────
-- RLS(Row Level Security, 줄 단위 접근 제한)를 켜고 아무 허용 규칙도 만들지 않는다.
-- = 브라우저에서 오는 요청은 전부 막힌다. service_role 키를 쓰는 서버만 통과한다.
alter table public.plans         enable row level security;
alter table public.consultations enable row level security;
alter table public.inquiries     enable row level security;
