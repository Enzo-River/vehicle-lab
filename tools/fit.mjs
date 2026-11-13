// 四视角截图，用于人工复核穿模/悬空/比例。需要先 npm start 起本地服务。
// 用法：npm run fit -- tbm sedan
//       npm run fit -- --view=side tbm
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BASE_URL, launchOptions } from './lib/browser.mjs';

const W = 1100;
const H = 820;
const ids = process.argv.slice(2).filter((s) => !s.startsWith('--'));
const only = process.argv.find((s) => s.startsWith('--view='));
const views = only ? [only.split('=')[1]] : ['q34', 'side', 'front', 'rear'];
const DIRS = {
  q34: [0.85, 0.5, 1],
  side: [1, 0.12, 0.02],
  front: [0.06, 0.22, 1],
  rear: [-0.06, 0.22, -1]
};
const OUT = process.env.SHOTS_DIR || path.join(os.tmpdir(), 'vl-shots');
fs.mkdirSync(OUT, { recursive: true });
if (!ids.length) {
  console.error('请至少指定一个车型 id，例如：npm run fit -- tbm');
  process.exit(1);
}

const browser = await puppeteer.launch(launchOptions({ width: W, height: H }));

for (const id of ids) {
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.setCacheEnabled(false);
  await page.goto(`${BASE_URL}/index.html?debug=1`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction('window.__VL && window.__VL.selectVehicle', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 500));
  await page.evaluate((v) => window.__VL.selectVehicle(v), id);
  await new Promise((r) => setTimeout(r, 700));

  const bb = await page.evaluate(() => {
    const v = window.__VL, b = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, z0: 1e9, z1: -1e9 };
    for (const p of v.parts) p.group.traverse((o) => {
      if (!o.isMesh) return;
      o.geometry.computeBoundingBox();
      const t = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
      b.x0 = Math.min(b.x0, t.min.x); b.x1 = Math.max(b.x1, t.max.x);
      b.y0 = Math.min(b.y0, t.min.y); b.y1 = Math.max(b.y1, t.max.y);
      b.z0 = Math.min(b.z0, t.min.z); b.z1 = Math.max(b.z1, t.max.z);
    });
    return b;
  });

  const cx = (bb.x0 + bb.x1) / 2, cy = (bb.y0 + bb.y1) / 2, cz = (bb.z0 + bb.z1) / 2;
  const w = bb.x1 - bb.x0, h = bb.y1 - bb.y0, l = bb.z1 - bb.z0;
  const tanV = Math.tan((42 * Math.PI) / 180 / 2), tanH = tanV * (W / H);
  const need = Math.max(w / (2 * tanH), h / (2 * tanV), l / (2 * tanH));
  const d = need * 1.3;

  for (const view of views) {
    const dir = DIRS[view];
    const n = Math.hypot(...dir);
    const pos = [cx + (dir[0] / n) * d, cy + (dir[1] / n) * d + 0.3, cz + (dir[2] / n) * d];
    await page.evaluate(([p, t]) => {
      const v = window.__VL;
      v.camera.position.set(...p);
      v.controls.target.set(...t);
      v.controls.update();
      v.camera.updateMatrixWorld();
    }, [pos, [cx, cy, cz]]);
    await new Promise((r) => setTimeout(r, 260));
    await page.screenshot({ path: path.join(OUT, `c-${id}-${view}.png`) });
  }
  console.log(`${id}${errs.length ? ' ERR ' + errs.join(' | ') : ' ok'}`);
  await page.close();
}
await browser.close();
