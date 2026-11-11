// 通用颜色与几何零件小工具（纯数据，不依赖 three.js）
export const C = {
  glass: 0x101c26,
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

// 车底结构：地板、门槛梁、副车架、传动轴、排气、油箱与下摆臂
// 让车底不再是一块随便塞进去的薄板，从侧下方看也有完整的机械结构
export function underbody(o = {}) {
  const {
    hw = 0.86,      // 车身半宽
    y = 0.3,        // 地板高度
    zf = 1.42,      // 前轴位置
    zr = -1.42,     // 后轴位置
    z0 = -2.0,      // 车尾内缘
    z1 = 2.0        // 车头内缘
  } = o;
  const mid = (zf + zr) / 2;
  const span = Math.abs(z1 - z0);
  const out = [
    // 地板总成
    box(hw * 1.44, 0.055, span * 0.8, 0x1b2027, 0, y - 0.03, mid),
    // 两侧门槛梁（下边梁），车身侧面的底边靠它收口
    box(0.11, 0.13, span * 0.74, 0x2a3038, -hw * 0.92, y + 0.02, mid),
    box(0.11, 0.13, span * 0.74, 0x2a3038, hw * 0.92, y + 0.02, mid),
    // 中央传动通道
    box(0.36, 0.11, span * 0.6, 0x232830, 0, y + 0.07, mid),
    // 前后副车架横梁
    box(hw * 1.66, 0.1, 0.17, 0x2a3038, 0, y + 0.02, zf - 0.1),
    box(hw * 1.66, 0.1, 0.17, 0x2a3038, 0, y + 0.02, zr + 0.1),
    // 传动轴
    cyl(0.055, 0.055, Math.abs(zf - zr) * 0.92, 0x8f969e, 0, y, mid,
      { r: [Math.PI / 2, 0, 0], seg: 14, metal: 0.7, rough: 0.3 }),
    // 排气管与消音器
    cyl(0.045, 0.045, span * 0.86, 0x8a9098, -hw * 0.4, y - 0.02, mid,
      { r: [Math.PI / 2, 0, 0], seg: 12, metal: 0.75, rough: 0.35 }),
    box(0.3, 0.13, 0.46, 0x9aa4ad, -hw * 0.4, y - 0.02, zr + 0.3, { metal: 0.6, rough: 0.4 }),
    // 燃油箱
    box(0.44, 0.15, 0.52, 0x3a3f45, hw * 0.44, y + 0.01, zr + 0.52),
    // 四轮下摆臂，把车轮和副车架连起来
    ...[-1, 1].flatMap((sx) => [zf, zr].map((z) => box(0.3, 0.07, 0.11, 0x3a3f45,
      sx * hw * 0.72, y + 0.02, z, { metal: 0.35, rough: 0.55 })))
  ];
  return out;
}

// 旋转剖面零件（轮胎等）：prof 为 [[半径, 轴向坐标], ...]，绕轴旋转成实体
export const lathe = (prof, color, x = 0, y = 0, z = 0, o = {}) =>
  ({ g: 'lathe', prof, c: color, p: [x, y, z], s: [0, 0, 0], ...o });

// 一只车轮：轮胎 + 胎面花纹 + 轮辋 + 辐条 + 刹车盘，轴向沿 X 轴
export function wheelSet(radius, width, rim = 0xd8d8d8, spokes = 5) {
  const hw = width / 2;
  const Rr = radius * 0.665;   // 轮辋半径：轮胎扁平比接近现代乘用车
  const H = radius - Rr;       // 胎侧高度
  const xf = hw * 0.84;        // 轮辋外端面，比胎侧略微内凹
  const ps = [];

  // 轮胎：剖面旋转成型，胎肩圆弧、胎侧鼓包、胎圈收口都有，不再是圆柱
  const prof = [
    [Rr, -hw * 0.78],
    [Rr + H * 0.16, -hw * 0.96],
    [Rr + H * 0.42, -hw * 1.0],
    [Rr + H * 0.7, -hw * 0.94],
    [Rr + H * 0.88, -hw * 0.78],
    [radius - 0.02, -hw * 0.58],
    [radius - 0.005, -hw * 0.3],
    [radius, 0],
    [radius - 0.005, hw * 0.3],
    [radius - 0.02, hw * 0.58],
    [Rr + H * 0.88, hw * 0.78],
    [Rr + H * 0.7, hw * 0.94],
    [Rr + H * 0.42, hw * 1.0],
    [Rr + H * 0.16, hw * 0.96],
    [Rr, hw * 0.78],
    [Rr * 0.99, hw * 0.34],
    [Rr * 0.99, -hw * 0.34]
  ];
  ps.push(lathe(prof, 0x151515, 0, 0, 0, { seg: 56, rough: 0.95, metal: 0 }));

  // 胎面花纹：两排交错的浅凸块，远看是细密的橡胶纹路
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    ps.push(box(width * 0.4, 0.008, 0.045, 0x0c0c0c,
      -width * 0.24, Math.cos(a) * radius, Math.sin(a) * radius,
      { r: [a, 0, 0], rough: 1, metal: 0 }));
    ps.push(box(width * 0.4, 0.008, 0.045, 0x0c0c0c,
      width * 0.24, Math.cos(a + 0.12) * radius, Math.sin(a + 0.12) * radius,
      { r: [a + 0.12, 0, 0], rough: 1, metal: 0 }));
  }

  [-1, 1].forEach((side) => {
    const x = side * xf;
    // 轮辋内桶：深色背板让辐条之间看进去是空的，不再是一块实心饼
    ps.push(cyl(Rr * 0.84, Rr * 0.84, 0.02, 0x0d0e10, side * width * 0.22, 0, 0,
      { r: [0, 0, Math.PI / 2], seg: 44, rough: 0.9, metal: 0.1 }));
    // 轮辋外圈：一圈折边，铝圈的厚度感
    ps.push(tor(Rr * 0.93, 0.026, rim, side * width * 0.36, 0, 0,
      { r: [0, Math.PI / 2, 0], metal: 0.88, rough: 0.22 }));
    // 轮辋外唇：亮面抛光的边缘
    ps.push(tor(Rr * 0.9, 0.012, rim, x, 0, 0,
      { r: [0, Math.PI / 2, 0], metal: 0.95, rough: 0.12 }));

    // 刹车盘与卡钳：透过辐条能看到的机械细节
    ps.push(cyl(Rr * 0.7, Rr * 0.7, 0.016, 0x8a9098, side * width * 0.28, 0, 0,
      { r: [0, 0, Math.PI / 2], seg: 44, metal: 0.95, rough: 0.42 }));
    ps.push(cyl(Rr * 0.28, Rr * 0.28, 0.03, 0x4a4f55, side * width * 0.3, 0, 0,
      { r: [0, 0, Math.PI / 2], seg: 28, metal: 0.85, rough: 0.35 }));
    ps.push(box(0.05, Rr * 0.3, Rr * 0.15, 0x8f3128,
      side * width * 0.3, Math.cos(2.3) * Rr * 0.62, Math.sin(2.3) * Rr * 0.62,
      { r: [2.3, 0, 0], metal: 0.35, rough: 0.5 }));

    // 双辐条：一根主辐条拆成两片，中间留缝，才有现代铝合金轮圈的味道
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * Math.PI * 2;
      [-1, 1].forEach((k) => {
        const d = k * 0.025;
        ps.push(box(0.03, Rr * 0.58, 0.042, rim,
          x, Math.cos(a) * Rr * 0.44 - Math.sin(a) * d, Math.sin(a) * Rr * 0.44 + Math.cos(a) * d,
          { r: [a, 0, 0], metal: 0.86, rough: 0.2 }));
      });
    }
    // 中心轮毂与轮毂盖
    ps.push(cyl(Rr * 0.24, Rr * 0.24, 0.055, 0x2b2e32, x, 0, 0,
      { r: [0, 0, Math.PI / 2], seg: 28, metal: 0.75, rough: 0.3 }));
    ps.push(cyl(Rr * 0.15, Rr * 0.15, 0.022, rim, side * (xf + 0.03), 0, 0,
      { r: [0, 0, Math.PI / 2], seg: 24, metal: 0.92, rough: 0.14 }));
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
