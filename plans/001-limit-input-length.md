# 계획 001: 손님이 보내는 글자 수에 상한을 둔다

> **실행자 안내**: 이 계획을 단계대로 따르세요. 각 단계의 확인 명령을 실제로 돌리고
> 기대한 결과가 나오는지 본 뒤에 다음으로 넘어가세요. "멈춰야 할 때" 항목에 해당하면
> 임의로 판단하지 말고 멈추고 보고하세요. 끝나면 `plans/README.md` 의 상태 칸을 고치세요.
>
> **어긋남 확인 (제일 먼저)**: `git diff --stat a99c979..HEAD -- lib/validate.ts lib/validate.test.ts`
> 결과가 비어 있지 않으면 아래 "지금 상태" 의 코드와 실제 코드를 비교하고,
> 다르면 멈춰야 할 때로 취급하세요.

## 상태

- **우선순위**: P1
- **품**: 작음(S)
- **위험**: 낮음
- **선행**: 없음
- **분류**: security
- **작성 시점**: 커밋 `a99c979`, 2026-08-18

## 왜 중요한가

`/api/plan` 은 손님이 보낸 값을 그대로 Gemini 프롬프트에 끼워 넣는다. 그런데 **문자열 길이 상한이 없다.**
`destinations` 와 `styles` 는 배열 개수만 제한하고(각각 10개·6개) 각 원소의 길이는 무제한이다.

실제로 확인했다 — 20만 자짜리 도시 이름이 검사를 그대로 통과한다.

지금 Gemini 가 **무료 등급**이라 당장 요금이 나가지는 않지만, 무료 한도가 날아가면 **손님 전원의 초안 생성이 멈춘다.**
그리고 출시 전에 유료 등급으로 올리기로 되어 있으므로, **그 전에 이 구멍을 막지 않으면 그날부터 진짜 요금이 된다.**
저장소가 공개라 이 API 의 주소와 형식은 이미 누구나 알 수 있다.

## 지금 상태

- `lib/validate.ts` — 손님이 보낸 값을 검사하는 유일한 관문. 이 파일만 고치면 된다
- `lib/validate.test.ts` — 위 파일의 테스트. 현재 11개, 전부 통과
- `lib/prompt.ts` — 검사를 통과한 값이 여기서 프롬프트 문자열에 들어간다 (이번엔 **안 고친다**)

`lib/validate.ts:12-16` — 목적지. `.slice(0, 10)` 은 **배열 길이**에만 걸린다:

```ts
  // 목적지가 없으면 AI가 일정을 만들 수 없다
  const destinations = Array.isArray(d.destinations)
    ? d.destinations.filter((s): s is string => typeof s === 'string' && s.trim() !== '').slice(0, 10)
    : []
  if (destinations.length === 0) return { ok: false, error: 'pick at least one destination' }
```

`lib/validate.ts:50-51` — 스타일. 마찬가지로 개수만 본다:

```ts
  const styles = Array.isArray(d.styles) ? d.styles.filter((s): s is string => typeof s === 'string') : []
  if (styles.length > 6) return { ok: false, error: 'too many styles' }
```

`lib/validate.ts:53` — **이 저장소에 이미 있는 자르기 도구.** 새로 만들지 말고 이걸 쓴다:

```ts
  const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined)
```

### 이 저장소의 규칙

- 검사 실패는 예외를 던지지 않고 `{ ok: false, error: '...' }` 를 돌려준다. 이 형태를 그대로 따른다
- `error` 문자열은 **영어**다 (`'durationDays must be 1-30'` 등). 개발자용이고 손님에게는 안 보인다. 영어로 맞춘다
- 주석은 한국어로, **왜** 그렇게 했는지를 적는다. `lib/validate.ts:24-27` 이 좋은 예다
- 테스트는 `node:test` 만 쓴다. 별도 도구를 깔지 않는다

## 필요한 명령

| 목적 | 명령 | 성공했을 때 |
|---|---|---|
| 테스트 | `npm test` | `pass` 개수가 늘고 `fail 0` |
| 타입 검사 | `npx tsc --noEmit` | 아무것도 출력 안 됨 |
| 문법 검사 | `npx eslint lib/` | 아무것도 출력 안 됨 |
| 빌드 | `npm run build` | `✓ Compiled successfully` |

## 범위

**고쳐도 되는 파일** (이것 외에는 건드리지 않는다):
- `lib/validate.ts`
- `lib/validate.test.ts`

**건드리면 안 되는 것**:
- `lib/prompt.ts` — 프롬프트 문구를 바꾸면 AI 결과물의 품질이 달라진다. 이번 계획의 목적이 아니다
- `app/api/plan/route.ts` — 시간당 5회 제한은 그대로 둔다. 이번엔 **길이**만 다룬다
- `app/plan/page.tsx` — 화면 쪽 입력칸은 안 건드린다. 서버에서 막는 게 요점이다
- 상한 값을 "더 안전하게" 임의로 더 줄이지 말 것. 아래 표의 숫자를 그대로 쓴다

## 작업 흐름

- 브랜치: `fix/001-limit-input-length`
- 커밋 메시지는 한국어 한 줄. 예: `손님 입력 문자열에 길이 상한 추가`
- **푸시나 PR 은 하지 않는다.** 시키지 않았으면 만들지 않는다

## 단계

### 1단계: 목적지 각 항목의 길이를 자른다

`lib/validate.ts:12-16` 을 고친다. 이미 있는 `text()` 는 이 위치보다 아래(53줄)에 정의돼 있으므로,
**`text()` 정의를 `destinations` 검사보다 위로 올린 뒤** 쓰거나, 여기서는 `.slice(0, 60)` 을 직접 쓴다.
둘 중 무엇이든 되지만, 올릴 경우 기존 사용처(69-71줄)가 그대로 도는지 확인한다.

목표 모양:

```ts
  // 도시 이름은 길어야 스무 글자 남짓이다. 그보다 길면 프롬프트를 부풀리려는 값이다.
  const destinations = Array.isArray(d.destinations)
    ? d.destinations
        .filter((s): s is string => typeof s === 'string' && s.trim() !== '')
        .map((s) => s.trim().slice(0, 60))
        .slice(0, 10)
    : []
```

**확인**: `npx tsc --noEmit` → 출력 없음

### 2단계: 스타일 각 항목의 길이를 자른다

`lib/validate.ts:50-51` 을 같은 방식으로 고친다. 상한은 **40자**.

```ts
  const styles = Array.isArray(d.styles)
    ? d.styles.filter((s): s is string => typeof s === 'string').map((s) => s.trim().slice(0, 40))
    : []
  if (styles.length > 6) return { ok: false, error: 'too many styles' }
```

**확인**: `npx tsc --noEmit` → 출력 없음

### 3단계: 상한을 넘긴 값에 대한 테스트를 쓴다

`lib/validate.test.ts` 에 아래 세 가지를 추가한다. 기존 테스트의 모양을 그대로 따른다
(파일을 먼저 읽고 `test(...)` 하나가 어떻게 생겼는지 확인할 것).

1. 아주 긴 목적지(예: `'A'.repeat(5000)`) 를 보내면 → `ok: true` 이고 `value.destinations[0].length === 60`
2. 아주 긴 스타일(예: `'B'.repeat(5000)`) 을 보내면 → `ok: true` 이고 `value.styles[0].length === 40`
3. 정상 길이 목적지(`'Seoul'`) 는 → 잘리지 않고 `'Seoul'` 그대로

**확인**: `npm test` → `fail 0`, `pass` 가 11에서 14로 늘어남

### 4단계: 전체가 도는지 본다

**확인**: `npm run build` → `✓ Compiled successfully`

## 테스트 계획

- 새 테스트 3개를 `lib/validate.test.ts` 에 추가한다
- 기존 테스트의 구조를 그대로 따른다 — 새 도구를 깔거나 파일을 새로 만들지 않는다
- 확인: `npm test` → 14개 통과, 실패 0

## 끝났다고 볼 수 있는 조건

전부 만족해야 한다:

- [ ] `npx tsc --noEmit` 출력 없음
- [ ] `npx eslint lib/` 출력 없음
- [ ] `npm test` 통과, 새 테스트 3개 포함해 14개
- [ ] `npm run build` 성공
- [ ] `git status` 에 `lib/validate.ts` 와 `lib/validate.test.ts` 외의 변경이 없음
- [ ] `plans/README.md` 의 001 상태 칸을 고침

## 멈춰야 할 때

아래 상황이면 임의로 진행하지 말고 멈추고 보고한다:

- "지금 상태" 에 적힌 코드가 실제 파일과 다르다 (그새 누가 고쳤다는 뜻)
- 확인 명령이 두 번 고쳐도 계속 실패한다
- 범위 밖 파일을 고쳐야만 될 것 같다
- 기존 테스트 11개 중 하나라도 깨진다 — **자르기 때문에 깨졌다면 상한이 너무 낮은 것이다. 멈추고 보고할 것**

## 이후 관리 메모

- **이 계획은 길이만 막는다.** AI 에게 "앞의 지시를 무시하라" 고 써 보내는 문제(프롬프트 주입)는 그대로 남는다. 별도 건이다
- 시간당 5회 제한은 서버 한 대 안에서만 센다. 서버가 늘면 헐거워진다 — `app/api/plan/route.ts:15-16` 주석 참고
- **Gemini 를 유료 등급으로 올리기 전에 이 계획이 먼저 들어가 있어야 한다.** 순서가 바뀌면 그 사이에 요금이 샌다
- 리뷰할 때 볼 것: 상한 숫자가 실제 도시 이름·스타일 이름보다 넉넉한지 (`app/plan/page.tsx` 의 `DESTINATIONS`, `STYLES` 목록과 대조)
