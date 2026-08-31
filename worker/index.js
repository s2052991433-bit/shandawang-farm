const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };
const ADMIN_SESSION_COOKIE = "sdw_admin_session";
const ADMIN_SESSION_SECONDS = 60 * 60 * 24 * 7;
// Cloudflare Workers' Web Crypto implementation accepts at most 100,000
// PBKDF2 iterations per deriveBits call. Keep the stored iteration count
// explicit so existing hashes remain independently verifiable.
const PASSWORD_ITERATIONS = 100000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_BLOCK_MS = 15 * 60 * 1000;
const LOGIN_FAILURE_LIMIT = 5;

const DEFAULT_PRODUCTS = [
  {
    id: "bayberries", name: "山里红杨梅", category: "farm-grown", categoryLabel: "农场自产", price: 168, inventory: 36,
    status: "本季最后一批", detail: "当日清晨采摘 · 2.5kg", spec: "2.5kg 保鲜装", image: "/assets/bayberries.webp",
    origin: "宁波山间 · 农场自产", delivery: "采摘后24小时内冷链发出", storage: "收到后冷藏，建议2天内食用",
    description: "成熟一批采一批，不催熟、不久放。酸甜度会随当天山间天气略有变化。", batch: "夏末最后一批",
    harvest: "每天清晨按成熟度分批采摘", sceneImage: "/assets/bayberries.webp", sceneTitle: "果香出来以后，才从枝头带走",
    sceneBody: "杨梅没有统一的采摘日。山坡朝向、树龄和清晨温度都会改变成熟速度，因此每天只采当日适合发出的数量。",
    fulfillment: { temperature: "chilled", packageSystem: "fruit", boxSize: "M", fragile: "high", compatibleWith: ["fruit"] }, sortOrder: 10,
  },
  {
    id: "eggs", name: "散养初生蛋", category: "farm-grown", categoryLabel: "农场自产", price: 98, inventory: 120,
    status: "每周二、五发出", detail: "林下散养 · 30枚", spec: "30枚缓冲蛋托装", image: "/assets/eggs.webp",
    origin: "林下鸡舍 · 农场自产", delivery: "灯检分级后常温发出", storage: "阴凉处存放，冷藏更佳",
    description: "鸡群白天在林地活动，傍晚归舍。鸡蛋按批次捡回、灯检并装入缓冲蛋托。", batch: "本周林下鸡舍批次",
    harvest: "每天傍晚捡回，每周二、五发出", sceneImage: "/assets/farm-egg-collecting.jpg", sceneTitle: "太阳落山前，把当天的蛋捡回来",
    sceneBody: "鸡群白天在林地里活动，傍晚归舍。鸡蛋不留到第二天，当天完成捡取、检查、分级与装托。",
    fulfillment: { temperature: "ambient", packageSystem: "egg", boxSize: "M", fragile: "high", compatibleWith: ["egg"] }, sortOrder: 20,
  },
  {
    id: "peaches", name: "奉化水蜜桃", category: "ningbo-select", categoryLabel: "宁波精选", price: 138, inventory: 48,
    status: "采摘后24小时内发出", detail: "树熟采摘 · 6枚礼装", spec: "6枚果托礼装", image: "/assets/peaches.webp",
    origin: "奉化东坡桃园 · 当地精选", delivery: "按成熟批次采摘发出", storage: "常温回软，成熟后及时食用",
    description: "逐棵查看成熟度，达到香气和软硬度后才采。运输中使用独立果托减少碰伤。", batch: "奉化东坡桃园 · 处暑批次",
    harvest: "达到香气与软硬度后分批采摘", sceneImage: "/assets/farm-peach-picking.jpg", sceneTitle: "趁山雾未散，轻轻旋下成熟的桃子",
    sceneBody: "不是按日历统一采摘，而是逐棵查看成熟度。达到甜度、果香已经出来的桃子，才会从枝头轻轻旋下。",
    fulfillment: { temperature: "ambient", packageSystem: "fruit", boxSize: "S", fragile: "high", compatibleWith: ["fruit"] }, sortOrder: 30,
  },
  {
    id: "egg-annual-card", name: "散养鸡蛋年卡", category: "gift-card", categoryLabel: "礼品卡", price: 798, inventory: 100,
    status: "限量100张", detail: "连续12个月 · 每月1箱30枚", spec: "12个月 × 30枚/箱", image: "/assets/egg-annual-card-2027.webp",
    origin: "山大王农场林下鸡舍 · 农场自产", delivery: "购卡后领取独立卡密，激活后自2027年1月起每月按批次发出1箱", storage: "卡密请妥善保管，激活后连续履约12个月",
    description: "一次送出一整年的惦记。激活后连续12个月，每月收到1箱30枚散养鸡蛋；每批完成捡取、灯检、分级和缓冲装托后发出。", batch: "2027 鸡蛋年卡 · 限量100张",
    harvest: "每月匹配当月鸡舍批次，共发出12箱", sceneImage: "/assets/farm-egg-checking.jpg", sceneTitle: "不是一次送完，而是每个月都记得",
    sceneBody: "年卡激活后建立12期履约计划。每月从当批鸡蛋中完成捡取、灯检与分级，再按固定30枚缓冲箱寄出。",
    fulfillment: { temperature: "ambient", packageSystem: "gift-card", boxSize: "S", fragile: "low", compatibleWith: ["gift"] }, sortOrder: 40,
  },
  {
    id: "ningbo-rice-cakes", name: "宁波水磨年糕", category: "ningbo-specialty", categoryLabel: "宁波特产", price: 36, inventory: 80,
    status: "每周三新做发出", detail: "传统水磨 · 1kg", spec: "1kg 真空保鲜装", image: "/assets/ningbo-rice-cakes.jpg",
    origin: "宁波本地年糕工坊 · 宁波精选", delivery: "制作完成后24小时内常温或冷藏发出", storage: "收到后冷藏，建议7天内食用",
    description: "选用当季粳米，经浸泡、水磨、蒸制和舂制完成。口感软糯有韧性，切片煮炒都合适。", batch: "本周水磨新做批次",
    harvest: "每周按订单排产，现做现发", sceneImage: "/assets/ningbo-rice-cakes.jpg", sceneTitle: "米泡足时间，年糕才有自然的韧",
    sceneBody: "年糕不靠香精和增白。粳米充分浸泡后水磨成浆，再经蒸制与舂打形成细密口感，每周按订单安排制作。",
    fulfillment: { temperature: "ambient", packageSystem: "ambient-food", boxSize: "S", fragile: "low", compatibleWith: ["ambient-food"] }, sortOrder: 50,
  },
  {
    id: "weekly-vegetable-basket", name: "本周农场菜篮", category: "vegetables", categoryLabel: "时令时蔬", price: 88, inventory: 45,
    status: "每周二、五发出", detail: "5—6种时蔬 · 约3kg", spec: "当周5—6种搭配，约3kg", image: "/assets/weekly-vegetable-basket.jpg",
    origin: "山大王农场菜地 · 农场自产", delivery: "采收后分拣装入时蔬箱，当日发出", storage: "叶菜冷藏，瓜果常温或冷藏保存",
    description: "不要求每周一模一样。根据菜地成熟情况搭配叶菜、番茄、黄瓜、茄子与毛豆，让一只菜篮对应真正的当周收成。", batch: "处暑本周菜篮",
    harvest: "发货当天清晨采收并组合", sceneImage: "/assets/weekly-vegetable-basket.jpg", sceneTitle: "菜篮跟着菜地走，不预设固定清单",
    sceneBody: "清晨查看每一畦菜的成熟度，再决定当天菜篮的搭配。叶菜放在上层，瓜果分区固定，减少运输挤压。",
    fulfillment: { temperature: "ambient", packageSystem: "vegetable", boxSize: "M", fragile: "medium", compatibleWith: ["vegetable"] }, sortOrder: 60,
  },
  {
    id: "baby-bok-choy", name: "露水小青菜", category: "vegetables", categoryLabel: "时令时蔬", price: 18, inventory: 60,
    status: "当日采收", detail: "清晨采收 · 500g", spec: "500g 保鲜装", image: "/assets/baby-bok-choy.jpg",
    origin: "山大王农场叶菜地 · 农场自产", delivery: "清晨采收，预冷后装入时蔬箱", storage: "冷藏保存，建议2—3天内食用",
    description: "叶片脆嫩，菜梗清甜。只在适合采收的大小上架，不为凑单提前拔菜。", batch: "处暑叶菜批次",
    harvest: "发货日清晨带露采收", sceneImage: "/assets/baby-bok-choy.jpg", sceneTitle: "太阳变热以前，把嫩叶带回分拣棚",
    sceneBody: "叶菜最怕失水。清晨采收后先去掉老叶和泥土，再预冷、套袋并放在时蔬箱上层。",
    fulfillment: { temperature: "chilled", packageSystem: "vegetable", boxSize: "S", fragile: "medium", compatibleWith: ["vegetable"] }, sortOrder: 70,
  },
  {
    id: "farm-tomatoes", name: "树熟沙瓤番茄", category: "vegetables", categoryLabel: "时令时蔬", price: 28, inventory: 56,
    status: "红一批采一批", detail: "自然转红 · 1kg", spec: "1kg 防压装", image: "/assets/farm-tomatoes.jpg",
    origin: "山大王农场番茄棚 · 农场自产", delivery: "达到转色与软硬度后采收发出", storage: "常温后熟，成熟后冷藏",
    description: "等番茄自然转红、果肩软下来才采。大小不完全一致，切开能看到自然沙瓤。", batch: "处暑树熟批次",
    harvest: "每天傍晚查看转色，次日清晨采收", sceneImage: "/assets/farm-tomatoes.jpg", sceneTitle: "颜色从果底慢慢红上来，才算成熟",
    sceneBody: "不按统一大小采摘，只看转色、香气和软硬度。成熟番茄单层放置，避免和硬质瓜果互相挤压。",
    fulfillment: { temperature: "ambient", packageSystem: "vegetable", boxSize: "S", fragile: "high", compatibleWith: ["vegetable"] }, sortOrder: 80,
  },
  {
    id: "farm-cucumbers", name: "清香刺黄瓜", category: "vegetables", categoryLabel: "时令时蔬", price: 22, inventory: 72,
    status: "清晨现摘", detail: "脆嫩现摘 · 1kg", spec: "1kg 保鲜装", image: "/assets/farm-cucumbers.jpg",
    origin: "山大王农场瓜棚 · 农场自产", delivery: "清晨采收，当日常温发出", storage: "阴凉处或冷藏，建议4天内食用",
    description: "瓜刺清晰、含水充足，适合凉拌或清炒。按长度和硬度挑选，不使用塑料托盘。", batch: "处暑瓜棚批次",
    harvest: "每天清晨逐藤采收", sceneImage: "/assets/farm-cucumbers.jpg", sceneTitle: "瓜还脆着，就从藤上摘下来",
    sceneBody: "黄瓜生长很快，每天清晨都要逐藤查看。采下后保留短柄，按硬度分级并尽快装箱。",
    fulfillment: { temperature: "ambient", packageSystem: "vegetable", boxSize: "S", fragile: "medium", compatibleWith: ["vegetable"] }, sortOrder: 90,
  },
  {
    id: "purple-eggplants", name: "紫皮长茄", category: "vegetables", categoryLabel: "时令时蔬", price: 24, inventory: 48,
    status: "本周采收", detail: "鲜嫩少籽 · 800g", spec: "800g 防压装", image: "/assets/weekly-vegetable-basket.jpg",
    origin: "山大王农场茄子地 · 农场自产", delivery: "采收后独立隔层装箱", storage: "阴凉处保存，避免低温久放",
    description: "表皮自然有光泽，手感紧实。嫩度合适时采下，避免长老后籽多纤维粗。", batch: "处暑茄果批次",
    harvest: "达到嫩度后分批采收", sceneImage: "/assets/weekly-vegetable-basket.jpg", sceneTitle: "看茄蒂和手感，决定今天采哪一根",
    sceneBody: "长茄容易擦伤，采收时保留茄蒂，装箱时与硬质瓜果分层，减少运输中的表皮碰伤。",
    fulfillment: { temperature: "ambient", packageSystem: "vegetable", boxSize: "S", fragile: "medium", compatibleWith: ["vegetable"] }, sortOrder: 100,
  },
  {
    id: "fresh-edamame", name: "带荚鲜毛豆", category: "vegetables", categoryLabel: "时令时蔬", price: 20, inventory: 64,
    status: "处暑正当季", detail: "颗粒饱满 · 500g", spec: "500g 透气保鲜装", image: "/assets/weekly-vegetable-basket.jpg",
    origin: "山大王农场豆田 · 农场自产", delivery: "带荚采收，当日装箱发出", storage: "冷藏保存，建议3天内食用",
    description: "豆荚青绿、颗粒已经鼓起但不过老。保留豆荚发出，煮食时豆香更完整。", batch: "处暑鲜豆批次",
    harvest: "豆粒饱满后分行采收", sceneImage: "/assets/weekly-vegetable-basket.jpg", sceneTitle: "豆荚鼓起来，又还没有变硬",
    sceneBody: "每天抽看豆荚成熟度，颗粒饱满、颜色仍鲜绿时采收。带荚透气装袋，避免闷热变黄。",
    fulfillment: { temperature: "chilled", packageSystem: "vegetable", boxSize: "S", fragile: "low", compatibleWith: ["vegetable"] }, sortOrder: 110,
  },
];

DEFAULT_PRODUCTS.push(
  {
    id: "spring-bamboo-shoots", name: "山林春笋", category: "vegetables", categoryLabel: "春日时蔬", price: 58, inventory: 80,
    status: "春季预售", detail: "清晨现挖 · 2.5kg", spec: "2.5kg 透气装", image: "/assets/season-spring-harvest.jpg",
    origin: "宁波山林竹园 · 农场自产", delivery: "春笋破土后按成熟批次发出", storage: "收到后冷藏，建议3天内食用",
    description: "不提前定死采挖日。笋尖破土、肉质仍嫩时才从竹园带回，完成去泥与透气装箱。", batch: "2027 清明前后批次",
    harvest: "预计3—4月，跟随山间温度分批采挖", sceneImage: "/assets/season-spring-harvest.jpg", sceneTitle: "笋尖冒出土面，春天才真正开始",
    sceneBody: "竹园湿度、坡向与连续晴雨都会改变春笋的生长速度。预售订单先排队，成熟以后再通知具体发出时间。",
    season: "spring", seasonLabel: "春", preorderNote: "预计3—4月成熟后分批发出", fulfillment: { temperature: "ambient", packageSystem: "vegetable", boxSize: "M", fragile: "medium", compatibleWith: ["vegetable"] }, sortOrder: 12,
  },
  {
    id: "spring-strawberries", name: "春日露水草莓", category: "farm-grown", categoryLabel: "春日鲜果", price: 88, inventory: 60,
    status: "春季预售", detail: "自然转红 · 2盒", spec: "2盒防压保鲜装", image: "/assets/season-spring-harvest.jpg",
    origin: "宁波山间草莓棚 · 当地精选", delivery: "达到甜度后清晨采摘、当天发出", storage: "收到后冷藏，建议当天食用",
    description: "以香气、转色和果肉硬度决定采摘，不为了赶订单提前摘下还没熟的果子。", batch: "2027 春日首批",
    harvest: "预计2—4月，成熟一批采一批", sceneImage: "/assets/season-spring-harvest.jpg", sceneTitle: "颜色红透，香气也到了",
    sceneBody: "草莓娇嫩，采后直接进入小盒与防压层。预售让每天采下的数量与当天能发出的数量保持一致。",
    season: "spring", seasonLabel: "春", preorderNote: "预计2—4月成熟后分批发出", fulfillment: { temperature: "chilled", packageSystem: "fruit", boxSize: "S", fragile: "high", compatibleWith: ["fruit"] }, sortOrder: 14,
  },
  {
    id: "autumn-persimmons", name: "山坡甜柿", category: "farm-grown", categoryLabel: "秋日鲜果", price: 76, inventory: 72,
    status: "秋季预售", detail: "树上转色 · 8枚", spec: "8枚果托装", image: "/assets/season-autumn-harvest.jpg",
    origin: "山大王农场南坡 · 农场自产", delivery: "果面转橙、糖度达到后分批发出", storage: "常温后熟，变软后冷藏",
    description: "等秋风把颜色慢慢推深，再按成熟度逐树采摘。果型不必完全一样，但每枚都有明确批次。", batch: "2027 寒露前后批次",
    harvest: "预计9—10月，转色后分批采收", sceneImage: "/assets/season-autumn-harvest.jpg", sceneTitle: "秋风来了，甜味才慢慢聚起来",
    sceneBody: "同一棵树上的柿子也不会同时成熟。预售订单按下单顺序匹配采摘批次，到发出前再确认软硬度。",
    season: "autumn", seasonLabel: "秋", preorderNote: "预计9—10月成熟后分批发出", fulfillment: { temperature: "ambient", packageSystem: "fruit", boxSize: "S", fragile: "high", compatibleWith: ["fruit"] }, sortOrder: 32,
  },
  {
    id: "autumn-sweet-potatoes", name: "山地蜜薯", category: "farm-grown", categoryLabel: "秋收根茎", price: 46, inventory: 100,
    status: "秋季预售", detail: "粉糯香甜 · 5kg", spec: "5kg 透气纸箱", image: "/assets/season-autumn-harvest.jpg",
    origin: "山大王农场旱地 · 农场自产", delivery: "霜降前后起垄晾干后发出", storage: "阴凉通风保存，避免潮湿",
    description: "等薯块长足、表皮稳定后再起垄。带一点自然大小差异，不做过度清洗，便于存放。", batch: "2027 秋收批次",
    harvest: "预计10—11月集中收获", sceneImage: "/assets/season-autumn-harvest.jpg", sceneTitle: "土松开以后，秋收从地下露出来",
    sceneBody: "起出的蜜薯先在通风处短暂晾放，表皮稳定后再装箱。预售数量会跟着实际收成调整。",
    season: "autumn", seasonLabel: "秋", preorderNote: "预计10—11月收获后发出", fulfillment: { temperature: "ambient", packageSystem: "vegetable", boxSize: "M", fragile: "low", compatibleWith: ["vegetable"] }, sortOrder: 34,
  },
  {
    id: "winter-tangerines", name: "山间蜜橘", category: "ningbo-select", categoryLabel: "冬日鲜果", price: 68, inventory: 90,
    status: "冬季预售", detail: "薄皮多汁 · 5kg", spec: "5kg 分层果箱", image: "/assets/season-winter-harvest.jpg",
    origin: "宁波本地橘园 · 当地精选", delivery: "降温增甜后采摘，按批次发出", storage: "阴凉通风保存",
    description: "经历初冬温差后再测甜度、看果皮与果蒂状态，达到要求的一批果子才进入预售履约。", batch: "2027 小雪前后批次",
    harvest: "预计11—12月分批采摘", sceneImage: "/assets/season-winter-harvest.jpg", sceneTitle: "天气转冷，橘子的甜慢慢稳下来",
    sceneBody: "冬橘不是越早摘越好。预售订单等待自然增甜，采下后按果面和软硬度分级，再分层装箱。",
    season: "winter", seasonLabel: "冬", preorderNote: "预计11—12月成熟后分批发出", fulfillment: { temperature: "ambient", packageSystem: "fruit", boxSize: "M", fragile: "medium", compatibleWith: ["fruit"] }, sortOrder: 52,
  },
  {
    id: "winter-greens", name: "霜打冬青菜", category: "vegetables", categoryLabel: "冬日时蔬", price: 26, inventory: 70,
    status: "冬季预售", detail: "清甜软糯 · 1kg", spec: "1kg 保鲜装", image: "/assets/season-winter-harvest.jpg",
    origin: "山大王农场冬菜地 · 农场自产", delivery: "经历低温后清晨采收，当日发出", storage: "冷藏保存，建议3天内食用",
    description: "让青菜经历自然低温，叶片积累更多清甜。发货日清晨采下，去老叶后直接进入时蔬箱。", batch: "2027 冬至前后批次",
    harvest: "预计12月至次年2月按地块采收", sceneImage: "/assets/season-winter-harvest.jpg", sceneTitle: "落过霜的菜地，有冬天自己的甜",
    sceneBody: "低温会改变叶菜风味，也让生长速度变慢。预售批次跟着天气走，到可以采收时再通知发出。",
    season: "winter", seasonLabel: "冬", preorderNote: "预计冬至前后按地块采收发出", fulfillment: { temperature: "chilled", packageSystem: "vegetable", boxSize: "S", fragile: "medium", compatibleWith: ["vegetable"] }, sortOrder: 54,
  }
);

const PRODUCT_SEASON_BY_ID = {
  "baby-bok-choy": "spring",
  bayberries: "summer", peaches: "summer", "weekly-vegetable-basket": "summer", "farm-tomatoes": "summer", "farm-cucumbers": "summer", "purple-eggplants": "summer",
  "fresh-edamame": "autumn", "ningbo-rice-cakes": "winter", eggs: "annual", "egg-annual-card": "annual",
};
const PRODUCT_SEASON_LABELS = { spring: "春", summer: "夏", autumn: "秋", winter: "冬", annual: "全年" };
const DEFAULT_SALE_MONTHS_BY_SEASON = {
  spring: [2, 3, 4],
  summer: [5, 6, 7, 8],
  autumn: [9, 10],
  winter: [11, 12, 1],
  annual: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};
const PRODUCT_SALE_MONTHS_BY_ID = {
  bayberries: [6, 7], peaches: [7, 8], "weekly-vegetable-basket": [5, 6, 7, 8], "farm-tomatoes": [5, 6, 7, 8], "farm-cucumbers": [5, 6, 7, 8], "purple-eggplants": [6, 7, 8],
  "fresh-edamame": [8, 9, 10], "baby-bok-choy": [2, 3, 4, 9, 10, 11], "spring-bamboo-shoots": [3, 4], "spring-strawberries": [2, 3, 4],
  "autumn-persimmons": [10, 11], "autumn-sweet-potatoes": [10, 11], "winter-tangerines": [11, 12], "winter-greens": [12, 1, 2], "ningbo-rice-cakes": [11, 12, 1, 2],
};

function productSeason(product) {
  return product.season || PRODUCT_SEASON_BY_ID[product.id] || "summer";
}

function productSaleMonths(product) {
  const season = productSeason(product);
  return product.saleMonths || PRODUCT_SALE_MONTHS_BY_ID[product.id] || DEFAULT_SALE_MONTHS_BY_SEASON[season] || [];
}

function productSaleMode(product, month) {
  const season = productSeason(product);
  if (product.id === "egg-annual-card" || season === "annual") return "available";
  const currentMonth = Number(month || new Date().getMonth() + 1);
  return productSaleMonths(product).map(Number).includes(currentMonth) ? "available" : "preorder";
}

DEFAULT_PRODUCTS.forEach(function (product) {
  const season = productSeason(product);
  product.season = season;
  product.seasonLabel = product.seasonLabel || PRODUCT_SEASON_LABELS[season];
  product.saleMonths = productSaleMonths(product);
  product.saleMode = productSaleMode(product);
  product.preorderNote = product.preorderNote || (product.id === "eggs" ? "全年按当期鸡舍产量，每周分批发出" : PRODUCT_SEASON_LABELS[season] + "季成熟后按批次发出");
});

const DEFAULT_FARM_LOGS = [{
  id: "farm-log-today", logDate: "2026-08-24", label: "08.24", season: "今天", summary: "2处农事 · 6张现场图", published: true,
  activities: [
    { time: "06:20", place: "东坡桃园", title: "趁山雾未散，采下今天的桃子", body: "成熟不是一个统一的时刻。我们逐棵查看，只把达到甜度、果香已经出来的桃子轻轻旋下，再送往分拣棚。", images: [{ src: "/assets/farm-peach-picking.jpg", alt: "清晨在桃树上手工采摘成熟水蜜桃" }, { src: "/assets/peaches.webp", alt: "刚刚采下、放在竹篮里的水蜜桃" }, { src: "/assets/farm-peach-sorting.jpg", alt: "分拣棚内按成熟度挑选水蜜桃" }] },
    { time: "17:40", place: "林下鸡舍", title: "太阳落山前，把今天的蛋捡回来", body: "鸡群白天在林地里活动，傍晚归舍。当天的鸡蛋逐枚捡回，经过检查、分级后装入缓冲蛋托。", images: [{ src: "/assets/farm-egg-collecting.jpg", alt: "傍晚从铺有稻草的鸡舍中捡取鸡蛋" }, { src: "/assets/eggs.webp", alt: "当天收回的散养鸡蛋" }, { src: "/assets/farm-egg-checking.jpg", alt: "在自然光下逐枚检查并装托鸡蛋" }] },
  ],
}];

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, category_label TEXT NOT NULL, price_cents INTEGER NOT NULL CHECK (price_cents >= 0), inventory INTEGER NOT NULL DEFAULT 0 CHECK (inventory >= 0), sales_status TEXT NOT NULL DEFAULT 'draft', active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)), sort_order INTEGER NOT NULL DEFAULT 0, data_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS inventory_batches (id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id), batch_code TEXT NOT NULL UNIQUE, sellable_quantity INTEGER NOT NULL DEFAULT 0, reserved_quantity INTEGER NOT NULL DEFAULT 0, sold_quantity INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'scheduled', harvest_at TEXT, ship_start_at TEXT, ship_end_at TEXT, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, order_no TEXT NOT NULL UNIQUE, order_type TEXT NOT NULL, customer_name TEXT NOT NULL, phone TEXT NOT NULL, address_json TEXT NOT NULL, items_json TEXT NOT NULL, subtotal_cents INTEGER NOT NULL DEFAULT 0, shipping_cents INTEGER NOT NULL DEFAULT 0, credit_cents INTEGER NOT NULL DEFAULT 0, total_cents INTEGER NOT NULL DEFAULT 0, payment_method TEXT NOT NULL DEFAULT '', payment_status TEXT NOT NULL DEFAULT 'pending', fulfillment_status TEXT NOT NULL DEFAULT 'pending_review', packing_plan_json TEXT NOT NULL DEFAULT '{}', source TEXT NOT NULL DEFAULT 'web', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS vouchers (id TEXT PRIMARY KEY, code_hash TEXT NOT NULL UNIQUE, code_hint TEXT NOT NULL, voucher_type TEXT NOT NULL, name TEXT NOT NULL, face_value_cents INTEGER NOT NULL DEFAULT 0, balance_cents INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active', expires_at TEXT, metadata_json TEXT NOT NULL DEFAULT '{}', activated_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS subscriptions (id TEXT PRIMARY KEY, voucher_id TEXT NOT NULL UNIQUE REFERENCES vouchers(id), order_id TEXT NOT NULL REFERENCES orders(id), customer_name TEXT NOT NULL, phone TEXT NOT NULL, address_json TEXT NOT NULL, starts_on TEXT NOT NULL, months INTEGER NOT NULL DEFAULT 12, status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS subscription_deliveries (id TEXT PRIMARY KEY, subscription_id TEXT NOT NULL REFERENCES subscriptions(id), delivery_month TEXT NOT NULL, quantity INTEGER NOT NULL DEFAULT 1, eggs_per_box INTEGER NOT NULL DEFAULT 30, status TEXT NOT NULL DEFAULT 'scheduled', tracking_no TEXT NOT NULL DEFAULT '', shipped_at TEXT, UNIQUE(subscription_id, delivery_month))",
  "CREATE TABLE IF NOT EXISTS farm_logs (id TEXT PRIMARY KEY, log_date TEXT NOT NULL, label TEXT NOT NULL, season TEXT NOT NULL DEFAULT '', summary TEXT NOT NULL DEFAULT '', activities_json TEXT NOT NULL DEFAULT '[]', published INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0, 1)), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, actor TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, detail_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS admin_users (id TEXT PRIMARY KEY, phone TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, password_iterations INTEGER NOT NULL, role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')), status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')), phone_verified INTEGER NOT NULL DEFAULT 0 CHECK (phone_verified IN (0, 1)), failed_login_count INTEGER NOT NULL DEFAULT 0, locked_until TEXT, last_login_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS admin_sessions (id TEXT PRIMARY KEY, admin_user_id TEXT NOT NULL REFERENCES admin_users(id), token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, revoked_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS admin_login_attempts (phone TEXT PRIMARY KEY, failure_count INTEGER NOT NULL DEFAULT 0, window_started_at TEXT NOT NULL, blocked_until TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE INDEX IF NOT EXISTS idx_products_active_sort ON products(active, sort_order)",
  "CREATE INDEX IF NOT EXISTS idx_batches_product_status ON inventory_batches(product_id, status)",
  "CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_orders_fulfillment ON orders(fulfillment_status, created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_vouchers_status_type ON vouchers(status, voucher_type)",
  "CREATE INDEX IF NOT EXISTS idx_farm_logs_published_date ON farm_logs(published, log_date DESC)",
  "CREATE INDEX IF NOT EXISTS idx_deliveries_month_status ON subscription_deliveries(delivery_month, status)",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_single_owner ON admin_users(role) WHERE role = 'owner'",
  "CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_expires ON admin_sessions(admin_user_id, expires_at)",
  "CREATE INDEX IF NOT EXISTS idx_admin_sessions_active_token ON admin_sessions(token_hash, expires_at) WHERE revoked_at IS NULL",
];

let readyDatabase = null;

function json(data, status, extraHeaders) {
  const headers = new Headers(JSON_HEADERS);
  Object.entries(extraHeaders || {}).forEach(function (entry) { headers.set(entry[0], entry[1]); });
  return new Response(JSON.stringify(data), { status: status || 200, headers: headers });
}

function safeJson(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function cents(value) {
  return Math.max(0, Math.round(Number(value || 0) * 100));
}

function publicProduct(row) {
  const data = safeJson(row.data_json, {});
  const product = Object.assign({}, data, { id: row.id, name: row.name, category: row.category, categoryLabel: row.category_label, price: row.price_cents / 100, inventory: row.inventory, status: row.sales_status, active: Boolean(row.active), sortOrder: row.sort_order, updatedAt: row.updated_at });
  product.season = productSeason(product);
  product.seasonLabel = product.seasonLabel || PRODUCT_SEASON_LABELS[product.season];
  product.saleMonths = productSaleMonths(product);
  product.saleMode = productSaleMode(product);
  return product;
}

function publicFarmLog(row) {
  return { id: row.id, date: row.log_date, logDate: row.log_date, label: row.label, season: row.season, summary: row.summary, activities: safeJson(row.activities_json, []), published: Boolean(row.published), updatedAt: row.updated_at };
}

function publicOrder(row) {
  return { id: row.id, orderNo: row.order_no, type: row.order_type, customerName: row.customer_name, phone: row.phone, address: safeJson(row.address_json, {}), items: safeJson(row.items_json, []), subtotal: row.subtotal_cents / 100, shipping: row.shipping_cents / 100, credit: row.credit_cents / 100, total: row.total_cents / 100, paymentMethod: row.payment_method, paymentStatus: row.payment_status, fulfillmentStatus: row.fulfillment_status, packingPlan: safeJson(row.packing_plan_json, {}), createdAt: row.created_at, updatedAt: row.updated_at };
}

function randomId(prefix) {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return prefix + Array.from(bytes, function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
}

function orderNumber(prefix) {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(2, 14);
  return prefix + stamp + String(Math.floor(Math.random() * 900) + 100);
}

async function sha256(value) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value).trim().toUpperCase()));
  return Array.from(new Uint8Array(buffer), function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
}

async function ensureDatabase(env) {
  if (!env.DB) throw new Error("database_unavailable");
  if (!readyDatabase) {
    readyDatabase = (async function () {
      await env.DB.batch(SCHEMA.map(function (statement) { return env.DB.prepare(statement); }));
      await env.DB.batch(DEFAULT_PRODUCTS.map(function (product) {
        const flexible = Object.assign({}, product);
        delete flexible.id; delete flexible.name; delete flexible.category; delete flexible.categoryLabel; delete flexible.price; delete flexible.inventory; delete flexible.status; delete flexible.sortOrder;
        return env.DB.prepare("INSERT OR IGNORE INTO products (id, name, category, category_label, price_cents, inventory, sales_status, active, sort_order, data_json) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)").bind(product.id, product.name, product.category, product.categoryLabel, cents(product.price), product.inventory, product.status, product.sortOrder, JSON.stringify(flexible));
      }));
      const logCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM farm_logs").first();
      if (!Number(logCount && logCount.count)) {
        await env.DB.batch(DEFAULT_FARM_LOGS.map(function (log) {
          return env.DB.prepare("INSERT INTO farm_logs (id, log_date, label, season, summary, activities_json, published) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(log.id, log.logDate, log.label, log.season, log.summary, JSON.stringify(log.activities), log.published ? 1 : 0);
        }));
      }
      await env.DB.prepare("PRAGMA optimize").run();
    })().catch(function (error) { readyDatabase = null; throw error; });
  }
  return readyDatabase;
}

function normalizePhone(value) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function validPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

function passwordProblem(value) {
  const password = String(value || "");
  if (password.length < 10) return "密码至少需要10位";
  if (password.length > 128) return "密码不能超过128位";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "密码需要同时包含字母和数字";
  return "";
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function randomSecret(byteLength) {
  const bytes = new Uint8Array(byteLength || 32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
}

async function sha256Exact(value) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || "")));
  return Array.from(new Uint8Array(buffer), function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
}

async function passwordHash(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(String(password)), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt, iterations: iterations }, key, 256);
  return bytesToBase64(new Uint8Array(bits));
}

function constantTimeEqual(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  let difference = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) difference |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  return difference === 0;
}

async function verifyPassword(password, row) {
  const derived = await passwordHash(password, base64ToBytes(row.password_salt), Number(row.password_iterations));
  return constantTimeEqual(derived, row.password_hash);
}

function readCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  for (const part of cookie.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    if (part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim());
  }
  return "";
}

function adminSessionCookie(token, maxAge) {
  return ADMIN_SESSION_COOKIE + "=" + encodeURIComponent(token || "") + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + String(maxAge) + (maxAge ? "" : "; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
}

function maskedPhone(phone) {
  return phone ? phone.slice(0, 3) + "****" + phone.slice(-4) : "";
}

function publicAdminUser(row) {
  return { id: row.id, displayName: row.display_name, phone: maskedPhone(row.phone), role: row.role, phoneVerified: Boolean(row.phone_verified) };
}

async function adminSetupRequired(env) {
  const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM admin_users").first();
  return !Number(row && row.count);
}

async function adminIdentity(request, env) {
  const token = readCookie(request, ADMIN_SESSION_COOKIE);
  if (!token) return { ok: false, actor: "anonymous", method: "session" };
  const row = await env.DB.prepare("SELECT u.*, s.id AS session_id FROM admin_sessions s JOIN admin_users u ON u.id = s.admin_user_id WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ? AND u.status = 'active'").bind(await sha256Exact(token), new Date().toISOString()).first();
  if (!row) return { ok: false, actor: "anonymous", method: "session" };
  return { ok: true, actor: row.id, method: "personal-account", user: publicAdminUser(row), sessionId: row.session_id };
}

async function issueAdminSession(env, user) {
  const token = randomSecret(32);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_SECONDS * 1000).toISOString();
  await env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at <= ? OR revoked_at IS NOT NULL").bind(new Date().toISOString()).run();
  await env.DB.prepare("INSERT INTO admin_sessions (id, admin_user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)").bind(randomId("ses_"), user.id, await sha256Exact(token), expiresAt).run();
  return { token: token, expiresAt: expiresAt };
}

async function authStatus(request, env) {
  const identity = await adminIdentity(request, env);
  return json({ authenticated: identity.ok, setupRequired: await adminSetupRequired(env), actor: identity.ok ? identity.user.displayName + " · " + identity.user.phone : "", method: identity.method, user: identity.ok ? identity.user : null });
}

async function registerOwner(request, env) {
  if (!(await adminSetupRequired(env))) return json({ error: "registration_closed", message: "农场主账号已经注册，后台不再开放自行注册" }, 409);
  const payload = await readBody(request);
  const phone = normalizePhone(payload.phone);
  const password = String(payload.password || "");
  const displayName = String(payload.displayName || "农场主").trim().slice(0, 30) || "农场主";
  if (!validPhone(phone)) return json({ error: "invalid_phone", message: "请输入正确的11位手机号" }, 400);
  const passwordMessage = passwordProblem(password);
  if (passwordMessage) return json({ error: "weak_password", message: passwordMessage }, 400);
  const source = String(request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const setupBucket = "setup:" + (await sha256Exact(source)).slice(0, 24);
  const setupAttempt = await loginAttempt(env, setupBucket);
  const now = new Date().toISOString();
  if (setupAttempt && setupAttempt.blocked_until && setupAttempt.blocked_until > now) return json({ error: "setup_locked", message: "首次注册尝试次数过多，请15分钟后再试" }, 429);
  if (!env.ADMIN_ACCESS_KEY || !constantTimeEqual(await sha256(String(payload.setupKey || "")), await sha256(env.ADMIN_ACCESS_KEY))) {
    const failure = await recordLoginFailure(env, setupBucket, null);
    return json({ error: failure.blockedUntil ? "setup_locked" : "invalid_setup_key", message: failure.blockedUntil ? "首次注册尝试次数过多，请15分钟后再试" : "首次注册校验码不正确" }, failure.blockedUntil ? 429 : 403);
  }

  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const user = { id: randomId("adm_"), phone: phone, displayName: displayName, role: "owner" };
  const hash = await passwordHash(password, salt, PASSWORD_ITERATIONS);
  try {
    await env.DB.prepare("INSERT INTO admin_users (id, phone, display_name, password_hash, password_salt, password_iterations, role, status) VALUES (?, ?, ?, ?, ?, ?, 'owner', 'active')").bind(user.id, phone, displayName, hash, bytesToBase64(salt), PASSWORD_ITERATIONS).run();
  } catch {
    return json({ error: "registration_closed", message: "农场主账号已经注册，后台不再开放自行注册" }, 409);
  }
  await env.DB.prepare("DELETE FROM admin_login_attempts WHERE phone = ?").bind(setupBucket).run();
  const session = await issueAdminSession(env, user);
  await audit(env, user.id, "register", "admin_user", user.id, { role: "owner", phone: maskedPhone(phone) });
  return json({ authenticated: true, setupRequired: false, actor: displayName + " · " + maskedPhone(phone), user: { id: user.id, displayName: displayName, phone: maskedPhone(phone), role: "owner", phoneVerified: false } }, 201, { "set-cookie": adminSessionCookie(session.token, ADMIN_SESSION_SECONDS) });
}

async function loginAttempt(env, phone) {
  return env.DB.prepare("SELECT * FROM admin_login_attempts WHERE phone = ?").bind(phone).first();
}

async function recordLoginFailure(env, phone, user) {
  const now = new Date();
  const previous = await loginAttempt(env, phone);
  const previousStart = previous && new Date(previous.window_started_at).getTime();
  const withinWindow = previousStart && now.getTime() - previousStart < LOGIN_WINDOW_MS;
  const count = withinWindow ? Number(previous.failure_count || 0) + 1 : 1;
  const windowStartedAt = withinWindow ? previous.window_started_at : now.toISOString();
  const blockedUntil = count >= LOGIN_FAILURE_LIMIT ? new Date(now.getTime() + LOGIN_BLOCK_MS).toISOString() : null;
  await env.DB.prepare("INSERT INTO admin_login_attempts (phone, failure_count, window_started_at, blocked_until, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(phone) DO UPDATE SET failure_count = excluded.failure_count, window_started_at = excluded.window_started_at, blocked_until = excluded.blocked_until, updated_at = CURRENT_TIMESTAMP").bind(phone, count, windowStartedAt, blockedUntil).run();
  if (user) await env.DB.prepare("UPDATE admin_users SET failed_login_count = ?, locked_until = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(count, blockedUntil, user.id).run();
  return { count: count, blockedUntil: blockedUntil };
}

async function loginAdmin(request, env) {
  const payload = await readBody(request);
  const phone = normalizePhone(payload.phone);
  const password = String(payload.password || "");
  if (!validPhone(phone) || !password) return json({ error: "invalid_credentials", message: "手机号或密码不正确" }, 401);
  const attempt = await loginAttempt(env, phone);
  const now = new Date().toISOString();
  if (attempt && attempt.blocked_until && attempt.blocked_until > now) return json({ error: "login_locked", message: "尝试次数过多，请15分钟后再试" }, 429);
  const user = await env.DB.prepare("SELECT * FROM admin_users WHERE phone = ?").bind(phone).first();
  const dummy = { password_salt: bytesToBase64(new Uint8Array(16)), password_iterations: PASSWORD_ITERATIONS, password_hash: "invalid" };
  const valid = await verifyPassword(password, user || dummy);
  if (!user || user.status !== "active" || !valid) {
    const failure = await recordLoginFailure(env, phone, user);
    return json({ error: failure.blockedUntil ? "login_locked" : "invalid_credentials", message: failure.blockedUntil ? "尝试次数过多，请15分钟后再试" : "手机号或密码不正确" }, failure.blockedUntil ? 429 : 401);
  }
  await env.DB.batch([
    env.DB.prepare("DELETE FROM admin_login_attempts WHERE phone = ?").bind(phone),
    env.DB.prepare("UPDATE admin_users SET failed_login_count = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(user.id),
  ]);
  const session = await issueAdminSession(env, user);
  await audit(env, user.id, "login", "admin_session", user.id, { phone: maskedPhone(phone) });
  return json({ authenticated: true, setupRequired: false, actor: user.display_name + " · " + maskedPhone(phone), user: publicAdminUser(user) }, 200, { "set-cookie": adminSessionCookie(session.token, ADMIN_SESSION_SECONDS) });
}

async function logoutAdmin(request, env) {
  const token = readCookie(request, ADMIN_SESSION_COOKIE);
  if (token) await env.DB.prepare("UPDATE admin_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ? AND revoked_at IS NULL").bind(await sha256Exact(token)).run();
  return json({ ok: true }, 200, { "set-cookie": adminSessionCookie("", 0) });
}

async function requireAdmin(request, env) {
  const identity = await adminIdentity(request, env);
  if (!identity.ok) return { response: json({ error: "admin_unauthorized", message: "请使用个人管理员账号登录后台" }, 401) };
  return { identity: identity };
}

async function readBody(request) {
  try { return await request.json(); } catch { throw new Error("invalid_json"); }
}

function addressIsValid(address) {
  return address && String(address.receiver || "").trim() && /^1\d{10}$/.test(String(address.phone || "").trim()) && String(address.province || "").trim() && String(address.city || "").trim() && String(address.district || "").trim() && String(address.detail || "").trim();
}

async function pricedItems(env, items) {
  if (!Array.isArray(items) || !items.length) throw new Error("empty_items");
  const priced = [];
  for (const item of items) {
    const row = await env.DB.prepare("SELECT * FROM products WHERE id = ? AND active = 1").bind(String(item.id || "")).first();
    if (!row) throw new Error("product_unavailable");
    const quantity = Math.min(99, Math.max(1, Math.floor(Number(item.quantity || 1))));
    if (row.inventory < quantity) throw new Error("insufficient_inventory");
    const data = safeJson(row.data_json, {});
    const seasonalProduct = Object.assign({}, data, { id: row.id });
    const season = productSeason(seasonalProduct);
    priced.push({ id: row.id, name: row.name, spec: data.spec || "", image: data.image || "", quantity: quantity, price: row.price_cents / 100, priceCents: row.price_cents, fulfillment: data.fulfillment || {}, saleMode: productSaleMode(seasonalProduct), season: season, seasonLabel: data.seasonLabel || PRODUCT_SEASON_LABELS[season], preorderNote: data.preorderNote || "成熟后按批次发出" });
  }
  return priced;
}

function packingPlan(items) {
  const groups = {};
  for (const item of items) {
    const system = item.fulfillment && item.fulfillment.packageSystem ? item.fulfillment.packageSystem : "ambient";
    if (!groups[system]) groups[system] = [];
    groups[system].push({ id: item.id, name: item.name, quantity: item.quantity });
  }
  return { packageCount: Object.keys(groups).length, groups: groups, generatedBy: "fulfillment-rules-v1" };
}

async function audit(env, actor, action, type, id, detail) {
  await env.DB.prepare("INSERT INTO audit_logs (actor, action, entity_type, entity_id, detail_json) VALUES (?, ?, ?, ?, ?)").bind(actor, action, type, id, JSON.stringify(detail || {})).run();
}

async function createOrder(request, env) {
  const payload = await readBody(request);
  if (!addressIsValid(payload.address)) return json({ error: "invalid_address", message: "请完整填写收货地址" }, 400);
  const items = await pricedItems(env, payload.items);
  const subtotalCents = items.reduce(function (sum, item) { return sum + item.priceCents * item.quantity; }, 0);
  const shippingCents = subtotalCents >= 19900 ? 0 : 1800;
  const orderType = items.some(function (item) { return item.saleMode === "preorder"; }) ? "preorder" : "purchase";
  const id = randomId("ord_");
  const number = orderNumber("SDW");
  await env.DB.prepare("INSERT INTO orders (id, order_no, order_type, customer_name, phone, address_json, items_json, subtotal_cents, shipping_cents, total_cents, payment_method, payment_status, fulfillment_status, packing_plan_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending_review', ?)").bind(id, number, orderType, payload.address.receiver.trim(), payload.address.phone.trim(), JSON.stringify(payload.address), JSON.stringify(items), subtotalCents, shippingCents, subtotalCents + shippingCents, String(payload.payment || "wechat"), JSON.stringify(Object.assign({}, packingPlan(items), { orderType: orderType }))).run();
  return json(publicOrder(await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first()), 201);
}

async function validateVoucher(request, env) {
  const payload = await readBody(request);
  const code = String(payload.code || "").trim().toUpperCase();
  if (!code) return json({ error: "missing_code", message: "请输入卡券兑换码" }, 400);
  const row = await env.DB.prepare("SELECT * FROM vouchers WHERE code_hash = ?").bind(await sha256(code)).first();
  if (!row) return json({ error: "voucher_not_found", message: "没有找到这张卡券，请检查卡密后重试" }, 404);
  if (row.status !== "active") return json({ error: "voucher_unavailable", message: row.status === "activated" ? "这张年卡已经激活" : "这张卡券当前不可使用" }, 409);
  if (row.expires_at && row.expires_at < new Date().toISOString().slice(0, 10)) return json({ error: "voucher_expired", message: "这张卡券已经过期" }, 410);
  const metadata = safeJson(row.metadata_json, {});
  return json({ id: row.id, code: code, type: row.voucher_type, name: row.name, value: row.face_value_cents / 100, balance: row.balance_cents / 100, expiresAt: row.expires_at, eligibleProductIds: metadata.eligibleProductIds || [], allowTopUp: metadata.allowTopUp !== false, allowAddOns: metadata.allowAddOns !== false, deliveryPlan: metadata.deliveryPlan || null });
}

async function activateAnnualVoucher(env, row, code, payload) {
  if (!addressIsValid(payload.address)) return json({ error: "invalid_address", message: "请完整填写收货地址" }, 400);
  const address = payload.address;
  const orderId = randomId("ord_");
  const number = orderNumber("NK");
  const item = { id: "egg-annual-card", name: row.name, spec: "连续12个月 · 每月1箱30枚", image: "/assets/eggs.webp", quantity: 1, price: row.face_value_cents / 100 };
  const subscriptionId = randomId("sub_");
  const update = env.DB.prepare("UPDATE vouchers SET status = 'activated', activated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active'").bind(row.id);
  const order = env.DB.prepare("INSERT INTO orders (id, order_no, order_type, customer_name, phone, address_json, items_json, subtotal_cents, credit_cents, total_cents, payment_method, payment_status, fulfillment_status, packing_plan_json) VALUES (?, ?, 'annual_card_activation', ?, ?, ?, ?, ?, ?, 0, 'voucher', 'paid', 'scheduled', ?)").bind(orderId, number, address.receiver.trim(), address.phone.trim(), JSON.stringify(address), JSON.stringify([item]), row.face_value_cents, row.face_value_cents, JSON.stringify({ packageCount: 12, schedule: "monthly", eggsPerBox: 30 }));
  const subscription = env.DB.prepare("INSERT INTO subscriptions (id, voucher_id, order_id, customer_name, phone, address_json, starts_on, months) VALUES (?, ?, ?, ?, ?, ?, '2027-01-01', 12)").bind(subscriptionId, row.id, orderId, address.receiver.trim(), address.phone.trim(), JSON.stringify(address));
  const deliveries = [];
  for (let month = 1; month <= 12; month += 1) deliveries.push(env.DB.prepare("INSERT INTO subscription_deliveries (id, subscription_id, delivery_month, quantity, eggs_per_box) VALUES (?, ?, ?, 1, 30)").bind(randomId("del_"), subscriptionId, "2027-" + String(month).padStart(2, "0")));
  const results = await env.DB.batch([update, order, subscription].concat(deliveries));
  if (!results[0] || !results[0].meta || results[0].meta.changes !== 1) return json({ error: "voucher_already_used", message: "这张年卡已经被激活" }, 409);
  return json({ id: number, orderNo: number, type: "annual_card_activation", status: "confirmed", subscriptionId: subscriptionId, startsOn: "2027-01-01", months: 12, eggsPerBox: 30, codeHint: code.slice(-4) }, 201);
}

async function createRedemption(request, env) {
  const payload = await readBody(request);
  const code = String(payload.voucherCode || "").trim().toUpperCase();
  const row = await env.DB.prepare("SELECT * FROM vouchers WHERE code_hash = ?").bind(await sha256(code)).first();
  if (!row || row.status !== "active") return json({ error: "voucher_unavailable", message: "卡券不存在或已经使用" }, 409);
  if (row.voucher_type === "annual_card") return activateAnnualVoucher(env, row, code, payload);
  if (!addressIsValid(payload.address)) return json({ error: "invalid_address", message: "请完整填写收货地址" }, 400);
  const items = await pricedItems(env, payload.items);
  const subtotalCents = items.reduce(function (sum, item) { return sum + item.priceCents * item.quantity; }, 0);
  const shippingCents = subtotalCents >= 19900 ? 0 : 1800;
  const creditCents = Math.min(row.balance_cents, subtotalCents + shippingCents);
  const totalCents = subtotalCents + shippingCents - creditCents;
  const remaining = row.balance_cents - creditCents;
  const id = randomId("ord_");
  const number = orderNumber("DH");
  const update = env.DB.prepare("UPDATE vouchers SET balance_cents = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active'").bind(remaining, remaining === 0 ? "used" : "active", row.id);
  const insert = env.DB.prepare("INSERT INTO orders (id, order_no, order_type, customer_name, phone, address_json, items_json, subtotal_cents, shipping_cents, credit_cents, total_cents, payment_method, payment_status, fulfillment_status, packing_plan_json) VALUES (?, ?, 'redemption', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', ?)").bind(id, number, payload.address.receiver.trim(), payload.address.phone.trim(), JSON.stringify(payload.address), JSON.stringify(items), subtotalCents, shippingCents, creditCents, totalCents, String(payload.payment || "wechat"), totalCents > 0 ? "pending" : "paid", JSON.stringify(packingPlan(items)));
  await env.DB.batch([update, insert]);
  return json({ id: number, orderNo: number, type: "redemption", status: totalCents > 0 ? "pending_payment" : "confirmed", topUpAmount: totalCents / 100, remainingBalance: remaining / 100 }, 201);
}

async function listProducts(env, admin) {
  const result = await env.DB.prepare(admin ? "SELECT * FROM products ORDER BY sort_order, updated_at DESC" : "SELECT * FROM products WHERE active = 1 ORDER BY sort_order, updated_at DESC").all();
  return json({ products: (result.results || []).map(publicProduct) });
}

async function listFarmLogs(env, admin) {
  const result = await env.DB.prepare(admin ? "SELECT * FROM farm_logs ORDER BY log_date DESC, created_at DESC LIMIT 60" : "SELECT * FROM farm_logs WHERE published = 1 ORDER BY log_date DESC, created_at DESC LIMIT 14").all();
  return json({ logs: (result.results || []).map(publicFarmLog) });
}

async function adminDashboard(env) {
  const rows = await env.DB.batch([env.DB.prepare("SELECT COUNT(*) AS count FROM orders"), env.DB.prepare("SELECT COUNT(*) AS count FROM orders WHERE fulfillment_status NOT IN ('delivered', 'cancelled')"), env.DB.prepare("SELECT COUNT(*) AS count FROM vouchers WHERE status = 'active'"), env.DB.prepare("SELECT COUNT(*) AS count FROM subscription_deliveries WHERE status = 'scheduled'"), env.DB.prepare("SELECT COALESCE(SUM(total_cents), 0) AS amount FROM orders WHERE payment_status = 'paid'"), env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 8"), env.DB.prepare("SELECT * FROM products ORDER BY inventory ASC LIMIT 8")]);
  return json({ metrics: { orders: Number(rows[0].results[0].count || 0), pendingFulfillment: Number(rows[1].results[0].count || 0), activeVouchers: Number(rows[2].results[0].count || 0), scheduledDeliveries: Number(rows[3].results[0].count || 0), paidRevenue: Number(rows[4].results[0].amount || 0) / 100 }, recentOrders: (rows[5].results || []).map(publicOrder), lowStock: (rows[6].results || []).map(publicProduct) });
}

async function adminOrders(env, url) {
  const status = url.searchParams.get("status");
  const result = await (status ? env.DB.prepare("SELECT * FROM orders WHERE fulfillment_status = ? ORDER BY created_at DESC LIMIT 100").bind(status) : env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100")).all();
  return json({ orders: (result.results || []).map(publicOrder) });
}

async function updateOrder(request, env, identity, id) {
  const payload = await readBody(request);
  const current = await env.DB.prepare("SELECT * FROM orders WHERE id = ? OR order_no = ?").bind(id, id).first();
  if (!current) return json({ error: "order_not_found", message: "订单不存在" }, 404);
  const fulfillment = ["pending_review", "picking", "packing", "ready_to_ship", "shipped", "delivered", "cancelled"].includes(payload.fulfillmentStatus) ? payload.fulfillmentStatus : current.fulfillment_status;
  const payment = ["pending", "paid", "refunded", "failed"].includes(payload.paymentStatus) ? payload.paymentStatus : current.payment_status;
  await env.DB.prepare("UPDATE orders SET fulfillment_status = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(fulfillment, payment, current.id).run();
  await audit(env, identity.actor, "update", "order", current.id, { fulfillmentStatus: fulfillment, paymentStatus: payment });
  return json(publicOrder(await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(current.id).first()));
}

async function saveProduct(request, env, identity, id) {
  const payload = await readBody(request);
  const productId = id || String(payload.id || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  if (!productId || !String(payload.name || "").trim()) return json({ error: "invalid_product", message: "请填写商品名称和编号" }, 400);
  const existing = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(productId).first();
  const nextData = Object.assign({}, existing ? safeJson(existing.data_json, {}) : {});
  ["detail", "spec", "image", "origin", "delivery", "storage", "description", "batch", "harvest", "sceneImage", "sceneTitle", "sceneBody", "fulfillment", "season", "seasonLabel", "saleMode", "preorderNote"].forEach(function (field) { if (payload[field] !== undefined) nextData[field] = payload[field]; });
  const values = { name: String(payload.name || (existing && existing.name) || "").trim(), category: String(payload.category || (existing && existing.category) || "farm-grown"), categoryLabel: String(payload.categoryLabel || (existing && existing.category_label) || "农场自产"), priceCents: payload.price === undefined && existing ? existing.price_cents : cents(payload.price), inventory: Math.max(0, Math.floor(Number(payload.inventory === undefined && existing ? existing.inventory : payload.inventory || 0))), status: String(payload.status || (existing && existing.sales_status) || "准备上架"), active: payload.active === undefined ? (existing ? existing.active : 1) : payload.active ? 1 : 0, sortOrder: Math.floor(Number(payload.sortOrder === undefined && existing ? existing.sort_order : payload.sortOrder || 0)) };
  if (existing) await env.DB.prepare("UPDATE products SET name = ?, category = ?, category_label = ?, price_cents = ?, inventory = ?, sales_status = ?, active = ?, sort_order = ?, data_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(values.name, values.category, values.categoryLabel, values.priceCents, values.inventory, values.status, values.active, values.sortOrder, JSON.stringify(nextData), productId).run();
  else await env.DB.prepare("INSERT INTO products (id, name, category, category_label, price_cents, inventory, sales_status, active, sort_order, data_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(productId, values.name, values.category, values.categoryLabel, values.priceCents, values.inventory, values.status, values.active, values.sortOrder, JSON.stringify(nextData)).run();
  await audit(env, identity.actor, existing ? "update" : "create", "product", productId, values);
  return json(publicProduct(await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(productId).first()), existing ? 200 : 201);
}

function randomVoucherCode(prefix) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let tail = "";
  for (let index = 0; index < bytes.length; index += 1) tail += alphabet[bytes[index] % alphabet.length];
  return String(prefix || "SDW").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 16) + "-" + tail.slice(0, 4) + "-" + tail.slice(4);
}

async function generateVouchers(request, env, identity) {
  const payload = await readBody(request);
  const count = Math.min(100, Math.max(1, Math.floor(Number(payload.count || 1))));
  const type = payload.type === "annual_card" ? "annual_card" : "gift_balance";
  const name = String(payload.name || (type === "annual_card" ? "2027散养鸡蛋年卡" : "山大王农场礼赠卡"));
  const valueCents = cents(payload.value === undefined ? (type === "annual_card" ? 798 : 200) : payload.value);
  const prefix = String(payload.prefix || (type === "annual_card" ? "SDW-EGG-2027" : "SDW-GIFT"));
  const expiresAt = String(payload.expiresAt || (type === "annual_card" ? "2027-12-31" : "2028-12-31"));
  const metadata = type === "annual_card" ? { deliveryPlan: { startsOn: "2027-01-01", months: 12, boxesPerMonth: 1, eggsPerBox: 30 } } : { eligibleProductIds: DEFAULT_PRODUCTS.filter(function (product) { return product.id !== "egg-annual-card"; }).map(function (product) { return product.id; }), allowTopUp: true, allowAddOns: true };
  const codes = [];
  const statements = [];
  for (let index = 0; index < count; index += 1) {
    const code = randomVoucherCode(prefix);
    codes.push(code);
    statements.push(env.DB.prepare("INSERT INTO vouchers (id, code_hash, code_hint, voucher_type, name, face_value_cents, balance_cents, status, expires_at, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)").bind(randomId("vch_"), await sha256(code), code.slice(-4), type, name, valueCents, type === "gift_balance" ? valueCents : 0, expiresAt, JSON.stringify(metadata)));
  }
  await env.DB.batch(statements);
  await audit(env, identity.actor, "generate", "voucher_batch", prefix, { count: count, type: type, value: valueCents / 100 });
  return json({ codes: codes, count: count, type: type, name: name, warning: "卡密仅在本次生成结果中完整显示，请立即下载保存" }, 201);
}

async function listVouchers(env) {
  const result = await env.DB.prepare("SELECT id, code_hint, voucher_type, name, face_value_cents, balance_cents, status, expires_at, activated_at, created_at FROM vouchers ORDER BY created_at DESC LIMIT 300").all();
  return json({ vouchers: (result.results || []).map(function (row) { return { id: row.id, codeHint: row.code_hint, type: row.voucher_type, name: row.name, value: row.face_value_cents / 100, balance: row.balance_cents / 100, status: row.status, expiresAt: row.expires_at, activatedAt: row.activated_at, createdAt: row.created_at }; }) });
}

async function saveFarmLog(request, env, identity, id) {
  const payload = await readBody(request);
  const logId = id || randomId("log_");
  const logDate = String(payload.logDate || payload.date || new Date().toISOString().slice(0, 10));
  const label = String(payload.label || logDate.slice(5).replace("-", "."));
  const activities = Array.isArray(payload.activities) ? payload.activities : [];
  if (!activities.length) return json({ error: "empty_activities", message: "农场日志至少需要一条农事记录" }, 400);
  const existing = await env.DB.prepare("SELECT id FROM farm_logs WHERE id = ?").bind(logId).first();
  if (existing) await env.DB.prepare("UPDATE farm_logs SET log_date = ?, label = ?, season = ?, summary = ?, activities_json = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(logDate, label, String(payload.season || ""), String(payload.summary || ""), JSON.stringify(activities), payload.published === false ? 0 : 1, logId).run();
  else await env.DB.prepare("INSERT INTO farm_logs (id, log_date, label, season, summary, activities_json, published) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(logId, logDate, label, String(payload.season || ""), String(payload.summary || ""), JSON.stringify(activities), payload.published === false ? 0 : 1).run();
  await audit(env, identity.actor, existing ? "update" : "create", "farm_log", logId, { logDate: logDate, activities: activities.length });
  return json(publicFarmLog(await env.DB.prepare("SELECT * FROM farm_logs WHERE id = ?").bind(logId).first()), existing ? 200 : 201);
}

async function listDeliveries(env, url) {
  const month = url.searchParams.get("month");
  const result = await (month ? env.DB.prepare("SELECT d.*, s.customer_name, s.phone, s.address_json FROM subscription_deliveries d JOIN subscriptions s ON s.id = d.subscription_id WHERE d.delivery_month = ? ORDER BY d.status, s.created_at").bind(month) : env.DB.prepare("SELECT d.*, s.customer_name, s.phone, s.address_json FROM subscription_deliveries d JOIN subscriptions s ON s.id = d.subscription_id ORDER BY d.delivery_month, d.status LIMIT 300")).all();
  return json({ deliveries: (result.results || []).map(function (row) { return { id: row.id, subscriptionId: row.subscription_id, deliveryMonth: row.delivery_month, quantity: row.quantity, eggsPerBox: row.eggs_per_box, status: row.status, trackingNo: row.tracking_no, shippedAt: row.shipped_at, customerName: row.customer_name, phone: row.phone, address: safeJson(row.address_json, {}) }; }) });
}

async function updateDelivery(request, env, identity, id) {
  const payload = await readBody(request);
  const current = await env.DB.prepare("SELECT * FROM subscription_deliveries WHERE id = ?").bind(id).first();
  if (!current) return json({ error: "delivery_not_found", message: "寄送计划不存在" }, 404);
  const status = ["scheduled", "preparing", "packed", "shipped", "delivered", "paused"].includes(payload.status) ? payload.status : current.status;
  const tracking = String(payload.trackingNo === undefined ? current.tracking_no : payload.trackingNo);
  await env.DB.prepare("UPDATE subscription_deliveries SET status = ?, tracking_no = ?, shipped_at = CASE WHEN ? = 'shipped' AND shipped_at IS NULL THEN CURRENT_TIMESTAMP ELSE shipped_at END WHERE id = ?").bind(status, tracking, status, id).run();
  await audit(env, identity.actor, "update", "subscription_delivery", id, { status: status, trackingNo: tracking });
  return json({ ok: true, id: id, status: status, trackingNo: tracking });
}

function apiRouteKnown(pathname) {
  return pathname === "/api/catalog/products" || pathname === "/api/farm-logs" || pathname === "/api/orders" || pathname === "/api/vouchers/validate" || pathname === "/api/redemptions" || pathname === "/api/admin/auth/status" || pathname === "/api/admin/auth/register" || pathname === "/api/admin/auth/login" || pathname === "/api/admin/auth/logout" || pathname === "/api/admin/session" || pathname === "/api/admin/dashboard" || pathname === "/api/admin/products" || /^\/api\/admin\/products\/[^/]+$/.test(pathname) || pathname === "/api/admin/orders" || /^\/api\/admin\/orders\/[^/]+$/.test(pathname) || pathname === "/api/admin/vouchers" || pathname === "/api/admin/farm-logs" || /^\/api\/admin\/farm-logs\/[^/]+$/.test(pathname) || pathname === "/api/admin/deliveries" || /^\/api\/admin\/deliveries\/[^/]+$/.test(pathname);
}

function sameOriginWrite(request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  if (!apiRouteKnown(path)) return json({ error: "not_found" }, 404);
  try {
    await ensureDatabase(env);
    if (path === "/api/catalog/products" && method === "GET") return listProducts(env, false);
    if (path === "/api/farm-logs" && method === "GET") return listFarmLogs(env, false);
    if (path === "/api/orders" && method === "POST") return createOrder(request, env);
    if (path === "/api/vouchers/validate" && method === "POST") return validateVoucher(request, env);
    if (path === "/api/redemptions" && method === "POST") return createRedemption(request, env);
    if (path.startsWith("/api/admin/") && !["GET", "HEAD"].includes(method) && !sameOriginWrite(request)) return json({ error: "cross_origin_blocked", message: "后台请求来源不安全" }, 403);
    if (path === "/api/admin/auth/status" && method === "GET") return authStatus(request, env);
    if (path === "/api/admin/auth/register" && method === "POST") return registerOwner(request, env);
    if (path === "/api/admin/auth/login" && method === "POST") return loginAdmin(request, env);
    if (path === "/api/admin/auth/logout" && method === "POST") return logoutAdmin(request, env);
    const auth = await requireAdmin(request, env);
    if (auth.response) return auth.response;
    if (path === "/api/admin/session" && method === "GET") return json({ authenticated: true, actor: auth.identity.user.displayName + " · " + auth.identity.user.phone, method: auth.identity.method, user: auth.identity.user });
    if (path === "/api/admin/dashboard" && method === "GET") return adminDashboard(env);
    if (path === "/api/admin/products" && method === "GET") return listProducts(env, true);
    if (path === "/api/admin/products" && method === "POST") return saveProduct(request, env, auth.identity, null);
    if (/^\/api\/admin\/products\/[^/]+$/.test(path) && method === "PATCH") return saveProduct(request, env, auth.identity, decodeURIComponent(path.split("/").pop()));
    if (path === "/api/admin/orders" && method === "GET") return adminOrders(env, url);
    if (/^\/api\/admin\/orders\/[^/]+$/.test(path) && method === "PATCH") return updateOrder(request, env, auth.identity, decodeURIComponent(path.split("/").pop()));
    if (path === "/api/admin/vouchers" && method === "GET") return listVouchers(env);
    if (path === "/api/admin/vouchers" && method === "POST") return generateVouchers(request, env, auth.identity);
    if (path === "/api/admin/farm-logs" && method === "GET") return listFarmLogs(env, true);
    if (path === "/api/admin/farm-logs" && method === "POST") return saveFarmLog(request, env, auth.identity, null);
    if (/^\/api\/admin\/farm-logs\/[^/]+$/.test(path) && method === "PATCH") return saveFarmLog(request, env, auth.identity, decodeURIComponent(path.split("/").pop()));
    if (path === "/api/admin/deliveries" && method === "GET") return listDeliveries(env, url);
    if (/^\/api\/admin\/deliveries\/[^/]+$/.test(path) && method === "PATCH") return updateDelivery(request, env, auth.identity, decodeURIComponent(path.split("/").pop()));
    return json({ error: "method_not_allowed" }, 405);
  } catch (error) {
    const known = { database_unavailable: [503, "后台数据库尚未连接"], invalid_json: [400, "提交的数据格式不正确"], empty_items: [400, "订单中没有商品"], product_unavailable: [409, "部分商品已经下架"], insufficient_inventory: [409, "部分商品库存不足"] };
    const mapped = known[error && error.message];
    return json({ error: error && error.message ? error.message : "server_error", message: mapped ? mapped[1] : "系统暂时无法完成这次操作" }, mapped ? mapped[0] : 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "shandawangfarm.com") {
      url.protocol = "https:";
      url.hostname = "www.shandawangfarm.com";
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname.startsWith("/api/")) return handleApi(request, env);
    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept") && request.headers.get("accept").includes("text/html");
    const isAdminRoute = url.pathname === "/admin" || url.pathname.startsWith("/admin/");
    if (response.status !== 404 || !["GET", "HEAD"].includes(request.method) || (!acceptsHtml && !isAdminRoute)) return response;
    const appUrl = new URL(request.url);
    appUrl.pathname = "/";
    appUrl.search = "";
    const appResponse = await env.ASSETS.fetch(new Request(appUrl, request));
    if (!isAdminRoute) return appResponse;
    const headers = new Headers(appResponse.headers);
    headers.set("cache-control", "no-store");
    headers.set("x-robots-tag", "noindex, nofollow, noarchive");
    headers.set("x-frame-options", "DENY");
    headers.set("referrer-policy", "same-origin");
    return new Response(appResponse.body, { status: appResponse.status, statusText: appResponse.statusText, headers: headers });
  },
};

export const __test = { PASSWORD_ITERATIONS, DEFAULT_PRODUCTS, productSaleMode, normalizePhone, validPhone, passwordProblem, passwordHash, verifyPassword, constantTimeEqual, adminSessionCookie, apiRouteKnown };
