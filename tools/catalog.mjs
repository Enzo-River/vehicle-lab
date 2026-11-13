// 生成 js/data/catalog.js：车库需要的元数据 + 按数据文件切分的懒加载函数。
// 用法：npm run catalog
// 数据文件新增/改名后重新跑一次，validate 会检查 catalog 与 VEHICLES 是否一致。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { VEHICLES, CATEGORIES, CATEGORY_META } from '../js/data/index.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../js/data');
const skip = new Set(['index.js', 'catalog.js', 'common.js']);
const files = fs.readdirSync(dir)
  .filter((f) => f.endsWith('.js') && !skip.has(f))
  .sort();

// 车型对象 → 所在的文件名（去掉 .js）
const owner = new Map();
for (const file of files) {
  const mod = await import(pathToFileURL(path.join(dir, file)).href);
  Object.values(mod).forEach((v) => {
    if (v && typeof v === 'object' && typeof v.id === 'string' && typeof v.name === 'string' && Array.isArray(v.parts)) {
      owner.set(v, file.replace(/\.js$/, ''));
    }
  });
}

const missing = VEHICLES.filter((v) => !owner.has(v));
if (missing.length) {
  console.error('❌ 这些车型找不到所在数据文件：' + missing.map((v) => v.id).join(', '));
  process.exit(1);
}

// 文件按第一次出现的顺序排列，生成的产物读起来和数据加载顺序一致
const fileOrder = [];
const entryFile = new Map();
VEHICLES.forEach((v) => {
  const file = owner.get(v);
  if (!fileOrder.includes(file)) fileOrder.push(file);
  entryFile.set(v.id, file);
});

const q = (s) => JSON.stringify(s);
const catalogLines = VEHICLES.map((v) => {
  const fields = [
    'id: ' + q(v.id),
    'name: ' + q(v.name),
    'icon: ' + q(v.icon),
    'category: ' + q(v.category),
    'color: ' + q(v.color),
    'partCount: ' + v.parts.length,
    'file: ' + q(entryFile.get(v.id))
  ];
  return '  { ' + fields.join(', ') + ' }';
});

const loaderLines = fileOrder.map((f) => `  ${q(f)}: () => import('./${f}.js')`);

const out = `// 由 tools/catalog.mjs 生成，请勿手改：npm run catalog
// 车库列表只依赖这里的元数据，点开某台车时再加载它所在的数据文件，
// 这样首屏不用把所有数据文件全部下载解析。

export const CATEGORIES = ${JSON.stringify(CATEGORIES)};

export const CATEGORY_META = ${JSON.stringify(CATEGORY_META, null, 2)};

export const CATALOG = [
${catalogLines.join(',\n')}
];

// 每个数据文件一个加载器，import() 的模块由浏览器缓存，重复切换不会重复下载
const LOADERS = {
${loaderLines.join(',\n')}
};

const byId = new Map(CATALOG.map((v) => [v.id, v]));
const fileCache = new Map();

export function loadVehicle(id) {
  const meta = byId.get(id);
  if (!meta) return Promise.reject(new Error('未知车型：' + id));
  let pending = fileCache.get(meta.file);
  if (!pending) {
    pending = LOADERS[meta.file]().then((mod) => {
      const map = new Map();
      Object.values(mod).forEach((v) => {
        if (v && typeof v === 'object' && typeof v.id === 'string' && Array.isArray(v.parts)) map.set(v.id, v);
      });
      return map;
    });
    fileCache.set(meta.file, pending);
  }
  return pending.then((map) => {
    const def = map.get(id);
    if (!def) throw new Error('数据文件 ' + meta.file + ' 里找不到车型：' + id);
    return def;
  });
}
`;

const target = path.join(dir, 'catalog.js');
fs.writeFileSync(target, out);
console.log(`✅ 已生成 js/data/catalog.js：${VEHICLES.length} 台车 / ${fileOrder.length} 个数据文件`);
