import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'
import { generateJson } from '@/lib/ai'
import { buildFullPlanPrompt, fullItinerarySchema } from '@/lib/prompt'
import { checkFullPlan } from '@/lib/check-full-plan'
import type { ConsultationStatus, FullItinerary, Plan } from '@/lib/types'

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
 *
 * 손님이 본 **무료 초안을 같이 넘겨서**, 유료 일정이 그 초안의 자세한 버전이 되게 한다 (써니 요청 2026-10-11).
 * 만든 뒤 약속(날 수, 모든 정거장의 팁, 초안의 장소)을 지켰는지 확인하고, 못 지켰으면 **저장하지 않는다** —
 * 저장하는 순간 아래에 '손님에게 보낼 링크'가 생기기 때문이다. 한 번 더 만들어 보고, 그래도 안 되면 이유를 화면에 띄운다.
 */
async function generateFullPlan(formData: FormData) {
  'use server'
  const planId = String(formData.get('planId'))

  const db = supabaseServer()
  const { data, error } = await db.from('plans').select('*').eq('id', planId).maybeSingle()
  if (error || !data) return

  const plan = data as Plan
  const draft = plan.itinerary // 만들다 실패한 초안이면 null — 그때는 예전처럼 폼 값만으로 만든다
  const dayCount = plan.duration_days
  const prompt = buildFullPlanPrompt(
    {
      destinations: plan.destinations,
      startDate: plan.start_date,
      durationDays: plan.duration_days,
      travelers: plan.travelers,
      budgetRange: plan.budget_range ?? undefined,
      budgetPerPerson: plan.budget_per_person ?? undefined,
      budgetCurrency: plan.budget_currency,
      styles: plan.styles,
      audience: plan.audience ?? undefined,
      pace: plan.pace ?? undefined,
      visitedBefore: plan.visited_before ?? undefined,
      transport: plan.transport ?? undefined,
      stayArea: plan.stay_area ?? undefined,
      dayRhythm: plan.day_rhythm ?? undefined,
      occasion: plan.occasion ?? undefined,
      avoid: plan.avoid ?? undefined,
      dietary: plan.dietary ?? undefined,
      language: plan.language,
    },
    draft
  )

  let problems: string[] = []
  for (let attempt = 1; attempt <= 2; attempt++) {
    const full = await generateJson<FullItinerary>(prompt, fullItinerarySchema(dayCount))
    problems = checkFullPlan(full, dayCount, draft)
    if (problems.length === 0) {
      const { error: saveError } = await db.from('plans').update({ full_itinerary: full }).eq('id', planId)
      if (saveError) console.error('유료 일정 저장 실패:', planId, saveError.message)
      revalidatePath('/admin')
      return
    }
    console.warn(`유료 일정 검사에 걸림 (${attempt}번째):`, planId, problems)
  }

  // 두 번 다 걸렸다. 저장하지 않았으니 버튼이 그대로 있다 — 이유를 그 신청 옆에 보여 준다
  redirect(`/admin?failed=${planId}&why=${encodeURIComponent(problems.slice(0, 3).join(' · '))}`)
}

function when(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const db = supabaseServer()

  // 전체 일정을 만들다 검사에 걸린 신청 (generateFullPlan 이 주소에 실어 보낸다)
  const query = await searchParams
  const failedPlan = typeof query.failed === 'string' ? query.failed : null
  const failedWhy = typeof query.why === 'string' ? query.why : ''

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

              {c.plan_id && c.plan_id === failedPlan && !fullPlanReady.has(c.plan_id) && (
                <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                  전체 일정을 두 번 만들었지만 검사에 걸려 저장하지 않았습니다 — 손님에게 보낼 링크도 만들지 않았습니다.
                  <br />
                  이유: {failedWhy}. 버튼을 다시 눌러 보세요.
                </p>
              )}
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
