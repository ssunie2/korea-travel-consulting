-- 서버(service_role)가 테이블을 읽고 쓸 수 있게 권한을 준다.
--
-- RLS(줄 단위 차단)와 권한은 별개다.
-- RLS는 "어떤 줄을 볼 수 있나", 권한은 "이 테이블에 손을 댈 수 있나"를 정한다.
-- 앞 마이그레이션에서 RLS만 걸어놨더니 서버조차 테이블에 못 들어갔다
-- (permission denied for table plans).
--
-- 브라우저 쪽(anon)에는 아무 권한도 주지 않는다. 손님 개인정보가 들어있다.

grant select, insert, update on public.plans         to service_role;
grant select, insert, update on public.consultations to service_role;
grant select, insert, update on public.inquiries     to service_role;
