import { t } from './copy'

/**
 * 고를 수 있는 여행지.
 *
 * **`v` 는 저장되는 값, `ko` 는 화면에 보이는 글자다.** 둘을 나눠 둔 이유가 있다 —
 * DB 와 AI 에게는 늘 같은 영어 이름이 가고(그래야 지난 초안과 말이 맞다),
 * 화면에만 지금 언어로 보여준다. 화면 언어를 바꿔도 저장된 값은 그대로다.
 *
 * 폼과 초안 화면 **양쪽에서 쓴다.** 목록을 두 벌 두면 한쪽만 고쳐서 어긋난다.
 */
export const DESTINATIONS = [
  { v: 'Seoul', ko: '서울' }, { v: 'Incheon', ko: '인천' },
  { v: 'Chuncheon', ko: '춘천' }, { v: 'Gangneung', ko: '강릉' }, { v: 'Sokcho', ko: '속초' },
  { v: 'Gyeongju', ko: '경주' }, { v: 'Andong', ko: '안동' }, { v: 'Pohang', ko: '포항' },
  { v: 'Daegu', ko: '대구' }, { v: 'Busan', ko: '부산' }, { v: 'Tongyeong', ko: '통영' },
  { v: 'Jeonju', ko: '전주' }, { v: 'Yeosu', ko: '여수' }, { v: 'Mokpo', ko: '목포' },
  { v: 'Jeju', ko: '제주' },
]

/**
 * 저장된 값을 지금 언어의 이름으로. 목록에 없으면 **적어주신 그대로 돌려준다** —
 * '그 외' 로 직접 적은 곳은 우리가 번역본을 갖고 있지 않다.
 */
export function placeLabel(value: string): string {
  const hit = DESTINATIONS.find((d) => d.v === value)
  return hit ? t({ ko: hit.ko, en: hit.v }) : value
}
