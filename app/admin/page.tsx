import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase-server'
import { generateJson } from '@/lib/ai'
import { buildFullPlanPrompt, fullItinerarySchema } from '@/lib/prompt'
import type { ConsultationStatus, FullItinerary, Plan } from '@/lib/types'
import { planInputFromRow } from '@/lib/plan-input'
import { sendEmail, layout } from '@/lib/email'
import { siteUrl } from '@/lib/site'

// 유료 일정 생성에 시간이 걸린다. 무료(12.7초)보다 내용이 많아 더 걸린다.
export const maxDuration = 300

// 항상 최신을 읽는다. 신청 목록은 미리 만들어두면 안 된다.
export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<ConsultationStatus, string> = {
  received: '접수',
  in_progress: '진행중',
  done: '완료',
  cancelled: '취소',
}

async function updateStatus(formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  const status = String(formData.get('status')) as ConsultationStatus

  if (!(status in STATUS_LABEL)) return

  // 결과를 반드시 받는다. 안 받으면 실패했을 때 화면이 성공과 똑같이 보여서
  // 원인을 찾는 데만 한참 걸린다 (실제로 겪었다).
  const { error } = await supabaseServer().from('consultations').update({ status }).eq('id', id)
  if (error) {
    console.error('상태 변경 실패:', id, status, error.message)
    return
  }

  revalidatePath('/admin')
}

/**
 * 유료 전체 일정을 만든다.
 *
 * **결제를 확인한 뒤 우리가 직접 누른다.** 손님이 보는 화면에는 이 버튼이 없다 —
 * 공개된 곳에 두면 아무나 눌러서 AI 요금이 그대로 나간다.
 * 토스 계약(#23)이 끝나면 이 자리를 결제 승인 신호로 바꾸면 된다.
 */
async function generateFullPlan(formData: FormData) {
  'use server'
  const planId = String(formData.get('planId'))

  const db = supabaseServer()
  const { data, error } = await db.from('plans').select('*').eq('id', planId).maybeSingle()
  if (error || !data) return

  const plan = data as Plan
  // 옛날엔 여기서 칸을 하나씩 손으로 옮겨 적었고, 폼에 칸이 늘었을 때 여기를 안 고쳐서
  // **유료 일정에만 새 답이 빠졌다.** 이제 옮기는 자리는 lib/plan-input.ts 한 곳뿐이다.

  /**
   * **AI 호출과 저장이 실패할 수 있다.** 전에는 결과를 아예 안 받아서, 실패하면
   * 화면만 에러로 떨어지고 왜 실패했는지 아무 데도 안 남았다 (Codex 리뷰, PR #76).
   */
  let full: FullItinerary
  try {
    full = await generateJson<FullItinerary>(buildFullPlanPrompt(planInputFromRow(plan)), fullItinerarySchema)
  } catch (e) {
    console.error('full plan generation failed:', planId, e)
    revalidatePath('/admin')
    return
  }

  const { error: saveError } = await db.from('plans').update({ full_itinerary: full }).eq('id', planId)
  if (saveError) {
    // 만들긴 했는데 저장이 안 됐다. 메일을 보내면 손님이 빈 화면을 본다 — 여기서 멈춘다.
    console.error('saving full plan failed:', planId, saveError)
    revalidatePath('/admin')
    return
  }

  /**
   * 손님에게 링크를 보낸다. **여기가 전에는 사람이 손으로 하던 자리다** —
   * 관리자 화면에서 링크를 복사해 메일 프로그램을 열어 붙여넣었다.
   * 메일이 실패해도 일정은 이미 저장돼 있으므로 관리자 화면의 링크로 보낼 수 있다.
   */
  const to = String(formData.get('to') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  if (to) {
    const url = `${siteUrl()}/plan/${planId}/full`
    await sendEmail({
      to,
      subject: '[모할래] 전체 일정이 준비됐습니다',
      html: layout(`<p style="margin:0 0 20px">${name ? `${name} 님, ` : ''}전체 일정이 준비됐습니다.</p>
<p style="margin:0 0 24px"><a href="${url}" style="display:inline-block;background:#1a2e2a;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none">전체 일정 보기</a></p>
<p style="margin:0 0 20px;font-size:14px;color:#7a8a86"><strong>이 링크를 보관해 주세요.</strong> 여행 내내 여기서 다시 보실 수 있습니다.</p>
<p style="margin:0;font-size:14px;color:#7a8a86">이 메일에 그대로 답장하셔도 됩니다.</p>`),
    })
  }

  revalidatePath('/admin')
}

function when(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
}

export default async function AdminPage() {
  const db = supabaseServer()

  const [consultations, inquiries] = await Promise.all([
    db
      .from('consultations')
      .select('id, created_at, name, email, messenger, message, status, plan_id')
      .order('created_at', { ascending: false }),
    db.from('inquiries').select('id, created_at, email, message').order('created_at', { ascending: false }),
  ])

  // 어떤 초안이 이미 유료 일정까지 만들어졌는지. 버튼을 두 번 눌러 요금이 두 번 나가는 걸 막는다.
  const { data: ready } = await db.from('plans').select('id').not('full_itinerary', 'is', null)
  const fullPlanReady = new Set((ready ?? []).map((p) => p.id))

  return (
    <main className="mx-auto max-w-5xl p-6 font-sans">
      <h1 className="text-2xl font-bold">관리자</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          상담 신청 <span className="text-gray-500">({consultations.data?.length ?? 0})</span>
        </h2>

        {consultations.error && <p className="mt-2 text-red-600">불러오지 못했습니다: {consultations.error.message}</p>}

        {consultations.data?.length === 0 && <p className="mt-2 text-gray-500">아직 신청이 없습니다.</p>}

        <ul className="mt-3 space-y-3">
          {consultations.data?.map((c) => (
            <li key={c.id} className="rounded border border-gray-300 p-4 dark:border-gray-700">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <strong>{c.name}</strong>
                <a href={`mailto:${c.email}`} className="text-blue-600 underline">
                  {c.email}
                </a>
                {c.messenger && <span className="text-gray-500">{c.messenger}</span>}
                <span className="ml-auto text-sm text-gray-500">{when(c.created_at)}</span>
              </div>

              {c.message && <p className="mt-2 whitespace-pre-wrap text-sm">{c.message}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {c.plan_id && (
                  <a href={`/plan/${c.plan_id}`} className="text-sm text-blue-600 underline">
                    이 손님이 본 초안
                  </a>
                )}

                {c.plan_id && (fullPlanReady.has(c.plan_id) ? (
                  <a href={`/plan/${c.plan_id}/full`} className="text-sm font-semibold text-green-700 underline dark:text-green-500">
                    전체 일정 보기 (손님에게 보낼 링크)
                  </a>
                ) : (
                  <form action={generateFullPlan}>
                    <input type="hidden" name="planId" value={c.plan_id} />
                    <input type="hidden" name="to" value={c.email} />
                    <input type="hidden" name="name" value={c.name} />
                    {/* 결제를 확인한 뒤에 누른다. 누르면 AI 요금이 나간다 */}
                    <button type="submit" className="rounded border border-gray-400 px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                      전체 일정 만들기
                    </button>
                  </form>
                ))}

                <form action={updateStatus} className="ml-auto flex items-center gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  {/*
                    key: 상태가 바뀌면 이 칸을 새로 그린다.
                      값을 리액트가 쥐고 있지 않아서(uncontrolled), 다시 그려도 브라우저가
                      잡고 있던 옛 값이 그대로 남는다. key 가 바뀌면 새 칸이 되어 새 값이 보인다.
                    autoComplete="off": 새로고침할 때 브라우저가 이전에 고른 값을 되살리는 걸 막는다.
                      이것 때문에 강력 새로고침(⌘⇧R)을 해야만 제대로 보였다.
                  */}
                  <select
                    key={c.status}
                    name="status"
                    defaultValue={c.status}
                    autoComplete="off"
                    className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-transparent"
                  >
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="rounded bg-gray-900 px-3 py-1 text-sm text-white dark:bg-gray-100 dark:text-gray-900">
                    변경
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">
          문의 <span className="text-gray-500">({inquiries.data?.length ?? 0})</span>
        </h2>

        {inquiries.data?.length === 0 && <p className="mt-2 text-gray-500">아직 문의가 없습니다.</p>}

        <ul className="mt-3 space-y-3">
          {inquiries.data?.map((q) => (
            <li key={q.id} className="rounded border border-gray-300 p-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <a href={`mailto:${q.email}`} className="text-blue-600 underline">
                  {q.email}
                </a>
                <span className="ml-auto text-sm text-gray-500">{when(q.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{q.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
