/**
 * 사이트의 바깥 주소. **메일 안의 링크에 쓴다** — 메일은 상대 경로를 못 쓴다.
 *
 * Vercel 이 배포마다 채워 주는 값을 쓰되, 도메인을 사면 `NEXT_PUBLIC_SITE_URL`
 * 하나만 넣으면 그쪽이 이긴다. 셋 다 없으면 지금 쓰는 주소로 떨어진다.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')
  // Vercel 이 본 배포에 붙여 주는 주소 (미리보기에서는 그 미리보기 주소가 온다)
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return 'https://korea-travel-consulting.vercel.app'
}
