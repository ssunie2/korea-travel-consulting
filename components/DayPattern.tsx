/**
 * DAY 마다 하나씩 붙는 전통 문양. **고른 날짜에만 켜진다.**
 *
 * 남의 도안을 가져다 쓰지 않는다. 네 개 모두 **각도와 반지름을 계산해서 그 자리에서 그린다** —
 * 아래 코드에 좌표가 통째로 적힌 곳이 없는 이유다. 단청과 문살에서 되풀이되는
 * 회전 대칭이라는 성질만 빌렸고, 모양 자체는 이 파일이 만든다.
 *
 * **바깥 테 → 가운데 무늬 → 속 무늬**, 세 겹으로 짠다. 실제 단청 원문양이 그렇게 생겼고,
 * 한 겹만 두면 단조롭다. 겹마다 각도를 어긋나게 둬서 사이가 메워지게 했다.
 *
 * 크기: 폰 16px, PC 26px. 획 굵기를 겹마다 달리해서 이 크기에서도 층이 구분된다.
 */

/** 그리기 판. 가운데가 (12,12), 바깥 테두리 반지름 11 */
const C = 12;
const RING = 11;

/** 각도를 좌표로. 12시 방향이 0도이고 시계 방향으로 돈다 */
function at(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [C + radius * Math.cos(rad), C + radius * Math.sin(rad)] as const;
}

/** n 등분한 각도 목록 */
function spokes(n: number, offset = 0) {
  return Array.from({ length: n }, (_, i) => offset + (i * 360) / n);
}

/** 끝이 뾰족한 꽃잎 하나. 안쪽 반지름에서 시작해 바깥에서 만난다 */
function petal(angle: number, inner: number, outer: number, width: number) {
  const [ix, iy] = at(angle, inner);
  const [ox, oy] = at(angle, outer);
  const [lx, ly] = at(angle - width, (inner + outer) / 2);
  const [rx, ry] = at(angle + width, (inner + outer) / 2);
  return `M${ix} ${iy}Q${lx} ${ly} ${ox} ${oy}Q${rx} ${ry} ${ix} ${iy}Z`;
}

/** 한 각도에서 안팎을 잇는 짧은 직선 */
function tick(angle: number, inner: number, outer: number) {
  const [sx, sy] = at(angle, inner);
  const [ex, ey] = at(angle, outer);
  return `M${sx} ${sy}L${ex} ${ey}`;
}

/** 정n각형. 육각형을 여러 개 붙일 것이라 중심을 받는다 */
function ngon(n: number, radius: number, cx = C, cy = C) {
  const pts = spokes(n).map((a) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return `${cx + radius * Math.cos(rad)} ${cy + radius * Math.sin(rad)}`;
  });
  return `M${pts.join("L")}Z`;
}

/** 바깥 테. 두 줄 사이에 잔살을 채운 띠 — 네 문양이 공유하는 테두리다 */
function Band({ beads, inner = 9.3 }: { beads: number; inner?: number }) {
  return (
    <g>
      <circle cx={C} cy={C} r={RING} />
      <circle cx={C} cy={C} r={inner} />
      <g strokeWidth={0.75}>
        {spokes(beads).map((a) => (
          <path key={a} d={tick(a, inner, RING)} />
        ))}
      </g>
    </g>
  );
}

const shell = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const dot = (angle: number, radius: number, r: number) => {
  const [x, y] = at(angle, radius);
  return <circle key={`${angle}-${radius}`} cx={x} cy={y} r={r} fill="currentColor" stroke="none" />;
};

/** DAY 1 — 연화문. 겹꽃잎: 바깥 여덟 장 안쪽 여덟 장이 서로 엇갈린다 */
function LotusContent() {
  return (
    <>
      <Band beads={16} />
      {spokes(8).map((a) => (
        <path key={a} d={petal(a, 5.4, 8.9, 21)} />
      ))}
      <g strokeWidth={0.95}>
        {spokes(8, 22.5).map((a) => (
          <path key={a} d={petal(a, 2.4, 5.2, 26)} />
        ))}
      </g>
      <circle cx={C} cy={C} r={1.5} fill="currentColor" stroke="none" />
    </>
  );
}

function Lotus() {
  return <svg {...shell} aria-hidden><LotusContent /></svg>;
}

/** DAY 2 — 꽃살문. 큰 꽃잎 넷 사이에 작은 꽃잎 넷, 그 끝마다 씨앗 하나 */
function Blossom() {
  return (
    <svg {...shell} aria-hidden>
      <Band beads={8} />
      {spokes(4).map((a) => (
        <path key={a} d={petal(a, 2.9, 8.8, 31)} />
      ))}
      <g strokeWidth={0.95}>
        {spokes(4, 45).map((a) => (
          <path key={a} d={petal(a, 2.9, 7.2, 17)} />
        ))}
      </g>
      {spokes(4, 45).map((a) => dot(a, 8.2, 0.72))}
      <circle cx={C} cy={C} r={2.3} strokeWidth={0.95} />
      <circle cx={C} cy={C} r={0.85} fill="currentColor" stroke="none" />
    </svg>
  );
}

/** DAY 3 — 귀갑문. 거북 등껍질에서 온 육각 칸이 벌집처럼 맞물린다 */
function TortoiseContent() {
  return (
    <>
      <Band beads={12} />
      <path d={ngon(6, 4.4)} strokeWidth={1.1} />
      <g strokeWidth={0.95}>
        {spokes(6).map((a) => {
          const [x, y] = at(a, 5.4);
          return <path key={a} d={ngon(6, 3.1, x, y)} />;
        })}
      </g>
      <circle cx={C} cy={C} r={1.1} fill="currentColor" stroke="none" />
    </>
  );
}

function Tortoise() {
  return <svg {...shell} aria-hidden><TortoiseContent /></svg>;
}

/**
 * DAY 4 — 겹연화문. 넷 중 유일하게 **선이 아니라 면으로 채운다.**
 * 셋이 모두 가는 선이라, 하나는 무게가 다른 편이 나란히 놓았을 때 구분된다.
 */
function LayeredLotus() {
  return (
    <svg {...shell} aria-hidden>
      <circle cx={C} cy={C} r={RING} />
      {spokes(24).map((a) => dot(a, 10.15, 0.4))}
      <circle cx={C} cy={C} r={9.1} strokeWidth={0.8} />
      <path d={spokes(8).map((a) => petal(a, 4.5, 8.8, 19)).join("")} fill="currentColor" stroke="none" />
      <path d={spokes(8, 22.5).map((a) => petal(a, 2.9, 6.2, 25)).join("")} fill="currentColor" stroke="none" />
      <circle cx={C} cy={C} r={2.35} fill="currentColor" stroke="none" />
    </svg>
  );
}

/** DAY 번호 → 문양. 넷을 넘어가면 처음으로 돌아간다 */
const PATTERNS = [Lotus, Blossom, Tortoise, LayeredLotus];

export default function DayPattern({ day }: { day: number }) {
  const Shape = PATTERNS[(day - 1) % PATTERNS.length];
  return <Shape />;
}

/** 클로드 시안의 최종 배경. 문양과 좌표, 투명도를 그대로 옮긴 고정 레이어다. */
export function BackgroundMotifs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-white">
      <svg
        className="absolute inset-0 h-full w-full opacity-[.055]"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 100 100"
      >
        <defs>
          <symbol id="ktc-bg-lotus" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <LotusContent />
            </g>
          </symbol>
          <symbol id="ktc-bg-tortoise" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <TortoiseContent />
            </g>
          </symbol>
        </defs>

        <use href="#ktc-bg-lotus" x="-180" y="-120" width="62" height="62" />
        <use href="#ktc-bg-lotus" x="8" y="62" width="70" height="70" />
        <use href="#ktc-bg-tortoise" x="-140" y="84" width="46" height="46" />
      </svg>

      <svg
        className="absolute -right-[9%] -top-[11%] w-[min(48vw,430px)] opacity-[.07] max-[760px]:-right-[22%] max-[760px]:-top-[6%] max-[760px]:w-[70vw]"
        viewBox="0 0 24 24"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
          <TortoiseContent />
        </g>
      </svg>
    </div>
  );
}
