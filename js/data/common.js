// 通用颜色与几何零件小工具（纯数据，不依赖 three.js）
export const C = {
  glass: 0x2f5673,
  rubber: 0x1c1c1c,
  dark: 0x24262b,
  steel: 0x9aa4ad,
  chrome: 0xc9ced4,
  yellow: 0xf0b81d,
  red: 0xd63232,
  blue: 0x2f6fd0,
  green: 0x3f8a4f,
  orange: 0xe28a2b,
  white: 0xecedf0,
  black: 0x1b1b1b
};

// 便捷构建函数：坐标单位约等于米
export const box = (w, h, d, color, x = 0, y = 0, z = 0, o = {}) =>
  ({ g: 'box', s: [w, h, d], c: color, p: [x, y, z], ...o });

export const cyl = (rt, rb, h, color, x = 0, y = 0, z = 0, o = {}) =>
  ({ g: 'cyl', s: [rt, rb, h, o.seg || 18], c: color, p: [x, y, z], ...o });

export const tor = (R, t, color, x = 0, y = 0, z = 0, o = {}) =>
  ({ g: 'torus', s: [R, t, o.rs || 10, o.ts || 24], c: color, p: [x, y, z], ...o });

export const sph = (r, color, x = 0, y = 0, z = 0, o = {}) =>
  ({ g: 'sphere', s: [r], c: color, p: [x, y, z], ...o });

export const cone = (r, h, color, x = 0, y = 0, z = 0, o = {}) =>
  ({ g: 'cone', s: [r, h, o.seg || 16], c: color, p: [x, y, z], ...o });

// 一只车轮：轮胎 + 轮辋 + 辐条，轴向沿 X 轴
export function wheelSet(radius, width, rim = 0xd8d8d8, spokes = 5) {
  const ps = [
    cyl(radius, radius, width, 0x1c1c1c, 0, 0, 0, { r: [0, 0, Math.PI / 2], seg: 22, rough: 0.9, metal: 0.1 }),
    cyl(radius * 0.62, radius * 0.62, width * 1.04, rim, 0, 0, 0, { r: [0, 0, Math.PI / 2], seg: 18, rough: 0.35, metal: 0.5 })
  ];
  for (let i = 0; i < spokes; i++) {
    ps.push(box(width * 1.06, radius * 1.08, 0.05, rim, 0, 0, 0, {
      r: [i * Math.PI / spokes, 0, 0], metal: 0.45, rough: 0.4
    }));
  }
  ps.push(cyl(radius * 0.17, radius * 0.17, width * 1.12, 0x333333, 0, 0, 0, { r: [0, 0, Math.PI / 2], seg: 10 }));
  return ps;
}

// 生成四个车轮零件定义（每个轮子单独可拆，学习位置名称）
export function fourWheels(cfg) {
  const { r, w, x, zf, zr, rim } = cfg;
  const list = [
    { id: 'wf_l', name: '左前轮', x: -x, z: zf },
    { id: 'wf_r', name: '右前轮', x: x, z: zf },
    { id: 'wr_l', name: '左后轮', x: -x, z: zr },
    { id: 'wr_r', name: '右后轮', x: x, z: zr }
  ];
  return list.map((it) => ({
    id: it.id,
    name: it.name,
    desc: '车轮转动，汽车才能前进；轮胎上的花纹能抓住地面。',
    tip: '轮胎里的空气能减震，让坐车更舒服。',
    color: '#3a3a3a',
    pos: [it.x, r, it.z],
    off: [Math.sign(it.x) * 1.5, 0.15, 0],
    spin: 'x',
    pieces: wheelSet(r, w, rim)
  }));
}
