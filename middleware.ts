import { NextResponse } from 'next/server'

// /admin 아래는 비밀번호를 물어본다. 손님 이름·이메일이 들어있는 화면이라 아무나 열면 안 된다.
//
// ponytail: 둘이서 쓰는 화면이라 공용 비밀번호 하나로 막았다. 계정을 따로 만들 이유가 없다.
// 누가 언제 상태를 바꿨는지 기록이 필요해지면 그때 Supabase 로그인으로 옮긴다.
export const config = { matcher: '/admin/:path*' }

export function middleware(req: Request) {
  const password = process.env.ADMIN_PASSWORD

  // 비밀번호를 안 정했으면 아예 잠근다. 설정을 빠뜨렸을 때 열려 있는 것보다 닫혀 있는 게 낫다.
  if (password && req.headers.get('authorization') === `Basic ${btoa(`admin:${password}`)}`) {
    return NextResponse.next()
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="admin"' },
  })
}
