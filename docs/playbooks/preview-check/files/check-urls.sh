#!/usr/bin/env bash
# 배포된 주소가 실제로 도는지 확인한다.
#
#   bash docs/playbooks/preview-check/files/check-urls.sh                 # 본 배포
#   bash docs/playbooks/preview-check/files/check-urls.sh <미리보기 주소>  # PR 미리보기
#
# 랜딩만 보면 안 되는 이유: DB 가 잠들어도 `/` 는 200 이다. 돈이 되는 화면만 404 가 된다.
set -uo pipefail

BASE="${1:-https://korea-travel-consulting.vercel.app}"
BASE="${BASE%/}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"

# 랜딩에 걸린 샘플 초안 아이디를 소스에서 뽑는다 (하드코딩하면 낡는다)
IDS=$(grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' "$ROOT/app/page.tsx" 2>/dev/null | sort -u)

fail=0
check() { # <경로> <기대코드> <설명>
  local path="$1" want="$2" label="$3" got loc
  got=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$BASE$path")
  if [ "$got" = "$want" ]; then
    printf '  통과   %-3s  %-44s %s\n' "$got" "$path" "$label"
  else
    fail=$((fail+1))
    printf '  실패   %-3s  %-44s %s  (기대 %s)\n' "$got" "$path" "$label" "$want"
    if [ "$got" = "302" ]; then
      loc=$(curl -s -o /dev/null -D - --max-time 20 "$BASE$path" | tr -d '\r' | awk 'tolower($1)=="location:"{print $2}')
      case "$loc" in
        *sso-api*) echo "         → Vercel Authentication 이 켜져 있다. Settings → Deployment Protection" ;;
        *)         echo "         → $loc" ;;
      esac
    fi
  fi
}

echo "대상: $BASE"
echo
echo "[DB 없이 도는 화면]"
check /         200 "랜딩"
check /plan     200 "입력 폼"
check /faq      200 "FAQ"
check /contact  200 "문의"
check /privacy  200 "개인정보"
echo
echo "[비번이 걸려야 하는 화면]"
check /admin    401 "관리자 (401 이 정상)"
echo
echo "[DB 를 읽는 화면 — 여기가 진짜 시험이다]"
if [ -z "$IDS" ]; then
  echo "  미확인      app/page.tsx 에서 샘플 초안 아이디를 못 찾았다"
else
  while read -r id; do
    [ -n "$id" ] && check "/plan/$id" 200 "샘플 초안 ${id:0:8}"
  done <<< "$IDS"
fi

echo
if [ "$fail" -eq 0 ]; then
  echo "전부 통과."
else
  echo "실패 $fail 건."
  echo "  · DB 화면만 404  → Supabase 가 잠들었다 (이슈 #71). 대시보드에서 Resume"
  echo "  · 302 로 sso-api → 미리보기 보호가 켜져 있다 (이슈 #68)"
  echo "  · 전부 404·500   → 환경변수나 빌드 문제. Vercel 배포 로그를 본다"
fi
exit "$fail"
