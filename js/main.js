import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { VEHICLES, CATEGORIES, CATEGORY_META } from './data/index.js';

/* ---------------- 基础环境 ---------------- */
const stage = document.getElementById('canvas-wrap');

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;
renderer.domElement.style.display = 'block';
renderer.domElement.style.touchAction = 'none';
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
camera.position.set(7, 6, 9);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.minPolarAngle = 0.12;
controls.maxPolarAngle = Math.PI * 0.49;
controls.target.set(0, 1, 0);
controls.enablePan = false;
controls.autoRotateSpeed = 0.6;

/* 灯光 */
scene.add(new THREE.HemisphereLight(0xdfeaff, 0x2b3a52, 0.55));
scene.add(new THREE.AmbientLight(0xffffff, 0.08));

const sun = new THREE.DirectionalLight(0xfff6e8, 2.9);
sun.position.set(9, 14, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -11;
sun.shadow.camera.right = 11;
sun.shadow.camera.top = 13;
sun.shadow.camera.bottom = -8;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 45;
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.02;
scene.add(sun);

const rim = new THREE.DirectionalLight(0x88bbff, 0.7);
rim.position.set(-8, 6, -10);
scene.add(rim);

/* 环境反射，让车漆有光泽 */
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.05).texture;

/* 展台 */
const floorMat = new THREE.MeshStandardMaterial({ color: 0x0a1322, roughness: 1, metalness: 0 });
const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 72), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.34;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(50, 50, 0x2c4a78, 0x18273f);
grid.position.y = -0.31;
grid.material.transparent = true;
grid.material.opacity = 0.45;
scene.add(grid);

const plate = new THREE.Mesh(
  new THREE.CylinderGeometry(7.6, 7.9, 0.3, 72),
  new THREE.MeshStandardMaterial({ color: 0x16243c, roughness: 0.75, metalness: 0.25 })
);
plate.position.y = -0.15;
plate.receiveShadow = true;
scene.add(plate);

const ringMat = new THREE.MeshBasicMaterial({ color: 0x4ea8ff, transparent: true, opacity: 0.28 });
[7.35, 8.4].forEach((r, i) => {
  const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.06, 96), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012 + i * 0.001;
  scene.add(ring);
});

/* ---------------- 材质与几何缓存 ---------------- */
const matCache = new Map();
function getMaterial(pc) {
  // 玻璃单独用更光滑、更通透的参数，看起来才像车窗
  const metal = pc.metal !== undefined ? pc.metal : (pc.gl ? 0.1 : 0.28);
  const rough = pc.rough !== undefined ? pc.rough : (pc.gl ? 0.05 : 0.5);
  const opacity = pc.op !== undefined ? pc.op : (pc.gl ? 0.76 : 1);
  const isHull = pc.g === 'hull';
  const key = [pc.c, metal, rough, pc.gl ? 1 : 0, opacity, pc.e || 0, pc.ei || 1, isHull ? 1 : 0].join('|');
  if (matCache.has(key)) return matCache.get(key);
  // 车漆用物理材质加清漆层，反光更像真车；橡胶、玻璃不加
  const shiny = !pc.gl && rough <= 0.62;
  const m = new THREE.MeshPhysicalMaterial({
    color: pc.c,
    metalness: metal,
    roughness: rough,
    clearcoat: shiny ? 1 : pc.gl ? 0.5 : 0,
    clearcoatRoughness: shiny ? 0.1 : 0.28,
    envMapIntensity: pc.gl ? 0.65 : 0.72,
    transparent: !!pc.gl || opacity < 1,
    opacity,
    emissive: new THREE.Color(pc.e || 0x000000),
    emissiveIntensity: pc.ei || 1,
    side: pc.gl || isHull ? THREE.DoubleSide : THREE.FrontSide,
    depthWrite: pc.gl ? false : true
  });
  matCache.set(key, m);
  return m;
}

const geoCache = new Map();

// 圆角方块：把方盒的棱角收圆，车身就不会像纸盒
function roundedBox(w, h, d, r) {
  const seg = 3;
  const geo = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
  const pos = geo.attributes.position;
  const inner = new THREE.Vector3(
    Math.max(0.001, w / 2 - r),
    Math.max(0.001, h / 2 - r),
    Math.max(0.001, d / 2 - r)
  );
  const v = new THREE.Vector3();
  const c = new THREE.Vector3();
  const dir = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    c.set(
      Math.max(-inner.x, Math.min(inner.x, v.x)),
      Math.max(-inner.y, Math.min(inner.y, v.y)),
      Math.max(-inner.z, Math.min(inner.z, v.z))
    );
    dir.copy(v).sub(c);
    if (dir.lengthSq() < 1e-8) continue;
    dir.normalize();
    pos.setXYZ(i, c.x + dir.x * r, c.y + dir.y * r, c.z + dir.z * r);
  }
  geo.computeVertexNormals();
  return geo;
}

// 放样车身：把一串横截面平滑地连起来，做出有弧度的车壳，而不是堆方块
// sta: [z, 半宽, 半高, 中心高度]，横截面为超椭圆并带上下内收（tumble/tuck）
function hullGeometry(sta, pow = 3.6, tumble = 0.16, tuck = 0.12, seg = 26) {
  const rings = sta.map(([z, a, b, cy]) => {
    const ring = [];
    for (let i = 0; i < seg; i++) {
      const u = (i / seg) * Math.PI * 2;
      const cs = Math.cos(u);
      const sn = Math.sin(u);
      let x = Math.sign(cs) * Math.pow(Math.abs(cs), 2 / pow) * a;
      const y = Math.sign(sn) * Math.pow(Math.abs(sn), 2 / pow) * b;
      const k = y / b;
      x *= 1 - (k > 0 ? tumble * k : tuck * -k);
      ring.push([x, cy + y, z]);
    }
    return ring;
  });

  const verts = [];
  rings.forEach((r) => r.forEach((v) => verts.push(v[0], v[1], v[2])));
  const idx = [];
  for (let r = 0; r < rings.length - 1; r++) {
    for (let i = 0; i < seg; i++) {
      const i2 = (i + 1) % seg;
      const A = r * seg + i;
      const B = r * seg + i2;
      const C = (r + 1) * seg + i2;
      const D = (r + 1) * seg + i;
      idx.push(A, B, C, A, C, D);
    }
  }
  // 前后封口
  verts.push(0, sta[0][3], sta[0][0]);
  const c0 = verts.length / 3 - 1;
  for (let i = 0; i < seg; i++) idx.push(c0, (i + 1) % seg, i);
  const lastBase = (rings.length - 1) * seg;
  verts.push(0, sta[sta.length - 1][3], sta[sta.length - 1][0]);
  const c1 = verts.length / 3 - 1;
  for (let i = 0; i < seg; i++) idx.push(c1, lastBase + i, lastBase + ((i + 1) % seg));

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function getGeometry(pc) {
  const key = pc.g === 'hull'
    ? 'hull:' + JSON.stringify([pc.sta, pc.pow, pc.tumble, pc.tuck, pc.seg])
    : pc.g + ':' + pc.s.join(',');
  if (geoCache.has(key)) return geoCache.get(key);
  let geo;
  switch (pc.g) {
    case 'hull': geo = hullGeometry(pc.sta, pc.pow, pc.tumble, pc.tuck, pc.seg); break;
    case 'arch': geo = new THREE.TorusGeometry(pc.s[0], pc.s[1], 8, 20, Math.PI); break;
    case 'box': {
      const min = Math.min(pc.s[0], pc.s[1], pc.s[2]);
      const r = Math.min(0.1, min * 0.26);
      geo = r > 0.004 ? roundedBox(pc.s[0], pc.s[1], pc.s[2], r) : new THREE.BoxGeometry(pc.s[0], pc.s[1], pc.s[2]);
      break;
    }
    case 'cyl': geo = new THREE.CylinderGeometry(pc.s[0], pc.s[1], pc.s[2], Math.max(20, pc.s[3])); break;
    case 'sphere': geo = new THREE.SphereGeometry(pc.s[0], 24, 18); break;
    case 'torus': geo = new THREE.TorusGeometry(pc.s[0], pc.s[1], pc.s[2], pc.s[3]); break;
    case 'cone': geo = new THREE.ConeGeometry(pc.s[0], pc.s[1], Math.max(20, pc.s[2])); break;
    default: geo = new THREE.BoxGeometry(1, 1, 1);
  }
  geoCache.set(key, geo);
  return geo;
}

/* ---------------- 车辆与零件 ---------------- */
const vehicleRoot = new THREE.Group();
scene.add(vehicleRoot);

const markerRoot = new THREE.Group();
markerRoot.visible = false;
vehicleRoot.add(markerRoot);

/* 特效层：零件装好时扩散的光圈 */
const fxRoot = new THREE.Group();
scene.add(fxRoot);
const fxList = [];

function spawnRing(pos, color = 0x6ee7ff) {
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(0.16, 0.3, 36),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(pos.x, 0.03, pos.z);
  fxRoot.add(mesh);
  fxList.push({ mesh, t: 0, life: 0.62 });
}

function updateFx(dt) {
  for (let i = fxList.length - 1; i >= 0; i--) {
    const e = fxList[i];
    e.t += dt;
    const k = e.t / e.life;
    if (k >= 1) {
      e.mesh.geometry.dispose();
      e.mesh.material.dispose();
      fxRoot.remove(e.mesh);
      fxList.splice(i, 1);
      continue;
    }
    e.mesh.scale.setScalar(1 + k * 3.6);
    e.mesh.material.opacity = 0.9 * (1 - k) * (1 - k);
  }
}

const parts = [];
let currentVehicle = VEHICLES[0];
let scatterRadius = 3.2;
let baseMaxDim = 4;
let baseCenterY = 1;

function clearVehicle() {
  teardownRig();
  vehicleRoot.children.slice().forEach((c) => { if (c !== markerRoot) vehicleRoot.remove(c); });
  while (markerRoot.children.length) {
    const m = markerRoot.children.pop();
    if (m.geometry) m.geometry.dispose();
    if (m.material) m.material.dispose();
  }
  parts.length = 0;
}

function buildVehicle(def) {
  clearVehicle();
  markerRoot.visible = false;

  def.parts.forEach((pd, index) => {
    const group = new THREE.Group();
    group.position.set(pd.pos[0], pd.pos[1], pd.pos[2]);
    group.userData.part = null;

    pd.pieces.forEach((pc) => {
      const mesh = new THREE.Mesh(getGeometry(pc), getMaterial(pc));
      mesh.position.set(pc.p[0], pc.p[1], pc.p[2]);
      if (pc.r) mesh.rotation.set(pc.r[0], pc.r[1], pc.r[2]);
      mesh.castShadow = !pc.gl;
      mesh.receiveShadow = !pc.gl;
      mesh.userData.baseY = mesh.position.y;
      group.add(mesh);
    });

    const part = {
      def: pd,
      index,
      group,
      home: new THREE.Vector3(pd.pos[0], pd.pos[1], pd.pos[2]),
      offset: new THREE.Vector3(...(pd.off || [0, 0.9, 0])),
      target: new THREE.Vector3(pd.pos[0], pd.pos[1], pd.pos[2]),
      state: 'placed',
      phase: index * 1.7,
      restY: 0.03,
      foot: 1,
      flashMats: [],
      marker: null,
      hop: 0,
      pop: 0,
      rigParent: null
    };
    group.userData.part = part;
    parts.push(part);
    vehicleRoot.add(group);
  });

  vehicleRoot.updateMatrixWorld(true);

  // 组装模式的幽灵框
  parts.forEach((p) => {
    const bb = new THREE.Box3().setFromObject(p.group);
    const size = bb.getSize(new THREE.Vector3());
    const center = bb.getCenter(new THREE.Vector3());
    // 散落时贴地摆放：把零件最低点落到地面高度
    p.restY = 0.03 - (bb.min.y - p.home.y);
    p.foot = Math.max(size.x, size.z);
    const boxGeo = new THREE.BoxGeometry(
      Math.max(size.x, 0.3) + 0.05,
      Math.max(size.y, 0.3) + 0.05,
      Math.max(size.z, 0.3) + 0.05
    );
    const edges = new THREE.EdgesGeometry(boxGeo);
    boxGeo.dispose();
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
      color: 0x4ea8ff, transparent: true, opacity: 0.55
    }));
    line.position.copy(center);
    line.visible = false;
    p.marker = line;
    markerRoot.add(line);

    if (p.def.anim === 'flash') {
      p.group.children.forEach((m) => {
        m.material = m.material.clone();
        m.material.transparent = false;
        p.flashMats.push(m.material);
      });
    }
  });

  // 记录整车尺寸，用于相机取景（不受零件散落影响）
  const vbb = new THREE.Box3().setFromObject(vehicleRoot);
  const vsize = vbb.getSize(new THREE.Vector3());
  baseMaxDim = Math.max(vsize.x, vsize.y, vsize.z, 3.2);
  baseCenterY = vbb.getCenter(new THREE.Vector3()).y;
  scatterRadius = Math.min(5.6, Math.max(4.4, baseMaxDim * 0.9));
}

let camZoom = 1;

function fitCamera(zoom = 1) {
  camZoom = zoom;
  const maxDim = baseMaxDim;
  // 竖屏时横向视野更窄，需要拉远一点才能看全
  const aspectFactor = Math.max(0.62, Math.min(1, camera.aspect / 1.55));
  const dist = (maxDim * 1.45 + 3.2) * zoom / aspectFactor;

  controls.target.set(0, Math.max(0.55, Math.min(1.6, baseCenterY * 0.72)), 0);
  const dir = new THREE.Vector3(0.66, 0.46, 0.92).normalize();
  camera.position.copy(controls.target).add(dir.multiplyScalar(dist));
  camera.lookAt(controls.target);
  controls.minDistance = maxDim * 0.55;
  controls.maxDistance = dist * 2.6;
  controls.update();
}

// 相机所在的方位角：零件散落时以它为基准，从车后方开始摆
const CAM_AZIMUTH = Math.atan2(0.92, 0.66);

function updateScatter() {
  // 大零件摆到车后方，小零件才允许靠近镜头一侧，避免挡住视线
  const sorted = parts.slice().sort((a, b) => b.foot - a.foot);
  const n = sorted.length;
  sorted.forEach((p, i) => {
    const angle = CAM_AZIMUTH + Math.PI / 2 + (i / n) * Math.PI * 2 + (i % 2 ? 0.05 : -0.05);
    const r = scatterRadius + (i % 3) * 0.34 + (p.foot > 2.2 ? 0.4 : 0);
    p.group.position.set(
      Math.cos(angle) * r,
      p.restY,
      Math.sin(angle) * r
    );
    p.target.copy(p.group.position);
  });
}

/* ---------------- 工程机械的机械臂联动 ---------------- */
// 演示时把斗杆挂到动臂、铲斗挂到斗杆上，动起来整条臂才会连在一起
const RIGS = {
  excavator: { stick: 'boom', bucket: 'stick' },
  crane: { hook: 'boom' }
};
let rigActive = false;

function setupRig() {
  const rig = RIGS[currentVehicle.id];
  if (!rig) return;
  Object.entries(rig).forEach(([childId, parentId]) => {
    const child = parts.find((p) => p.def.id === childId);
    const parent = parts.find((p) => p.def.id === parentId);
    if (!child || !parent) return;
    child.group.position.copy(child.home).sub(parent.home);
    child.group.rotation.set(0, 0, 0);
    parent.group.add(child.group);
    child.rigParent = parent;
  });
  rigActive = true;
}

function teardownRig() {
  if (!rigActive) return;
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (!p.rigParent) continue;
    p.group.rotation.set(0, 0, 0);
    p.group.position.copy(p.home);
    vehicleRoot.add(p.group);
    p.rigParent = null;
  }
  rigActive = false;
}

/* ---------------- 交互状态 ---------------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-10, -10);
const dragPlane = new THREE.Plane();
const clock = new THREE.Clock();

let mode = 'explore';
let dragging = null;
let dragOffset = new THREE.Vector3();
let hovered = null;
let downInfo = null;

let soundOn = true;
let winShown = false;
let celebrateT = 0;
let completed = new Set();
try {
  completed = new Set(JSON.parse(localStorage.getItem('vl-completed') || '[]'));
} catch (e) { completed = new Set(); }

/* ---------------- UI ---------------- */
const $ = (id) => document.getElementById(id);

function buildGarage() {
  const list = $('garage-list');
  list.innerHTML = '';
  CATEGORIES.forEach((cat) => {
    const items = VEHICLES.filter((v) => v.category === cat);
    if (!items.length) return;
    const label = document.createElement('div');
    label.className = 'cat-label';
    label.textContent = CATEGORY_META[cat].icon + ' ' + cat;
    list.appendChild(label);
    items.forEach((v) => {
      const el = document.createElement('div');
      el.className = 'veh-item';
      el.dataset.id = v.id;
      el.innerHTML =
        '<div class="veh-icon">' + v.icon + '</div>' +
        '<div class="veh-meta"><div class="veh-name">' + v.name + '</div>' +
        '<div class="veh-sub">' + v.parts.length + ' 个零件</div></div>' +
        '<div class="veh-done">✔</div>';
      el.addEventListener('click', () => selectVehicle(v.id));
      list.appendChild(el);
    });
  });
  $('garage-count').textContent = VEHICLES.length + ' 辆';
  refreshGarageState();
}

function refreshGarageState() {
  document.querySelectorAll('.veh-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.id === currentVehicle.id);
    el.classList.toggle('done', completed.has(el.dataset.id));
  });
}

function selectVehicle(id) {
  const v = VEHICLES.find((x) => x.id === id);
  if (!v) return;
  currentVehicle = v;
  hideCard();
  hidePrinciple();
  hideCelebrate();
  buildVehicle(v);
  fitCamera();
  $('vi-icon').textContent = v.icon;
  $('vi-name').textContent = v.name;
  $('vi-tag').textContent = v.category;
  $('vi-intro').textContent = v.intro;
  $('pp-icon').textContent = v.icon;
  $('pp-title').textContent = v.intro;
  $('pp-steps').innerHTML = v.steps.map((s) => '<li>' + s + '</li>').join('');
  setMode('explore', true);
  sfx('select');
  refreshGarageState();
  hint('点一点零件，看看它是什么～');
}

function setMode(m, silent) {
  mode = m;
  winShown = false;
  if (!silent) sfx('mode');
  document.querySelectorAll('.mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
  hideCard();
  teardownRig();
  parts.forEach((p) => {
    p.group.rotation.set(0, 0, 0);
    p.group.scale.setScalar(1);
    p.hop = 0;
    p.pop = 0;
    p.group.children.forEach((m) => {
      if (m.userData.baseY !== undefined) m.position.y = m.userData.baseY;
    });
    p.marker.visible = false;
    if (p.marker) p.marker.material.opacity = 0.55;
  });
  hovered = null;
  markerRoot.visible = false;

  if (m === 'assemble') {
    markerRoot.visible = true;
    updateScatter();
    parts.forEach((p) => {
      p.state = 'detached';
      p.marker.visible = false;
    });
    fitCamera(1.55);
    if (!silent) hint('把零件拖进蓝色框框，把汽车装好！');
  } else {
    parts.forEach((p) => {
      p.state = 'placed';
      p.target.copy(p.home);
      p.group.position.copy(p.home);
    });
    fitCamera(1);
    if (m === 'demo' && !silent) {
      $('principle-panel').classList.remove('hidden');
      hint('发动机、车轮和机械臂动起来啦！');
    }
  }

  if (m === 'demo') {
    setupRig();
    startEngine();
    controls.autoRotate = true;
  } else {
    stopEngine();
    controls.autoRotate = false;
  }

  refreshProgress();
}

function refreshProgress() {
  const total = parts.length;
  if (!total) return;
  let label = '';
  let value = 0;
  if (mode === 'assemble') {
    const done = parts.filter((p) => p.state === 'placed').length;
    label = '已装好 ' + done + ' / ' + total;
    value = done / total;
  } else if (mode === 'explore') {
    const off = parts.filter((p) => p.state !== 'placed').length;
    label = '已拆下 ' + off + ' / ' + total;
    value = off / total;
  } else {
    label = '运转演示中…';
    value = 1;
  }
  $('progress-text').textContent = label;
  $('progress-fill').style.width = Math.round(value * 100) + '%';
}

function showCard(part) {
  $('card-dot').style.background = part.def.color;
  $('card-dot').style.color = part.def.color;
  $('card-name').textContent = part.def.name;
  $('card-desc').textContent = part.def.desc;
  $('card-tip').textContent = part.def.tip;
  $('card-hint').textContent =
    mode === 'explore' ? '再点一次可以装回去' :
    mode === 'assemble' ? '按住它，拖到蓝色框框的位置' : '运转演示中，观察它怎么工作';
  $('part-card').classList.remove('hidden');
  $('principle-panel').classList.add('hidden');
}

function hideCard() { $('part-card').classList.add('hidden'); }
function hidePrinciple() { $('principle-panel').classList.add('hidden'); }

function togglePrinciple() {
  const panel = $('principle-panel');
  if (panel.classList.contains('hidden')) {
    panel.classList.remove('hidden');
    hideCard();
  } else {
    panel.classList.add('hidden');
  }
}

function hideCelebrate() {
  $('celebrate').classList.add('hidden');
  celebrateT = 0;
  vehicleRoot.position.y = 0;
  controls.autoRotate = mode === 'demo';
}

let hintTimer = null;
function hint(text, ms) {
  const el = $('hint-bubble');
  el.textContent = text;
  el.classList.remove('hidden');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => el.classList.add('hidden'), ms || 2300);
}

/* ---------------- 音效（WebAudio 合成，无外部音频文件） ---------------- */
let audioCtx = null;
let masterGain = null;
let engineNodes = null;
let noiseBuf = null;

function ensureAudio() {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.9;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch (e) {
    return null;
  }
}

// 单个音符：f 起始频率，opt.to 结束频率（滑音），opt.at 延迟
function tone(f, dur, opt = {}) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const t0 = ctx.currentTime + (opt.at || 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opt.type || 'triangle';
  osc.frequency.setValueAtTime(f, t0);
  if (opt.to) osc.frequency.exponentialRampToValueAtTime(Math.max(24, opt.to), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(opt.gain || 0.12, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

// 一小段噪声：金属碰撞、风声、沙沙声都用它
function noise(dur, opt = {}) {
  const ctx = ensureAudio();
  if (!ctx) return;
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.5), ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const filt = ctx.createBiquadFilter();
  filt.type = opt.type || 'bandpass';
  filt.frequency.value = opt.freq || 1400;
  filt.Q.value = opt.q || 1;
  const gain = ctx.createGain();
  const t0 = ctx.currentTime + (opt.at || 0);
  gain.gain.setValueAtTime(opt.gain || 0.08, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filt).connect(gain).connect(masterGain);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

const SFX = {
  pick() { tone(560, 0.055, { type: 'square', gain: 0.05 }); noise(0.04, { freq: 2600, gain: 0.04 }); },
  detach() { tone(430, 0.2, { to: 150, type: 'sawtooth', gain: 0.06 }); noise(0.16, { freq: 700, gain: 0.07, q: 0.7 }); },
  pop() { tone(620, 0.16, { to: 300, type: 'sine', gain: 0.08 }); },
  snap() {
    tone(165, 0.14, { to: 60, type: 'square', gain: 0.08 });
    noise(0.07, { freq: 2000, gain: 0.1, q: 0.6 });
    tone(1250, 0.05, { gain: 0.04, at: 0.01 });
  },
  error() { tone(320, 0.12, { to: 210, gain: 0.05 }); tone(210, 0.18, { to: 140, gain: 0.05, at: 0.11 }); },
  mode() { tone(520, 0.07, { gain: 0.06 }); tone(780, 0.1, { gain: 0.06, at: 0.08 }); },
  select() { tone(180, 0.45, { to: 90, type: 'sawtooth', gain: 0.04 }); noise(0.28, { freq: 520, gain: 0.03 }); },
  win() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.5, { gain: 0.1, at: i * 0.11 }));
    noise(0.5, { freq: 3200, gain: 0.03, type: 'highpass', at: 0.44 });
  }
};

function sfx(type) {
  if (!soundOn) return;
  try { (SFX[type] || SFX.pop)(); } catch (e) { /* 忽略音频错误 */ }
}

// 演示模式下的低频发动机轰鸣（持续音）
function startEngine() {
  if (!soundOn || engineNodes) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, t0);
  out.gain.exponentialRampToValueAtTime(0.045, t0 + 0.7);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 380;
  lp.Q.value = 2;
  const o1 = ctx.createOscillator();
  o1.type = 'sawtooth';
  o1.frequency.value = 62;
  const o2 = ctx.createOscillator();
  o2.type = 'square';
  o2.frequency.value = 31;
  o2.detune.value = 14;
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 5.2;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 3.5;
  lfo.connect(lfoGain);
  lfoGain.connect(o1.frequency);
  o1.connect(lp);
  o2.connect(lp);
  lp.connect(out);
  out.connect(masterGain);
  [o1, o2, lfo].forEach((o) => o.start(t0));
  engineNodes = { out, oscs: [o1, o2, lfo] };
}

function stopEngine() {
  if (!engineNodes) return;
  if (!audioCtx) { engineNodes = null; return; }
  const t = audioCtx.currentTime;
  const { out, oscs } = engineNodes;
  out.gain.cancelScheduledValues(t);
  out.gain.setValueAtTime(Math.max(0.0002, out.gain.value), t);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  oscs.forEach((o) => o.stop(t + 0.45));
  engineNodes = null;
}

/* ---------------- 交互 ---------------- */
function setPointer(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function pickPart() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(parts.map((p) => p.group), true);
  if (!hits.length) return null;
  let obj = hits[0].object;
  while (obj && !obj.userData.part) obj = obj.parent;
  return obj ? obj.userData.part : null;
}

function onPointerDown(e) {
  if (e.button !== undefined && e.button !== 0) return;
  setPointer(e);
  const part = pickPart();
  downInfo = { x: e.clientX, y: e.clientY, part: part, moved: false };
  if (mode === 'assemble' && part && part.state !== 'placed') {
    dragging = part;
    part.state = 'dragging';
    controls.enabled = false;
    dragPlane.setFromNormalAndCoplanarPoint(
      camera.getWorldDirection(new THREE.Vector3()).normalize(),
      part.group.position.clone()
    );
    const hitPoint = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(dragPlane, hitPoint)) {
      dragOffset.copy(part.group.position).sub(hitPoint);
    } else {
      dragOffset.set(0, 0, 0);
    }
    if (hovered) { hovered.group.scale.setScalar(1); hovered = null; }
    hideTooltip();
    syncMarkers(part);
    sfx('pick');
  }
}

function onPointerMove(e) {
  if (!downInfo) {
    updateHover(e);
    return;
  }
  if (Math.abs(e.clientX - downInfo.x) + Math.abs(e.clientY - downInfo.y) > 6) downInfo.moved = true;
  if (dragging) {
    setPointer(e);
    raycaster.setFromCamera(pointer, camera);
    const pt = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(dragPlane, pt)) {
      pt.add(dragOffset);
      pt.x = Math.max(-14, Math.min(14, pt.x));
      pt.z = Math.max(-14, Math.min(14, pt.z));
      pt.y = Math.max(Math.min(dragging.restY, 0.4), pt.y);
      dragging.group.position.copy(pt);
    }
    hideTooltip();
  }
}

function onPointerUp() {
  if (!downInfo) return;
  if (dragging) {
    const p = dragging;
    dragging = null;
    controls.enabled = true;
    // 屏幕上的位置也很接近时同样算装好（抵消拖拽平面带来的深度偏差）
    const rect = renderer.domElement.getBoundingClientRect();
    const sp = p.group.position.clone().project(camera);
    const sh = p.home.clone().project(camera);
    const screenDist = Math.hypot((sp.x - sh.x) * rect.width / 2, (sp.y - sh.y) * rect.height / 2);
    if (p.group.position.distanceTo(p.home) < 1.05 || screenDist < 60) {
      placePart(p);
    } else {
      p.state = 'detached';
      p.target.set(p.group.position.x, p.restY, p.group.position.z);
      sfx('pop');
      hint('再靠近一点点就能装好啦～');
    }
    syncMarkers(null);
    refreshProgress();
  } else if (!downInfo.moved && downInfo.part) {
    handleClick(downInfo.part);
  }
  downInfo = null;
}

function handleClick(part) {
  showCard(part);
  if (mode === 'explore') {
    if (part.state === 'placed') {
      part.state = 'detached';
      part.target.copy(part.home).add(part.offset);
      part.hop = 0.001;
      sfx('detach');
    } else {
      part.state = 'returning';
      part.target.copy(part.home);
      part.pop = 1;
      spawnRing(part.home);
      sfx('snap');
    }
    refreshProgress();
  } else if (mode === 'assemble' && part.state !== 'placed') {
    hint('按住零件，把它拖到蓝色框框的位置～');
    if (part.marker) {
      part.marker.visible = true;
      const m = part.marker;
      setTimeout(() => { if (m && hovered !== part) m.visible = false; }, 1100);
    }
  }
}

function placePart(part) {
  part.state = 'returning';
  part.target.copy(part.home);
  if (part.marker) part.marker.visible = false;
  part.pop = 1;
  spawnRing(part.home);
  sfx('snap');
  refreshProgress();
}

function checkWin() {
  if (winShown) return;
  winShown = true;
  completed.add(currentVehicle.id);
  try { localStorage.setItem('vl-completed', JSON.stringify(Array.from(completed))); } catch (e) {}
  refreshGarageState();
  $('celebrate-title').textContent = '组装完成！';
  $('celebrate-sub').textContent =
    '你把「' + currentVehicle.name + '」的 ' + parts.length + ' 个零件全部装好啦！';
  $('celebrate-stars').textContent = '⭐⭐⭐';
  $('celebrate').classList.remove('hidden');
  sfx('win');
  spawnConfetti();
  celebrateT = 3.4;
  controls.autoRotate = true;
  parts.forEach((p, i) => {
    if (i % 2 === 0) setTimeout(() => spawnRing(p.home, 0xffc857), i * 90);
  });
}

function spawnConfetti() {
  const wrap = $('celebrate');
  wrap.querySelectorAll('.confetti').forEach((c) => c.remove());
  const colors = ['#4ea8ff', '#ffc857', '#4bd18a', '#ff6b6b', '#b78bff', '#ffffff'];
  for (let i = 0; i < 46; i++) {
    const d = document.createElement('div');
    d.className = 'confetti';
    d.style.left = Math.random() * 100 + '%';
    d.style.background = colors[Math.floor(Math.random() * colors.length)];
    d.style.animationDelay = (Math.random() * 0.7) + 's';
    d.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
    d.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    wrap.appendChild(d);
  }
}

// 组装模式下，只在悬停/拖拽某零件时显示它的蓝色幽灵框
function syncMarkers(part) {
  if (mode !== 'assemble') return;
  parts.forEach((p) => {
    if (p.marker) p.marker.visible = (p === part && p.state !== 'placed');
  });
}

function updateHover(e) {
  if (e.target !== renderer.domElement) {
    if (hovered) { hovered.group.scale.setScalar(1); hovered = null; }
    $('tooltip').classList.add('hidden');
    syncMarkers(null);
    return;
  }
  const part = pickPart();
  const tip = $('tooltip');
  if (part) {
    if (hovered !== part) {
      if (hovered) hovered.group.scale.setScalar(1);
      hovered = part;
      part.group.scale.setScalar(1.045);
      syncMarkers(part);
    }
    tip.textContent = part.def.name;
    tip.classList.remove('hidden');
    const rect = stage.getBoundingClientRect();
    tip.style.left = (e.clientX - rect.left) + 'px';
    tip.style.top = (e.clientY - rect.top) + 'px';
    renderer.domElement.style.cursor = mode === 'assemble' && part.state !== 'placed' ? 'grab' : 'pointer';
  } else {
    if (hovered) { hovered.group.scale.setScalar(1); hovered = null; }
    tip.classList.add('hidden');
    syncMarkers(null);
    renderer.domElement.style.cursor = 'grab';
  }
}

function hideTooltip() {
  $('tooltip').classList.add('hidden');
  if (hovered) { hovered.group.scale.setScalar(1); hovered = null; }
}

function explodeAll() {
  if (mode === 'assemble') {
    setMode('assemble');
    return;
  }
  if (mode === 'demo') setMode('explore', true);
  parts.forEach((p, i) => {
    p.state = 'detached';
    p.target.copy(p.home).add(p.offset);
    setTimeout(() => { p.hop = 0.001; }, i * 55);
  });
  refreshProgress();
  sfx('detach');
  hint('所有零件都拆下来啦，点零件看它的本领～');
}

function attachAll(instant) {
  parts.forEach((p) => {
    p.state = 'returning';
    p.target.copy(p.home);
    p.hop = 0;
    if (p.marker) p.marker.visible = false;
    if (instant) {
      p.group.position.copy(p.home);
      p.state = 'placed';
    }
  });
  if (instant) {
    parts.forEach((p) => p.group.rotation.set(0, 0, 0));
  }
  refreshProgress();
}

/* ---------------- 逐帧更新 ---------------- */
function updateParts(dt, t) {
  const rigged = !!RIGS[currentVehicle.id];
  parts.forEach((p) => {
    // 被机械臂挂接的零件用的是相对坐标，不能再自己飞回原位
    if (p.state !== 'dragging' && !(rigActive && p.rigParent)) {
      p.group.position.lerp(p.target, 1 - Math.exp(-dt * 8.5));
      if (p.state === 'returning' && p.group.position.distanceTo(p.target) < 0.12) {
        p.group.position.copy(p.target);
        p.state = 'placed';
        refreshProgress();
        if (mode === 'assemble' && parts.every((q) => q.state === 'placed')) checkWin();
      }
    }

    // 拆下瞬间的小跳
    if (p.hop > 0 && p.hop < 1) p.hop = Math.min(1, p.hop + dt / 0.55);
    const hopY = p.hop > 0 && p.hop < 1 ? Math.sin(p.hop * Math.PI) * 0.4 : 0;

    // 装好时的弹跳 + 悬停脉冲
    if (p.pop > 0) p.pop = Math.max(0, p.pop - dt * 2.6);
    const hoverK = hovered === p ? 1.045 + Math.sin(t * 5 + p.phase) * 0.012 : 1;
    p.group.scale.setScalar(hoverK + p.pop * 0.3);

    const id = p.def.id;

    if (mode === 'demo') {
      if (p.def.spin === 'x') p.group.rotation.x += dt * 7.5;
      if (p.def.anim === 'spin') p.group.rotation.z += dt * 2.1;
      if (id === 'steering') p.group.rotation.z = Math.sin(t * 1.6 + p.phase) * 0.5;
      if (rigged) {
        if (id === 'boom') p.group.rotation.x = Math.sin(t * 1.0) * 0.18;
        else if (id === 'stick') p.group.rotation.x = Math.sin(t * 1.0 - 0.8) * 0.26;
        else if (id === 'bucket') p.group.rotation.x = Math.sin(t * 1.0 - 1.5) * 0.45;
        else if (id === 'hook') p.group.rotation.z = Math.sin(t * 1.4) * 0.05;
      }
    }

    if (p.def.anim === 'flash' && p.flashMats.length) {
      const pulse = 0.5 + Math.sin(t * 8 + p.phase) * 0.5;
      p.flashMats.forEach((m) => { m.emissiveIntensity = 1.3 + pulse * 1.7; });
    }

    let animY = 0;
    if (mode === 'demo' && p.state === 'placed') {
      const a = p.def.anim;
      if (a === 'swing' && !rigged) p.group.rotation.x = Math.sin(t * 1.1 + p.phase) * 0.32;
      else if (a === 'bob') animY = Math.sin(t * 1.5 + p.phase) * 0.12;
      else if (a === 'shake') animY = Math.sin(t * 24 + p.phase * 3) * 0.012;
    }

    p.group.children.forEach((m) => {
      if (m.userData.baseY !== undefined) m.position.y = m.userData.baseY + hopY + animY;
    });
  });
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  updateParts(dt, t);
  updateFx(dt);

  if (celebrateT > 0) {
    celebrateT -= dt;
    // 高兴地跳一跳
    vehicleRoot.position.y = Math.abs(Math.sin(t * 7)) * 0.14 * Math.min(1, celebrateT / 1.2);
    if (celebrateT <= 0) {
      vehicleRoot.position.y = 0;
      controls.autoRotate = mode === 'demo';
    }
  } else if (mode === 'demo') {
    vehicleRoot.position.y = Math.sin(t * 2.2) * 0.025;
  } else {
    vehicleRoot.position.y = 0;
  }

  controls.update();
  renderer.render(scene, camera);
}

function resize() {
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h);
  const prevAspect = camera.aspect;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (parts.length && Math.abs(prevAspect - camera.aspect) > 0.05) fitCamera(camZoom);
}

/* ---------------- 事件绑定 ---------------- */
renderer.domElement.addEventListener('pointerdown', onPointerDown);
// 浏览器要求先有一次用户操作才能播放声音，这里做一次性解锁
window.addEventListener('pointerdown', () => { if (soundOn) ensureAudio(); }, { once: true });
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
window.addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);

document.querySelectorAll('.mode-btn').forEach((b) => {
  b.addEventListener('click', () => setMode(b.dataset.mode));
});
$('btn-explode').addEventListener('click', explodeAll);
$('btn-attach').addEventListener('click', () => { attachAll(false); hideCard(); });
$('btn-reset').addEventListener('click', fitCamera);
$('btn-principle').addEventListener('click', togglePrinciple);
$('principle-close').addEventListener('click', hidePrinciple);
$('card-close').addEventListener('click', hideCard);
$('btn-sound').addEventListener('click', () => {
  soundOn = !soundOn;
  $('btn-sound').textContent = soundOn ? '🔊 音效' : '🔇 静音';
  $('btn-sound').setAttribute('aria-pressed', String(soundOn));
  if (soundOn) {
    sfx('pop');
    if (mode === 'demo') startEngine();
  } else {
    stopEngine();
  }
});
$('btn-again').addEventListener('click', () => { hideCelebrate(); setMode('assemble'); });
$('btn-next').addEventListener('click', () => {
  hideCelebrate();
  const idx = VEHICLES.findIndex((v) => v.id === currentVehicle.id);
  selectVehicle(VEHICLES[(idx + 1) % VEHICLES.length].id);
});

/* ---------------- 启动 ---------------- */
buildGarage();
setMode('explore', true);
selectVehicle(VEHICLES[0].id);
resize();
animate();

/* 便于自动化测试的调试接口（仅在 ?debug=1 时开启） */
if (location.search.indexOf('debug') !== -1) {
  window.__VL = {
    parts,
    camera,
    renderer,
    scene,
    controls,
    VEHICLES,
    setMode,
    selectVehicle,
    get current() { return currentVehicle; },
    project(v) {
      const p = v.clone().project(camera);
      const r = renderer.domElement.getBoundingClientRect();
      return {
        x: (p.x * 0.5 + 0.5) * r.width + r.left,
        y: (-p.y * 0.5 + 0.5) * r.height + r.top
      };
    },
    placeAll() {
      parts.forEach((p) => {
        p.group.position.copy(p.home);
        p.target.copy(p.home);
        p.state = 'placed';
        p.marker.visible = false;
      });
      refreshProgress();
    }
  };
}

