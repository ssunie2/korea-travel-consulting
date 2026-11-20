/**
 * 취소·환불 규정 글의 모양 (써니 2026-11-20 "내가 수정할 수 있게").
 * 글은 text-ko.ts · text-en.ts 에 있고, 화면(page.tsx)은 그 글을 읽어서 그리기만 한다.
 * 그래서 글을 고칠 때 화면 코드를 건드릴 일이 없다.
 */

/** 본문 한 덩어리: 글자 = 문단, 글자 목록 = 점 목록, { note } = 회색 상자 */
export type Block = string | string[] | { note: string };

export type RefundText = {
  /** 맨 위 '최종 수정' 날짜 */
  updated: string;
  title: string;
  /** 검색·공유 미리보기에 나가는 한 줄 */
  description: string;
  /** 제목 아래 한 줄 요약 */
  intro: string;
  /** id 는 주소 # 자리 이름이라 한국어 · 영어가 같아야 한다 */
  sections: { id: string; title: string; body: Block[] }[];
};
