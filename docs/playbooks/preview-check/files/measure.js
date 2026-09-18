// 화면 변경(크기·자간·간격)이 말한 대로 됐는지 **숫자로** 확인한다.
// 브라우저 콘솔에 붙여넣거나 Claude 의 javascript_tool 로 실행한다.
//
//   measure('span')                       // 모든 span
//   measure('span', /^DAY \d+$/)          // 글자가 정규식과 맞는 것만
//
// 왜 필요한가: PR 설명과 실제 diff 가 어긋날 수 있다. 눈이나 설명이 아니라
// getComputedStyle 이 판정한다. (실제 사례: PR #59)
globalThis.measure = function measure(sel, textRe) {
  const els = [...document.querySelectorAll(sel)]
    .filter((e) => e.textContent.trim())
    .filter((e) => (textRe ? textRe.test(e.textContent.trim()) : true));
  return {
    viewport: innerWidth,
    items: els.map((e) => {
      const c = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return {
        t: e.textContent.trim().slice(0, 30),
        fontSize: c.fontSize,
        letterSpacing: c.letterSpacing,
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
      };
    }),
  };
};
