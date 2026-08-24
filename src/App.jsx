import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CaretDown,
  Clock,
  List,
  MagnifyingGlass,
  MapPin,
  Mountains,
  ShoppingBagOpen,
  ShoppingCartSimple,
  UserCircle,
  X,
} from "@phosphor-icons/react";

const seasons = [
  ["立秋", "8月7日", "山风开始转凉"],
  ["处暑", "8月23日", "早晚采摘更从容"],
  ["白露", "9月7日", "露水养甜秋果"],
  ["秋分", "9月22日", "新米与秋菜登场"],
];

const products = [
  { name: "山里红杨梅", detail: "当日清晨采摘 · 2.5kg", price: "¥168", status: "本季最后一批", image: "/assets/bayberries.webp" },
  { name: "散养初生蛋", detail: "林下散养 · 30枚", price: "¥98", status: "每周二、五发出", image: "/assets/eggs.webp" },
  { name: "奉化水蜜桃", detail: "树熟采摘 · 6枚礼装", price: "¥138", status: "采摘后24小时内发出", image: "/assets/peaches.webp" },
];

const farmNotes = [
  { date: "08.24", label: "清晨 06:20", title: "趁山雾未散，采下今天的果子", body: "成熟不是一个统一的时刻。我们逐棵查看，只把达到甜度的果实带下山。", image: "/assets/peaches.webp" },
  { date: "08.21", label: "鸡舍 17:40", title: "太阳落山前，把今天的蛋收回来", body: "鸡群白天在林地里活动，傍晚归舍。鸡蛋经过灯检和分级后，再装入缓冲蛋托。", image: "/assets/eggs.webp" },
];

function IconButton({ label, children, onClick, className = "" }) {
  return <button className={`icon-button ${className}`} aria-label={label} onClick={onClick}>{children}</button>;
}

export function App() {
  const [view, setView] = useState("home");
  const [transitioning, setTransitioning] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const [notice, setNotice] = useState("");
  const productsRef = useRef(null);
  const aboutRef = useRef(null);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const changeView = (next) => {
    if (transitioning || view === next) return;
    setMobileOpen(false);
    setTransitioning(true);
    window.setTimeout(() => {
      setView(next);
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 430);
    window.setTimeout(() => setTransitioning(false), 980);
  };

  const scrollTo = (ref) => {
    setMobileOpen(false);
    if (view !== "home") {
      setView("home");
      window.setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth" }), 80);
      return;
    }
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`site-shell ${transitioning ? "is-transitioning" : ""}`} data-view={view}>
      <header className="site-header">
        <button className="brand" onClick={() => changeView("home")} aria-label="返回山大王农场首页">
          <span className="brand-mark"><Mountains weight="thin" /></span>
          <span><strong>山大王农场</strong><small>SHAN DA WANG FARM</small></span>
        </button>

        <nav className={`main-nav ${mobileOpen ? "is-open" : ""}`} aria-label="主导航">
          <button onClick={() => scrollTo(productsRef)}>商城 <CaretDown size={13} /></button>
          <button onClick={() => changeView("farm")}>农场此刻</button>
          <button onClick={() => setNotice("卡券兑换将在下一阶段接入完整流程")}>卡券兑换</button>
          <button onClick={() => scrollTo(aboutRef)}>关于我们</button>
        </nav>

        <div className="header-actions">
          <button className="search-trigger" aria-label="搜索" onClick={() => setPanel("search")}><span>搜索商品</span><MagnifyingGlass /></button>
          <IconButton label="个人中心" onClick={() => setNotice("会员中心将在交易系统接入后开放")}><UserCircle /></IconButton>
          <IconButton label="购物袋" onClick={() => setPanel("cart")}><ShoppingCartSimple /></IconButton>
          <IconButton label={mobileOpen ? "关闭导航" : "打开导航"} className="menu-button" onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <X /> : <List />}</IconButton>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <img className="hero-image" src="/assets/hero-farm-v2.webp" alt="群山环抱、晨光中的山大王农场全景" />
          <div className="hero-scrim" aria-hidden="true" />
          <div className="hero-content" key={view}>
            {view === "home" ? (
              <>
                <p className="eyebrow">农场八月 · 正值丰收</p>
                <h1 id="hero-title">这一季，<br />山里有什么</h1>
                <p className="hero-copy">顺着节气采摘，照着食物本来的样子发出。<br />从山间到餐桌，少一点周转，多一点新鲜。</p>
                <div className="hero-actions">
                  <button className="button button-primary" onClick={() => scrollTo(productsRef)}>看看当季</button>
                  <button className="button button-quiet" onClick={() => changeView("farm")}>进入农场 <ArrowRight /></button>
                </div>
              </>
            ) : (
              <>
                <p className="eyebrow">农场此刻 · 08:20</p>
                <h1 id="hero-title">山里的一天，<br />正在发生</h1>
                <p className="hero-copy">不把农场写成故事。今天采什么、长得怎样、<br />什么时候发出，都从土地的现场说起。</p>
                <div className="hero-actions">
                  <button className="button button-primary" onClick={() => document.getElementById("farm-journal")?.scrollIntoView({ behavior: "smooth" })}>看今天的农事</button>
                  <button className="button button-quiet" onClick={() => changeView("home")}><ArrowLeft /> 返回首页</button>
                </div>
              </>
            )}
          </div>
          <div className="hero-side-note" aria-hidden="true"><span>29°56′N</span><i /><span>NINGBO</span></div>
        </section>

        {view === "home" ? <HomeContent productsRef={productsRef} addToCart={(name) => setNotice(`${name} 已加入选购袋`)} goFarm={() => changeView("farm")} /> : <FarmContent goHome={() => changeView("home")} />}
      </main>

      <footer ref={aboutRef} className="site-footer">
        <div><p className="footer-brand">山大王农场</p><p>宁波山间的一座真实农场，把应季食物认真送到你家。</p></div>
        <div className="footer-meta"><span>农场自产</span><span>当季采摘</span><span>按批次发货</span></div>
      </footer>

      {panel === "search" && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="搜索商品">
          <button className="overlay-backdrop" aria-label="关闭搜索" onClick={() => setPanel(null)} />
          <div className="search-panel">
            <div className="panel-title"><span>搜索当季食物</span><IconButton label="关闭" onClick={() => setPanel(null)}><X /></IconButton></div>
            <label className="search-field"><MagnifyingGlass /><input autoFocus placeholder="试试“水蜜桃”或“鸡蛋”" /></label>
            <p>热门：水蜜桃 · 杨梅 · 初生蛋 · 本周菜篮</p>
          </div>
        </div>
      )}

      {panel === "cart" && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="购物袋">
          <button className="overlay-backdrop" aria-label="关闭购物袋" onClick={() => setPanel(null)} />
          <aside className="cart-panel">
            <div className="panel-title"><span>选购袋</span><IconButton label="关闭" onClick={() => setPanel(null)}><X /></IconButton></div>
            <ShoppingBagOpen className="empty-icon" weight="thin" />
            <h2>还没有选好</h2><p>从这一季真正成熟的食物开始。</p>
            <button className="button button-primary" onClick={() => { setPanel(null); scrollTo(productsRef); }}>看看当季</button>
          </aside>
        </div>
      )}

      <div className={`toast ${notice ? "is-visible" : ""}`} role="status" aria-live="polite">{notice}</div>
    </div>
  );
}

function HomeContent({ productsRef, addToCart, goFarm }) {
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

      <section ref={productsRef} className="products-section section-shell">
        <div className="section-intro">
          <div><p className="eyebrow dark">当季在售</p><h2>本季值得买</h2></div>
          <p>不追求全年都有什么。只把此刻成熟、适合发出的食物，放到你面前。</p>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.name}>
              <div className="product-image-wrap"><img src={product.image} alt={product.name} /><span>{product.status}</span></div>
              <div className="product-info">
                <div><h3>{product.name}</h3><p>{product.detail}</p></div>
                <div className="product-buy"><strong>{product.price}</strong><button onClick={() => addToCart(product.name)} aria-label={`把${product.name}加入选购袋`}><ShoppingCartSimple /></button></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="farm-proof section-shell">
        <div className="proof-copy">
          <p className="eyebrow dark">从土地开始</p><h2>知道食物从哪里来，<br />也知道它何时出发</h2>
          <p>每一批果子、蔬菜和禽蛋都有自己的成熟时间。我们记录采摘、分拣和发出的过程，让“新鲜”不只是一句形容。</p>
          <button className="text-link" onClick={goFarm}>去农场看一看 <ArrowRight /></button>
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

function FarmContent({ goHome }) {
  return (
    <section id="farm-journal" className="farm-journal section-shell">
      <div className="journal-heading"><p className="eyebrow dark">农场日志</p><h2>土地有自己的时间</h2><p>这里不是一张静态的“关于我们”。随着天气、物候和劳动，它每天都会有一点不同。</p></div>
      <div className="journal-list">
        {farmNotes.map((note) => (
          <article className="journal-entry" key={note.date}>
            <div className="journal-date"><strong>{note.date}</strong><span>{note.label}</span></div>
            <img src={note.image} alt="农场当天记录" />
            <div><h3>{note.title}</h3><p>{note.body}</p><button className="text-link" onClick={() => {}}>查看这批食物 <ArrowRight /></button></div>
          </article>
        ))}
      </div>
      <button className="button button-outline" onClick={goHome}><ArrowLeft /> 回到当季首页</button>
    </section>
  );
}
