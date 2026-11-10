// Supabase 무료 플랜은 일주일 동안 DB 사용이 거의 없으면 프로젝트를 잠재운다 (#71).
// 잠들면 초안 결과·상담 신청·랜딩 샘플이 전부 404 가 된다. 랜딩은 멀쩡해 보여서 아무도 모른다.
// 그래서 Vercel 이 하루 한 번 /api/keepalive 를 부르고(vercel.json 의 crons), 그 주소가 DB 에 아주 작은 읽기를 한 번 보낸다.
//
// ponytail: 출시 때 Supabase Pro 로 바꾸면 잠들지 않으므로 이 장치는 지워도 된다 (써니 2026-11-10 "사이트 오픈할 때 유료로").

/**
 * 이 요청을 받아도 되는가.
 * Vercel 은 CRON_SECRET 환경 변수가 있으면 `Authorization: Bearer <값>` 을 붙여 부른다.
 * - CRON_SECRET 이 있으면: 그 값이 맞을 때만 받는다 (남이 함부로 부르지 못하게)
 * - 없으면: 받는다. 하는 일이 '읽기 한 번'뿐이라 아무나 불러도 초안 화면을 한 번 여는 것과 같다.
 *   설정을 빠뜨려도 깨우기가 멈추지 않는 쪽을 골랐다 — 멈추면 DB 가 잠들어 손님 화면이 404 가 된다.
 */
export function keepaliveAllowed(authorization: string | null, secret: string | undefined): boolean {
  if (!secret) return true
  return authorization === `Bearer ${secret}`
}
