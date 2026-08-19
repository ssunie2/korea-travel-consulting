/**
 * DAY 마다 하나씩 붙는 전통 문양. **고른 날짜에만 켜진다.**
 *
 * 남의 도안을 가져다 쓰지 않는다. 네 개 모두 **각도와 반지름을 계산해서 그 자리에서 그린다** —
 * 아래 코드에 좌표가 통째로 적힌 곳이 없는 이유다. 단청과 문살에서 되풀이되는
 * 회전 대칭이라는 성질만 빌렸고, 모양 자체는 이 파일이 만든다.
 *
 * 크기가 작다(폰 11px, PC 17px — 원래 주황색 타원의 좁은 폭에 맞췄다).
 * 그래서 획을 굵게 두고 요소 수를 줄였다. 잘게 나누면 이 크기에서 뭉개진다.
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

const shell = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** DAY 1 — 연화문. 여덟 장 꽃잎이 한 바퀴 */
function Lotus() {
  return (
    <svg {...shell} aria-hidden>
      <circle cx={C} cy={C} r={RING} />
      {spokes(8).map((a) => (
        <path key={a} d={petal(a, 3.4, 9.6, 22)} />
      ))}
      <circle cx={C} cy={C} r={1.6} fill="currentColor" stroke="none" />
    </svg>
  );
}

/** DAY 2 — 꽃살문. 큰 꽃잎 넷에 모서리마다 점 하나 */
function Blossom() {
  return (
    <svg {...shell} aria-hidden>
      <circle cx={C} cy={C} r={RING} />
      {spokes(4).map((a) => (
        <path key={a} d={petal(a, 2.6, 9.4, 34)} />
      ))}
      {spokes(4, 45).map((a) => {
        const [x, y] = at(a, 7.4);
        return <circle key={a} cx={x} cy={y} r={0.95} fill="currentColor" stroke="none" />;
      })}
    </svg>
  );
}

/** DAY 3 — 국화문. 가는 살이 여럿, 끝마다 점 */
function Chrysanthemum() {
  return (
    <svg {...shell} aria-hidden strokeWidth={1.15}>
      <circle cx={C} cy={C} r={RING} />
      <circle cx={C} cy={C} r={3.5} />
      {spokes(12).map((a) => {
        const [sx, sy] = at(a, 4.4);
        const [ex, ey] = at(a, 8);
        const [dx, dy] = at(a, 9.4);
        return (
          <g key={a}>
            <path d={`M${sx} ${sy}L${ex} ${ey}`} />
            <circle cx={dx} cy={dy} r={0.8} fill="currentColor" stroke="none" />
          </g>
        );
      })}
    </svg>
  );
}

/** DAY 4 — 삼태극에서 온 세 갈래 소용돌이 */
function Whirl() {
  return (
    <svg {...shell} aria-hidden strokeWidth={2}>
      <circle cx={C} cy={C} r={RING} strokeWidth={1.4} />
      {spokes(3).map((a) => (
        <path key={a} d={arc(a, a + 96, 6.6)} />
      ))}
      <circle cx={C} cy={C} r={1.5} fill="currentColor" stroke="none" />
    </svg>
  );
}

/** DAY 번호 → 문양. 넷을 넘어가면 처음으로 돌아간다 */
const PATTERNS = [Lotus, Blossom, Chrysanthemum, Whirl];

export default function DayPattern({ day }: { day: number }) {
  const Shape = PATTERNS[(day - 1) % PATTERNS.length];
  return <Shape />;
}
