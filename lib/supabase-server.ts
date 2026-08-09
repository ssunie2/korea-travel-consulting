import { createClient } from '@supabase/supabase-js'

// 서버에서만 쓰는 Supabase 연결.
// 손님 개인정보를 다루므로 브라우저에서 DB에 직접 붙지 않는다 (DB 쪽도 막아뒀다).
// 화면이 필요한 데이터는 서버가 대신 읽어서 내려준다.
//
// 파일을 읽는 순간이 아니라 **부를 때** 연결을 만든다.
// 그래야 키가 없는 상태에서도 `npm run build` 가 돌아간다.
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
