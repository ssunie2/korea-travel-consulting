# 계획 003: 문의 폼에 보내는 횟수 제한을 건다

> **실행자 안내**: 단계대로 따르고, 각 단계의 확인 명령을 실제로 돌려 기대 결과를 본 뒤
> 다음으로 넘어가라. "멈춰야 할 때" 에 걸리면 임의로 판단하지 말고 멈추고 보고하라.
> 끝나면 `plans/README.md` 의 003 상태 칸을 고쳐라.
>
> **어긋남 확인 (제일 먼저)**: `git diff --stat a99c979..HEAD -- app/contact/page.tsx app/api/plan/route.ts`
> 결과가 비어 있지 않으면 아래 "지금 상태" 의 코드와 실제 코드를 대조하고, 다르면 멈춘다.

## 상태

- **우선순위**: P2
- **품**: 작음(S)
- **위험**: 낮음
- **선행**: 없음
- **분류**: security
- **작성 시점**: 커밋 `a99c979`, 2026-08-18

## 왜 중요한가

손님이 글을 써서 **우리 데이터베이스에 저장하는 통로가 세 개**다.

| 통로 | 횟수 제한 |
|---|---|
| `/api/plan` (초안 만들기) | **있음** — 한 IP 당 시간당 5회 |
| `/plan/[id]/consult` (전체 일정 신청) | 없음 |
| `/contact` (문의) | **없음** |

`/contact` 가 제일 무르다. **초안 주소 같은 것도 필요 없이 누구나 바로 보낼 수 있다.**
저장소가 공개라 주소도 알려져 있다. 자동 프로그램 하나면 `inquiries` 테이블을 무한정 채울 수 있고,
Supabase 무료 등급에는 용량 한도가 있다. 한도가 차면 **초안 저장과 상담 신청까지 같이 멈춘다** — 돈 받는 흐름이 죽는 것이다.

`/plan/[id]/consult` 는 유효한 초안 아이디를 먼저 알아야 해서 훨씬 어렵다. **이번 계획은 `/contact` 만 다룬다.**

## 지금 상태

- `app/contact/page.tsx` — 문의 화면. 안에 서버 액션 `submit` 이 있다 (24~42줄). **제한이 없다**
- `app/api/plan/route.ts` — **따라 할 본보기.** 여기 이미 제한이 구현돼 있다

`app/contact/page.tsx:24-42` 현재 모습:

```tsx
async function submit(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const message = String(formData.get("message") ?? "").trim().slice(0, 2000);

  // 화면에서만 막으면 서버를 직접 부르는 방법으로 뚫린다
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
    redirect("/contact?error=1");
  }

  const { error } = await supabaseServer().from("inquiries").insert({ email, message });

  if (error) {
    console.error("saving inquiry failed:", error);
    redirect("/contact?error=2");
  }

  redirect("/contact?sent=1");
}
```

`app/api/plan/route.ts:15-27` — **이 방식을 그대로 가져다 쓴다.** 새 라이브러리를 깔지 않는다:

```ts
// ponytail: 요금 폭탄 방어용 최소 장치. 서버 한 대 안에서만 세므로 서버가 여러 대로 늘면 그만큼 헐거워진다.
// 제대로 하려면 DB나 별도 저장소로 옮긴다 (이슈 C3)
const RECENT = new Map<string, number[]>()
const LIMIT = 5
const WINDOW_MS = 60 * 60 * 1000

function tooManyRequests(ip: string): boolean {
  const now = Date.now()
  const hits = (RECENT.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  RECENT.set(ip, hits)
  return hits.length > LIMIT
}
```

`app/api/plan/route.ts:39-40` — **접속자 구분하는 방법. 이 두 줄을 그대로 쓴다.** 이유가 주석에 있다:

```ts
const forwarded = req.headers.get('x-forwarded-for')?.split(',').map((s) => s.trim()).filter(Boolean) ?? []
const ip = req.headers.get('x-real-ip')?.trim() || forwarded.at(-1) || 'unknown'
```

⚠️ **서버 액션에는 `req` 객체가 없다.** Next.js 의 `headers()` 를 써야 한다 (`next/headers` 에서 가져온다).
`await headers()` 로 받은 뒤 같은 방식으로 `x-real-ip` → `x-forwarded-for` 마지막 값 순서로 본다.

### 이 저장소의 규칙

- 서버 액션은 실패를 `redirect("/contact?error=N")` 로 알린다. 화면이 그 숫자를 보고 문구를 고른다
- 화면 쪽 오류 문구는 `app/contact/page.tsx` 안에 `error === "1"` / 그 외로 갈린다. **새 번호를 쓰면 그 분기도 같이 늘려야 한다**
- 화면 글자는 `t({ ko, en })` 로 **한국어와 영어를 나란히** 적는다. `lib/copy.ts` 참고. 한쪽만 적으면 안 된다
- 주석은 한국어로 **왜** 를 적는다
- 새 라이브러리를 깔지 않는다 (`AGENTS.md` 6장)

## 필요한 명령

| 목적 | 명령 | 성공했을 때 |
|---|---|---|
| 빌드 | `npm run build` | `✓ Compiled successfully` |
| 타입 검사 | `npx tsc --noEmit` | 출력 없음 |
| 문법 검사 | `npx eslint app/` | 출력 없음 |
| 화면 띄우기 | `npm run dev` | `localhost:3000/contact` 가 열림 |

## 범위

**고쳐도 되는 파일**:
- `app/contact/page.tsx`

**건드리면 안 되는 것**:
- `app/api/plan/route.ts` — 본보기로 **읽기만** 한다. 공용으로 빼겠다고 옮기지 말 것.
  두 곳이 조금 다르고(`req` 유무), 지금 단계에서 공용화는 이득보다 위험이 크다
- `app/plan/[id]/consult/page.tsx` — 이번 범위가 아니다. 초안 아이디가 필요해 훨씬 어렵다
- `supabase/migrations/` — DB 는 안 건드린다
- 제한 숫자를 임의로 정하지 말 것. **시간당 5회**로, `/api/plan` 과 같게 맞춘다

## 작업 흐름

- 브랜치: `fix/003-rate-limit-contact`
- 커밋 메시지 한국어 한 줄. 예: `문의 폼에 시간당 5회 제한 추가`
- 푸시나 PR 은 하지 않는다

## 단계

### 1단계: 제한 장치를 문의 화면에 넣는다

`app/contact/page.tsx` 위쪽에 `RECENT` / `LIMIT` / `WINDOW_MS` / `tooManyRequests` 를 만든다.
`app/api/plan/route.ts:15-27` 의 모양을 그대로 따르고, **왜 이렇게 허술한지 적은 주석도 같이 옮긴다**
(서버가 여러 대로 늘면 헐거워진다는 사실은 여기서도 그대로 참이다).

**확인**: `npx tsc --noEmit` → 출력 없음

### 2단계: 접속자를 구분해서 제한을 건다

`submit` 안, **이메일 검사 뒤 · DB 저장 앞**에 넣는다. 순서가 중요하다 — 형식이 틀린 요청까지 횟수로 세면
손님이 오타 한 번에 막힌다.

`next/headers` 의 `headers()` 로 헤더를 받아 `x-real-ip` → `x-forwarded-for` 의 **마지막** 값 순으로 본다.
제한에 걸리면 `redirect("/contact?error=3")`.

**확인**: `npx tsc --noEmit` → 출력 없음

### 3단계: 손님에게 보일 문구를 만든다

`app/contact/page.tsx` 의 오류 문구 분기에 `error === "3"` 을 더한다. **`t({ ko, en })` 형식으로 둘 다 적는다.**

- 한국어 예: `문의를 너무 자주 보내셨습니다. 한 시간 뒤에 다시 시도해 주세요.`
- 영어 예: `Too many messages. Please try again in an hour.`

**확인**: `npm run build` → `✓ Compiled successfully`

### 4단계: 실제로 막히는지 눈으로 본다

`npm run dev` 로 띄우고 `localhost:3000/contact` 에서 **여섯 번 보낸다.**

- 1~5회: `?sent=1` 로 넘어간다
- 6회: `?error=3` 으로 넘어가고 3단계에서 만든 문구가 보인다

**확인**: 6회째에 문구가 뜬다. 안 뜨면 2단계의 넣은 위치를 다시 본다

> 확인이 끝나면 개발 중에 들어간 문의 줄을 Supabase 대시보드에서 지운다.
> **서버에는 삭제 권한이 없어서 코드로는 못 지운다** (`supabase/migrations/20260810120000_grants.sql` — 일부러 그렇게 했다).

## 테스트 계획

**자동 테스트는 쓰지 않는다.** 이 저장소의 테스트(`node --test lib/*.test.ts`)는 `lib/` 의 순수 함수만 돌린다.
서버 액션은 Next.js 실행 환경이 필요해서 지금 구조로는 못 돌린다. 도구를 새로 깔지 않는다는 규칙(`AGENTS.md` 6장)에 따라
**4단계의 손으로 하는 확인이 이번 검증이다.**

`tooManyRequests` 를 나중에 `lib/` 로 빼면 그때 테스트를 붙일 수 있다. 이번엔 하지 않는다.

## 끝났다고 볼 수 있는 조건

- [ ] `npx tsc --noEmit` 출력 없음
- [ ] `npx eslint app/` 출력 없음
- [ ] `npm run build` 성공
- [ ] 4단계 손 확인에서 6회째가 막힘
- [ ] `grep -c "t({" app/contact/page.tsx` 가 이전보다 1 이상 늘어남 (새 문구가 두 언어로 들어갔다는 뜻)
- [ ] `git status --short` 에 `app/contact/page.tsx` 외의 변경이 없음
- [ ] `plans/README.md` 의 003 상태 칸을 고침

## 멈춰야 할 때

- "지금 상태" 의 코드가 실제 파일과 다르다
- `next/headers` 의 `headers()` 가 이 Next.js 버전에서 다르게 동작한다 →
  **추측하지 말고** `node_modules/next/dist/docs/` 를 읽고, 그래도 안 맞으면 멈추고 보고
- 4단계에서 6회를 보내도 안 막힌다 → 개발 서버가 매 요청마다 다시 뜨면서 `RECENT` 가 초기화되는 것일 수 있다.
  두 번 확인해도 같으면 멈추고 보고
- 범위 밖 파일을 고쳐야만 될 것 같다

## 이후 관리 메모

- **이 제한은 서버 한 대 안에서만 센다.** Vercel 이 서버를 여러 개 띄우면 각각 5회씩 허용된다.
  제대로 하려면 DB 로 옮겨야 하고, 그건 `/api/plan` 도 같이 바꿔야 하는 별도 건이다
- `/plan/[id]/consult` 는 여전히 제한이 없다. 초안 아이디가 필요해 난이도가 높지만 **남아 있는 구멍이다**
- 리뷰할 때 볼 것: 제한 확인이 이메일 형식 검사 **뒤에** 있는지. 앞에 있으면 오타 한 번도 횟수로 세어 손님이 억울하게 막힌다
