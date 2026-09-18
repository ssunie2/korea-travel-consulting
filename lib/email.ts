import { Resend } from 'resend'

/**
 * 손님에게 메일을 보낸다.
 *
 * **이 함수는 절대 예외를 던지지 않는다.** 메일이 안 나갔다고 손님의 신청까지
 * 실패하면 안 된다 — 신청은 이미 DB 에 들어갔고, 그게 더 중요하다.
 * 실패하면 `{ ok: false }` 와 로그만 남기고 부르는 쪽이 이어서 진행한다.
 *
 * ## 보내는 주소
 *
 * 도메인을 사기 전에는 Resend 가 주는 `onboarding@resend.dev` 를 쓴다.
 * ⚠️ **그 주소로는 Resend 계정 본인에게만 보낼 수 있다.** 도메인을 인증해야
 * 아무에게나 보낼 수 있다 — 출시 전 `LAUNCH.md` 항목이다.
 * 도메인이 생기면 `RESEND_FROM` 환경변수만 바꾸면 되고 코드는 그대로다.
 */
const FROM = process.env.RESEND_FROM ?? 'mohallae <onboarding@resend.dev>'

/** 신청이 들어왔을 때 우리가 받을 주소. 없으면 우리 알림만 건너뛴다 */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL

type Mail = { to: string; subject: string; html: string; replyTo?: string }

export async function sendEmail({ to, subject, html, replyTo }: Mail): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY
  // 키가 없는 환경(로컬 첫 실행 등)에서 조용히 실패하면 왜 안 오는지 알 수 없다
  if (!key) {
    console.error('email skipped: RESEND_API_KEY is not set')
    return { ok: false, error: 'no api key' }
  }

  try {
    const { error } = await new Resend(key).emails.send({ from: FROM, to, subject, html, replyTo })
    if (error) {
      console.error('email send failed:', subject, '→', to, error)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (e) {
    // 네트워크가 끊기거나 Resend 가 죽어도 부르는 쪽은 계속 가야 한다
    console.error('email send threw:', subject, '→', to, e)
    return { ok: false, error: e instanceof Error ? e.message : 'unknown' }
  }
}

/**
 * 메일 본문의 공통 틀.
 *
 * **글꼴·색을 style 속성으로 직접 적는다** — 메일 프로그램은 `<style>` 태그와
 * CSS 변수를 대부분 무시한다. 사이트에서 쓰는 Tailwind 는 여기서 하나도 안 듣는다.
 */
export function layout(body: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a2e2a;line-height:1.7">
<div style="font-size:20px;font-weight:600;letter-spacing:-0.02em;margin-bottom:28px">mohallae</div>
${body}
<div style="margin-top:36px;padding-top:20px;border-top:1px solid #e3e8e6;font-size:13px;color:#7a8a86">
mohallae · 대한민국 서울<br>
저희는 계획을 세우고, 예약은 손님이 하십니다.
</div>
</div>`
}
