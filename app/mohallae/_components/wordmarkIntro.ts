/**
 * 글자 로고 인트로 — 다람쥐가 달려가며 m · o · h · a · l · l · a 를 남기고, 마지막 a 에서 폴짝 뛰어
 * 공중에서 한 바퀴 구르며 몸을 말아 e 자리에 내려앉고 그대로 e 가 된다 (써니 2026-11-13 "이걸로 해서 페이지에 적용").
 *
 * 움직임 시안 페이지(모할래 인트로 e 변신)의 코드를 그대로 옮겼다. 숫자를 바꾸면 시안 페이지와 어긋나니,
 * 고칠 때는 시안 페이지에서 먼저 맞춰 보고 옮긴다.
 *
 * 이미 그려진 Wordmark SVG 위에서만 움직인다 — 글자 8개(<g transform="translate(x 0)">)는 건드리기만 하고
 * 다람쥐 · 먼지 · e 로 바뀌는 공은 그 위에 잠깐 덧붙였다가 끝나면 모두 지우고 원래 로고로 되돌린다.
 * 좌표는 Wordmark 의 viewBox 단위(글자 높이 157.27)다.
 */

const NS = "http://www.w3.org/2000/svg";
const INK = "#012731";

// ── 시간표 (초) ─────────────────────────────────────────
const SPEED = 300.8; // 달리는 빠르기 (초당 로고 단위)
const T0 = 0.2; // 출발
const X0 = -300; // 출발 자리 — 로고 왼쪽 바깥. 처음 0.25초 동안 서서히 나타난다
const BX = -40, BY = -62; // 몸을 말 때 공의 가운데 (다람쥐 좌표)
const ER = 51.5, ECY = -51.5; // e 바깥 반지름 · e 가운데 높이
const HOP_D = 70; // 폴짝 뛰어 앞으로 가는 거리
const K = 1.12; // 다람쥐 크기
const TRIG = 112; // 꼬리 한가운데가 글자 가운데를 지나는 순간 글자가 솟음
const GROW = 0.52; // 글자가 솟는 시간
const HOP = 0.62, ARC = 62; // 폴짝 → 한 바퀴 구르며 공이 되는 시간 · 높이
const MORPH = 0.42; // 내려앉은 공이 e 로 풀리는 시간
const HALO = 4; // 다람쥐 둘레 · 꼬리 · 목 · 귀 사이 틈

// ── 다람쥐 (오른쪽을 봄, 땅 y = 0, 코끝 근처가 x = 0) ─────────
const TAIL_BASE: [number, number] = [-66, -40];
const TAIL_TH0 = 188;
const TAIL_SEGS: [number, number][] = [[20, 34], [28, 52], [24, 38], [70, -154], [12, -22]]; // [길이, 꺾는 각도(도)]
const TAIL_N = 101;
const BODY = { cx: -40, cy: -40, rx: 40, ry: 28 };
const HAUNCH = { cx: -64, cy: -32, r: 22 };
const HEAD = { cx: 6, cy: -72, r: 29 };
const NOSE = { cx: 31, cy: -66, r: 7 };
const EAR = { cx: -9, cy: -103, rx: 10, ry: 13.5, rot: -14 };
const EYE = { cx: 15, cy: -77, r: 5.6 };
const FRONT = { x: -14, y: -30, len: 28, w: 12 };
const HIND = { x: -62, y: -18, w: 13 };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, s: number) => a + (b - a) * s;
const outCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const outBack = (p: number, k = 1.55) => 1 + (k + 1) * Math.pow(p - 1, 3) + k * Math.pow(p - 1, 2);
const inOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const f = (v: number) => String(+v.toFixed(2));

type Attrs = Record<string, string | number>;
function el(tag: string, attrs: Attrs, parent?: Element): SVGElement {
  const e = document.createElementNS(NS, tag) as SVGElement;
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(e);
  return e;
}

// 꼬리 — 가운뎃줄을 '구간 길이 + 꺾는 각도'로 그린 둥근 S. 흔들림은 방향에 물결을 실어 뿌리 → 끝으로 번지게
const TAIL_LEN = TAIL_SEGS.reduce((a, q) => a + q[0], 0);
const widthAt = (u: number) => (u <= 0.7 ? 10 + 19 * (1 - Math.pow(1 - u / 0.7, 2)) : 29 - 9 * Math.pow((u - 0.7) / 0.3, 2));
function rawTurn(s: number) {
  let acc = 0;
  for (const [L, d] of TAIL_SEGS) {
    if (s <= acc + L) return d / L;
    acc += L;
  }
  return 0;
}
function turnRate(s: number) {
  let sum = 0;
  for (let k = -6; k <= 6; k++) sum += rawTurn(s + k * 1.5);
  return sum / 13;
}
function tailShape(t: number, droop: number, P: number): [number, number, number][] {
  const deg = Math.PI / 180, WS = Math.PI / P, WB = (2 * Math.PI) / P, ds = TAIL_LEN / (TAIL_N - 1);
  let base = TAIL_TH0, x = TAIL_BASE[0], y = TAIL_BASE[1];
  const out: [number, number, number][] = [[x, y, widthAt(0) / 2]];
  for (let i = 1; i < TAIL_N; i++) {
    const s = (i - 0.5) * ds, u = s / TAIL_LEN;
    base += turnRate(s) * ds;
    const wave = (2 + 7 * u) * (Math.sin(WS * t - 2.4 * u) + 0.35 * Math.sin(WB * t - 1.3 - 1.8 * u));
    const th = (base + wave + droop * Math.pow(u, 1.5)) * deg;
    x += Math.cos(th) * ds;
    y += Math.sin(th) * ds;
    out.push([x, y, widthAt(i / (TAIL_N - 1)) / 2]);
  }
  return out; // 가운뎃줄을 따라 둥근 붓을 촘촘히 찍음 → 테두리가 꺾이지 않음
}

type Cluster = { g: SVGElement; parts: [SVGElement, SVGElement][] };
function cluster(parent: Element, ground: string, build: (layer: SVGElement, halo: boolean) => SVGElement[]): Cluster {
  // 같은 모양을 두 번: 바탕색 테두리(틈) → 먹색
  const g = el("g", {}, parent);
  const halo = el("g", { fill: ground, stroke: ground, "stroke-width": HALO * 2, "stroke-linejoin": "round", "stroke-linecap": "round" }, g);
  const ink = el("g", { fill: INK }, g);
  const hs = build(halo, true), is = build(ink, false);
  return { g, parts: hs.map((h, i) => [h, is[i]] as [SVGElement, SVGElement]) };
}

function makeSquirrel(root: Element, ground: string) {
  const sq = el("g", {}, root);
  const tail = cluster(sq, ground, (p) => Array.from({ length: TAIL_N }, () => el("circle", { r: 0 }, p)));
  const body = cluster(sq, ground, (p, halo) => {
    const lw = (w: number) => (halo ? w + HALO * 2 : w);
    const stroke = halo ? ground : INK;
    const hind = el("path", { d: `M ${HIND.x} ${HIND.y} L ${HIND.x - 2} -6 L ${HIND.x + 18} -6`, fill: "none", stroke, "stroke-width": lw(HIND.w), "stroke-linecap": "round", "stroke-linejoin": "round" }, p);
    const front = el("line", { x1: FRONT.x, y1: FRONT.y, x2: FRONT.x, y2: FRONT.y + FRONT.len, stroke, "stroke-width": lw(FRONT.w), "stroke-linecap": "round" }, p);
    const trunk = el("g", {}, p);
    el("circle", { cx: HAUNCH.cx, cy: HAUNCH.cy, r: HAUNCH.r }, trunk);
    el("ellipse", { cx: BODY.cx, cy: BODY.cy, rx: BODY.rx, ry: BODY.ry }, trunk);
    return [hind, front, trunk];
  });
  const ear = cluster(sq, ground, (p) => [el("ellipse", { cx: EAR.cx, cy: EAR.cy, rx: EAR.rx, ry: EAR.ry, transform: `rotate(${EAR.rot} ${EAR.cx} ${EAR.cy})` }, p)]);
  const head = cluster(sq, ground, (p) => [el("circle", { cx: HEAD.cx, cy: HEAD.cy, r: HEAD.r }, p), el("circle", { cx: NOSE.cx, cy: NOSE.cy, r: NOSE.r }, p)]);
  const eye = el("circle", { cx: EYE.cx, cy: EYE.cy, r: EYE.r, fill: ground }, head.g);
  // 몸을 말 때 지우는 것: 틈(바탕색 테두리)과 눈
  const halos = [tail, body, ear, head].map((c) => c.g.children[0] as SVGElement).concat([eye]);
  return { sq, tail, body, ear, head, halos };
}
type Squirrel = ReturnType<typeof makeSquirrel>;
type Pose = { bob: number; pitch: number; front: number; hind: number; stretch: number; droop: number };

function poseAt(phi: number): Pose {
  // phi: 한 번 뛰는 동안 0 → 1 (0 과 1 은 땅)
  const s = 0.5 - 0.5 * Math.cos(2 * Math.PI * phi);
  return { bob: -17 * Math.sin(Math.PI * phi), pitch: -5 * Math.sin(2 * Math.PI * phi), front: lerp(16, -62, s), hind: lerp(-30, 58, s), stretch: lerp(0.95, 1.07, s), droop: 0 };
}

function applySquirrel(S: Squirrel, x: number, pose: Pose, t: number, P: number) {
  const st = pose.stretch, dx = (st - 1) * 34;
  const fx = BODY.cx + (FRONT.x - BODY.cx) * st, hx = BODY.cx + (HIND.x - BODY.cx) * st;
  const tl = tailShape(t, pose.droop, P);
  S.tail.parts.forEach((pair, i) => {
    for (const e of pair) {
      e.setAttribute("cx", f(tl[i][0]));
      e.setAttribute("cy", f(tl[i][1]));
      e.setAttribute("r", f(tl[i][2]));
    }
  });
  S.tail.g.setAttribute("transform", `translate(${f(-dx)} 0)`);
  for (const e of S.body.parts[0]) e.setAttribute("transform", `translate(${f(hx - HIND.x)} 0) rotate(${f(pose.hind)} ${HIND.x} ${HIND.y})`);
  for (const e of S.body.parts[1]) e.setAttribute("transform", `translate(${f(fx - FRONT.x)} 0) rotate(${f(pose.front)} ${FRONT.x} ${FRONT.y})`);
  for (const e of S.body.parts[2]) e.setAttribute("transform", `translate(${BODY.cx} ${BODY.cy}) scale(${f(st)} ${f(1 / Math.sqrt(st))}) translate(${-BODY.cx} ${-BODY.cy})`);
  S.ear.g.setAttribute("transform", `translate(${f(dx)} 0)`);
  S.head.g.setAttribute("transform", `translate(${f(dx)} 0)`);
  S.sq.setAttribute("transform", `translate(${f(x)} ${f(pose.bob)}) scale(${K}) rotate(${f(pose.pitch)} -40 -40)`);
}

/**
 * svg 위에서 인트로를 한 번 재생한다. 끝나면(또는 돌려받은 함수를 부르면) 덧붙인 것을 모두 지우고 원래 로고로 되돌린다.
 * ground: 로고 뒤 바탕색 — 다람쥐 둘레 틈을 이 색으로 칠한다.
 */
export function playWordmarkIntro(svg: SVGSVGElement, ground: string, onDone: () => void): () => void {
  const glyphs = Array.from(svg.children).filter((n): n is SVGGElement => n.tagName.toLowerCase() === "g");
  if (glyphs.length !== 8) {
    onDone();
    return () => {};
  }
  const origT = glyphs.map((g) => g.getAttribute("transform") ?? "");
  const gx = origT.map((s) => Number(/translate\(([-\d.]+)/.exec(s)?.[1] ?? 0));
  const WIDTH = [186, 103, 103, 103, 20, 20, 103, 103];
  const centers = gx.map((x, i) => x + WIDTH[i] / 2);
  const EX = centers[7]; // e 가운데

  const X1 = EX - HOP_D - BX * K; // 이 자리에서 뛰어야 공 가운데가 e 가운데에 내려앉음
  const RUN = (X1 - X0) / SPEED, BOUNDS = Math.round(RUN / 0.32), P = RUN / BOUNDS;
  const TH = T0 + RUN, TLAND = TH + HOP, END = TLAND + MORPH + 0.1;
  const AX = (t: number) => X0 + ((X1 - X0) * (t - T0)) / RUN;
  const TL = centers.map((c) => T0 + ((c + TRIG - X0) / (X1 - X0)) * RUN); // 글자별 등장 시각

  // 덧붙이는 것들: 먼지, 물방울처럼 합쳐지는 효과(필터), e 로 바뀌는 묶음(e 복사본 + 공 + 다람쥐)
  const added: Element[] = [];
  const dust = el("g", { fill: INK, "pointer-events": "none" }, svg);
  const puffs = [0, 1].map(() => [el("circle", { r: 0, opacity: 0 }, dust), el("circle", { r: 0, opacity: 0 }, dust)]);
  const fid = `wm-goo-${Math.random().toString(36).slice(2, 8)}`;
  const defs = el("defs", {}, svg);
  const filt = el("filter", { id: fid, filterUnits: "userSpaceOnUse", x: EX - 254, y: -330, width: 500, height: 400, "color-interpolation-filters": "sRGB" }, defs);
  const blur = el("feGaussianBlur", { in: "SourceGraphic", stdDeviation: 0, result: "b" }, filt);
  el("feColorMatrix", { in: "b", mode: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10", result: "g" }, filt);
  el("feComposite", { in: "SourceGraphic", in2: "g", operator: "atop" }, filt);
  const morph = el("g", { "pointer-events": "none" }, svg);
  const eg = el("g", {}, morph);
  const eCopy = glyphs[7].cloneNode(true) as SVGGElement;
  eCopy.setAttribute("opacity", "0");
  eg.appendChild(eCopy);
  const disc = el("circle", { r: 0, fill: INK }, eg);
  const S = makeSquirrel(morph, ground);
  added.push(dust, defs, morph);

  const setGoo = (sd: number) => {
    if (sd <= 0.01) morph.removeAttribute("filter");
    else {
      morph.setAttribute("filter", `url(#${fid})`);
      blur.setAttribute("stdDeviation", f(sd));
    }
  };

  function render(t: number) {
    // 글자 m … a — 꼬리가 지나가면 바닥에서 솟음. 진짜 e 는 다람쥐가 e 가 될 때까지 숨김
    glyphs.forEach((g, i) => {
      if (i === 7) {
        g.setAttribute("opacity", "0");
        return;
      }
      const p = clamp((t - TL[i]) / GROW);
      if (p <= 0) {
        g.setAttribute("opacity", "0");
        g.setAttribute("transform", origT[i]);
        return;
      }
      const c = centers[i], sy = outBack(p), sx = 0.9 + 0.1 * outCubic(p);
      g.setAttribute("opacity", f(clamp(p / 0.18)));
      g.setAttribute("transform", p >= 1 ? origT[i] : `translate(${f(c)} 0) scale(${f(sx)} ${f(sy)}) translate(${f(-c)} 0) ${origT[i]}`);
    });

    S.halos.forEach((h) => h.setAttribute("opacity", "1"));
    eg.removeAttribute("transform");
    disc.setAttribute("r", "0");
    if (t < TH) {
      setGoo(0);
      const tt = Math.max(t, T0), phi = ((tt - T0) / P) % 1;
      S.sq.style.display = "";
      applySquirrel(S, AX(tt), poseAt(t < T0 ? 0 : phi), t, P);
      S.sq.setAttribute("opacity", f(clamp((t - T0) / 0.25)));
    } else if (t < TLAND) {
      // 폴짝 뛰어 한 바퀴 구르며 몸을 동그랗게 말고(작아지며 공으로 녹아듦), e 자리로 떨어짐
      const p = (t - TH) / HOP;
      const c0x = X1 + BX * K, c0y = BY * K;
      const cx = lerp(c0x, EX, p), cy = lerp(c0y, ECY, p) - 4 * ARC * p * (1 - p);
      const tuck = outCubic(clamp(p / 0.3));
      S.sq.style.display = "";
      applySquirrel(S, 0, { bob: 0, pitch: 0, front: lerp(16, -8, tuck), hind: lerp(-30, 8, tuck), stretch: 0.95, droop: -10 * tuck }, t, P);
      const rot = 360 * inOut(clamp((p - 0.06) / 0.84)), sc = lerp(1, 0.3, inOut(clamp((p - 0.3) / 0.55)));
      S.sq.setAttribute("transform", `translate(${f(cx)} ${f(cy)}) rotate(${f(rot)}) scale(${f(K * sc)}) translate(${-BX} ${-BY})`);
      S.sq.setAttribute("opacity", "1");
      S.halos.forEach((h) => h.setAttribute("opacity", f(1 - clamp((p - 0.22) / 0.16))));
      disc.setAttribute("cx", f(cx));
      disc.setAttribute("cy", f(cy));
      disc.setAttribute("r", f(ER * outCubic(clamp((p - 0.4) / 0.52))));
      eCopy.setAttribute("opacity", "0");
      setGoo(5.5 * clamp((p - 0.36) / 0.18));
    } else {
      // 내려앉아 살짝 눌렸다가, 공 가운데가 열리며 e 로 풀림
      const q = (t - TLAND) / MORPH;
      S.sq.style.display = "none";
      eCopy.setAttribute("opacity", "1");
      disc.setAttribute("cx", f(EX));
      disc.setAttribute("cy", f(ECY));
      disc.setAttribute("r", f(ER * (1 - inOut(clamp(q / 0.8)))));
      setGoo(5.5 * (1 - clamp((q - 0.3) / 0.55)));
      const s2 = clamp(q / 0.5), sy = 1 - 0.13 * Math.sin(Math.PI * s2), sx = 1 + 0.08 * Math.sin(Math.PI * s2);
      if (s2 < 1) eg.setAttribute("transform", `translate(${f(EX)} 0) scale(${f(sx)} ${f(sy)}) translate(${f(-EX)} 0)`);
    }

    // 착지 먼지 — 뛰는 동안 뒷발이 땅에 닿을 때마다
    const k = Math.floor((t - T0) / P);
    puffs.forEach((pair, j) => {
      const kk = k - j, tk = T0 + kk * P, dt = t - tk;
      const on = kk >= 1 && kk <= BOUNDS && dt >= 0 && dt < 0.4 && tk <= TH + 0.01;
      pair.forEach((c, m) => {
        if (!on) {
          c.setAttribute("opacity", "0");
          return;
        }
        const e = outCubic(dt / 0.4), fx = AX(Math.min(tk, TH)) + HIND.x * K;
        c.setAttribute("cx", f(fx - (m ? 4 : 16) - (m ? 10 : 22) * e));
        c.setAttribute("cy", f(-3 - (m ? 5 : 11) * e));
        c.setAttribute("r", f((m ? 2.5 : 3.5) + (m ? 3 : 5) * e));
        c.setAttribute("opacity", f(0.26 * (1 - e)));
      });
    });
  }

  let raf = 0, t = 0, last = performance.now(), finished = false;
  const restore = () => {
    cancelAnimationFrame(raf);
    for (const a of added) a.remove();
    glyphs.forEach((g, i) => {
      g.removeAttribute("opacity");
      g.setAttribute("transform", origT[i]);
    });
  };
  const tick = (now: number) => {
    t += Math.min(0.05, (now - last) / 1000); // 탭을 오래 비웠다 돌아와도 한 번에 건너뛰지 않음
    last = now;
    if (t >= END) {
      finished = true;
      restore();
      onDone();
      return;
    }
    render(t);
    raf = requestAnimationFrame(tick);
  };
  render(0); // 첫 그림을 바로 그려서, 숨겨 둔 글자가 잠깐이라도 다 보이는 일이 없게
  raf = requestAnimationFrame((now) => {
    last = now;
    raf = requestAnimationFrame(tick);
  });
  return () => {
    if (!finished) restore();
  };
}
