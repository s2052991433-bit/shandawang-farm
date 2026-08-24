import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CaretDown,
  CheckCircle,
  Clock,
  List,
  MagnifyingGlass,
  MapPin,
  Minus,
  Mountains,
  Package,
  Plus,
  ShoppingBagOpen,
  ShoppingCartSimple,
  Ticket,
  Truck,
  UserCircle,
  Wallet,
  X,
} from "@phosphor-icons/react";
import { storeApi } from "./services/storeApi";

const seasons = [
  ["立秋", "8月7日", "山风开始转凉"],
  ["处暑", "8月23日", "早晚采摘更从容"],
  ["白露", "9月7日", "露水养甜秋果"],
  ["秋分", "9月22日", "新米与秋菜登场"],
];

const products = [
  {
    id: "bayberries",
    name: "山里红杨梅",
    detail: "当日清晨采摘 · 2.5kg",
    spec: "2.5kg 保鲜装",
    price: 168,
    status: "本季最后一批",
    image: "/assets/bayberries.webp",
    origin: "宁波山间 · 农场自产",
    delivery: "采摘后24小时内冷链发出",
    storage: "收到后冷藏，建议2天内食用",
    description: "成熟一批采一批，不催熟、不久放。酸甜度会随当天山间天气略有变化。",
    category: "farm-grown",
    categoryLabel: "农场自产",
    batch: "2026 夏末最后一批",
    harvest: "每天清晨按成熟度分批采摘",
    sceneImage: "/assets/bayberries.webp",
    sceneTitle: "果香出来以后，才从枝头带走",
    sceneBody: "杨梅没有统一的采摘日。山坡朝向、树龄和清晨温度都会改变成熟速度，因此每天只采当日适合发出的数量。",
  },
  {
    id: "eggs",
    name: "散养初生蛋",
    detail: "林下散养 · 30枚",
    spec: "30枚缓冲蛋托装",
    price: 98,
    status: "每周二、五发出",
    image: "/assets/eggs.webp",
    origin: "林下鸡舍 · 农场自产",
    delivery: "灯检分级后常温发出",
    storage: "阴凉处存放，冷藏更佳",
    description: "鸡群白天在林地活动，傍晚归舍。鸡蛋按批次捡回、灯检并装入缓冲蛋托。",
    category: "farm-grown",
    categoryLabel: "农场自产",
    batch: "本周林下鸡舍批次",
    harvest: "每天傍晚捡回，每周二、五发出",
    sceneImage: "/assets/farm-egg-collecting.jpg",
    sceneTitle: "太阳落山前，把当天的蛋捡回来",
    sceneBody: "鸡群白天在林地里活动，傍晚归舍。鸡蛋不留到第二天，当天完成捡取、检查、分级与装托。",
  },
  {
    id: "peaches",
    name: "奉化水蜜桃",
    detail: "树熟采摘 · 6枚礼装",
    spec: "6枚果托礼装",
    price: 138,
    status: "采摘后24小时内发出",
    image: "/assets/peaches.webp",
    origin: "奉化东坡桃园 · 当地精选",
    delivery: "按成熟批次采摘发出",
    storage: "常温回软，成熟后及时食用",
    description: "逐棵查看成熟度，达到香气和软硬度后才采。运输中使用独立果托减少碰伤。",
    category: "ningbo-select",
    categoryLabel: "宁波精选",
    batch: "奉化东坡桃园 · 处暑批次",
    harvest: "达到香气与软硬度后分批采摘",
    sceneImage: "/assets/farm-peach-picking.jpg",
    sceneTitle: "趁山雾未散，轻轻旋下成熟的桃子",
    sceneBody: "不是按日历统一采摘，而是逐棵查看成熟度。达到甜度、果香已经出来的桃子，才会从枝头轻轻旋下。",
  },
  {
    id: "ningbo-rice-cakes",
    name: "宁波水磨年糕",
    detail: "传统水磨 · 1kg",
    spec: "1kg 真空保鲜装",
    price: 36,
    status: "每周三新做发出",
    image: "/assets/ningbo-rice-cakes.jpg",
    origin: "宁波本地年糕工坊 · 宁波精选",
    delivery: "制作完成后24小时内常温或冷藏发出",
    storage: "收到后冷藏，建议7天内食用",
    description: "选用当季粳米，经浸泡、水磨、蒸制和舂制完成。口感软糯有韧性，切片煮炒都合适。",
    category: "ningbo-specialty",
    categoryLabel: "宁波特产",
    batch: "本周水磨新做批次",
    harvest: "每周按订单排产，现做现发",
    sceneImage: "/assets/ningbo-rice-cakes.jpg",
    sceneTitle: "米泡足时间，年糕才有自然的韧",
    sceneBody: "年糕不靠香精和增白。粳米充分浸泡后水磨成浆，再经蒸制与舂打形成细密口感，每周按订单安排制作。",
  },
  {
    id: "weekly-vegetable-basket",
    name: "本周农场菜篮",
    detail: "5—6种时蔬 · 约3kg",
    spec: "当周5—6种搭配，约3kg",
    price: 88,
    status: "每周二、五发出",
    image: "/assets/weekly-vegetable-basket.jpg",
    origin: "山大王农场菜地 · 农场自产",
    delivery: "采收后分拣装入时蔬箱，当日发出",
    storage: "叶菜冷藏，瓜果常温或冷藏保存",
    description: "不要求每周一模一样。根据菜地成熟情况搭配叶菜、番茄、黄瓜、茄子与毛豆，让一只菜篮对应真正的当周收成。",
    category: "vegetables",
    categoryLabel: "时令时蔬",
    batch: "处暑本周菜篮",
    harvest: "发货当天清晨采收并组合",
    sceneImage: "/assets/weekly-vegetable-basket.jpg",
    sceneTitle: "菜篮跟着菜地走，不预设固定清单",
    sceneBody: "清晨查看每一畦菜的成熟度，再决定当天菜篮的搭配。叶菜放在上层，瓜果分区固定，减少运输挤压。",
  },
  {
    id: "baby-bok-choy",
    name: "露水小青菜",
    detail: "清晨采收 · 500g",
    spec: "500g 保鲜装",
    price: 18,
    status: "当日采收",
    image: "/assets/baby-bok-choy.jpg",
    origin: "山大王农场叶菜地 · 农场自产",
    delivery: "清晨采收，预冷后装入时蔬箱",
    storage: "冷藏保存，建议2—3天内食用",
    description: "叶片脆嫩，菜梗清甜。只在适合采收的大小上架，不为凑单提前拔菜。",
    category: "vegetables",
    categoryLabel: "时令时蔬",
    batch: "处暑叶菜批次",
    harvest: "发货日清晨带露采收",
    sceneImage: "/assets/baby-bok-choy.jpg",
    sceneTitle: "太阳变热以前，把嫩叶带回分拣棚",
    sceneBody: "叶菜最怕失水。清晨采收后先去掉老叶和泥土，再预冷、套袋并放在时蔬箱上层。",
  },
  {
    id: "farm-tomatoes",
    name: "树熟沙瓤番茄",
    detail: "自然转红 · 1kg",
    spec: "1kg 防压装",
    price: 28,
    status: "红一批采一批",
    image: "/assets/farm-tomatoes.jpg",
    origin: "山大王农场番茄棚 · 农场自产",
    delivery: "达到转色与软硬度后采收发出",
    storage: "常温后熟，成熟后冷藏",
    description: "等番茄自然转红、果肩软下来才采。大小不完全一致，切开能看到自然沙瓤。",
    category: "vegetables",
    categoryLabel: "时令时蔬",
    batch: "处暑树熟批次",
    harvest: "每天傍晚查看转色，次日清晨采收",
    sceneImage: "/assets/farm-tomatoes.jpg",
    sceneTitle: "颜色从果底慢慢红上来，才算成熟",
    sceneBody: "不按统一大小采摘，只看转色、香气和软硬度。成熟番茄单层放置，避免和硬质瓜果互相挤压。",
  },
  {
    id: "farm-cucumbers",
    name: "清香刺黄瓜",
    detail: "脆嫩现摘 · 1kg",
    spec: "1kg 保鲜装",
    price: 22,
    status: "清晨现摘",
    image: "/assets/farm-cucumbers.jpg",
    origin: "山大王农场瓜棚 · 农场自产",
    delivery: "清晨采收，当日常温发出",
    storage: "阴凉处或冷藏，建议4天内食用",
    description: "瓜刺清晰、含水充足，适合凉拌或清炒。按长度和硬度挑选，不使用塑料托盘。",
    category: "vegetables",
    categoryLabel: "时令时蔬",
    batch: "处暑瓜棚批次",
    harvest: "每天清晨逐藤采收",
    sceneImage: "/assets/farm-cucumbers.jpg",
    sceneTitle: "瓜还脆着，就从藤上摘下来",
    sceneBody: "黄瓜生长很快，每天清晨都要逐藤查看。采下后保留短柄，按硬度分级并尽快装箱。",
  },
  {
    id: "purple-eggplants",
    name: "紫皮长茄",
    detail: "鲜嫩少籽 · 800g",
    spec: "800g 防压装",
    price: 24,
    status: "本周采收",
    image: "/assets/weekly-vegetable-basket.jpg",
    origin: "山大王农场茄子地 · 农场自产",
    delivery: "采收后独立隔层装箱",
    storage: "阴凉处保存，避免低温久放",
    description: "表皮自然有光泽，手感紧实。嫩度合适时采下，避免长老后籽多纤维粗。",
    category: "vegetables",
    categoryLabel: "时令时蔬",
    batch: "处暑茄果批次",
    harvest: "达到嫩度后分批采收",
    sceneImage: "/assets/weekly-vegetable-basket.jpg",
    sceneTitle: "看茄蒂和手感，决定今天采哪一根",
    sceneBody: "长茄容易擦伤，采收时保留茄蒂，装箱时与硬质瓜果分层，减少运输中的表皮碰伤。",
  },
  {
    id: "fresh-edamame",
    name: "带荚鲜毛豆",
    detail: "颗粒饱满 · 500g",
    spec: "500g 透气保鲜装",
    price: 20,
    status: "处暑正当季",
    image: "/assets/weekly-vegetable-basket.jpg",
    origin: "山大王农场豆田 · 农场自产",
    delivery: "带荚采收，当日装箱发出",
    storage: "冷藏保存，建议3天内食用",
    description: "豆荚青绿、颗粒已经鼓起但不过老。保留豆荚发出，煮食时豆香更完整。",
    category: "vegetables",
    categoryLabel: "时令时蔬",
    batch: "处暑鲜豆批次",
    harvest: "豆粒饱满后分行采收",
    sceneImage: "/assets/weekly-vegetable-basket.jpg",
    sceneTitle: "豆荚鼓起来，又还没有变硬",
    sceneBody: "每天抽看豆荚成熟度，颗粒饱满、颜色仍鲜绿时采收。带荚透气装袋，避免闷热变黄。",
  },
];

const money = (value) => `¥${Number(value || 0).toFixed(2).replace(".00", "")}`;

const farmLogTemplates = [
  {
    date: "2026-08-24",
    label: "08.24",
    season: "处暑后的第二天",
    summary: "2处农事 · 6张现场图",
    activities: [
      {
        time: "06:20",
        place: "东坡桃园",
        title: "趁山雾未散，采下今天的桃子",
        body: "成熟不是一个统一的时刻。我们逐棵查看，只把达到甜度、果香已经出来的桃子轻轻旋下，再送往分拣棚。",
        images: [
          { src: "/assets/farm-peach-picking.jpg", alt: "清晨在桃树上手工采摘成熟水蜜桃" },
          { src: "/assets/peaches.webp", alt: "刚刚采下、放在竹篮里的水蜜桃" },
          { src: "/assets/farm-peach-sorting.jpg", alt: "分拣棚内按成熟度挑选水蜜桃" },
        ],
      },
      {
        time: "17:40",
        place: "林下鸡舍",
        title: "太阳落山前，把今天的蛋捡回来",
        body: "鸡群白天在林地里活动，傍晚归舍。当天的鸡蛋逐枚捡回，经过检查、分级后装入缓冲蛋托。",
        images: [
          { src: "/assets/farm-egg-collecting.jpg", alt: "傍晚从铺有稻草的鸡舍中捡取鸡蛋" },
          { src: "/assets/eggs.webp", alt: "当天收回的散养鸡蛋" },
          { src: "/assets/farm-egg-checking.jpg", alt: "在自然光下逐枚检查并装托鸡蛋" },
        ],
      },
    ],
  },
  {
    date: "2026-08-23",
    label: "08.23",
    season: "处暑",
    summary: "2处农事 · 5张现场图",
    activities: [
      {
        time: "09:10",
        place: "分拣棚",
        title: "第一轮桃子完成分级",
        body: "先看成熟度，再看果面和大小。适合立即发出的、需要再放一晚的，分别进入不同的竹筐。",
        images: [
          { src: "/assets/farm-peach-sorting.jpg", alt: "农场工作人员在分拣水蜜桃" },
          { src: "/assets/peaches.webp", alt: "竹篮中的成熟水蜜桃" },
          { src: "/assets/farm-peach-picking.jpg", alt: "桃园里仍在树上的成熟水蜜桃" },
        ],
      },
      {
        time: "16:50",
        place: "林下鸡舍",
        title: "鸡群归舍前，补水并查看产蛋",
        body: "傍晚温度下降后补一次清水，也顺手查看草窝。鸡蛋不留到第二天，收回后当天完成检查。",
        images: [
          { src: "/assets/farm-egg-collecting.jpg", alt: "林下鸡舍当天的鸡蛋收集" },
          { src: "/assets/farm-egg-checking.jpg", alt: "收回鸡蛋后的检查与装托" },
        ],
      },
    ],
  },
];

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFarmTime(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatFarmDate(date) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(date).replace("/", ".");
}

function buildLiveFarmLogs(reference = new Date()) {
  return farmLogTemplates.map((template, index) => {
    const date = new Date(reference);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - index);
    return {
      ...template,
      date: localDateKey(date),
      label: formatFarmDate(date),
      season: index === 0 ? "今天" : template.season,
    };
  });
}

function parseRoute(pathname = window.location.pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const productMatch = path.match(/^\/products\/([^/]+)$/);
  if (productMatch) return { name: "product", productId: decodeURIComponent(productMatch[1]), path };
  if (path === "/shop") return { name: "shop", path };
  if (path === "/farm" || path.startsWith("/farm/")) return { name: "farm", date: path.split("/")[2] || null, path };
  if (path === "/redeem") return { name: "redeem", path };
  if (path === "/checkout") return { name: "checkout", path };
  if (path === "/about") return { name: "about", path };
  return { name: "home", path: "/" };
}

const pageMeta = {
  home: ["山大王农场｜来自山林的自然味道", "顺着节气采摘，把此刻成熟的山间食物认真送到你家。"],
  shop: ["当季商城｜山大王农场", "查看山大王农场当季在售、农场自产与宁波精选食物。"],
  farm: ["农场此刻｜山大王农场", "从清晨到傍晚，查看山大王农场今天正在发生的采摘、捡蛋、分拣与装箱。"],
  redeem: ["卡券兑换｜山大王农场", "验证卡券、选择当季食物并完成补差与收货信息。"],
  checkout: ["订单结算｜山大王农场", "确认商品、收货地址、配送方式与支付信息。"],
  about: ["关于山大王｜山大王农场", "宁波山间的一座真实农场，按土地与季节的时间认真做事。"],
};

function IconButton({ label, children, onClick, className = "" }) {
  return <button className={`icon-button ${className}`} aria-label={label} onClick={onClick}>{children}</button>;
}

export function App() {
  const [route, setRoute] = useState(() => parseRoute());
  const [transitioning, setTransitioning] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const [notice, setNotice] = useState("");
  const [farmNow, setFarmNow] = useState(() => new Date());
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("shandawang-cart") || "[]");
    } catch {
      return [];
    }
  });
  const liveFarmLogs = useMemo(() => buildLiveFarmLogs(farmNow), [farmNow]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const timer = window.setInterval(() => setFarmNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("shandawang-cart", JSON.stringify(cart));
    } catch {
      // Keep the session usable if local storage is unavailable.
    }
  }, [cart]);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute());
      setMobileOpen(false);
      setPanel(null);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const product = route.name === "product" ? products.find((item) => item.id === route.productId) : null;
    const [title, description] = product
      ? [`${product.name}｜山大王农场`, `${product.batch}。${product.delivery}。`]
      : pageMeta[route.name] || pageMeta.home;
    document.title = title;
    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.name = "description";
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.content = description;
  }, [route]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (product, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      return [...current, { id: product.id, name: product.name, price: product.price, image: product.image, spec: product.spec, quantity }];
    });
    setNotice(`${product.name} 已加入购物袋`);
  };

  const changeQuantity = (productId, delta) => {
    setCart((current) => current
      .map((item) => item.id === productId ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0));
  };

  const navigate = (path, options = {}) => {
    if (transitioning || window.location.pathname === path) {
      if (window.location.pathname === path) window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setMobileOpen(false);
    setPanel(null);
    const commit = () => {
      if (options.replace) window.history.replaceState({}, "", path);
      else window.history.pushState({}, "", path);
      setRoute(parseRoute(path));
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion && document.startViewTransition) {
      setTransitioning(true);
      const transition = document.startViewTransition(commit);
      transition.finished.finally(() => setTransitioning(false));
    } else if (!reduceMotion) {
      setTransitioning(true);
      window.setTimeout(commit, 240);
      window.setTimeout(() => setTransitioning(false), 760);
    } else {
      commit();
    }
  };

  const currentProduct = route.name === "product" ? products.find((product) => product.id === route.productId) || products[0] : null;

  if (route.name === "checkout") {
    return <CheckoutFlow cart={cart} close={() => navigate("/shop")} complete={() => setCart([])} />;
  }

  if (route.name === "redeem") {
    return <VoucherFlow close={() => navigate("/")} />;
  }

  return (
    <div className={`site-shell ${transitioning ? "is-transitioning" : ""}`} data-route={route.name}>
      <header className="site-header">
        <button className="brand" onClick={() => navigate("/")} aria-label="返回山大王农场首页">
          <span className="brand-mark"><Mountains weight="thin" /></span>
          <span><strong>山大王农场</strong><small>SHAN DA WANG FARM</small></span>
        </button>

        <nav className={`main-nav ${mobileOpen ? "is-open" : ""}`} aria-label="主导航">
          <button className={route.name === "shop" || route.name === "product" ? "is-active" : ""} onClick={() => navigate("/shop")}>当季商城 <CaretDown size={13} /></button>
          <button className={route.name === "farm" ? "is-active" : ""} onClick={() => navigate("/farm")}>农场此刻</button>
          <button onClick={() => navigate("/redeem")}>卡券兑换</button>
          <button className={route.name === "about" ? "is-active" : ""} onClick={() => navigate("/about")}>关于山大王</button>
        </nav>

        <div className="header-actions">
          <button className="search-trigger" aria-label="搜索" onClick={() => setPanel("search")}><span>搜索商品</span><MagnifyingGlass /></button>
          <IconButton label="个人中心" onClick={() => setNotice("会员中心将在交易系统接入后开放")}><UserCircle /></IconButton>
          <IconButton label={`购物袋，${cartCount}件商品`} className="cart-trigger" onClick={() => setPanel("cart")}><ShoppingCartSimple />{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</IconButton>
          <IconButton label={mobileOpen ? "关闭导航" : "打开导航"} className="menu-button" onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <X /> : <List />}</IconButton>
        </div>
      </header>

      <main>
        {route.name === "home" && <><ImmersiveHero variant="home" now={farmNow} navigate={navigate} /><HomeContent addToCart={addToCart} navigate={navigate} liveFarmLogs={liveFarmLogs} /></>}
        {route.name === "shop" && <><ImmersiveHero variant="shop" now={farmNow} navigate={navigate} /><ShopContent addToCart={addToCart} navigate={navigate} /></>}
        {route.name === "farm" && <><ImmersiveHero variant="farm" now={farmNow} navigate={navigate} /><FarmContent initialDate={route.date} farmLogs={liveFarmLogs} navigate={navigate} /></>}
        {route.name === "product" && <ProductPage key={currentProduct.id} product={currentProduct} addToCart={addToCart} navigate={navigate} />}
        {route.name === "about" && <AboutContent navigate={navigate} />}
      </main>

      <footer className="site-footer">
        <div><p className="footer-brand">山大王农场</p><p>宁波山间的一座真实农场，把应季食物认真送到你家。</p></div>
        <nav className="footer-meta" aria-label="页脚导航"><button onClick={() => navigate("/farm")}>农场日志</button><button onClick={() => navigate("/about")}>关于山大王</button><button onClick={() => navigate("/redeem")}>卡券兑换</button></nav>
      </footer>

      {panel === "search" && (
        <SearchPanel close={() => setPanel(null)} navigate={navigate} />
      )}

      {panel === "cart" && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="购物袋">
          <button className="overlay-backdrop" aria-label="关闭购物袋" onClick={() => setPanel(null)} />
          <aside className="cart-panel">
            <div className="panel-title"><span>选购袋</span><IconButton label="关闭" onClick={() => setPanel(null)}><X /></IconButton></div>
            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingBagOpen className="empty-icon" weight="thin" />
                <h2>还没有选好</h2><p>从这一季真正成熟的食物开始。</p>
                <button className="button button-primary" onClick={() => navigate("/shop")}>看看当季</button>
              </div>
            ) : (
              <>
                <div className="cart-lines">
                  {cart.map((item) => (
                    <article className="cart-line" key={item.id}>
                      <img src={item.image} alt={item.name} />
                      <div><h3>{item.name}</h3><p>{item.spec}</p><strong>{money(item.price)}</strong></div>
                      <QuantityControl value={item.quantity} decrease={() => changeQuantity(item.id, -1)} increase={() => changeQuantity(item.id, 1)} />
                    </article>
                  ))}
                </div>
                <div className="cart-total"><span>商品小计</span><strong>{money(cartSubtotal)}</strong></div>
                <p className="cart-delivery-note">配送费将在填写地址后计算</p>
                <button className="button button-primary cart-checkout" onClick={() => navigate("/checkout")}>去结算 <ArrowRight /></button>
              </>
            )}
          </aside>
        </div>
      )}

      <div className={`toast ${notice ? "is-visible" : ""}`} role="status" aria-live="polite">{notice}</div>
      <div className="transition-curtain" aria-hidden="true"><span>沿着山路，去下一处</span></div>
    </div>
  );
}

function ImmersiveHero({ variant, now, navigate }) {
  const content = {
    home: {
      eyebrow: `农场${now.getMonth() + 1}月 · 正值丰收`,
      title: <>这一季，<br />山里有什么</>,
      copy: <>顺着节气采摘，照着食物本来的样子发出。<br />从山间到餐桌，少一点周转，多一点新鲜。</>,
      primary: ["看看当季", "/shop"],
      secondary: ["进入农场", "/farm"],
    },
    shop: {
      eyebrow: "当季商城 · 成熟一批，发出一批",
      title: <>从山里出发，<br />只卖这一季</>,
      copy: <>这里没有全年不变的货架。果实、蔬菜和禽蛋<br />按照成熟批次出现，也按照土地的时间离场。</>,
      primary: ["查看本季在售", "#shop-products"],
      secondary: ["看今天的农事", "/farm"],
    },
    farm: {
      eyebrow: `农场此刻 · ${formatFarmTime(now)}`,
      title: <>山里的一天，<br />正在发生</>,
      copy: <>不把农场写成故事。今天采什么、长得怎样、<br />什么时候发出，都从土地的现场说起。</>,
      primary: ["看今天的农事", "#farm-journal"],
      secondary: ["回到当季", "/shop"],
    },
  }[variant];

  const activate = (target) => {
    if (target.startsWith("#")) document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    else navigate(target);
  };

  return (
    <section className={`hero hero-${variant}`} aria-labelledby="hero-title">
      <img className="hero-image" src="/assets/hero-farm-v2.webp" alt="群山环抱、晨光中的山大王农场全景" />
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-content" key={variant}>
        <p className="eyebrow">{content.eyebrow}</p>
        <h1 id="hero-title">{content.title}</h1>
        <p className="hero-copy">{content.copy}</p>
        <div className="hero-actions">
          <button className="button button-primary" onClick={() => activate(content.primary[1])}>{content.primary[0]}</button>
          <button className="button button-quiet" onClick={() => activate(content.secondary[1])}>{variant === "farm" && <ArrowLeft />} {content.secondary[0]} {variant !== "farm" && <ArrowRight />}</button>
        </div>
      </div>
      <div className="hero-side-note" aria-hidden="true"><span>29°56′N</span><i /><span>NINGBO</span></div>
      <div className="hero-scroll-cue" aria-hidden="true"><span>向下，沿着季节走</span><i /></div>
    </section>
  );
}

function HomeContent({ addToCart, navigate, liveFarmLogs }) {
  const todayActivity = liveFarmLogs[0].activities[0];
  return (
    <>
      <section className="season-strip" aria-label="时令物候">
        <div className="season-heading"><span>时令物候</span><small>农历七月</small></div>
        <div className="season-list">
          {seasons.map(([name, date, note], index) => (
            <article className={index === 1 ? "is-current" : ""} key={name}><span className="season-dot" /><div><strong>{name}</strong><small>{date}</small><p>{note}</p></div></article>
          ))}
        </div>
      </section>

      <section className="products-section section-shell">
        <div className="section-intro">
          <div><p className="eyebrow dark">当季在售</p><h2>本季值得买</h2></div>
          <div className="section-intro-action"><p>首页只放这一季最值得带走的三样。更多批次、分类和发出时间，都在当季商城里。</p><button className="text-link" onClick={() => navigate("/shop")}>走进当季商城 <ArrowRight /></button></div>
        </div>
        <ProductGrid items={products.filter(({ id }) => ["peaches", "weekly-vegetable-basket", "ningbo-rice-cakes"].includes(id))} addToCart={addToCart} navigate={navigate} />
      </section>

      <section className="home-live-chapter">
        <div className="home-live-image"><img src={todayActivity.images[0].src} alt={todayActivity.images[0].alt} /></div>
        <div className="home-live-copy">
          <p className="eyebrow dark">农场此刻 · {todayActivity.time}</p>
          <span>{todayActivity.place}</span>
          <h2>{todayActivity.title}</h2>
          <p>{todayActivity.body}</p>
          <button className="text-link" onClick={() => navigate("/farm")}>继续跟着今天走 <ArrowRight /></button>
        </div>
      </section>

      <section className="voucher-section section-shell home-voucher">
        <div className="voucher-copy">
          <p className="eyebrow">礼赠与兑换</p>
          <h2>收到一张卡，<br />也收到选择这一季的自由</h2>
          <p>礼物不必替别人决定。让收礼的人自己走进这一季，选择真正想收到的食物。</p>
          <button className="button voucher-button" onClick={() => navigate("/redeem")}><Ticket /> 打开我的卡券</button>
        </div>
        <div className="voucher-visual" aria-hidden="true">
          <span>山大王农场</span><strong>时令礼赠卡</strong><small>SHAN DA WANG FARM GIFT</small><i>山</i>
        </div>
      </section>

      <section className="farm-proof section-shell">
        <div className="proof-copy">
          <p className="eyebrow dark">从土地开始</p><h2>知道食物从哪里来，<br />也知道它何时出发</h2>
          <p>每一批果子、蔬菜和禽蛋都有自己的成熟时间。我们记录采摘、分拣和发出的过程，让“新鲜”不只是一句形容。</p>
          <button className="text-link" onClick={() => navigate("/about")}>认识这座农场 <ArrowRight /></button>
        </div>
        <div className="proof-facts">
          <article><MapPin weight="thin" /><strong>宁波山间</strong><span>农场自产与本地精选</span></article>
          <article><Clock weight="thin" /><strong>顺应节气</strong><span>成熟一批，认真发一批</span></article>
          <article><Mountains weight="thin" /><strong>真实记录</strong><span>从采摘到装箱有迹可循</span></article>
        </div>
      </section>
    </>
  );
}

function ShopContent({ addToCart, navigate }) {
  const [filter, setFilter] = useState("all");
  const visibleProducts = filter === "all" ? products : products.filter((product) => product.category === filter);
  return (
    <section id="shop-products" className="shop-page section-shell">
      <div className="shop-page-heading">
        <div><p className="eyebrow dark">本季货架</p><h2>成熟以后，才来到这里</h2></div>
        <p>商品不是全年固定陈列。每一次在售，都对应一个真实批次、一个发出时间和一套包装方式。</p>
      </div>
      <div className="shop-filters" role="group" aria-label="筛选商品来源">
        {[["all", "全部当季"], ["vegetables", "时令时蔬"], ["farm-grown", "农场自产"], ["ningbo-select", "宁波精选"], ["ningbo-specialty", "宁波特产"]].map(([value, label]) => <button className={filter === value ? "is-active" : ""} key={value} onClick={() => setFilter(value)}>{label}</button>)}
      </div>
      <ProductGrid items={visibleProducts} addToCart={addToCart} navigate={navigate} />
      <aside className="shop-note">
        <Clock weight="thin" />
        <div><strong>为什么有些食物不在货架上？</strong><p>因为还没有成熟。下一批采摘时间会在农场日志和商品页同步更新，不用让土地追着订单跑。</p></div>
        <button className="text-link" onClick={() => navigate("/farm")}>查看农场进度 <ArrowRight /></button>
      </aside>
    </section>
  );
}

function ProductGrid({ items, addToCart, navigate }) {
  return (
    <div className="product-grid">
      {items.map((product) => (
        <article className="product-card" key={product.id}>
          <button className="product-image-wrap" onClick={() => navigate(`/products/${product.id}`)}><img src={product.image} alt={product.name} style={{ viewTransitionName: `product-${product.id}` }} /><span>{product.status}</span></button>
          <div className="product-info">
            <button className="product-title" onClick={() => navigate(`/products/${product.id}`)}><small>{product.categoryLabel}</small><h3>{product.name}</h3><p>{product.detail}</p></button>
            <div className="product-buy"><strong>{money(product.price)}</strong><button onClick={() => addToCart(product)} aria-label={`把${product.name}加入选购袋`}><ShoppingCartSimple /></button></div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProductPage({ product, addToCart, navigate }) {
  const [quantity, setQuantity] = useState(1);
  return (
    <article className="product-page">
      <button className="page-back" onClick={() => navigate("/shop")}><ArrowLeft /> 回到当季商城</button>
      <section className="product-page-hero">
        <div className="product-page-image"><img src={product.image} alt={product.name} style={{ viewTransitionName: `product-${product.id}` }} /><span>{product.status}</span></div>
        <div className="product-page-copy">
          <p className="eyebrow dark">{product.categoryLabel} · {product.batch}</p>
          <h1>{product.name}</h1>
          <p className="product-lead">{product.description}</p>
          <dl>
            <div><dt>这一批</dt><dd>{product.batch}</dd></div>
            <div><dt>采摘与收取</dt><dd>{product.harvest}</dd></div>
            <div><dt>来源</dt><dd>{product.origin}</dd></div>
            <div><dt>发出</dt><dd>{product.delivery}</dd></div>
            <div><dt>保存</dt><dd>{product.storage}</dd></div>
          </dl>
          <div className="product-page-buy"><div><small>{product.spec}</small><strong>{money(product.price)}</strong></div><QuantityControl value={quantity} decrease={() => setQuantity((value) => Math.max(1, value - 1))} increase={() => setQuantity((value) => value + 1)} /></div>
          <button className="button button-primary product-add" onClick={() => addToCart(product, quantity)}>加入购物袋 · {money(product.price * quantity)}</button>
        </div>
      </section>
      <section className="product-story-chapter">
        <div><img src={product.sceneImage} alt={product.sceneTitle} /></div>
        <div><p className="eyebrow dark">从现场开始</p><h2>{product.sceneTitle}</h2><p>{product.sceneBody}</p><button className="text-link" onClick={() => navigate("/farm")}>查看今天的农场记录 <ArrowRight /></button></div>
      </section>
      <section className="product-fulfillment section-shell">
        <article><Mountains weight="thin" /><strong>批次对应</strong><p>前台批次与后台库存、采摘日和预计发出时间保持一致。</p></article>
        <article><Package weight="thin" /><strong>按属性装箱</strong><p>根据温控、易碎与同箱规则匹配箱型，不让打包临时发挥。</p></article>
        <article><Truck weight="thin" /><strong>发出可追踪</strong><p>接入后台后同步分拣、装箱、发货与物流状态。</p></article>
      </section>
    </article>
  );
}

function AboutContent({ navigate }) {
  return (
    <article className="about-page">
      <section className="about-hero">
        <img src="/assets/hero-farm-v2.webp" alt="晨光中的山大王农场" />
        <div><p className="eyebrow">关于山大王</p><h1>一座农场，<br />怎样度过自己的四季</h1><p>不把“自然”当作一句广告。看天气、等成熟、按批次发出，是这里每天重复的工作。</p></div>
      </section>
      <section className="about-chapters section-shell">
        <article><span>01</span><div><p className="eyebrow dark">土地</p><h2>先听土地说，现在适合什么</h2><p>不同坡向、温度和雨水，让同一种果实也有不同的成熟时刻。我们接受这种不整齐，并把它写进商品批次。</p></div><img src="/assets/farm-peach-picking.jpg" alt="农场人员在桃园采摘" /></article>
        <article><span>02</span><div><p className="eyebrow dark">劳动</p><h2>一天的工作，不只发生一件事</h2><p>采摘、捡蛋、分拣、装托与冷链准备，被记录成每天的农场日志，也成为用户理解食物的依据。</p></div><img src="/assets/farm-egg-checking.jpg" alt="农场人员检查当天鸡蛋" /></article>
      </section>
      <section className="about-cta"><p>今天的农场已经开始了。</p><button className="button button-primary" onClick={() => navigate("/farm")}>进入农场此刻 <ArrowRight /></button></section>
    </article>
  );
}

function SearchPanel({ close, navigate }) {
  const [query, setQuery] = useState("");
  const matches = products.filter((product) => `${product.name}${product.detail}${product.categoryLabel}`.includes(query.trim()));
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="搜索商品">
      <button className="overlay-backdrop" aria-label="关闭搜索" onClick={close} />
      <div className="search-panel">
        <div className="panel-title"><span>搜索当季食物</span><IconButton label="关闭" onClick={close}><X /></IconButton></div>
        <label className="search-field"><MagnifyingGlass /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="试试“水蜜桃”或“鸡蛋”" /></label>
        {!query && <p>热门：水蜜桃 · 杨梅 · 初生蛋</p>}
        {query && <div className="search-results">{matches.length ? matches.map((product) => <button key={product.id} onClick={() => navigate(`/products/${product.id}`)}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.detail}</small></span><ArrowRight /></button>) : <p>这一季暂时没有找到相关食物。</p>}</div>}
      </div>
    </div>
  );
}

function FarmContent({ initialDate, farmLogs, navigate }) {
  const todayKey = farmLogs[0].date;
  const [selectedDate, setSelectedDate] = useState(() => farmLogs.find((day) => day.date === initialDate)?.date || todayKey);
  const activeDay = farmLogs.find((day) => day.date === selectedDate) || farmLogs[0];

  return (
    <section id="farm-journal" className="farm-journal section-shell">
      <div className="journal-heading">
        <p className="eyebrow dark">农场日志</p>
        <h2>一天，不只发生一件事</h2>
        <p>同一天里的采摘、捡蛋、分拣与装箱都记在一起。日期每天向前走，农场的现场也跟着更新。</p>
        <div className="journal-live"><i /> 每日更新 · 当前记录至 {farmLogs[0].label}</div>
      </div>

      <nav className="journal-days" aria-label="选择农场日志日期">
        {farmLogs.map((day) => (
          <button className={day.date === activeDay.date ? "is-active" : ""} key={day.date} onClick={() => { setSelectedDate(day.date); window.history.replaceState({}, "", `/farm/${day.date}`); }}>
            <strong>{day.label}</strong>
            <span>{day.date === todayKey ? "今天" : day.season}</span>
            <small>{day.summary}</small>
          </button>
        ))}
      </nav>

      <div className="journal-day" key={activeDay.date}>
        <header className="journal-day-heading">
          <div><span>{activeDay.date === todayKey ? "今天" : activeDay.season}</span><strong>{activeDay.label}</strong></div>
          <p>{activeDay.summary}，从清晨到傍晚按发生时间记录。</p>
        </header>

        <div className="journal-list">
          {activeDay.activities.map((activity, activityIndex) => (
            <article className="journal-entry" key={`${activeDay.date}-${activity.time}`}>
              <div className="journal-date"><strong>{activity.time}</strong><span>{activity.place}</span></div>
              <PhotoCarousel images={activity.images} title={activity.title} />
              <div className="journal-copy"><h3>{activity.title}</h3><p>{activity.body}</p><button className="text-link" onClick={() => navigate(activityIndex === 0 ? "/products/peaches" : "/products/eggs")}>查看这批食物 <ArrowRight /></button></div>
            </article>
          ))}
        </div>
      </div>
      <button className="button button-outline" onClick={() => navigate("/")}><ArrowLeft /> 回到当季首页</button>
    </section>
  );
}

function PhotoCarousel({ images, title }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);

  const goTo = (nextIndex) => {
    const safeIndex = Math.max(0, Math.min(images.length - 1, nextIndex));
    const track = trackRef.current;
    const target = track?.children[safeIndex];
    if (track && target) track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setIndex(safeIndex);
  };

  const syncIndex = () => {
    const track = trackRef.current;
    if (!track) return;
    const children = Array.from(track.children);
    const closest = children.reduce((best, child, childIndex) => {
      const distance = Math.abs(child.offsetLeft - track.offsetLeft - track.scrollLeft);
      return distance < best.distance ? { childIndex, distance } : best;
    }, { childIndex: 0, distance: Number.POSITIVE_INFINITY });
    setIndex(closest.childIndex);
  };

  return (
    <div className="journal-gallery">
      <div className="journal-gallery-track" ref={trackRef} onScroll={syncIndex} aria-label={`${title}现场图片，可左右滑动`}>
        {images.map((image, imageIndex) => (
          <figure key={image.src}>
            <img src={image.src} alt={image.alt} loading="lazy" />
            <figcaption>{String(imageIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</figcaption>
          </figure>
        ))}
      </div>
      <div className="journal-gallery-controls">
        <span>左右滑动查看 · {index + 1}/{images.length}</span>
        <div>
          <button aria-label="上一张图片" disabled={index === 0} onClick={() => goTo(index - 1)}><ArrowLeft /></button>
          <button aria-label="下一张图片" disabled={index === images.length - 1} onClick={() => goTo(index + 1)}><ArrowRight /></button>
        </div>
      </div>
    </div>
  );
}

function QuantityControl({ value, decrease, increase, compact = false }) {
  return (
    <div className={`quantity-control ${compact ? "is-compact" : ""}`} aria-label={`数量 ${value}`}>
      <button aria-label="减少数量" onClick={decrease}><Minus /></button>
      <span>{value}</span>
      <button aria-label="增加数量" onClick={increase}><Plus /></button>
    </div>
  );
}

function ProductDetail({ product, close, addToCart }) {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="commerce-overlay" role="dialog" aria-modal="true" aria-label={`${product.name}商品详情`}>
      <button className="commerce-backdrop" aria-label="关闭商品详情" onClick={close} />
      <section className="product-modal">
        <IconButton label="关闭商品详情" className="modal-close" onClick={close}><X /></IconButton>
        <div className="product-modal-image"><img src={product.image} alt={product.name} /><span>{product.status}</span></div>
        <div className="product-modal-copy">
          <p className="eyebrow dark">当季食物</p>
          <h2>{product.name}</h2>
          <p className="product-modal-description">{product.description}</p>
          <dl>
            <div><dt>规格</dt><dd>{product.spec}</dd></div>
            <div><dt>来源</dt><dd>{product.origin}</dd></div>
            <div><dt>发出</dt><dd>{product.delivery}</dd></div>
            <div><dt>保存</dt><dd>{product.storage}</dd></div>
          </dl>
          <div className="product-modal-buy">
            <div><small>单价</small><strong>{money(product.price)}</strong></div>
            <QuantityControl value={quantity} decrease={() => setQuantity((value) => Math.max(1, value - 1))} increase={() => setQuantity((value) => value + 1)} />
          </div>
          <button className="button button-primary product-add" onClick={() => addToCart(product, quantity)}>加入购物袋 · {money(product.price * quantity)}</button>
        </div>
      </section>
    </div>
  );
}

function FlowHeader({ title, steps, step, close }) {
  return (
    <header className="flow-header">
      <div className="flow-brand"><Mountains weight="thin" /><span><strong>山大王农场</strong><small>{title}</small></span></div>
      <ol className="flow-steps">
        {steps.map((label, index) => <li className={index === step ? "is-current" : index < step ? "is-done" : ""} key={label}><span>{index < step ? "✓" : index + 1}</span><small>{label}</small></li>)}
      </ol>
      <IconButton label={`关闭${title}`} onClick={close}><X /></IconButton>
    </header>
  );
}

function OrderLineList({ items }) {
  return (
    <div className="checkout-lines">
      {items.map((item) => (
        <article key={item.id}>
          <img src={item.image} alt={item.name} />
          <div><h3>{item.name}</h3><p>{item.spec}</p><span>数量 × {item.quantity}</span></div>
          <strong>{money(item.price * item.quantity)}</strong>
        </article>
      ))}
    </div>
  );
}

function AddressForm({ value, onChange, error }) {
  const update = (field) => (event) => onChange({ ...value, [field]: event.target.value });
  return (
    <div className="address-form">
      <label><span>收货人</span><input value={value.receiver} onChange={update("receiver")} placeholder="请填写姓名" /></label>
      <label><span>手机号码</span><input inputMode="tel" value={value.phone} onChange={update("phone")} placeholder="用于接收配送通知" /></label>
      <div className="address-region">
        <label><span>省份</span><input value={value.province} onChange={update("province")} placeholder="浙江省" /></label>
        <label><span>城市</span><input value={value.city} onChange={update("city")} placeholder="宁波市" /></label>
        <label><span>区县</span><input value={value.district} onChange={update("district")} placeholder="奉化区" /></label>
      </div>
      <label className="address-detail"><span>详细地址</span><textarea value={value.detail} onChange={update("detail")} placeholder="街道、门牌号、小区和楼栋房间" /></label>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

function CheckoutSummary({ subtotal, shipping, credit = 0, totalLabel = "应付合计" }) {
  return (
    <div className="checkout-summary">
      <p><span>商品金额</span><strong>{money(subtotal)}</strong></p>
      {credit > 0 && <p className="is-credit"><span>卡券抵扣</span><strong>-{money(credit)}</strong></p>}
      <p><span>配送费</span><strong>{shipping === 0 ? "免配送费" : money(shipping)}</strong></p>
      <p className="checkout-grand-total"><span>{totalLabel}</span><strong>{money(Math.max(0, subtotal + shipping - credit))}</strong></p>
    </div>
  );
}

function isAddressComplete(address) {
  return address.receiver.trim() && /^1\d{10}$/.test(address.phone.trim()) && address.province.trim() && address.city.trim() && address.district.trim() && address.detail.trim();
}

const emptyAddress = { receiver: "", phone: "", province: "", city: "", district: "", detail: "" };

function CheckoutFlow({ cart, close, complete }) {
  const steps = ["确认商品", "收货地址", "配送支付", "完成"];
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(emptyAddress);
  const [addressError, setAddressError] = useState("");
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("wechat");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 199 ? 0 : 18;

  const nextFromAddress = () => {
    if (!isAddressComplete(address)) {
      setAddressError("请完整填写地址，并确认手机号为11位");
      return;
    }
    setAddressError("");
    setStep(2);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const created = await storeApi.createOrder({ items: cart, address, delivery, payment, subtotal, shipping, total: subtotal + shipping });
      setOrder(created);
      complete();
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="commerce-flow" role="dialog" aria-modal="true" aria-label="订单结算">
      <FlowHeader title="订单结算" steps={steps} step={step} close={close} />
      <main className="flow-main">
        {step === 0 && <FlowSection eyebrow="01 · 确认商品" title="这一单，准备这样发出" intro="商品会按温控和包装要求安排箱型；最终配送费在地址确认后计算。">
          <OrderLineList items={cart} />
          <CheckoutSummary subtotal={subtotal} shipping={shipping} />
          <FlowActions><button className="button button-primary" disabled={!cart.length} onClick={() => setStep(1)}>填写收货地址 <ArrowRight /></button></FlowActions>
        </FlowSection>}

        {step === 1 && <FlowSection eyebrow="02 · 收货信息" title="这批食物送到哪里" intro="冷链商品请填写白天方便签收的地址。">
          <AddressForm value={address} onChange={setAddress} error={addressError} />
          <FlowActions back={() => setStep(0)}><button className="button button-primary" onClick={nextFromAddress}>选择配送与支付 <ArrowRight /></button></FlowActions>
        </FlowSection>}

        {step === 2 && <FlowSection eyebrow="03 · 配送与支付" title="最后确认一次" intro="真实支付将在接入后台后由微信或支付宝安全完成。">
          <div className="option-section"><h3>配送方式</h3><OptionCard selected={delivery === "standard"} onClick={() => setDelivery("standard")} icon={<Truck />} title="按商品属性配送" note="冷链、常温自动分箱 · 预计1–3天发出" price={shipping === 0 ? "已免配送费" : money(shipping)} /></div>
          <div className="option-section"><h3>支付方式</h3><div className="option-grid"><OptionCard selected={payment === "wechat"} onClick={() => setPayment("wechat")} icon={<Wallet />} title="微信支付" note="后台接入后唤起支付" /><OptionCard selected={payment === "alipay"} onClick={() => setPayment("alipay")} icon={<Wallet />} title="支付宝" note="后台接入后唤起支付" /></div></div>
          <div className="confirm-address"><MapPin /><div><strong>{address.receiver} · {address.phone}</strong><p>{address.province}{address.city}{address.district}{address.detail}</p></div><button onClick={() => setStep(1)}>修改</button></div>
          <OrderLineList items={cart} />
          <CheckoutSummary subtotal={subtotal} shipping={shipping} />
          <FlowActions back={() => setStep(1)}><button className="button button-primary" disabled={submitting} onClick={submit}>{submitting ? "正在创建订单…" : `提交订单 · ${money(subtotal + shipping)}`}</button></FlowActions>
        </FlowSection>}

        {step === 3 && order && <ResultSection icon={<CheckCircle weight="thin" />} title="订单已经创建" id={order.id} note="当前为前端演示状态。接入支付后台后，这里会自动展示付款结果、预计发货批次和物流进度。" close={close} />}
      </main>
    </div>
  );
}

function VoucherFlow({ close }) {
  const steps = ["验券", "选食物", "补差加购", "收货信息", "确认", "完成"];
  const [step, setStep] = useState(0);
  const [code, setCode] = useState("");
  const [voucher, setVoucher] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState(emptyAddress);
  const [addressError, setAddressError] = useState("");
  const [payment, setPayment] = useState("wechat");
  const [redemption, setRedemption] = useState(null);

  const selectedItems = products.filter((product) => quantities[product.id] > 0).map((product) => ({ ...product, quantity: quantities[product.id] }));
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = selectedItems.length === 0 ? 0 : subtotal >= 199 ? 0 : 18;
  const credit = Math.min(voucher?.balance || 0, subtotal + shipping);
  const topUpAmount = Math.max(0, subtotal + shipping - credit);
  const remaining = Math.max(0, (voucher?.balance || 0) - subtotal - shipping);

  const validateCode = async () => {
    if (!code.trim()) { setError("请输入卡券兑换码"); return; }
    setLoading(true); setError("");
    try {
      const result = await storeApi.validateVoucher(code);
      setVoucher(result);
      setStep(1);
    } catch (validationError) {
      setError(validationError.message);
    } finally {
      setLoading(false);
    }
  };

  const changeVoucherQuantity = (productId, delta) => setQuantities((current) => ({ ...current, [productId]: Math.max(0, (current[productId] || 0) + delta) }));

  const nextAddress = () => {
    if (!isAddressComplete(address)) { setAddressError("请完整填写地址，并确认手机号为11位"); return; }
    setAddressError(""); setStep(4);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const created = await storeApi.createRedemption({ voucherId: voucher.id, voucherCode: voucher.code, items: selectedItems, address, subtotal, shipping, credit, topUpAmount, payment });
      setRedemption(created); setStep(5);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="commerce-flow voucher-flow" role="dialog" aria-modal="true" aria-label="卡券兑换">
      <FlowHeader title="卡券兑换" steps={steps} step={step} close={close} />
      <main className="flow-main">
        {step === 0 && <FlowSection eyebrow="01 · 卡券校验" title="先看看，这张卡里有什么" intro="输入兑换码后会显示余额、有效期和可兑换范围。">
          <div className="voucher-code-card"><Ticket weight="thin" /><div><span>山大王农场</span><strong>时令礼赠卡</strong><small>SHAN DA WANG FARM GIFT</small></div></div>
          <div className="voucher-code-input"><input value={code} onChange={(event) => setCode(event.target.value)} onKeyDown={(event) => event.key === "Enter" && validateCode()} placeholder="请输入兑换码" /><button className="button button-primary" disabled={loading} onClick={validateCode}>{loading ? "正在校验…" : "验证卡券"}</button></div>
          <p className="demo-code">体验兑换码：<button onClick={() => setCode("SDW2026")}>SDW2026</button></p>
          {error && <p className="form-error">{error}</p>}
        </FlowSection>}

        {step === 1 && voucher && <FlowSection eyebrow="02 · 选择食物" title="用这张卡，选这一季" intro={`卡券余额 ${money(voucher.balance)}，有效期至 ${voucher.expiresAt}。`}>
          <VoucherBalance voucher={voucher} subtotal={subtotal} shipping={shipping} remaining={remaining} topUpAmount={topUpAmount} />
          <div className="voucher-products">{products.filter((product) => voucher.eligibleProductIds.includes(product.id)).map((product) => <VoucherProduct key={product.id} product={product} quantity={quantities[product.id] || 0} change={(delta) => changeVoucherQuantity(product.id, delta)} />)}</div>
          <FlowActions back={() => setStep(0)}><button className="button button-primary" disabled={!selectedItems.length} onClick={() => setStep(2)}>查看补差与加购 <ArrowRight /></button></FlowActions>
        </FlowSection>}

        {step === 2 && voucher && <FlowSection eyebrow="03 · 补差与加购" title="余额不浪费，喜欢的也能多带一点" intro="超过卡券余额的部分可以补差；没有用完的余额会继续保留在卡中。">
          <VoucherBalance voucher={voucher} subtotal={subtotal} shipping={shipping} remaining={remaining} topUpAmount={topUpAmount} />
          <div className="add-on-list">{products.map((product) => <article key={product.id}><img src={product.image} alt={product.name} /><div><strong>{product.name}</strong><span>{money(product.price)} · {product.spec}</span></div><QuantityControl compact value={quantities[product.id] || 0} decrease={() => changeVoucherQuantity(product.id, -1)} increase={() => changeVoucherQuantity(product.id, 1)} /></article>)}</div>
          <FlowActions back={() => setStep(1)}><button className="button button-primary" disabled={!selectedItems.length} onClick={() => setStep(3)}>填写收货地址 <ArrowRight /></button></FlowActions>
        </FlowSection>}

        {step === 3 && <FlowSection eyebrow="04 · 收货信息" title="礼物送到哪里" intro="需要冷链的商品会按地址和批次安排发出。">
          <AddressForm value={address} onChange={setAddress} error={addressError} />
          <FlowActions back={() => setStep(2)}><button className="button button-primary" onClick={nextAddress}>确认兑换内容 <ArrowRight /></button></FlowActions>
        </FlowSection>}

        {step === 4 && voucher && <FlowSection eyebrow="05 · 确认兑换" title="核对无误，就按这里发出" intro="提交后将锁定卡券额度；补差金额会在后台接入后进入支付。">
          <OrderLineList items={selectedItems} />
          <div className="confirm-address"><MapPin /><div><strong>{address.receiver} · {address.phone}</strong><p>{address.province}{address.city}{address.district}{address.detail}</p></div><button onClick={() => setStep(3)}>修改</button></div>
          {topUpAmount > 0 && <div className="option-section"><h3>补差支付</h3><div className="option-grid"><OptionCard selected={payment === "wechat"} onClick={() => setPayment("wechat")} icon={<Wallet />} title="微信支付" note="兑换提交后唤起" /><OptionCard selected={payment === "alipay"} onClick={() => setPayment("alipay")} icon={<Wallet />} title="支付宝" note="兑换提交后唤起" /></div></div>}
          <CheckoutSummary subtotal={subtotal} shipping={shipping} credit={credit} totalLabel={topUpAmount > 0 ? "需要补差" : "无需补差"} />
          <FlowActions back={() => setStep(3)}><button className="button button-primary" disabled={loading} onClick={submit}>{loading ? "正在提交兑换…" : topUpAmount > 0 ? `确认兑换并补差 ${money(topUpAmount)}` : "确认兑换"}</button></FlowActions>
        </FlowSection>}

        {step === 5 && redemption && <ResultSection icon={<Package weight="thin" />} title="兑换已经提交" id={redemption.id} note={topUpAmount > 0 ? "兑换单已生成，等待补差支付接入。支付完成后将按商品批次安排发出。" : "卡券额度已完成演示核销。接入后台后，这里会展示真实核销结果和预计发货批次。"} close={close} />}
      </main>
    </div>
  );
}

function FlowSection({ eyebrow, title, intro, children }) {
  return <section className="flow-section"><div className="flow-section-heading"><p>{eyebrow}</p><h1>{title}</h1><span>{intro}</span></div>{children}</section>;
}

function FlowActions({ back, children }) {
  return <div className="flow-actions">{back ? <button className="button flow-back" onClick={back}><ArrowLeft /> 上一步</button> : <span />}{children}</div>;
}

function OptionCard({ selected, onClick, icon, title, note, price }) {
  return <button className={`option-card ${selected ? "is-selected" : ""}`} onClick={onClick}>{icon}<span><strong>{title}</strong><small>{note}</small></span>{price && <em>{price}</em>}<i>{selected ? "✓" : ""}</i></button>;
}

function VoucherBalance({ voucher, subtotal, shipping, remaining, topUpAmount }) {
  const used = Math.min(voucher.balance, subtotal + shipping);
  return <div className="voucher-balance"><div><span>卡券可用</span><strong>{money(voucher.balance)}</strong></div><div><span>本次已选</span><strong>{money(subtotal + shipping)}</strong></div><div className={topUpAmount > 0 ? "needs-top-up" : ""}><span>{topUpAmount > 0 ? "需要补差" : "兑换后余额"}</span><strong>{money(topUpAmount > 0 ? topUpAmount : remaining)}</strong></div><div className="voucher-meter"><i style={{ width: `${Math.min(100, (used / voucher.balance) * 100)}%` }} /></div></div>;
}

function VoucherProduct({ product, quantity, change }) {
  return <article className={`voucher-product ${quantity ? "is-selected" : ""}`}><img src={product.image} alt={product.name} /><div><span>{product.status}</span><h3>{product.name}</h3><p>{product.spec}</p><strong>{money(product.price)}</strong></div>{quantity ? <QuantityControl value={quantity} decrease={() => change(-1)} increase={() => change(1)} /> : <button className="button button-outline" onClick={() => change(1)}>选择</button>}</article>;
}

function ResultSection({ icon, title, id, note, close }) {
  return <section className="result-section">{icon}<p>提交成功</p><h1>{title}</h1><span className="result-id">编号：{id}</span><p className="result-note">{note}</p><div className="result-timeline"><article><i>1</i><strong>订单已提交</strong><span>前端数据已保存</span></article><article><i>2</i><strong>等待后台确认</strong><span>接入库存、支付或卡券接口</span></article><article><i>3</i><strong>按批次发出</strong><span>同步物流与履约状态</span></article></div><button className="button button-primary" onClick={close}>完成并返回网站</button></section>;
}
