import type { MetadataRoute } from "next";

/**
 * 출시 전까지 검색엔진을 막는다.
 *
 * 저장소가 공개라 AGENTS.md 에 적힌 사이트 주소를 누구나 볼 수 있다.
 * 가격도 연락처도 아직 자리만 잡힌 상태라, 이 상태로 검색에 걸리면 곤란하다.
 * 한 번 색인되면 우리가 지워도 캐시가 남는다.
 *
 * 손님을 받을 때 이 파일을 지우면 원래대로 돌아온다.
 * (링크를 아는 사람은 지금도 볼 수 있다. 이건 "우연히 발견되는 것"만 막는다)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
