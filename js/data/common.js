// 通用颜色与几何零件小工具（纯数据，不依赖 three.js）
export const C = {
  glass: 0x1d3140,
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

// 平滑放样车身：sta = [[z, 半宽, 半高, 中心高度], ...]，从后往前排列
export const hull = (sta, color, o = {}) =>
  ({ g: 'hull', sta, c: color, p: [0, 0, 0], s: [0, 0, 0], ...o });

// 贴合车壳曲面的车窗玻璃：沿 hull 的同一段横截面取一块曲面片
// z0/z1 为车窗在车身方向的范围，u0/u1 为横截面上的角度范围（u=π/2 是车顶，u=π 是左侧）
export const glassPatch = (sta, color, o = {}) => ({
  g: 'glass', sta, c: color, p: [0, 0, 0], s: [0, 0, 0], gl: 1,
  pow: 3.6, tumble: 0.16, tuck: 0.12, segZ: 8, segU: 12, off: 0.006,
  ...o
});

// 轮眉圆环（半圆），平放在车轮所在的竖直平面里
export const arch = (R, t, color, x = 0, y = 0, z = 0, o = {}) =>
  ({ g: 'arch', s: [R, t, 8], c: color, p: [x, y, z], r: [0, Math.PI / 2, 0], ...o });

// 前大灯总成：深色灯腔 + 镀铬反光碗 + 双透镜 + 日行灯导光条 + 外侧转向灯
// (x,y,z) 是灯腔中心，朝 +Z 安装；w/h 是灯罩尺寸
export function lamp(x, y, z, w = 0.32, h = 0.13, o = {}) {
  const d = o.d ?? 0.06;
  const f = z + d / 2;
  const side = x >= 0 ? 1 : -1;
  const ps = [
    box(w, h, d, 0x0e1216, x, y, z, { rough: 0.5, metal: 0.35 }),
    box(w * 0.9, h * 0.76, 0.012, 0x2b333c, x, y, f + 0.002, { metal: 0.92, rough: 0.2 }),
    ...(o.single
      ? [cyl(h * 0.4, h * 0.4, 0.016, 0xdce8f5, x, y, f + 0.012, {
          r: [Math.PI / 2, 0, 0], seg: 18, e: 0xc9dcff, ei: 0.3, metal: 0.6, rough: 0.08
        })]
      : [
          cyl(h * 0.3, h * 0.3, 0.016, 0xdce8f5, x - w * 0.24, y, f + 0.012, {
            r: [Math.PI / 2, 0, 0], seg: 18, e: 0xc9dcff, ei: 0.32, metal: 0.6, rough: 0.08
          }),
          cyl(h * 0.3, h * 0.3, 0.016, 0xdce8f5, x + w * 0.24, y, f + 0.012, {
            r: [Math.PI / 2, 0, 0], seg: 18, e: 0xc9dcff, ei: 0.32, metal: 0.6, rough: 0.08
          })
        ]),
    box(w * 0.84, h * 0.09, 0.01, 0xf2f7ff, x, y + h * 0.36, f + 0.01, { e: 0xdfeaff, ei: 0.45 })
  ];
  if (o.turn !== false) {
    ps.push(box(w * 0.14, h * 0.46, 0.01, 0xffa62b, x + side * w * 0.41, y - h * 0.02, f + 0.011, {
      e: 0xff9a1a, ei: 0.45
    }));
  }
  return ps;
}

// 尾灯总成：深色灯腔 + 双层红色导光条 + 外侧琥珀转向段，朝 -Z 安装
export function tailLamp(x, y, z, w = 0.34, h = 0.12, o = {}) {
  const d = o.d ?? 0.05;
  const f = z - d / 2;
  const side = x >= 0 ? 1 : -1;
  return [
    box(w, h, d, 0x140c0e, x, y, z, { rough: 0.45, metal: 0.3 }),
    box(w * 0.92, h * 0.74, 0.012, 0x5e1116, x, y, f - 0.002, { metal: 0.4, rough: 0.28 }),
    box(w * 0.86, h * 0.11, 0.01, 0xff3b34, x, y + h * 0.28, f - 0.01, { e: 0xff2a22, ei: 0.5 }),
    box(w * 0.86, h * 0.11, 0.01, 0xff3b34, x, y - h * 0.28, f - 0.01, { e: 0xff2a22, ei: 0.5 }),
    box(w * 0.14, h * 0.5, 0.01, 0xffb02a, x + side * w * 0.4, y, f - 0.011, { e: 0xffa31a, ei: 0.4 })
  ];
}

// 一只车轮：轮胎 + 胎面花纹 + 轮辋 + 辐条 + 刹车盘，轴向沿 X 轴
export function wheelSet(radius, width, rim = 0xd8d8d8, spokes = 5) {
  const ps = [
    // 轮胎主体（橡胶，粗糙不反光）
    cyl(radius, radius, width, 0x161616, 0, 0, 0, { r: [0, 0, Math.PI / 2], seg: 32, rough: 0.96, metal: 0.02 }),
    // 两侧胎肩的圆角
    tor(radius - 0.026, 0.028, 0x1b1b1b, width / 2 - 0.012, 0, 0, { r: [0, Math.PI / 2, 0], rough: 0.9, metal: 0.02 }),
    tor(radius - 0.026, 0.028, 0x1b1b1b, -width / 2 + 0.012, 0, 0, { r: [0, Math.PI / 2, 0], rough: 0.9, metal: 0.02 }),
    // 胎面花纹块
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => {
      const a = (i / 16) * Math.PI * 2;
      return box(width * 0.9, 0.028, 0.06, 0x101010, 0, Math.cos(a) * radius, Math.sin(a) * radius, {
        r: [a, 0, 0], rough: 1, metal: 0
      });
    }),
  ];
  // 轮胎两侧都是实心端面，轮辋必须贴在最外侧才能看见
  [-1, 1].forEach((side) => {
    const xFace = side * (width / 2 + 0.012);
    // 深色轮辋底板（辐条之间的空隙就是它）
    ps.push(cyl(radius * 0.58, radius * 0.58, 0.024, 0x0d0e10, xFace, 0, 0, {
      r: [0, 0, Math.PI / 2], seg: 30, rough: 0.95, metal: 0
    }));
    // 轮辋外圈亮边
    ps.push(tor(radius * 0.585, 0.02, rim, xFace + side * 0.012, 0, 0, {
      r: [0, Math.PI / 2, 0], rough: 0.18, metal: 0.75
    }));
    // 辐条呈放射状，辐条之间能看到深色底板，才有铝合金轮圈的样子
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2;
      ps.push(box(0.045, radius * 0.5, 0.06, rim,
        xFace + side * 0.016, Math.cos(a) * radius * 0.34, Math.sin(a) * radius * 0.34,
        { r: [a, 0, 0], metal: 0.62, rough: 0.24 }));
    }
    // 中心轮毂 + 轮毂盖
    ps.push(cyl(radius * 0.2, radius * 0.2, 0.05, 0x9aa4ad, xFace + side * 0.02, 0, 0, {
      r: [0, 0, Math.PI / 2], seg: 22, metal: 0.6, rough: 0.3
    }));
    ps.push(cyl(radius * 0.095, radius * 0.095, 0.06, 0x24262b, xFace + side * 0.024, 0, 0, {
      r: [0, 0, Math.PI / 2], seg: 18, metal: 0.4, rough: 0.4
    }));
  });
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
