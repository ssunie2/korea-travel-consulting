import { createClient } from '@supabase/supabase-js'

// 서버에서만 쓰는 Supabase 연결.
// 손님 개인정보를 다루므로 브라우저에서 DB에 직접 붙지 않는다 (DB 쪽도 막아뒀다).
// 화면이 필요한 데이터는 서버가 대신 읽어서 내려준다.
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
