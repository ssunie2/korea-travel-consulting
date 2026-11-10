import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 첫 화면을 새 디자인(/mohallae)으로 (써니 2026-11-10 "사이트에 디자인을 적용").
  // 옛 첫 화면(app/page.tsx)은 지우지 않고 남겨 둔다 — 되돌릴 때는 이 redirects 만 지우면 된다.
  // permanent: false (307) — 브라우저·검색엔진이 영구로 기억하지 않게. ?lang=en 같은 값은 그대로 따라간다.
  async redirects() {
    return [{ source: "/", destination: "/mohallae", permanent: false }];
  },
};

export default nextConfig;
