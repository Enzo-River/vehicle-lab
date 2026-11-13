// 逐台切换车型，收集页面报错；需要先 npm start 起本地服务。
// 用法：npm run audit            （全部车型）
//       npm run audit -- tbm sedan
import puppeteer from 'puppeteer-core';
import { BASE_URL, launchOptions } from './lib/browser.mjs';
import { VEHICLES } from '../js/data/index.js';

const ids = process.argv.slice(2);
const browser = await puppeteer.launch(launchOptions());
const page = await browser.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await page.setCacheEnabled(false);
await page.goto(`${BASE_URL}/index.html?debug=1`, { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForFunction('window.__VL && window.__VL.selectVehicle', { timeout: 30000 });

const list = ids.length ? ids : VEHICLES.map((v) => v.id);
for (const id of list) {
  await page.evaluate((v) => window.__VL.selectVehicle(v), id);
  await new Promise((r) => setTimeout(r, 220));
}
console.log(errs.length ? errs.join('\n') : 'NO ERRORS');
await browser.close();
process.exit(errs.length ? 1 : 0);
