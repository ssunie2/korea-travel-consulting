import Link from "next/link";
import type { FreeItinerary } from "@/lib/types";
import base from "../../../mohallae.module.css";
import styles from "../plan.module.css";
import { draftCopy } from "../copy";
import type { Lang } from "../../../content";
import CopyLink from "./CopyLink";

/**
 * 닫는 띠 (시안 ③ 맨 아래). 왼쪽은 숙소·식당·예산, 오른쪽은 "팁 하나를 보셨습니다" 와 버튼 둘.
 *
 * '전체 일정 받기'는 **지금 쓰는 신청 화면(/plan/[id]/consult)** 으로 간다. 신청·결제 쪽은 이번 범위가 아니라
 * 손대지 않는다. 먼저 초안을 다 보여 준 다음에 파는 자리라서 화면 맨 끝에 둔다 (PRODUCT.md 원칙 2).
 */
export default function ClosingBand({
  planId,
  trip,
  lang,
}: {
  planId: string;
  trip: FreeItinerary;
  lang: Lang;
}) {
  const facts = [
    { label: draftCopy.stay[lang], value: trip.picks.stay },
    { label: draftCopy.eat[lang], value: trip.picks.dining },
    { label: draftCopy.total[lang], value: trip.totalEstimate },
  ];

  return (
    <section className={styles.band} aria-label={draftCopy.fullPlan[lang]}>
      <div className={`${styles.wrap} ${styles.bandInner}`}>
        <dl className={styles.facts}>
          {facts.map((f) => (
            <div key={f.label} className={styles.fact}>
              {/* 영어는 시안처럼 쌍점을 붙이고, 한국어 이름표에는 붙이지 않는다 (예전 화면과 같다) */}
              <dt className={styles.factLabel}>
                {f.label}
                {lang === "en" && ":"}
              </dt>
              <dd className={styles.factValue}>{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.actions}>
          <p className={styles.oneTip}>{draftCopy.oneTip[lang]}</p>
          <div className={styles.buttons}>
            <Link href={`/plan/${planId}/consult`} className={`${base.pillDark} ${styles.cta}`}>
              {draftCopy.fullPlan[lang]}
              <span aria-hidden="true" className="mx-2">
                ·
              </span>
              {draftCopy.price}
            </Link>
            <CopyLink lang={lang} />
          </div>
        </div>
      </div>
    </section>
  );
}
