# korea-travel-consulting

해외 여행객이 한국에 오기 전에 컨설팅을 받는 웹사이트.

- 스택: Next.js 16 + TypeScript + Tailwind CSS + Supabase
- **팀 규칙은 [AGENTS.md](AGENTS.md)** — Claude·Codex 둘 다 이 파일을 읽는다. 작업 전에 한 번 읽고 시작할 것

## 처음 세팅

```bash
npm install
cp .env.example .env.local
```

`.env.local`을 열어 값을 채운다.

| 항목 | 어디서 가져오나 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 대시보드 > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 같은 화면 |
| `GEMINI_API_KEY` | Google AI Studio (아직 없으면 비워둬도 실행은 됨) |

```bash
npm run dev
```

http://localhost:3000 이 열리면 성공.

## 자주 쓰는 명령

```bash
npm run dev     # 개발 서버 실행
npm run build   # 배포용 빌드 — 올리기 전에 에러 없는지 확인용
npm run lint    # 문법·스타일 검사
```

## 작업 흐름

```bash
git checkout main && git pull        # 최신 받기
git checkout -b feat/기능이름         # 새 브랜치
git add . && git commit -m "무엇을 했는지"
git push -u origin feat/기능이름      # 올린 뒤 PR 생성
```

main에는 직접 푸시하지 않는다. 자세한 건 [AGENTS.md](AGENTS.md).

## 폴더

```
app/                  화면 (폴더 이름 = 주소)
app/api/              서버에서만 도는 코드 (AI 키 등 비밀은 여기서만)
lib/                  공용 코드 (supabase 연결 등)
components/           공용 화면 조각
supabase/migrations/  DB 구조 변경 기록
```
