// 本地校验脚本共用的浏览器启动配置。
// Chrome 路径优先取 CHROME 环境变量，其次找常见的 macOS 安装位置。
import fs from 'node:fs';

const CANDIDATES = [
  process.env.CHROME,
  '/tmp/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  '/Applications/Chromium.app/Contents/MacOS/Chromium'
];

export const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8080';

export function chromePath() {
  const found = CANDIDATES.find((p) => p && fs.existsSync(p));
  if (!found) {
    throw new Error('找不到 Chrome，请用 CHROME=/path/to/chrome 指定可执行文件');
  }
  return found;
}

export function launchOptions(viewport) {
  return {
    executablePath: chromePath(),
    headless: true,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
    defaultViewport: viewport || { width: 1100, height: 820 }
  };
}
