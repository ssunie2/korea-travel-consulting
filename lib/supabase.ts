import { createClient } from '@supabase/supabase-js'

// 브라우저에서 쓰는 Supabase 연결. 공개돼도 되는 키만 쓴다.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
