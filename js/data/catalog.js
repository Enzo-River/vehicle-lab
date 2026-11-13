// 由 tools/catalog.mjs 生成，请勿手改：npm run catalog
// 车库列表只依赖这里的元数据，点开某台车时再加载它所在的数据文件，
// 这样首屏不用把所有数据文件全部下载解析。

export const CATEGORIES = ["家用车","特种车","工程车","农用车"];

export const CATEGORY_META = {
  "家用车": {
    "icon": "🚘",
    "color": "#2f6fd0"
  },
  "特种车": {
    "icon": "🚨",
    "color": "#d63232"
  },
  "工程车": {
    "icon": "🏗️",
    "color": "#f0b81d"
  },
  "农用车": {
    "icon": "🌾",
    "color": "#3f8a4f"
  }
};

export const CATALOG = [
  { id: "sedan", name: "小轿车", icon: "🚗", category: "家用车", color: "#2f6fd0", partCount: 10, file: "cars" },
  { id: "sports", name: "跑车", icon: "🏎️", category: "家用车", color: "#d22b2b", partCount: 10, file: "cars" },
  { id: "suv", name: "越野车 SUV", icon: "🚙", category: "家用车", color: "#3b7d52", partCount: 10, file: "cars" },
  { id: "pickup", name: "皮卡", icon: "🛻", category: "家用车", color: "#e28a2b", partCount: 10, file: "cars2" },
  { id: "minivan", name: "面包车", icon: "🚐", category: "家用车", color: "#3d5a73", partCount: 10, file: "cars3" },
  { id: "boxtruck", name: "厢式货车", icon: "🚐", category: "特种车", color: "#e8eef3", partCount: 7, file: "machines" },
  { id: "semitruck", name: "半挂卡车", icon: "🚛", category: "特种车", color: "#c8372d", partCount: 10, file: "trailers" },
  { id: "containertruck", name: "集装箱车", icon: "📦", category: "特种车", color: "#2f5a9e", partCount: 8, file: "trailers" },
  { id: "cartransporter", name: "汽车运输车", icon: "🚚", category: "特种车", color: "#c8372d", partCount: 10, file: "trailers" },
  { id: "reeftruck", name: "冷藏车", icon: "❄️", category: "特种车", color: "#eef2f5", partCount: 10, file: "trucks3" },
  { id: "towtruck", name: "清障车", icon: "🛠️", category: "特种车", color: "#f2c230", partCount: 10, file: "trucks3" },
  { id: "doublebus", name: "双层巴士", icon: "🚌", category: "特种车", color: "#d23b3b", partCount: 10, file: "trucks3" },
  { id: "schoolbus", name: "校车", icon: "🚌", category: "特种车", color: "#f2b31c", partCount: 10, file: "special2" },
  { id: "rv", name: "房车", icon: "🚐", category: "特种车", color: "#f2f4f6", partCount: 10, file: "special2" },
  { id: "bus", name: "公交车", icon: "🚌", category: "家用车", color: "#f0c020", partCount: 10, file: "special" },
  { id: "police", name: "警车", icon: "🚓", category: "特种车", color: "#1b3a8f", partCount: 10, file: "cars2" },
  { id: "firetruck", name: "消防车", icon: "🚒", category: "特种车", color: "#cc2222", partCount: 10, file: "special" },
  { id: "ambulance", name: "救护车", icon: "🚑", category: "特种车", color: "#f2f4f8", partCount: 10, file: "special" },
  { id: "laddertruck", name: "消防云梯车", icon: "🚒", category: "特种车", color: "#c0271f", partCount: 10, file: "special3" },
  { id: "snowplow", name: "除雪车", icon: "❄️", category: "特种车", color: "#e0662a", partCount: 10, file: "special3" },
  { id: "sewagetruck", name: "吸污车", icon: "🚛", category: "特种车", color: "#2f6fd0", partCount: 9, file: "special3" },
  { id: "watertruck", name: "洒水车", icon: "💧", category: "特种车", color: "#3f8fb0", partCount: 7, file: "machines" },
  { id: "garbagetruck", name: "垃圾车", icon: "🗑️", category: "特种车", color: "#2f7d4f", partCount: 7, file: "machines" },
  { id: "sweeper", name: "道路清扫车", icon: "🧹", category: "特种车", color: "#1f8a70", partCount: 7, file: "machines" },
  { id: "tankertruck", name: "油罐车", icon: "🛢️", category: "特种车", color: "#c9ced4", partCount: 9, file: "machines" },
  { id: "posttruck", name: "邮政厢车", icon: "📮", category: "特种车", color: "#1f7a4d", partCount: 8, file: "trucks4" },
  { id: "flatbed", name: "平板半挂车", icon: "🛻", category: "特种车", color: "#2f6fd0", partCount: 10, file: "trucks4" },
  { id: "midaxle", name: "中置轴挂车", icon: "🚚", category: "特种车", color: "#445b70", partCount: 10, file: "trucks4" },
  { id: "excavator", name: "挖掘机", icon: "🚜", category: "工程车", color: "#f0b81d", partCount: 9, file: "machines" },
  { id: "backhoe", name: "挖掘装载机", icon: "🚜", category: "工程车", color: "#f0b81d", partCount: 10, file: "machines2" },
  { id: "bulldozer", name: "推土机", icon: "🚧", category: "工程车", color: "#e8b81c", partCount: 8, file: "machines" },
  { id: "crane", name: "起重机", icon: "🏗️", category: "工程车", color: "#2b6cb0", partCount: 10, file: "machines" },
  { id: "crawlercrane", name: "履带起重机", icon: "🏗️", category: "工程车", color: "#f2c230", partCount: 7, file: "machines4" },
  { id: "concretepump", name: "混凝土泵车", icon: "🏗", category: "工程车", color: "#c8372d", partCount: 10, file: "machines" },
  { id: "mixer", name: "搅拌车", icon: "🚛", category: "工程车", color: "#4a7fb5", partCount: 9, file: "machines" },
  { id: "loader", name: "装载机", icon: "🏗️", category: "工程车", color: "#f0b81d", partCount: 8, file: "machines" },
  { id: "skidsteer", name: "滑移装载机", icon: "⚙️", category: "工程车", color: "#f0b81d", partCount: 7, file: "machines" },
  { id: "forklift", name: "叉车", icon: "📦", category: "工程车", color: "#e8a11c", partCount: 7, file: "machines" },
  { id: "boomlift", name: "高空作业车", icon: "⬆️", category: "工程车", color: "#f07a1a", partCount: 7, file: "machines" },
  { id: "roller", name: "压路机", icon: "🚧", category: "工程车", color: "#e8b81c", partCount: 6, file: "machines" },
  { id: "grader", name: "平地机", icon: "🛣️", category: "工程车", color: "#f0b81d", partCount: 10, file: "machines4" },
  { id: "coldplaner", name: "铣刨机", icon: "🛠️", category: "工程车", color: "#f0b81d", partCount: 7, file: "machines4" },
  { id: "dumper", name: "自卸车", icon: "🚚", category: "工程车", color: "#c25f2a", partCount: 7, file: "machines" },
  { id: "tractor", name: "拖拉机", icon: "🚜", category: "农用车", color: "#3f8a4f", partCount: 9, file: "machines" },
  { id: "seeder", name: "播种机", icon: "🌱", category: "农用车", color: "#c94f2c", partCount: 10, file: "machines2" },
  { id: "combine", name: "联合收割机", icon: "🌾", category: "农用车", color: "#b03a2e", partCount: 8, file: "machines" },
  { id: "sprayer", name: "喷药机", icon: "🌾", category: "农用车", color: "#3f8a4f", partCount: 8, file: "machines" },
  { id: "baler", name: "打捆机", icon: "🌾", category: "农用车", color: "#2f7d32", partCount: 7, file: "farm2" },
  { id: "farmtruck", name: "农用运输车", icon: "🚜", category: "农用车", color: "#2f6fd0", partCount: 7, file: "farm2" },
  { id: "transplanter", name: "插秧机", icon: "🌱", category: "农用车", color: "#d94f2b", partCount: 7, file: "farm2" },
  { id: "asphaltpaver", name: "沥青摊铺机", icon: "🚧", category: "工程车", color: "#e8b21c", partCount: 10, file: "machines3" },
  { id: "rotarydrill", name: "旋挖钻机", icon: "⛏️", category: "工程车", color: "#d9761f", partCount: 10, file: "machines3" },
  { id: "truckcrane", name: "随车吊", icon: "🏗️", category: "工程车", color: "#e8a825", partCount: 10, file: "machines3" },
  { id: "hatchback", name: "两厢车", icon: "🚙", category: "家用车", color: "#2fa39a", partCount: 10, file: "cars4" },
  { id: "wagon", name: "旅行车", icon: "🚙", category: "家用车", color: "#3d6b52", partCount: 10, file: "cars4" },
  { id: "convertible", name: "敞篷车", icon: "🏎️", category: "家用车", color: "#b03a2e", partCount: 10, file: "cars4" },
  { id: "mpv", name: "商务MPV", icon: "🚐", category: "家用车", color: "#5a6472", partCount: 10, file: "cars4" },
  { id: "coach", name: "长途大巴", icon: "🚄", category: "特种车", color: "#f2f5f8", partCount: 8, file: "special4" },
  { id: "minibus", name: "中巴", icon: "🚐", category: "特种车", color: "#f4f6f8", partCount: 9, file: "special4" },
  { id: "trolleybus", name: "无轨电车", icon: "🚎", category: "特种车", color: "#d94141", partCount: 8, file: "special4" },
  { id: "cashvan", name: "运钞车", icon: "💰", category: "特种车", color: "#9fa8b0", partCount: 8, file: "special4" },
  { id: "commandtruck", name: "通信指挥车", icon: "📡", category: "特种车", color: "#e2e7ec", partCount: 8, file: "special4" },
  { id: "foodtruck", name: "移动餐车", icon: "🌮", category: "特种车", color: "#f0b81d", partCount: 8, file: "special4" },
  { id: "guardrailcleaner", name: "护栏清洗车", icon: "🧽", category: "特种车", color: "#f4f7fa", partCount: 9, file: "special5" },
  { id: "dusttruck", name: "抑尘雾炮车", icon: "💨", category: "特种车", color: "#f2f6f8", partCount: 9, file: "special5" },
  { id: "rescuetruck", name: "抢险救援消防车", icon: "🚒", category: "特种车", color: "#d63232", partCount: 8, file: "special5" },
  { id: "curtainsider", name: "侧帘半挂车", icon: "🪟", category: "特种车", color: "#e4ebf1", partCount: 8, file: "trucks5" },
  { id: "lowboy", name: "低平板半挂车", icon: "🛤️", category: "特种车", color: "#3a4046", partCount: 8, file: "trucks5" },
  { id: "bulker", name: "粉粒物料运输车", icon: "🌫️", category: "特种车", color: "#f0f3f6", partCount: 8, file: "trucks5" },
  { id: "lighttruck", name: "城市配送轻卡", icon: "📦", category: "特种车", color: "#f2f5f8", partCount: 8, file: "trucks5" },
  { id: "telehandler", name: "伸缩臂叉装车", icon: "🏗️", category: "工程车", color: "#e8a020", partCount: 8, file: "machines5" },
  { id: "miniexcavator", name: "微型挖掘机", icon: "🦾", category: "工程车", color: "#e0b020", partCount: 8, file: "machines5" },
  { id: "piledriver", name: "打桩机", icon: "📌", category: "工程车", color: "#e0a51e", partCount: 7, file: "machines5" },
  { id: "asphaltdistributor", name: "沥青洒布车", icon: "🛢️", category: "工程车", color: "#f0f3f6", partCount: 8, file: "machines5" },
  { id: "soilstabilizer", name: "稳定土拌和机", icon: "🌀", category: "工程车", color: "#e0a51e", partCount: 8, file: "machines5" },
  { id: "linepump", name: "车载混凝土泵", icon: "🚰", category: "工程车", color: "#2f6fd0", partCount: 9, file: "machines5" },
  { id: "rotarytiller", name: "旋耕机", icon: "🌱", category: "农用车", color: "#2f8f5b", partCount: 6, file: "farm3" },
  { id: "cottonpicker", name: "采棉机", icon: "🌾", category: "农用车", color: "#c63a30", partCount: 8, file: "farm3" },
  { id: "canecutter", name: "甘蔗收割机", icon: "🎍", category: "农用车", color: "#d8b022", partCount: 6, file: "farm3" },
  { id: "orchardtruck", name: "果园运输车", icon: "🍎", category: "农用车", color: "#2f7f4f", partCount: 6, file: "farm3" },
  { id: "crawlertractor", name: "履带拖拉机", icon: "🚜", category: "农用车", color: "#2f7f4f", partCount: 6, file: "farm3" },
  { id: "minicar", name: "微型车", icon: "🚗", category: "家用车", color: "#f0cf3c", partCount: 8, file: "cars5" },
  { id: "limousine", name: "加长礼宾车", icon: "🎩", category: "家用车", color: "#f2f3f5", partCount: 7, file: "cars5" },
  { id: "classiccar", name: "老爷车", icon: "🎩", category: "家用车", color: "#8f2f2f", partCount: 8, file: "cars5" },
  { id: "rallycar", name: "拉力赛车", icon: "🏁", category: "家用车", color: "#2f6fd0", partCount: 8, file: "cars5" },
  { id: "airportbus", name: "机场摆渡车", icon: "✈️", category: "特种车", color: "#f2f5f7", partCount: 8, file: "special6" },
  { id: "fueltruck", name: "流动加油车", icon: "⛽", category: "特种车", color: "#f2f5f8", partCount: 9, file: "special6" },
  { id: "hazardtruck", name: "危险品运输车", icon: "☢️", category: "特种车", color: "#f0b81d", partCount: 9, file: "special6" },
  { id: "powergen", name: "应急电源车", icon: "🔌", category: "特种车", color: "#5a636c", partCount: 10, file: "special6" },
  { id: "caravantrailer", name: "旅居拖挂车", icon: "🏕️", category: "特种车", color: "#f4f2ee", partCount: 8, file: "special6" },
  { id: "stagetruck", name: "舞台宣传车", icon: "🎪", category: "特种车", color: "#f2f5f8", partCount: 10, file: "special6" },
  { id: "airportfiretruck", name: "机场消防车", icon: "🚒", category: "特种车", color: "#d63232", partCount: 9, file: "special6" },
  { id: "scrapgrapple", name: "抓钢机", icon: "♻️", category: "工程车", color: "#e8891b", partCount: 7, file: "machines6" },
  { id: "demolition", name: "拆楼机", icon: "🏚️", category: "工程车", color: "#e8b21c", partCount: 7, file: "machines6" },
  { id: "miningdumper", name: "矿用宽体自卸车", icon: "⛏️", category: "工程车", color: "#d9a017", partCount: 6, file: "machines6" },
  { id: "bridgeinspect", name: "桥梁检测车", icon: "🌉", category: "特种车", color: "#f0f3f6", partCount: 7, file: "machines6" },
  { id: "prunertruck", name: "绿化修剪车", icon: "🌳", category: "特种车", color: "#2f9e4f", partCount: 7, file: "machines6" },
  { id: "tbm", name: "隧道掘进机", icon: "🕳️", category: "工程车", color: "#e0a01a", partCount: 6, file: "machines6" }
];

// 每个数据文件一个加载器，import() 的模块由浏览器缓存，重复切换不会重复下载
const LOADERS = {
  "cars": () => import('./cars.js'),
  "cars2": () => import('./cars2.js'),
  "cars3": () => import('./cars3.js'),
  "machines": () => import('./machines.js'),
  "trailers": () => import('./trailers.js'),
  "trucks3": () => import('./trucks3.js'),
  "special2": () => import('./special2.js'),
  "special": () => import('./special.js'),
  "special3": () => import('./special3.js'),
  "trucks4": () => import('./trucks4.js'),
  "machines2": () => import('./machines2.js'),
  "machines4": () => import('./machines4.js'),
  "farm2": () => import('./farm2.js'),
  "machines3": () => import('./machines3.js'),
  "cars4": () => import('./cars4.js'),
  "special4": () => import('./special4.js'),
  "special5": () => import('./special5.js'),
  "trucks5": () => import('./trucks5.js'),
  "machines5": () => import('./machines5.js'),
  "farm3": () => import('./farm3.js'),
  "cars5": () => import('./cars5.js'),
  "special6": () => import('./special6.js'),
  "machines6": () => import('./machines6.js')
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
