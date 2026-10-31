import type { StaticImageData } from "next/image";
import type { Lang } from "./content";
import { SEOUL_PHOTOS, type Slot } from "./photo-ledger";

// 서울 사진 (사진 대장 photo-ledger.ts). **이 파일에서만 불러온다** — 다른 파일이 직접 불러오면 검사가 막는다.
import gyeonghoeru from "@/public/mohallae/seoul/gyeonghoeru.jpg";
import seochonInwangsan from "@/public/mohallae/seoul/seochon-inwangsan.jpg";
import bukchonLane from "@/public/mohallae/seoul/bukchon-lane.jpg";
import samcheongWall from "@/public/mohallae/seoul/samcheong-wall.jpg";
import hanokCourtyard from "@/public/mohallae/seoul/hanok-courtyard.jpg";
import insadongTeahouse from "@/public/mohallae/seoul/insadong-teahouse.jpg";
import jongmyoWall from "@/public/mohallae/seoul/jongmyo-wall.jpg";
import euljiroAlley from "@/public/mohallae/seoul/euljiro-alley.jpg";
import heunginjimunNight from "@/public/mohallae/seoul/heunginjimun-night.jpg";
import seoulforestGinkgo from "@/public/mohallae/seoul/seoulforest-ginkgo.jpg";
import seongsuCourtyard from "@/public/mohallae/seoul/seongsu-courtyard.jpg";
import seoulforestBridge from "@/public/mohallae/seoul/seoulforest-bridge.jpg";
import yeonnamStreet from "@/public/mohallae/seoul/yeonnam-street.jpg";
import hannamGallery from "@/public/mohallae/seoul/hannam-gallery.jpg";
import itaewonRooftop from "@/public/mohallae/seoul/itaewon-rooftop.jpg";
import banpoFountain from "@/public/mohallae/seoul/banpo-fountain.jpg";
import ttukseomBike from "@/public/mohallae/seoul/ttukseom-bike.jpg";
import olympicLonetree from "@/public/mohallae/seoul/olympic-lonetree.jpg";

/** 대장의 id → 사진 파일 */
const FILES: Record<string, StaticImageData> = {
  gyeonghoeru,
  "seochon-inwangsan": seochonInwangsan,
  "bukchon-lane": bukchonLane,
  "samcheong-wall": samcheongWall,
  "hanok-courtyard": hanokCourtyard,
  "insadong-teahouse": insadongTeahouse,
  "jongmyo-wall": jongmyoWall,
  "euljiro-alley": euljiroAlley,
  "heunginjimun-night": heunginjimunNight,
  "seoulforest-ginkgo": seoulforestGinkgo,
  "seongsu-courtyard": seongsuCourtyard,
  "seoulforest-bridge": seoulforestBridge,
  "yeonnam-street": yeonnamStreet,
  "hannam-gallery": hannamGallery,
  "itaewon-rooftop": itaewonRooftop,
  "banpo-fountain": banpoFountain,
  "ttukseom-bike": ttukseomBike,
  "olympic-lonetree": olympicLonetree,
};

/**
 * 자리에 정해 둔 사진을 꺼낸다. src·alt 와, 잘릴 때 보여 줄 곳(position)을 돌려준다.
 * 대장에 그 자리의 사진이 없으면 바로 오류를 낸다 — 빈 칸으로 조용히 넘어가지 않게.
 */
export function photo(slot: Slot, lang: Lang) {
  const p = SEOUL_PHOTOS.find((x) => x.slot === slot);
  const src = p && FILES[p.id];
  if (!p || !src) throw new Error(`사진 대장에 '${slot}' 자리의 사진이 없다`);
  return { src, alt: p.alt[lang], position: p.position };
}
