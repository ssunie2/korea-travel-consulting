// 실행: node --test app/mohallae/photo-ledger.test.ts
// 사진 대장(photo-ledger.ts) 규칙 — 같은 사진은 사이트에서 한 곳에만 쓴다 (써니 2026-10-30).
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { SEOUL_PHOTOS, SLOTS } from "./photo-ledger.ts";

const ROOT = join(import.meta.dirname, "..", "..");
const LEDGER_FILES = ["app/mohallae/photo-ledger.ts", "app/mohallae/photo-ledger.test.ts", "app/mohallae/photos.ts"];

/** 화면 코드 전부 (app · components · lib 의 .ts/.tsx). 대장·검사·photos.ts 는 뺀다 */
function sourceFiles(): { path: string; text: string }[] {
  const out: { path: string; text: string }[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name !== "node_modules" && !e.name.startsWith(".")) walk(full);
      } else if (/\.tsx?$/.test(e.name)) {
        const path = relative(ROOT, full);
        if (!LEDGER_FILES.includes(path)) out.push({ path, text: readFileSync(full, "utf8") });
      }
    }
  };
  for (const dir of ["app", "components", "lib"]) if (existsSync(join(ROOT, dir))) walk(join(ROOT, dir));
  return out;
}

/** 파일 안에서 사진 파일을 가리키는 곳들. "@/public/x.jpg" 와 "/x.jpg" 를 같은 "/x.jpg" 로 맞춘다. ${…} 로 만드는 주소는 셀 수 없어 뺀다 */
function imageRefs(text: string): string[] {
  const refs: string[] = [];
  for (const m of text.matchAll(/["'`]((?:@\/public)?\/[\w./-]+\.(?:jpe?g|png|webp|avif))["'`]/g)) {
    refs.push(m[1].replace(/^@\/public/, ""));
  }
  return refs;
}

const quoted = (s: string) => new RegExp(`["'\`]${s.replace(/\./g, "\\.")}["'\`]`, "g");

test("사진 id 는 겹치지 않고, 파일이 모두 있다", () => {
  const ids = SEOUL_PHOTOS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "id 가 겹친다");
  for (const id of ids) assert.ok(existsSync(join(ROOT, "public/mohallae/seoul", `${id}.jpg`)), `${id}.jpg 가 없다`);
});

test("photos.ts 는 대장의 사진을 빠짐없이, 대장에 있는 사진만 불러온다", () => {
  const text = readFileSync(join(ROOT, "app/mohallae/photos.ts"), "utf8");
  const imported = [...text.matchAll(/from "@\/public\/mohallae\/seoul\/([\w-]+)\.jpg"/g)].map((m) => m[1]);
  assert.deepEqual([...imported].sort(), SEOUL_PHOTOS.map((p) => p.id).sort());
});

test("자리 하나에 사진 하나 — 모든 자리에 사진이 딱 한 장씩 정해져 있다", () => {
  for (const slot of SLOTS) {
    const owners = SEOUL_PHOTOS.filter((p) => p.slot === slot).map((p) => p.id);
    assert.equal(owners.length, 1, `'${slot}' 자리의 사진: ${owners.join(", ") || "없음"}`);
  }
  for (const p of SEOUL_PHOTOS) {
    assert.ok(p.slot === null || (SLOTS as readonly string[]).includes(p.slot), `${p.id} 의 자리 '${p.slot}' 가 SLOTS 에 없다`);
  }
});

test("자리 이름은 화면 코드에 한 번만 나온다 — 같은 사진이 두 곳에 그려지지 않게", () => {
  const files = sourceFiles();
  for (const slot of SLOTS) {
    const uses = files.flatMap((f) => (f.text.match(quoted(slot)) ?? []).map(() => f.path));
    assert.equal(uses.length, 1, `'${slot}' 자리를 쓰는 곳: ${uses.join(", ") || "없음"}`);
  }
});

test("서울 사진 폴더(public/mohallae/seoul)는 photos.ts 만 불러온다", () => {
  for (const f of sourceFiles()) {
    assert.ok(!f.text.includes("mohallae/seoul/"), `${f.path} 가 서울 사진을 직접 불러온다 — photo("자리") 로 꺼내 주세요`);
  }
});

test("남산타워가 보이는 사진은 한 장까지", () => {
  assert.ok(SEOUL_PHOTOS.filter((p) => p.tower).length <= 1);
});

/**
 * 새 랜딩(/mohallae 첫 화면)이 쓰는 사진 파일은 랜딩 안에서 한 번만, 다른 화면과도 겹치지 않게.
 * 아직 남은 예외: 서울 밖 샘플 카드 두 장(부산·경주) — 입력 흐름의 엽서와 같은 파일이다.
 * 서울만 도는 새 샘플 초안으로 바꾸면 이 두 줄을 지운다.
 */
const KNOWN_SHARED = new Set(["/mohallae/postcard-busan.jpg", "/mohallae/postcard-gyeongju.jpg"]);

test("새 랜딩의 사진은 랜딩 안에서 한 번만, 다른 화면과 겹치지 않는다", () => {
  const isLanding = (p: string) =>
    p === "app/mohallae/page.tsx" || p === "app/mohallae/content.ts" || p.startsWith("app/mohallae/_components/");
  const files = sourceFiles();
  const landingRefs = files.filter((f) => isLanding(f.path)).flatMap((f) => imageRefs(f.text));
  const otherRefs = new Set(files.filter((f) => !isLanding(f.path)).flatMap((f) => imageRefs(f.text)));

  const seen = new Set<string>();
  for (const ref of landingRefs) {
    assert.ok(!seen.has(ref), `랜딩이 ${ref} 를 두 번 쓴다`);
    seen.add(ref);
    if (!KNOWN_SHARED.has(ref)) assert.ok(!otherRefs.has(ref), `랜딩의 ${ref} 를 다른 화면도 쓴다`);
  }
});
