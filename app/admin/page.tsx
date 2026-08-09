import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase-server'
import type { ConsultationStatus } from '@/lib/types'

// 항상 최신을 읽는다. 신청 목록은 미리 만들어두면 안 된다.
export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<ConsultationStatus, string> = {
  received: '접수',
  in_progress: '진행중',
  done: '완료',
}

async function updateStatus(formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  const status = String(formData.get('status')) as ConsultationStatus

  if (!(status in STATUS_LABEL)) return

  await supabaseServer().from('consultations').update({ status }).eq('id', id)
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

                <form action={updateStatus} className="ml-auto flex items-center gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  <select
                    name="status"
                    defaultValue={c.status}
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
