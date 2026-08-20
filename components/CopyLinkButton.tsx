"use client";

import { useState } from "react";
import { t } from "@/lib/copy";

/**
 * 지금 보고 있는 주소를 복사한다.
 *
 * **이 링크가 회원가입을 대신한다.** 1차에서 로그인을 뺀 이유가 그거라(이슈 #10),
 * 손님이 링크를 잃어버리면 자기 초안을 다시 찾을 길이 없다.
 * 주소창을 직접 긁게 두면 폰에서 특히 번거로워서 버튼을 준다.
 *
 * 주소를 서버에서 넘겨받지 않고 `window.location.href` 를 그대로 읽는다.
 * 배포 주소와 미리보기 주소가 서로 다른데, 이러면 지금 열려 있는 주소가 무엇이든 그대로 복사된다.
 */
export default function CopyLinkButton() {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("done");
      // 되돌려두지 않으면 "복사됨"이 계속 남아, 두 번째로 눌렀을 때 됐는지 알 수 없다
      setTimeout(() => setState("idle"), 2000);
    } catch {
      // ponytail: clipboard 는 https 나 localhost 에서만 동작한다.
      // 그 밖(사내망 http 등)에서는 주소창을 쓰라고 안내만 하고 끝낸다.
      setState("failed");
    }
  }

  return (
    <div className="mt-5">
      {/* min-h-11: 손가락으로 누를 수 있는 최소 크기(44px)를 보장한다 */}
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 items-center rounded-full border border-[var(--c-line)] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.15em] text-[var(--c-text)] transition-colors hover:border-[var(--c-deep)] hover:bg-[var(--c-text)] hover:text-[var(--c-bg)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--c-focus)]"
      >
        {state === "done"
          ? t({ ko: "복사했습니다", en: "Copied" })
          : t({ ko: "링크 복사", en: "Copy link" })}
      </button>

      {/* aria-live: 버튼 글자만 바뀌면 화면을 못 보는 손님은 복사됐는지 알 수 없다 */}
      <p aria-live="polite" className="mt-3 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[var(--c-text-3)]">
        {state === "failed"
          ? t({
              ko: "복사하지 못했습니다 — 주소창의 주소를 그대로 저장해 두세요.",
              en: "Couldn’t copy — please save the address in your browser bar.",
            })
          : t({
              ko: "이 링크를 보관하세요 — 초안은 여기 그대로 있습니다",
              en: "Keep this link — your draft stays here",
            })}
      </p>
    </div>
  );
}
