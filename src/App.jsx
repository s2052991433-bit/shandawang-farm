import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Bag, Bell, CalendarDots, CaretDown, Check, Clock,
  CreditCard, Headphones, Heart, Leaf, List, MagnifyingGlass, MapPin, Minus,
  Mountains, Package, Plus, Receipt, SealCheck, ShieldCheck, ShoppingCart,
  SignOut, Ticket, Truck, UserCircle, Wallet, X,
} from "@phosphor-icons/react";

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

const products = [
  { id: "bayberry", name: "东魁杨梅 · 山选大果", desc: "当季现摘，酸甜多汁", price: 128, unit: "2斤装", tag: "本季限定", category: "当季", image: asset("bayberries.png") },
  { id: "eggs", name: "山林散养鸡蛋", desc: "谷物喂养，营养鲜味", price: 68, unit: "30枚", tag: "农场自产", category: "农场自产", image: asset("eggs.png") },
  { id: "peaches", name: "水蜜桃 · 湖景基地", desc: "香甜多汁，现摘现发", price: 98, unit: "4斤装", tag: "本周鲜选", category: "当季", image: asset("peaches.png") },
  { id: "gift", name: "山大王四季礼盒", desc: "精选组合，送礼佳品", price: 298, unit: "1盒", tag: "礼赠甄选", category: "礼盒", image: asset("gift-box.png") },
];

const navItems = [["商城", "shop"], ["农场此刻", "farm"], ["卡券兑换", "redeem"], ["关于我们", "about"]];
const routeFromHash = () => window.location.hash.replace(/^#\/?/, "") || "home";

function Brand({ light = false, onClick }) {
  return <button className={`brand ${light ? "brand-light" : ""}`} onClick={onClick} aria-label="返回首页">
    <Mountains size={40} weight="thin" />
    <span className="brand-copy"><strong>山大王农场</strong><small>来自山林的自然味道</small></span>
  </button>;
}

function Header({ route, cartCount, navigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="site-header">
    <div className="nav-shell">
      <Brand onClick={() => navigate("home")} />
      <nav className="desktop-nav" aria-label="主导航">
        {navItems.map(([label, path]) => <button key={path} className={route.startsWith(path) ? "active" : ""} onClick={() => navigate(path)}>{label}{path === "shop" && <CaretDown size={13} />}</button>)}
      </nav>
      <div className="header-actions">
        <button className="search-pill" onClick={() => navigate("shop")}><span>搜索商品</span><MagnifyingGlass size={20} /></button>
        <button className="icon-button desktop-only" aria-label="我的账户" onClick={() => navigate("account")}><UserCircle size={23} /></button>
        <button className="icon-button cart-button" aria-label="购物车" onClick={() => navigate("cart")}><ShoppingCart size={23} />{cartCount > 0 && <span className="cart-count">{cartCount}</span>}</button>
        <button className="icon-button mobile-menu-button" aria-label="打开菜单" onClick={() => setMenuOpen(true)}><List size={25} /></button>
      </div>
    </div>
    {menuOpen && <div className="mobile-menu">
      <div className="mobile-menu-top"><Brand onClick={() => { navigate("home"); setMenuOpen(false); }} /><button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="关闭菜单"><X size={24} /></button></div>
      <div className="mobile-menu-links">{navItems.map(([label, path]) => <button key={path} onClick={() => { navigate(path); setMenuOpen(false); }}>{label}<ArrowRight size={18} /></button>)}<button onClick={() => { navigate("account"); setMenuOpen(false); }}>我的账户<ArrowRight size={18} /></button></div>
    </div>}
  </header>;
}

function Footer({ navigate }) {
  return <footer className="site-footer">
    <div className="footer-main"><Brand light onClick={() => navigate("home")} />
      <div className="footer-columns">
        <div><strong>购物指南</strong><button onClick={() => navigate("shop")}>如何下单</button><button onClick={() => navigate("checkout")}>支付方式</button><button>配送说明</button></div>
        <div><strong>关于我们</strong><button onClick={() => navigate("farm")}>农场故事</button><button>种养方式</button><button>联系我们</button></div>
        <div><strong>帮助中心</strong><button>常见问题</button><button onClick={() => navigate("redeem")}>卡券兑换</button><button>售后政策</button></div>
      </div>
      <div className="footer-contact"><strong>400-888-8888</strong><span>服务时间：9:00–18:00</span><span>浙江 · 山大王农场</span></div>
    </div><div className="footer-bottom">© 2026 山大王农场 · 本站为前端演示原型</div>
  </footer>;
}

function ProductCard({ product, navigate, addToCart }) {
  return <article className="product-card">
    <button className="product-image-wrap" onClick={() => navigate(`product/${product.id}`)}><img src={product.image} alt={product.name} /><span className="product-tag">{product.tag}</span></button>
    <div className="product-card-body"><button className="product-title" onClick={() => navigate(`product/${product.id}`)}>{product.name}</button><p>{product.desc}</p><div className="price-row"><span><b>¥{product.price}</b> / {product.unit}</span><button className="round-cart" onClick={() => addToCart(product)} aria-label={`将${product.name}加入购物车`}><ShoppingCart size={19} /></button></div></div>
  </article>;
}

function Home({ navigate, addToCart }) {
  return <>
    <section className="hero"><img src={asset("hero-farm.png")} alt="晨光中的山大王农场与远山" /><div className="hero-shade" />
      <div className="hero-copy"><span className="eyebrow light">农场八月 · 正值丰收</span><h1><span>这一季，</span><span>山里有什么</span></h1><p>顺应自然的节奏，把当季最好的味道送到你家。</p><div className="button-row"><button className="primary-button" onClick={() => navigate("shop")}>看看当季</button><button className="ghost-button" onClick={() => navigate("farm")}>进入农场</button></div></div>
      <aside className="farm-now-card"><div className="farm-card-head"><div><strong>今日农场</strong><span>8月24日 · 晴 26°C</span></div><Clock size={22} /></div>
        <div className="farm-update"><img src={asset("bayberries.png")} alt="杨梅" /><span><b>杨梅进入最佳采摘期</b><small>果实饱满，酸甜多汁</small></span></div>
        <div className="farm-update"><img src={asset("eggs.png")} alt="鲜鸡蛋" /><span><b>鸡舍今日新鲜收集</b><small>山林散养，营养好蛋</small></span></div>
        <div className="farm-update"><img src={asset("peaches.png")} alt="桃子" /><span><b>新一批水蜜桃在成熟</b><small>自然生长，安心慢熟</small></span></div>
      </aside>
    </section>
    <section className="section-shell products-section"><div className="section-heading"><div><span className="eyebrow">本季鲜选</span><h2>本季值得买</h2><p>时令好物，新鲜到家</p></div><button className="text-link" onClick={() => navigate("shop")}>查看全部 <ArrowRight size={16} /></button></div><div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} navigate={navigate} addToCart={addToCart} />)}</div></section>
    <section className="proof-section"><div className="section-shell"><div className="section-heading compact"><div><h2>为什么是这些东西</h2><p>因为它们来自真实的山里</p></div></div><div className="proof-grid">
      <article className="proof-card"><img src={asset("eggs.png")} alt="山林散养" /><div><strong>山林散养</strong><span>自由活动，健康成长</span></div></article>
      <article className="proof-card"><img src={asset("bayberries.png")} alt="当季采摘" /><div><strong>当季采摘</strong><span>自然成熟，及时采摘</span></div></article>
      <article className="proof-card"><img src={asset("hero-farm.png")} alt="农场山野" /><div><strong>天然种植</strong><span>不催熟，少干预</span></div></article>
      <article className="belief-card"><Leaf size={34} weight="thin" /><strong>我们相信<br />好的食物<br />从土地到餐桌<br />都应该被看见</strong><button onClick={() => navigate("farm")}>了解更多农场故事 <ArrowRight size={15} /></button></article>
    </div></div></section>
    <section className="section-shell promo-grid"><article className="promo-card card-redeem"><div><span>收到山大王农场卡？</span><p>输入兑换码，选择你的产品</p><button onClick={() => navigate("redeem")}>立即兑换</button></div></article><article className="promo-card card-gift"><div><span>送一份来自山里的礼物</span><p>送家人、送朋友、送客户</p><button onClick={() => navigate("shop")}>了解礼赠方案</button></div></article><article className="promo-card card-business"><div><span>企业礼赠 / 团福利</span><p>专属定制，批量采购更优惠</p><button>了解企业方案</button></div></article></section>
    <section className="section-shell trust-strip"><div><Leaf size={28} /><span><b>真实农场</b><small>看得见的生产环境</small></span></div><div><ShieldCheck size={28} /><span><b>品质保证</b><small>严格把控每一份产品</small></span></div><div><Truck size={30} /><span><b>新鲜直达</b><small>产地直发，快速到家</small></span></div><div><Headphones size={28} /><span><b>贴心服务</b><small>售前售后全程陪伴</small></span></div></section>
  </>;
}

function Shop({ navigate, addToCart }) {
  const [filter, setFilter] = useState("全部"); const [search, setSearch] = useState("");
  const visible = products.filter(p => (filter === "全部" || p.category === filter) && p.name.includes(search));
  return <main className="page-shell"><section className="page-intro split-intro"><div><span className="eyebrow">来自山林的当季味道</span><h1>农场商店</h1><p>不追求琳琅满目，只把此刻真正值得吃的东西带给你。</p></div><div className="page-search"><MagnifyingGlass size={20} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索商品" /></div></section><div className="filter-row">{["全部", "当季", "农场自产", "礼盒"].map(item => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="product-grid shop-grid">{visible.map(product => <ProductCard key={product.id} product={product} navigate={navigate} addToCart={addToCart} />)}</div><section className="shop-note"><Leaf size={30} /><div><strong>跟着农场的时间买东西</strong><p>当季产品随采摘情况限量供应；稳定货盘全年持续更新。</p></div></section></main>;
}

function ProductDetail({ product, addToCart, navigate }) {
  const sizeOptions = product.id === "gift" ? ["经典礼盒", "丰盛礼盒 +¥98"] : [product.unit, `家庭装 +¥${Math.round(product.price * .7)}`];
  const [quantity, setQuantity] = useState(1); const [size, setSize] = useState(sizeOptions[0]);
  return <main className="page-shell product-page"><button className="back-link" onClick={() => navigate("shop")}><ArrowLeft size={17} /> 返回商城</button><section className="product-hero-grid"><div className="product-gallery"><div className="main-product-image"><img src={product.image} alt={product.name} /><span>{product.tag}</span></div><div className="thumb-row"><button className="selected"><img src={product.image} alt="商品主图" /></button><button><img src={asset("hero-farm.png")} alt="商品产地" /></button><button><img src={asset(product.id === "eggs" ? "gift-box.png" : "eggs.png")} alt="商品场景" /></button></div></div>
    <div className="product-buy-panel"><span className="eyebrow">{product.tag}</span><h1>{product.name}</h1><p className="product-lead">从枝头与山林直接来到餐桌。新鲜、真实、有清楚的来处。</p><div className="detail-price"><b>¥{product.price}</b><span>含产地直发</span></div><div className="batch-note"><CalendarDots size={21} /><div><b>本批预计 8 月 28 日发货</b><span>按成熟度采摘，可能提前 1–2 天通知</span></div></div><div className="option-group"><label>规格</label><div className="choice-row">{sizeOptions.map(item => <button key={item} className={size === item ? "selected" : ""} onClick={() => setSize(item)}>{item}</button>)}</div></div><div className="option-group"><label>数量</label><div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button></div></div><div className="buy-actions"><button className="primary-button wide" onClick={() => { addToCart(product, quantity); navigate("cart"); }}>立即购买</button><button className="outline-button wide" onClick={() => addToCart(product, quantity)}><ShoppingCart size={19} /> 加入购物车</button></div><div className="micro-benefits"><span><SealCheck size={18} /> 坏果包赔</span><span><Truck size={18} /> 农场直发</span><span><ShieldCheck size={18} /> 品质可溯</span></div></div></section>
    <section className="story-feature"><div className="story-copy"><span className="eyebrow">它从哪里来</span><h2>不是仓库里的货，<br />是山里正在成熟的一批。</h2><p>每件产品都对应真实的地块、种养方式和采收日期。我们把农场作为产品的证明，而不是一段遥远的品牌故事。</p><button className="text-link" onClick={() => navigate("farm")}>看看农场此刻 <ArrowRight size={16} /></button></div><img src={asset("hero-farm.png")} alt="山大王农场产地" /></section>
    <section className="info-grid"><div><Leaf size={25} /><strong>自然生长</strong><p>尊重成熟节奏，减少不必要干预。</p></div><div><Package size={25} /><strong>当日采装</strong><p>按订单组织采摘与分装，缩短等待。</p></div><div><Truck size={25} /><strong>冷链直发</strong><p>针对鲜果采用保鲜包装与冷链配送。</p></div><div><Headphones size={25} /><strong>售后保障</strong><p>签收后如有问题，客服快速处理。</p></div></section>
  </main>;
}

function Farm({ navigate }) {
  return <main><section className="farm-hero"><img src={asset("hero-farm.png")} alt="山大王农场全景" /><div className="farm-hero-copy"><span className="eyebrow light">农场此刻 · 八月</span><h1>土地有自己的时间</h1><p>我们记录每一次开花、成熟与采收，也把它们变成你能安心带回家的味道。</p></div></section><section className="page-shell farm-content"><div className="season-header"><div><span className="eyebrow">今天的山里</span><h2>正在发生的三件小事</h2></div><span className="date-chip">8 月 24 日 · 晴</span></div><div className="timeline-cards"><article><img src={asset("bayberries.png")} alt="杨梅采摘" /><div><span>08:10 · 东坡果园</span><h3>杨梅进入最后一周采摘</h3><p>清晨露水散去后开始采摘，成熟果当天完成分选。</p></div></article><article><img src={asset("eggs.png")} alt="收集鸡蛋" /><div><span>09:30 · 山林鸡舍</span><h3>今日新鲜鸡蛋完成收集</h3><p>按大小分级、逐枚灯检，傍晚前进入包装区。</p></div></article><article><img src={asset("peaches.png")} alt="桃子成熟" /><div><span>15:40 · 湖景基地</span><h3>下一批水蜜桃还要等三天</h3><p>让果实在枝头多待一点时间，风味会更完整。</p></div></article></div><section className="next-season"><div><span className="eyebrow light">即将成熟</span><h2>九月，新米与秋梨</h2><p>订阅农场提醒，第一批采收时我们会告诉你。</p><button className="ghost-button"><Bell size={18} /> 提醒我</button></div></section><div className="farm-shop-cta"><div><h2>农场正在发生什么，<br />商店就会出现什么。</h2><p>看看本周仍在采收的产品。</p></div><button className="primary-button" onClick={() => navigate("shop")}>看看当季 <ArrowRight size={17} /></button></div></section></main>;
}

function Stepper({ step }) {
  const labels = ["验证卡券", "选择商品", "升级加购", "填写地址", "确认订单"];
  return <div className="stepper">{labels.map((label, index) => <div key={label} className={step >= index ? "done" : ""}><span>{step > index ? <Check size={15} /> : index + 1}</span><b>{label}</b></div>)}</div>;
}

function Redeem({ navigate }) {
  const [step, setStep] = useState(0); const [code, setCode] = useState(""); const [error, setError] = useState(""); const [choice, setChoice] = useState(products[0]); const [upgrade, setUpgrade] = useState("标准兑换"); const [addon, setAddon] = useState(false); const [address, setAddress] = useState({ name: "", phone: "", city: "", detail: "" });
  const validate = () => { if (code.trim().toUpperCase() !== "SDW2026") { setError("演示兑换码为 SDW2026，请重新输入"); return; } setError(""); setStep(1); };
  const addressReady = Object.values(address).every(Boolean);
  if (step === 5) return <main className="page-shell success-page"><div className="success-mark"><Check size={42} /></div><span className="eyebrow">兑换成功</span><h1>你的产品将从农场发出</h1><p>订单 SDW-0824-2608 已创建。我们会在采装完成后发送物流提醒。</p><div className="success-order"><img src={choice.image} alt={choice.name} /><div><strong>{choice.name}</strong><span>{upgrade}{addon ? " · 加购山林鸡蛋" : ""}</span><small>收货人：{address.name} · {address.city}{address.detail}</small></div></div><div className="button-row center"><button className="primary-button" onClick={() => navigate("farm")}>看看它来自哪里</button><button className="outline-button" onClick={() => navigate("shop")}>看看本季还有什么</button></div></main>;
  return <main className="redeem-page"><section className="redeem-banner"><div><span className="eyebrow light">山大王农场礼卡</span><h1>把一份山里的心意，<br />换成你真正喜欢的味道。</h1><p>兑换过程约需 2 分钟，无需注册账号。</p></div><Ticket size={116} weight="thin" /></section><div className="page-shell redeem-shell"><Stepper step={step} />
    {step === 0 && <section className="redeem-panel code-panel"><Ticket size={44} weight="thin" /><h2>输入你的兑换码</h2><p>兑换码通常印在卡片背面涂层下方。</p><label>兑换码</label><div className={`code-input ${error ? "has-error" : ""}`}><input value={code} onChange={e => setCode(e.target.value)} placeholder="输入 8 位兑换码" onKeyDown={e => e.key === "Enter" && validate()} /><button onClick={validate}>验证卡券</button></div>{error && <span className="form-error">{error}</span>}<small>演示兑换码：<button onClick={() => setCode("SDW2026")}>SDW2026</button></small></section>}
    {step === 1 && <section className="redeem-panel"><div className="panel-title"><div><span className="eyebrow">卡券验证成功</span><h2>山大王农场四季鲜果卡</h2><p>权益价值 ¥128，可从以下产品中选择一份。</p></div><div className="valid-chip"><Check size={17} /> 有效</div></div><div className="redeem-choice-grid">{products.slice(0, 3).map(product => <button key={product.id} className={choice.id === product.id ? "selected" : ""} onClick={() => setChoice(product)}><img src={product.image} alt={product.name} /><span><b>{product.name}</b><small>{product.unit} · 免运费</small></span><i>{choice.id === product.id && <Check size={15} />}</i></button>)}</div><div className="panel-actions"><span>已选择：{choice.name}</span><button className="primary-button" onClick={() => setStep(2)}>下一步 <ArrowRight size={17} /></button></div></section>}
    {step === 2 && <section className="redeem-panel"><div className="panel-title"><div><span className="eyebrow">让这份礼物更合心意</span><h2>升级规格或顺便加购</h2><p>所有额外费用将在模拟确认页统一展示。</p></div></div><div className="upgrade-list"><button className={upgrade === "标准兑换" ? "selected" : ""} onClick={() => setUpgrade("标准兑换")}><span><b>标准兑换</b><small>{choice.unit} · 使用卡券全额抵扣</small></span><strong>¥0</strong></button><button className={upgrade !== "标准兑换" ? "selected" : ""} onClick={() => setUpgrade("精品大果升级")}><span><b>精品大果升级</b><small>更高果径标准 · 精品包装</small></span><strong>+¥39</strong></button></div><label className={`addon-card ${addon ? "selected" : ""}`}><img src={asset("eggs.png")} alt="山林散养鸡蛋" /><span><b>顺便加一盒山林散养鸡蛋</b><small>30 枚 · 与兑换商品一起发出</small></span><strong>+¥59</strong><input type="checkbox" checked={addon} onChange={e => setAddon(e.target.checked)} /></label><div className="panel-actions"><button className="back-link" onClick={() => setStep(1)}><ArrowLeft size={17} /> 上一步</button><button className="primary-button" onClick={() => setStep(3)}>填写地址 <ArrowRight size={17} /></button></div></section>}
    {step === 3 && <section className="redeem-panel form-panel"><div className="panel-title"><div><span className="eyebrow">配送信息</span><h2>产品送到哪里？</h2><p>请填写真实地址，演示原型不会保存这些信息。</p></div></div><div className="form-grid"><label><span>收货人</span><input value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} placeholder="姓名" /></label><label><span>手机号码</span><input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="11 位手机号码" /></label><label className="full"><span>省 / 市 / 区</span><input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="例如：浙江省 杭州市 西湖区" /></label><label className="full"><span>详细地址</span><textarea value={address.detail} onChange={e => setAddress({ ...address, detail: e.target.value })} placeholder="街道、门牌号、小区、楼栋等" /></label></div><div className="panel-actions"><button className="back-link" onClick={() => setStep(2)}><ArrowLeft size={17} /> 上一步</button><button className="primary-button" disabled={!addressReady} onClick={() => setStep(4)}>确认订单 <ArrowRight size={17} /></button></div></section>}
    {step === 4 && <section className="redeem-panel confirm-panel"><div className="panel-title"><div><span className="eyebrow">最后确认</span><h2>确认兑换订单</h2></div></div><div className="confirm-product"><img src={choice.image} alt={choice.name} /><div><strong>{choice.name}</strong><span>{upgrade} · {choice.unit}</span>{addon && <small>加购：山林散养鸡蛋 30枚</small>}</div><b>{upgrade === "标准兑换" ? "卡券抵扣" : "+¥39"}</b></div><div className="confirm-address"><MapPin size={22} /><div><strong>{address.name} · {address.phone}</strong><span>{address.city}{address.detail}</span></div><button onClick={() => setStep(3)}>修改</button></div><div className="order-totals"><span><i>商品金额</i><b>¥{choice.price}</b></span><span><i>卡券抵扣</i><b>−¥{choice.price}</b></span>{upgrade !== "标准兑换" && <span><i>规格升级</i><b>¥39</b></span>}{addon && <span><i>加购商品</i><b>¥59</b></span>}<span className="total"><i>还需支付（模拟）</i><b>¥{(upgrade !== "标准兑换" ? 39 : 0) + (addon ? 59 : 0)}</b></span></div><div className="panel-actions"><button className="back-link" onClick={() => setStep(3)}><ArrowLeft size={17} /> 上一步</button><button className="primary-button" onClick={() => setStep(5)}>确认兑换</button></div></section>}
  </div></main>;
}

function Cart({ items, setItems, navigate }) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0); const update = (id, qty) => setItems(items.map(item => item.id === id ? { ...item, qty: Math.max(1, qty) } : item)); const remove = id => setItems(items.filter(item => item.id !== id));
  return <main className="page-shell cart-page"><div className="page-intro"><span className="eyebrow">购物袋</span><h1>你的农场好物</h1><p>{items.length ? `共 ${items.reduce((n, i) => n + i.qty, 0)} 件商品` : "购物袋还是空的"}</p></div>{items.length === 0 ? <div className="empty-state"><Bag size={56} weight="thin" /><h2>还没有选中商品</h2><p>看看本季正在采收的新鲜好物。</p><button className="primary-button" onClick={() => navigate("shop")}>去逛商城</button></div> : <div className="cart-layout"><div className="cart-items">{items.map(item => <article key={item.id}><img src={item.image} alt={item.name} /><div className="cart-item-copy"><strong>{item.name}</strong><span>{item.unit} · 农场直发</span><button onClick={() => remove(item.id)}>移除</button></div><div className="quantity-control"><button onClick={() => update(item.id, item.qty - 1)}><Minus size={15} /></button><span>{item.qty}</span><button onClick={() => update(item.id, item.qty + 1)}><Plus size={15} /></button></div><b>¥{item.price * item.qty}</b></article>)}</div><aside className="summary-card"><h2>订单小计</h2><span><i>商品金额</i><b>¥{total}</b></span><span><i>产地直发</i><b>免运费</b></span><span className="total"><i>合计</i><b>¥{total}</b></span><button className="primary-button wide" onClick={() => navigate("checkout")}>去结算</button><small><ShieldCheck size={16} /> 本页面为演示原型，不会产生真实扣款</small></aside></div>}</main>;
}

function Checkout({ items, navigate }) {
  const [success, setSuccess] = useState(false); const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (success) return <main className="page-shell success-page"><div className="success-mark"><Check size={42} /></div><span className="eyebrow">模拟支付成功</span><h1>订单已交给农场</h1><p>我们会根据成熟度组织采装，并在发货前通知你。</p><button className="primary-button" onClick={() => navigate("account")}>查看我的订单</button></main>;
  return <main className="page-shell checkout-page"><button className="back-link" onClick={() => navigate("cart")}><ArrowLeft size={17} /> 返回购物袋</button><div className="page-intro"><span className="eyebrow">结算</span><h1>确认配送与订单</h1></div><div className="checkout-layout"><div className="checkout-forms"><section><h2><MapPin size={23} /> 收货地址</h2><div className="form-grid"><label><span>收货人</span><input placeholder="姓名" /></label><label><span>手机号码</span><input placeholder="11 位手机号码" /></label><label className="full"><span>省 / 市 / 区</span><input placeholder="选择地区" /></label><label className="full"><span>详细地址</span><input placeholder="街道、门牌号、小区、楼栋" /></label></div></section><section><h2><CreditCard size={23} /> 支付方式</h2><label className="payment-option selected"><span><Wallet size={24} /><b>模拟支付</b><small>用于前端原型演示，不会真实扣款</small></span><Check size={17} /></label></section></div><aside className="summary-card"><h2>订单商品</h2>{items.map(item => <div className="mini-order" key={item.id}><img src={item.image} alt={item.name} /><span><b>{item.name}</b><small>{item.qty} × ¥{item.price}</small></span></div>)}<span><i>商品金额</i><b>¥{total}</b></span><span><i>配送费</i><b>¥0</b></span><span className="total"><i>实付</i><b>¥{total}</b></span><button className="primary-button wide" onClick={() => setSuccess(true)}>确认并模拟支付</button></aside></div></main>;
}

function Account({ navigate }) {
  return <main className="page-shell account-page"><div className="account-head"><div className="avatar">山</div><div><span>下午好</span><h1>山里来客</h1><p>这是模拟账户中心</p></div><button className="outline-button"><SignOut size={18} /> 退出</button></div><div className="account-grid"><aside className="account-nav"><button className="active"><Receipt size={20} /> 我的订单</button><button><Ticket size={20} /> 我的卡券</button><button><MapPin size={20} /> 收货地址</button><button><Heart size={20} /> 我的收藏</button></aside><section className="account-main"><div className="account-section-head"><h2>最近订单</h2><button>查看全部</button></div><article className="order-card"><div className="order-meta"><span>订单 SDW-0824-2608</span><b>待采装</b></div><div className="order-product"><img src={asset("bayberries.png")} alt="东魁杨梅" /><div><strong>东魁杨梅 · 山选大果</strong><span>2斤装 × 1</span><small>预计 8 月 28 日从农场发出</small></div><b>¥128</b></div><div className="order-actions"><span><Clock size={17} /> 农场正在等待最佳成熟度</span><button onClick={() => navigate("farm")}>查看农场此刻</button></div></article><div className="account-cards"><div><Ticket size={27} /><span><b>1 张</b><small>可用卡券</small></span></div><div><Package size={27} /><span><b>3 笔</b><small>历史订单</small></span></div><div><Leaf size={27} /><span><b>2 次</b><small>农场认购</small></span></div></div></section></div></main>;
}

function About({ navigate }) {
  return <main><section className="about-hero"><div><span className="eyebrow">关于山大王</span><h1>让真实的生产，<br />成为最有力的品牌。</h1><p>我们不把农场当作风景。这里的土地、天气、人物和时间，共同决定每一件产品的味道。</p><button className="primary-button" onClick={() => navigate("farm")}>看看农场此刻</button></div><img src={asset("hero-farm.png")} alt="山大王农场" /></section><section className="page-shell values-grid"><article><span>01</span><h2>自然不是口号</h2><p>尊重季节、减少干预，以成熟度而不是日历决定采摘。</p></article><article><span>02</span><h2>看得见的来源</h2><p>商品与真实地块、种养方式、采收批次一一对应。</p></article><article><span>03</span><h2>把关系留下来</h2><p>一次购买或卡券兑换，是用户认识农场的开始。</p></article></section></main>;
}

export function App() {
  const [route, setRoute] = useState(routeFromHash()); const [cart, setCart] = useState([{ ...products[1], qty: 1 }]); const [toast, setToast] = useState("");
  useEffect(() => { const onHash = () => { setRoute(routeFromHash()); window.scrollTo(0, 0); }; window.addEventListener("hashchange", onHash); return () => window.removeEventListener("hashchange", onHash); }, []);
  const navigate = path => { if (route === path) window.scrollTo({ top: 0, behavior: "smooth" }); window.location.hash = `/${path}`; };
  const addToCart = (product, qty = 1) => { setCart(current => { const found = current.find(item => item.id === product.id); return found ? current.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item) : [...current, { ...product, qty }]; }); setToast(`${product.name} 已加入购物车`); window.setTimeout(() => setToast(""), 2200); };
  const count = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]); const productRoute = route.startsWith("product/") ? products.find(item => item.id === route.split("/")[1]) : null;
  return <div className="app"><Header route={route} cartCount={count} navigate={navigate} />
    {route === "home" && <Home navigate={navigate} addToCart={addToCart} />}{route === "shop" && <Shop navigate={navigate} addToCart={addToCart} />}{productRoute && <ProductDetail product={productRoute} addToCart={addToCart} navigate={navigate} />}{route === "farm" && <Farm navigate={navigate} />}{route === "redeem" && <Redeem navigate={navigate} />}{route === "cart" && <Cart items={cart} setItems={setCart} navigate={navigate} />}{route === "checkout" && <Checkout items={cart} navigate={navigate} />}{route === "account" && <Account navigate={navigate} />}{route === "about" && <About navigate={navigate} />}
    <Footer navigate={navigate} />{toast && <div className="toast"><Check size={17} /> {toast}</div>}
  </div>;
}
