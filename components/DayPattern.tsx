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

/** 두 각 사이를 잇는 호 */
function arc(from: number, to: number, radius: number) {
  const [sx, sy] = at(from, radius);
  const [ex, ey] = at(to, radius);
  const big = Math.abs(to - from) > 180 ? 1 : 0;
  return `M${sx} ${sy}A${radius} ${radius} 0 ${big} 1 ${ex} ${ey}`;
}

/** 한 각도에서 안팎을 잇는 짧은 직선 */
function tick(angle: number, inner: number, outer: number) {
  const [sx, sy] = at(angle, inner);
  const [ex, ey] = at(angle, outer);
  return `M${sx} ${sy}L${ex} ${ey}`;
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
function Lotus() {
  return (
    <svg {...shell} aria-hidden>
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
    </svg>
  );
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

/** DAY 3 — 국화문. 살 열여섯에 그 사이사이 짧은 살, 속에 또 한 겹 */
function Chrysanthemum() {
  return (
    <svg {...shell} aria-hidden strokeWidth={1.05}>
      <Band beads={24} inner={9.6} />
      <g strokeWidth={0.85}>
        {spokes(16).map((a) => (
          <path key={a} d={tick(a, 5.9, 9)} />
        ))}
        {spokes(16, 11.25).map((a) => dot(a, 7.4, 0.5))}
      </g>
      <circle cx={C} cy={C} r={5.4} strokeWidth={0.95} />
      <g strokeWidth={0.85}>
        {spokes(8).map((a) => (
          <path key={a} d={petal(a, 1.9, 4.9, 24)} />
        ))}
      </g>
      <circle cx={C} cy={C} r={1.15} fill="currentColor" stroke="none" />
    </svg>
  );
}

/** DAY 4 — 삼태극에서 온 소용돌이. 세 갈래가 바깥·안 두 겹으로 맞물린다 */
function Whirl() {
  return (
    <svg {...shell} aria-hidden>
      <Band beads={12} />
      <g strokeWidth={1.65}>
        {spokes(3).map((a) => (
          <path key={a} d={arc(a, a + 92, 7.5)} />
        ))}
      </g>
      {spokes(3).map((a) => dot(a, 7.5, 0.85))}
      <g strokeWidth={1.15}>
        {spokes(3, 60).map((a) => (
          <path key={a} d={arc(a, a + 84, 4.4)} />
        ))}
      </g>
      <circle cx={C} cy={C} r={1.35} fill="currentColor" stroke="none" />
    </svg>
  );
}

/** DAY 번호 → 문양. 넷을 넘어가면 처음으로 돌아간다 */
const PATTERNS = [Lotus, Blossom, Chrysanthemum, Whirl];

export default function DayPattern({ day }: { day: number }) {
  const Shape = PATTERNS[(day - 1) % PATTERNS.length];
  return <Shape />;
}
