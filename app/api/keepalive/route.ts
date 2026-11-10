import { supabaseServer } from '@/lib/supabase-server'
import { keepaliveAllowed } from '@/lib/keepalive'

// DB 깨우기 (#71) — Vercel 이 하루 한 번 부른다 (vercel.json 의 crons).
// plans 표에서 한 줄만 읽는다. 아무것도 쓰거나 지우지 않는다.
// 요청 머리(headers)를 읽으므로 매번 새로 실행된다 — 캐시된 응답으로 넘어가지 않는다.
export async function GET(req: Request) {
  if (!keepaliveAllowed(req.headers.get('authorization'), process.env.CRON_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { error } = await supabaseServer().from('plans').select('id').limit(1)

  if (error) {
    // 자세한 오류는 Vercel 로그에만 남긴다. 바깥에는 실패했다는 것만 알린다.
    console.error('[keepalive] Supabase 읽기 실패:', error.message)
    return Response.json({ ok: false }, { status: 500 })
  }
  return Response.json({ ok: true, at: new Date().toISOString() })
}
