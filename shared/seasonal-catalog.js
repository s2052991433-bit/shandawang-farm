const SEASON_META = {
  spring: { label: "春", image: "/assets/season-spring-harvest.jpg", origin: "宁波山间春季产区", baseSort: 200 },
  summer: { label: "夏", image: "/assets/season-summer-harvest.jpg", origin: "宁波山间夏季产区", baseSort: 400 },
  autumn: { label: "秋", image: "/assets/season-autumn-harvest.jpg", origin: "宁波山间秋季产区", baseSort: 600 },
  winter: { label: "冬", image: "/assets/season-winter-harvest.jpg", origin: "宁波山间冬季产区", baseSort: 800 },
};

const KIND_META = {
  fruit: { category: "farm-grown", label: "鲜果", packageSystem: "fruit", fragile: "high", storage: "阴凉处或冷藏保存，成熟后及时食用" },
  vegetable: { category: "vegetables", label: "时蔬", packageSystem: "vegetable", fragile: "medium", storage: "冷藏或阴凉处保存，建议尽快食用" },
  grain: { category: "farm-grown", label: "谷物根茎", packageSystem: "ambient-food", fragile: "low", storage: "置于阴凉、干燥、通风处保存" },
  specialty: { category: "ningbo-specialty", label: "宁波风物", packageSystem: "ambient-food", fragile: "low", storage: "按包装说明置于阴凉处或冷藏保存" },
  tea: { category: "ningbo-select", label: "山间茶", packageSystem: "ambient-food", fragile: "low", storage: "密封、避光、防潮保存" },
  seafood: { category: "ningbo-select", label: "东海鲜味", packageSystem: "chilled", fragile: "medium", storage: "收到后立即冷藏或冷冻，并按说明尽快食用" },
  "new-year": { category: "new-year-goods", label: "宁波年货", packageSystem: "ambient-food", fragile: "low", storage: "按包装说明冷藏、冷冻或置于阴凉处保存" },
};

function monthCopy(months) {
  const values = months.map(Number);
  if (values.includes(12) && values.includes(1)) return `${values[0]}月—次年${values[values.length - 1]}月`;
  if (values.length === 1) return `${values[0]}月`;
  return `${values[0]}—${values[values.length - 1]}月`;
}

function makeProduct(season, item, index) {
  const seasonMeta = SEASON_META[season];
  const kindMeta = KIND_META[item.kind || "vegetable"];
  const period = monthCopy(item.months);
  const spec = item.spec || item.detail;
  const description = item.description || `${item.name}只在适合的时令安排采收或制作，按成熟度和实际产量进入当期批次。`;
  return {
    id: item.id,
    name: item.name,
    category: kindMeta.category,
    categoryLabel: item.categoryLabel || (item.kind === "new-year" ? "宁波年货" : `${seasonMeta.label}日${kindMeta.label}`),
    price: item.price,
    inventory: item.inventory || 60,
    status: `${seasonMeta.label}季 · ${period}`,
    detail: item.detail,
    spec,
    image: item.image || `/assets/products/${item.id}.jpg`,
    origin: item.origin || `${seasonMeta.origin} · ${["specialty", "tea", "seafood", "new-year"].includes(item.kind) ? "宁波精选" : "农场自产"}`,
    delivery: item.delivery || `进入${period}当季批次后，完成采收、分拣并按订单发出`,
    storage: item.storage || kindMeta.storage,
    description,
    batch: `2027 ${seasonMeta.label}季 ${item.name}批次`,
    harvest: item.harvest || `预计${period}，跟随成熟度分批采收或制作`,
    sceneImage: item.image || `/assets/products/${item.id}.jpg`,
    sceneTitle: item.sceneTitle || `等${item.name}到了自己的时令`,
    sceneBody: item.sceneBody || description,
    fulfillment: {
      temperature: item.temperature || (item.kind === "seafood" ? "chilled" : "ambient"),
      packageSystem: kindMeta.packageSystem,
      boxSize: item.boxSize || "S",
      fragile: kindMeta.fragile,
      compatibleWith: [kindMeta.packageSystem],
    },
    season,
    seasonLabel: seasonMeta.label,
    saleMonths: item.months,
    preorderNote: `预计${period}成熟或制作后分批发出`,
    sortOrder: seasonMeta.baseSort + index * 2,
  };
}

const SPRING_PRODUCTS = [
  { id: "spring-mingqian-tea", name: "宁海望海茶", kind: "tea", price: 128, detail: "明前嫩芽 · 100g", months: [3, 4], origin: "宁海望海岗茶区 · 宁波精选", description: "只取早春嫩芽，摊青、杀青和干燥都跟着当天鲜叶状态调整。" },
  { id: "spring-shepherd-purse", name: "宁波野生荠菜", kind: "vegetable", price: 22, detail: "早春嫩叶 · 500g", months: [2, 3, 4], description: "嫩叶长足、梗还没有变硬时采下，适合包馄饨或清炒。" },
  { id: "spring-broad-beans", name: "慈溪嫩蚕豆", kind: "vegetable", price: 26, detail: "青嫩饱满 · 1kg", months: [4, 5], origin: "慈溪沿海田园 · 宁波精选", description: "豆粒刚刚鼓起、仍保持青嫩时整荚采收，保留春天的清甜。" },
  { id: "spring-sweet-peas", name: "鲜甜豌豆", kind: "vegetable", price: 28, detail: "当日剥食 · 1kg", months: [3, 4, 5], description: "豆荚自然鼓起后分批采摘，不久放，适合清炒和焖饭。" },
  { id: "spring-chives", name: "头刀春韭", kind: "vegetable", price: 20, detail: "头茬细嫩 · 500g", months: [2, 3, 4], description: "入春后的第一茬韭菜，叶片细嫩、香气清亮，清晨割取。" },
  { id: "spring-water-celery", name: "姚江水芹", kind: "vegetable", price: 24, detail: "脆嫩清香 · 500g", months: [2, 3, 4], origin: "姚江沿岸水田 · 宁波精选", description: "水汽充足的地块里慢慢长成，只取茎叶鲜嫩的一段。" },
  { id: "spring-lettuce", name: "脆嫩莴笋", kind: "vegetable", price: 18, detail: "去叶净笋 · 1kg", months: [3, 4, 5], description: "笋茎长足但没有空心时采收，口感脆嫩，适合凉拌或清炒。" },
  { id: "spring-asparagus", name: "春尖芦笋", kind: "vegetable", price: 38, detail: "嫩尖现采 · 500g", months: [3, 4, 5], description: "嫩芽冒出地面后逐根查看，长度与紧实度合适才采。" },
  { id: "spring-malan", name: "宁波马兰头", kind: "vegetable", price: 24, detail: "春野嫩梢 · 300g", months: [2, 3, 4], description: "只取早春最嫩的梢叶，当天清理、预冷，保留宁波春桌上的清香。" },
  { id: "spring-mulberries", name: "紫熟桑葚", kind: "fruit", price: 68, detail: "枝头紫熟 · 4盒", months: [4, 5], temperature: "chilled", description: "等果实从红转紫、轻触微软时清晨采下，当天进入冷链。" },
  { id: "spring-cherries", name: "四明山樱桃", kind: "fruit", price: 98, detail: "小果浓甜 · 4盒", months: [4, 5], origin: "四明山樱桃园 · 宁波精选", temperature: "chilled", description: "成熟期短，按颜色和果柄状态逐批采摘，不提前抢青。" },
  { id: "spring-toon-shoots", name: "香椿嫩芽", kind: "vegetable", price: 32, detail: "头茬嫩芽 · 300g", months: [3, 4], description: "芽梗还脆、叶片尚未完全展开时采下，香气更干净。" },
  { id: "spring-radishes", name: "樱桃萝卜", kind: "vegetable", price: 18, detail: "脆甜小根 · 500g", months: [2, 3, 4], description: "根茎长到一口大小时整株拔取，保留鲜亮叶梗和清脆口感。" },
  { id: "spring-rapeseed-shoots", name: "早春菜薹", kind: "vegetable", price: 20, detail: "嫩薹带花 · 500g", months: [2, 3], description: "花苞初显、茎秆仍嫩时采收，错过几天口感就会不同。" },
  { id: "spring-pea-shoots", name: "豌豆苗", kind: "vegetable", price: 22, detail: "嫩梢手掐 · 300g", months: [2, 3, 4], description: "只掐藤尖最嫩的一段，当天预冷装袋，保持叶片水分。" },
  { id: "spring-potatoes", name: "宁海春收新土豆", kind: "grain", price: 32, detail: "薄皮粉糯 · 2.5kg", months: [4, 5], origin: "宁海山地农田 · 宁波精选", description: "表皮刚刚稳定时起垄，保留自然大小差异，不做过度清洗。" },
  { id: "spring-green-plums", name: "奉化青梅", kind: "fruit", price: 48, detail: "青脆饱满 · 2kg", months: [4, 5], origin: "奉化山坡梅园 · 宁波精选", description: "果实长足、酸香清楚时采下，适合泡酒、制酱或腌渍。" },
];

const SUMMER_PRODUCTS = [
  { id: "summer-watermelons", name: "象山大塘港西瓜", kind: "fruit", price: 58, detail: "一藤一果 · 2枚", months: [6, 7, 8], origin: "象山大塘港瓜田 · 宁波精选", description: "看卷须、听声音并记录坐果天数，达到成熟度以后再离藤。" },
  { id: "summer-muskmelons", name: "慈溪网纹甜瓜", kind: "fruit", price: 68, detail: "自然起香 · 4枚", months: [6, 7, 8], origin: "慈溪沿海瓜田 · 宁波精选", description: "网纹长足、果蒂附近有自然香气时采摘，常温回香后食用。" },
  { id: "summer-blueberries", name: "宁海山地蓝莓", kind: "fruit", price: 88, detail: "晨采鲜果 · 4盒", months: [5, 6, 7], origin: "宁海山地果园 · 宁波精选", temperature: "chilled", description: "果粉完整、颜色转深后逐串挑采，采后尽快预冷。" },
  { id: "summer-loofah", name: "鄞州棱角丝瓜", kind: "vegetable", price: 20, detail: "嫩瓜现摘 · 1kg", months: [6, 7, 8, 9], origin: "鄞州近郊菜地 · 宁波精选", description: "瓜身仍嫩、纤维还没有变粗时清晨采下，适合清炒或煮汤。" },
  { id: "summer-bitter-melon", name: "白玉苦瓜", kind: "vegetable", price: 26, detail: "脆嫩少苦 · 1kg", months: [6, 7, 8, 9], description: "果棱饱满、颜色仍清亮时采收，保留夏季瓜果的清脆。" },
  { id: "summer-okra", name: "嫩荚秋葵", kind: "vegetable", price: 24, detail: "晨采嫩荚 · 500g", months: [7, 8, 9], description: "每天清晨逐株查看，荚果尚嫩时及时剪下。" },
  { id: "summer-sweet-corn", name: "慈溪水果玉米", kind: "grain", price: 32, detail: "乳熟采收 · 8穗", months: [6, 7, 8], origin: "慈溪沿海农田 · 宁波精选", description: "籽粒进入乳熟期后采收，甜度和水分都集中在短暂几天里。" },
  { id: "summer-wax-gourd", name: "迷你冬瓜", kind: "vegetable", price: 28, detail: "小果型 · 约2.5kg", months: [7, 8, 9], description: "果面蜡粉稳定、瓜身结实后剪藤，适合家庭一次食用。" },
  { id: "summer-yardlong-beans", name: "清晨长豇豆", kind: "vegetable", price: 22, detail: "细嫩无筋 · 1kg", months: [6, 7, 8, 9], description: "豆荚长足但种子尚未鼓硬时采下，保持细嫩口感。" },
  { id: "summer-plums", name: "四明山青脆李", kind: "fruit", price: 58, detail: "酸甜脆口 · 2kg", months: [6, 7], origin: "四明山李园 · 宁波精选", description: "果面转色、果肉仍脆时分批采摘，酸甜度跟着日照变化。" },
  { id: "summer-grapes", name: "慈溪甬优葡萄", kind: "fruit", price: 98, detail: "整穗成熟 · 3kg", months: [7, 8, 9], origin: "慈溪葡萄园 · 宁波精选", description: "整穗观察转色和甜度，达到采收标准后剪穗、套袋装箱。" },
  { id: "summer-lotus-shoots", name: "余姚河姆渡藕带", kind: "vegetable", price: 36, detail: "水田现取 · 500g", months: [5, 6, 7], origin: "余姚河姆渡水田 · 宁波精选", temperature: "chilled", description: "藕带仍白嫩时从水田取出，清洗后尽快预冷发出。" },
  { id: "summer-fresh-lilies", name: "宁海长街蛏子", kind: "seafood", price: 58, detail: "滩涂鲜活 · 1kg", months: [5, 6, 7], origin: "宁海长街蛏子产区 · 宁波精选", temperature: "chilled", description: "按潮汐起捕、吐沙净养后冷链发出，保留宁波沿海的当季鲜味。" },
  { id: "summer-green-peppers", name: "奉化薄皮青椒", kind: "vegetable", price: 20, detail: "清脆微辣 · 1kg", months: [6, 7, 8, 9], origin: "奉化近郊菜地 · 宁波精选", description: "果皮薄亮、手感紧实时采下，按辣度与大小分装。" },
];

const AUTUMN_PRODUCTS = [
  { id: "autumn-pears", name: "慈溪蜜梨", kind: "fruit", price: 78, detail: "清甜多汁 · 8枚", months: [8, 9, 10], origin: "慈溪蜜梨园 · 宁波精选", description: "果皮转亮、果肉水分充足后分批采摘，使用果托防压。" },
  { id: "autumn-pomelo", name: "象山红心香柚", kind: "fruit", price: 68, detail: "树熟清甜 · 2枚", months: [9, 10, 11], origin: "象山柚园 · 宁波精选", description: "果实长足、香气稳定后离树，常温静置几天风味更柔和。" },
  { id: "autumn-pomegranates", name: "四明山石榴", kind: "fruit", price: 72, detail: "籽粒晶亮 · 6枚", months: [9, 10], origin: "四明山南坡果园 · 宁波精选", description: "果皮转色、棱线清楚后逐枚采下，避免裂果和挤压。" },
  { id: "autumn-chestnuts", name: "余姚板栗", kind: "grain", price: 48, detail: "新鲜栗果 · 2kg", months: [9, 10, 11], origin: "余姚山林栗园 · 宁波精选", description: "栗蓬自然开裂后收取，完成挑选和短时风干再装袋。" },
  { id: "autumn-taro", name: "奉化芋艿头", kind: "grain", price: 46, detail: "粉糯细滑 · 2.5kg", months: [9, 10, 11], description: "芋叶自然转黄后起垄，晾去表面水汽再按大小分装。" },
  { id: "autumn-pumpkin", name: "宁海贝贝南瓜", kind: "vegetable", price: 38, detail: "粉糯栗香 · 4枚", months: [8, 9, 10, 11], origin: "宁海山地瓜田 · 宁波精选", description: "果柄木质化、瓜皮稳定后剪下，短时后熟再进入订单。" },
  { id: "autumn-peanuts", name: "慈溪带壳鲜花生", kind: "grain", price: 32, detail: "新挖水煮 · 2kg", months: [8, 9, 10], origin: "慈溪沿海农田 · 宁波精选", description: "荚果饱满后整株起收，去泥通风，适合当季水煮。" },
  { id: "autumn-lotus-root", name: "余姚河姆渡莲藕", kind: "vegetable", price: 36, detail: "湖田整节 · 2kg", months: [9, 10, 11], origin: "余姚河姆渡水田 · 宁波精选", description: "藕节长足后人工摸取，保留完整藕节减少失水。" },
  { id: "autumn-water-chestnuts", name: "慈城荸荠", kind: "vegetable", price: 32, detail: "脆甜多汁 · 2kg", months: [10, 11, 12], origin: "江北慈城水田 · 宁波精选", description: "球茎饱满、外皮转深后挖取，清洗分级后装箱。" },
  { id: "autumn-new-rice", name: "鄞州新季晚稻米", kind: "grain", price: 68, detail: "当季新碾 · 5kg", months: [10, 11], origin: "鄞州晚稻田 · 宁波精选", description: "稻谷成熟晾晒后分批新碾，保留新米自然清香。" },
  { id: "autumn-red-rice", name: "山田红糙米", kind: "grain", price: 76, detail: "带糠新米 · 3kg", months: [10, 11, 12], description: "成熟后低温烘干并保留米糠层，口感有自然谷物香。" },
  { id: "autumn-shiitake", name: "四明山鲜香菇", kind: "vegetable", price: 42, detail: "菌盖厚实 · 500g", months: [9, 10, 11], origin: "四明山菌菇产区 · 宁波精选", temperature: "chilled", description: "菌盖展开到合适程度时采下，按大小和完整度分盒。" },
  { id: "autumn-tea-oil", name: "四明山山茶籽油", kind: "specialty", price: 168, detail: "低温初榨 · 500ml", months: [10, 11, 12], origin: "四明山茶园 · 宁波精选", description: "茶果成熟采收、晾晒脱壳后低温压榨，按当年批次装瓶。" },
  { id: "autumn-kiwi", name: "四明山猕猴桃", kind: "fruit", price: 68, detail: "自然后熟 · 2kg", months: [9, 10, 11], origin: "四明山山野果园 · 宁波精选", description: "达到采收硬度后离藤，常温后熟，变软后香气更完整。" },
  { id: "autumn-jujube", name: "象山梭子蟹", kind: "seafood", price: 168, detail: "东海鲜捕 · 4只", months: [8, 9, 10], origin: "象山东海渔港 · 宁波精选", temperature: "chilled", description: "跟随东海开渔和当日船期到港，挑选鲜活规格后冷链发出。" },
  { id: "autumn-radish", name: "宁海露地白萝卜", kind: "vegetable", price: 18, detail: "清甜多汁 · 2.5kg", months: [9, 10, 11], origin: "宁海露地菜园 · 宁波精选", description: "昼夜温差起来后再拔取，根肉紧实、辛辣味更柔和。" },
  { id: "autumn-yam", name: "象山粉糯山药", kind: "grain", price: 48, detail: "细长完整 · 2kg", months: [10, 11, 12], origin: "象山山地农田 · 宁波精选", description: "藤叶转黄后顺沟慢挖，尽量保持根茎完整再分装。" },
];

const WINTER_PRODUCTS = [
  { id: "winter-bamboo-shoots", name: "奉化山林冬笋", kind: "vegetable", price: 88, detail: "雪下鲜挖 · 2kg", months: [12, 1, 2], origin: "奉化竹林 · 宁波精选", description: "沿竹鞭寻找尚未出土的笋芽，肉质紧实、纤维细嫩时采挖。" },
  { id: "winter-red-beauty", name: "象山红美人", kind: "fruit", price: 128, detail: "果冻口感 · 12枚", months: [11, 12, 1], description: "经历降温增甜后测糖、看果皮，达到批次标准再采摘。" },
  { id: "winter-kumquats", name: "宁海清甜金桔", kind: "fruit", price: 58, detail: "带皮可食 · 2kg", months: [11, 12, 1], origin: "宁海金桔园 · 宁波精选", description: "果皮转金黄、香气清楚后整果采下，适合鲜食或泡水。" },
  { id: "winter-sugarcane", name: "慈溪青皮甘蔗", kind: "fruit", price: 48, detail: "清甜多汁 · 5kg", months: [11, 12, 1, 2], origin: "慈溪沿海蔗田 · 宁波精选", description: "入冬糖分稳定后砍收，去叶分段，保持自然水分。" },
  { id: "winter-radish", name: "宁海霜后萝卜", kind: "vegetable", price: 20, detail: "脆甜少辣 · 2.5kg", months: [11, 12, 1, 2], origin: "宁海露地菜园 · 宁波精选", description: "经历低温后再拔取，水分足、辛辣味柔和，适合炖煮。" },
  { id: "winter-napa-cabbage", name: "黄心大白菜", kind: "vegetable", price: 26, detail: "紧实包心 · 2棵", months: [11, 12, 1, 2], description: "菜心自然包紧后整棵采收，去掉外层老叶再装箱。" },
  { id: "winter-spinach", name: "红根菠菜", kind: "vegetable", price: 22, detail: "霜后清甜 · 500g", months: [11, 12, 1, 2], description: "低温里慢慢长成，保留红根采下，叶片厚实清甜。" },
  { id: "winter-cauliflower", name: "宁波红膏炝蟹", kind: "new-year", price: 188, detail: "传统年味 · 2只", months: [11, 12, 1, 2], temperature: "frozen", origin: "宁波沿海渔港 · 宁波年货", description: "选用膏满梭子蟹按宁波传统风味腌制，全程冷链作为年桌海味。" },
  { id: "winter-broccoli", name: "宁波八宝饭", kind: "new-year", price: 48, detail: "糯米果料 · 1盒", months: [11, 12, 1, 2], temperature: "frozen", origin: "宁波本地年货工坊 · 宁波年货", description: "糯米、豆沙与果料分层蒸制，复热后上桌，是宁波年夜饭里的甜味。" },
  { id: "winter-carrots", name: "宁波风鳗", kind: "new-year", price: 138, detail: "海风晾制 · 1条", months: [11, 12, 1, 2], origin: "象山渔港 · 宁波年货", description: "冬日海风里自然晾制，咸香紧实，蒸熟切片就是宁波年桌味道。" },
  { id: "winter-mustard-greens", name: "宁波水晶油包", kind: "new-year", price: 38, detail: "猪油芝麻馅 · 8只", months: [11, 12, 1, 2], temperature: "frozen", origin: "宁波本地面点工坊 · 宁波年货", description: "松软面皮包入猪油芝麻馅，蒸热后油润香甜。" },
  { id: "winter-celery", name: "三北豆酥糖", kind: "new-year", price: 36, detail: "层层酥松 · 2盒", months: [11, 12, 1, 2], origin: "慈溪三北 · 宁波年货", description: "黄豆粉与糖层层压制，入口酥松，是慈溪三北传统茶点。" },
  { id: "winter-leeks", name: "宁波油赞子", kind: "new-year", price: 32, detail: "现炸酥脆 · 2袋", months: [11, 12, 1, 2], origin: "宁波本地老工坊 · 宁波年货", description: "面团搓制后分批炸制，咸甜两味都保留宁波老式年货口感。" },
  { id: "winter-baby-mustard", name: "奉化千层饼", kind: "new-year", price: 36, detail: "层酥葱香 · 2盒", months: [11, 12, 1, 2], origin: "奉化溪口 · 宁波年货", description: "薄层叠酥、葱香清楚，按批烘烤后密封装盒。" },
  { id: "winter-pickled-mustard", name: "宁波雪菜", kind: "new-year", price: 28, detail: "低盐腌制 · 500g", months: [11, 12, 1, 2], origin: "鄞州雪菜产区 · 宁波年货", description: "当季雪里蕻收下后分批腌制，保留宁波家常的清鲜风味。" },
  { id: "winter-dried-bamboo", name: "奉化山晒笋干", kind: "new-year", price: 68, detail: "自然晒制 · 500g", months: [11, 12, 1, 2], origin: "奉化竹乡 · 宁波年货", description: "春笋煮制后自然晾晒，冬季按干燥度复检、分装发出。" },
  { id: "winter-tangyuan", name: "宁波黑芝麻汤圆", kind: "new-year", price: 42, detail: "手作馅心 · 12枚", months: [12, 1, 2], temperature: "frozen", origin: "宁波本地汤圆工坊 · 宁波年货", description: "糯米粉与黑芝麻馅按批制作，成型后冷冻锁鲜发出。" },
];

export const SUPPLEMENTAL_PRODUCTS = [
  ...SPRING_PRODUCTS.map((item, index) => makeProduct("spring", item, index)),
  ...SUMMER_PRODUCTS.map((item, index) => makeProduct("summer", item, index)),
  ...AUTUMN_PRODUCTS.map((item, index) => makeProduct("autumn", item, index)),
  ...WINTER_PRODUCTS.map((item, index) => makeProduct("winter", item, index)),
];

const CORE_SEASONAL_PRODUCT_IDS = [
  "baby-bok-choy",
  "spring-bamboo-shoots",
  "spring-xiangshan-loquat",
  "bayberries",
  "peaches",
  "weekly-vegetable-basket",
  "farm-tomatoes",
  "farm-cucumbers",
  "purple-eggplants",
  "fresh-edamame",
  "autumn-persimmons",
  "autumn-sweet-potatoes",
  "ningbo-rice-cakes",
  "winter-tangerines",
  "winter-greens",
];

export const SEASONAL_PRODUCT_IMAGE_BY_ID = Object.fromEntries(
  [...CORE_SEASONAL_PRODUCT_IDS, ...SUPPLEMENTAL_PRODUCTS.map((product) => product.id)]
    .map((id) => [id, `/assets/products/${id}.jpg`]),
);
