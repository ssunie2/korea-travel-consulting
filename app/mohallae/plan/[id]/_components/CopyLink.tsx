"use client";

import { useState } from "react";
import styles from "../plan.module.css";
import { draftCopy } from "../copy";
import type { Lang } from "../../../content";

/**
 * 지금 보고 있는 주소를 복사한다. 예전 결과 화면의 CopyLinkButton 과 하는 일이 같다.
 *
 * **이 링크가 회원가입을 대신한다** (이슈 #10). 손님이 링크를 잃어버리면 자기 초안을 다시 찾을 길이 없다.
 * 그래서 "이 링크를 보관하세요" 안내는 **늘 보인다** (써니 결정 2026-10-09 — 시안에는 없던 줄).
 * 주소는 `window.location.href` 를 그대로 읽는다 — 배포 주소와 미리보기 주소가 달라도 지금 열린 주소가 복사된다.
 *
 * 버튼 줄(flex, 줄바꿈 허용) 안에 들어가고, 안내 줄은 폭을 다 차지해 버튼 아래 줄로 내려간다.
 * 공용 컴포넌트(components/CopyLinkButton)는 사이트 전체 언어만 따르고 예전 모양이라 새 화면용으로 따로 둔다.
 */
export default function CopyLink({ lang }: { lang: Lang }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("done");
      // 되돌려 두지 않으면 두 번째로 눌렀을 때 됐는지 알 수 없다
      setTimeout(() => setState("idle"), 2000);
    } catch {
      // clipboard 는 https 나 localhost 에서만 된다. 그 밖에서는 주소창을 쓰라고 안내한다.
      setState("failed");
    }
  }

  return (
    <>
      <button type="button" onClick={copy} className={styles.copy}>
        {state === "done" ? draftCopy.copied[lang] : draftCopy.copyLink[lang]}
      </button>
      {/* 실패하면 안내 줄이 실패 안내로 바뀌고, 화면 낭독기도 읽는다 */}
      <p aria-live="polite" className={styles.keepLink}>
        {state === "failed" ? draftCopy.copyFailed[lang] : draftCopy.keepLink[lang]}
      </p>
      {/* 버튼 글자만 바뀌면 화면을 못 보는 손님은 복사됐는지 알 수 없다 */}
      <span aria-live="polite" className="sr-only">
        {state === "done" ? draftCopy.copied[lang] : ""}
      </span>
    </>
  );
}
