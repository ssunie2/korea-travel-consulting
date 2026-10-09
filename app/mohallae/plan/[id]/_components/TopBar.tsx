import Link from "next/link";
import styles from "../plan.module.css";
import { draftCopy } from "../copy";
import type { Lang } from "../../../content";

/**
 * 위 막대 (시안 ③). 왼쪽 글자 로고, 오른쪽 EN | 한국어 와 '무료 초안' 표시. 다른 메뉴는 없다.
 * 로고는 새 첫 화면(/mohallae)으로, 언어 단추는 **지금 이 초안 주소**에서 ?lang= 만 바꾼다.
 */
export default function TopBar({ lang, planId }: { lang: Lang; planId: string }) {
  const here = `/mohallae/plan/${planId}`;
  const item = (code: Lang, label: string) => (
    <Link
      href={`${here}?lang=${code}`}
      hrefLang={code}
      lang={code}
      aria-current={lang === code ? "true" : undefined}
      className={styles.langLink}
    >
      {label}
    </Link>
  );

  return (
    <header className={styles.topbar}>
      <div className={`${styles.wrap} ${styles.topbarInner}`}>
        <Link
          href={`/mohallae${lang === "en" ? "?lang=en" : ""}`}
          className={styles.wordmark}
          aria-label={draftCopy.home[lang]}
        >
          mohallae
        </Link>
        <div className={styles.topbarRight}>
          <span className={styles.lang} role="group" aria-label={draftCopy.langLabel[lang]}>
            {item("en", "EN")}
            <span aria-hidden="true" className={styles.langBar} />
            {item("ko", "한국어")}
          </span>
          <p className={styles.freeDraft}>{draftCopy.freeDraft[lang]}</p>
        </div>
      </div>
    </header>
  );
}
