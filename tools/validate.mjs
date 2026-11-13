// 数据契约校验：不依赖浏览器和 three.js，直接读 js/data 的导出做静态检查。
// 用法：npm run validate
import { VEHICLES, CATEGORIES } from '../js/data/index.js';
import { CATALOG, CATEGORIES as CATALOG_CATEGORIES, CATEGORY_META as CATALOG_META, loadVehicle } from '../js/data/catalog.js';

const KINDS = new Set(['box', 'cyl', 'torus', 'sphere', 'lathe', 'hull', 'glass', 'cone', 'arch']);
const SPINS = new Set(['x', 'y', 'z']);
const COLOR = /^#[0-9a-f]{6}$/i;

const errors = [];
const warns = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warns.push(`${where}: ${msg}`);

const isNum = (n) => typeof n === 'number' && Number.isFinite(n);
const isVec3 = (v) => Array.isArray(v) && v.length === 3 && v.every(isNum);
const isText = (s) => typeof s === 'string' && s.trim().length > 0;
const vec = (v) => (isVec3(v) ? v.join(',') : String(v));

const vehicleIds = new Set();
let partCount = 0;
let pieceCount = 0;

VEHICLES.forEach((v) => {
  const vi = `车型 ${v.id}`;
  if (!isText(v.id)) fail(vi, '缺少 id');
  if (vehicleIds.has(v.id)) fail(vi, 'id 重复');
  vehicleIds.add(v.id);

  if (!isText(v.name)) fail(vi, '缺少 name');
  if (!isText(v.icon)) fail(vi, '缺少 icon');
  if (!COLOR.test(v.color || '')) fail(vi, `color 不是 #rrggbb：${v.color}`);
  if (!CATEGORIES.includes(v.category)) fail(vi, `category 不在分类里：${v.category}`);
  if (!isText(v.intro)) fail(vi, '缺少 intro');
  if (!Array.isArray(v.steps) || v.steps.length < 3 || v.steps.length > 5) {
    fail(vi, `steps 应为 3~5 条，实际 ${v.steps && v.steps.length}`);
  } else if (!v.steps.every(isText)) {
    fail(vi, 'steps 里有空条目');
  }

  if (!Array.isArray(v.parts) || !v.parts.length) {
    fail(vi, '没有 parts');
    return;
  }
  if (v.parts.length < 6 || v.parts.length > 10) {
    warn(vi, `part 数 ${v.parts.length}，规范是 6~8（最多 10）`);
  }

  const partIds = new Set();
  v.parts.forEach((p, pi) => {
    partCount++;
    const where = `${vi} / 零件 ${p.id || '#' + pi}`;
    if (!isText(p.id)) fail(where, '缺少 id');
    if (partIds.has(p.id)) fail(where, '零件 id 重复');
    partIds.add(p.id);

    if (!isText(p.name)) fail(where, '缺少 name');
    if (!COLOR.test(p.color || '')) fail(where, `color 不是 #rrggbb：${p.color}`);
    if (!isText(p.desc)) fail(where, '缺少 desc');
    if (!isText(p.tip)) fail(where, '缺少 tip');
    if (!isVec3(p.pos)) fail(where, `pos 必须是三元数组：${vec(p.pos)}`);
    if (!isVec3(p.off)) fail(where, `off 必须是三元数组：${vec(p.off)}`);
    if (p.spin !== undefined && !SPINS.has(p.spin)) fail(where, `spin 只能是 x/y/z：${p.spin}`);

    if (!Array.isArray(p.pieces) || !p.pieces.length) {
      fail(where, 'pieces 为空');
      return;
    }
    const pcs = p.pieces.filter((pc) => pc && !Array.isArray(pc) && isVec3(pc.p));
    // 旋转零件的支点是 group 原点，几何体偏离旋转轴的话演示模式会绕着轴外的点甩
    if (p.spin && pcs.length) {
      const c = pcs.reduce((a, pc) => [a[0] + pc.p[0] / pcs.length, a[1] + pc.p[1] / pcs.length, a[2] + pc.p[2] / pcs.length], [0, 0, 0]);
      // 只量到旋转轴的垂直距离：绕 y 轴转时高度不影响，绕 x 轴转时左右不影响
      const perp = { x: [1, 2], y: [0, 2], z: [0, 1] }[p.spin];
      const dist = Math.hypot(c[perp[0]], c[perp[1]]);
      if (dist > 0.24) {
        warn(where, `spin='${p.spin}' 零件的几何中心离旋转轴 ${dist.toFixed(2)}，演示时会绕轴外的点甩`);
      }
    }
    p.pieces.forEach((pc, qi) => {
      pieceCount++;
      const pw = `${where} / pieces[${qi}]`;
      if (Array.isArray(pc)) {
        fail(pw, 'pieces 里出现数组：lamp / tailLamp 返回的是数组，必须用 flatMap 展开');
        return;
      }
      if (!pc || typeof pc !== 'object') {
        fail(pw, `不是对象：${String(pc)}`);
        return;
      }
      if (!isVec3(pc.p)) fail(pw, `p 必须是三元数组：${vec(pc.p)}`);
      else if (pc.p.some((n) => Math.abs(n) > 30)) warn(pw, `坐标过大，检查单位：${vec(pc.p)}`);
      if (pc.g !== undefined && !KINDS.has(pc.g)) fail(pw, `未知几何类型：${pc.g}`);
      if (pc.r !== undefined && !isVec3(pc.r)) fail(pw, `r 必须是三元数组：${vec(pc.r)}`);
    });
  });
});

if (VEHICLES.length !== vehicleIds.size) {
  fail('车库', `VEHICLES 里有重复 id（${VEHICLES.length} 项 / ${vehicleIds.size} 个唯一 id）`);
}

/* ---------------- catalog：车库元数据与懒加载映射 ---------------- */
// catalog.js 由 tools/catalog.mjs 生成，这里确认它没有和数据文件脱节
if (CATALOG_CATEGORIES.join(',') !== CATEGORIES.join(',')) {
  fail('catalog', `分类列表与 index.js 不一致：${CATALOG_CATEGORIES.join(',')} / ${CATEGORIES.join(',')}`);
}
CATEGORIES.forEach((c) => {
  const m = CATALOG_META[c];
  if (!m || !isText(m.icon) || !COLOR.test(m.color || '')) fail('catalog', `分类 ${c} 的 icon/color 缺失`);
});

if (CATALOG.length !== VEHICLES.length) {
  fail('catalog', `车型数不一致：catalog ${CATALOG.length} / index.js ${VEHICLES.length}，请重新跑 npm run catalog`);
} else {
  for (let i = 0; i < CATALOG.length; i++) {
    const meta = CATALOG[i];
    const def = VEHICLES[i];
    const where = `catalog ${meta.id}`;
    if (meta.id !== def.id) {
      fail(where, `顺序与 index.js 不一致：第 ${i} 台应为 ${def.id}，请重新跑 npm run catalog`);
      continue;
    }
    ['name', 'icon', 'category', 'color'].forEach((k) => {
      if (meta[k] !== def[k]) fail(where, `${k} 与数据不一致：${meta[k]} / ${def[k]}`);
    });
    if (meta.partCount !== def.parts.length) {
      fail(where, `partCount 与数据不一致：${meta.partCount} / ${def.parts.length}`);
    }
    try {
      const loaded = await loadVehicle(meta.id);
      if (loaded !== def) fail(where, 'loadVehicle 加载到的对象不是数据文件里的那一台');
    } catch (e) {
      fail(where, 'loadVehicle 失败：' + e.message);
    }
  }
}

const summary = `${VEHICLES.length} 台车 / ${partCount} 个零件 / ${pieceCount} 个零件块`;
if (warns.length) {
  console.log(`\n⚠️  ${warns.length} 条提醒：`);
  warns.forEach((w) => console.log('  - ' + w));
}
if (errors.length) {
  console.log(`\n❌ ${errors.length} 个错误：`);
  errors.forEach((e) => console.log('  - ' + e));
  console.log(`\n${summary}，校验未通过`);
  process.exit(1);
}
console.log(`\n✅ 校验通过：${summary}，无错误`);
