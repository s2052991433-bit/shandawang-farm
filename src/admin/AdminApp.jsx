import { useEffect, useMemo, useState } from "react";
import {
  ArrowClockwise,
  ArrowRight,
  CalendarDots,
  Check,
  ClipboardText,
  Cube,
  DownloadSimple,
  Egg,
  Eye,
  EyeSlash,
  Gear,
  House,
  Key,
  List,
  LockKey,
  Package,
  PencilSimple,
  Phone,
  Plus,
  SignOut,
  Storefront,
  Ticket,
  Truck,
  User,
  X,
} from "@phosphor-icons/react";
import { adminApi } from "../services/adminApi";
import "./admin.css";

const navItems = [
  ["overview", "经营总览", House],
  ["products", "商品与库存", Storefront],
  ["orders", "订单处理", ClipboardText],
  ["vouchers", "卡券与卡密", Ticket],
  ["farm", "农场此刻", CalendarDots],
  ["deliveries", "年卡寄送", Truck],
];

const fulfillmentLabels = {
  pending_review: "待确认",
  picking: "分拣中",
  packing: "装箱中",
  ready_to_ship: "待发货",
  shipped: "已发货",
  delivered: "已送达",
  cancelled: "已取消",
};

const paymentLabels = { pending: "待支付", paid: "已支付", refunded: "已退款", failed: "支付失败" };
const deliveryLabels = { scheduled: "待排期", preparing: "准备中", packed: "已装箱", shipped: "已发货", delivered: "已送达", paused: "已暂停" };
const money = (value) => `¥${Number(value || 0).toFixed(2).replace(".00", "")}`;
const dateTime = (value) => value ? new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)) : "—";

function AdminLogin({ error, setupRequired, working, onLogin, onRegister }) {
  const [form, setForm] = useState({ displayName: "", phone: "", password: "", confirmPassword: "", setupKey: "" });
  const [localError, setLocalError] = useState("");
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const submit = (event) => {
    event.preventDefault();
    setLocalError("");
    if (setupRequired && form.password !== form.confirmPassword) { setLocalError("两次输入的密码不一致"); return; }
    if (setupRequired) onRegister(form);
    else onLogin({ phone: form.phone, password: form.password });
  };
  return (
    <main className="admin-login">
      <section className="admin-login-card">
        <div className="admin-login-brand"><span><Egg weight="thin" /></span><div><strong>山大王农场</strong><small>经营管理后台</small></div></div>
        <p className="admin-kicker">{setupRequired ? "首次安全设置" : "仅供农场经营人员使用"}</p>
        <h1>{setupRequired ? <>注册农场主<br />个人账号</> : <>使用个人账号，<br />进入经营后台</>}</h1>
        <p>{setupRequired ? "这是唯一一次自主注册。完成后注册入口自动关闭，后续工作人员只能由农场主邀请。" : "后台不开放公开注册，请使用已经登记的管理员手机号与个人密码登录。"}</p>
        <form onSubmit={submit}>
          {setupRequired && <label><User /><input value={form.displayName} onChange={update("displayName")} placeholder="姓名或称呼" autoComplete="name" maxLength="30" required /></label>}
          <label><Phone /><input value={form.phone} onChange={update("phone")} placeholder="管理员手机号" inputMode="numeric" autoComplete="tel" maxLength="11" required /></label>
          <label><LockKey /><input type="password" value={form.password} onChange={update("password")} placeholder={setupRequired ? "设置个人密码（至少10位）" : "个人密码"} autoComplete={setupRequired ? "new-password" : "current-password"} required /></label>
          {setupRequired && <label><LockKey /><input type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="再次输入个人密码" autoComplete="new-password" required /></label>}
          {setupRequired && <label><Key /><input type="password" value={form.setupKey} onChange={update("setupKey")} placeholder="首次注册校验码" autoComplete="one-time-code" required /></label>}
          {(localError || error) && <p className="admin-form-error">{localError || error}</p>}
          <button className="admin-primary" type="submit" disabled={working}>{working ? "正在确认…" : setupRequired ? "注册并进入后台" : "进入管理后台"} <ArrowRight /></button>
          <small className="admin-login-note">手机号在本后台中唯一；密码只保存加密结果。</small>
        </form>
        <a href="/">返回网站首页</a>
      </section>
      <aside className="admin-login-scene"><img src="/assets/hero-farm-v2.webp" alt="晨光中的山大王农场" /><div><span>今日经营</span><strong>每一批食物，<br />都有清楚的去向</strong></div></aside>
    </main>
  );
}

function AdminSidebar({ view, setView, actor, mobileOpen, setMobileOpen, signOut }) {
  return (
    <aside className={`admin-sidebar ${mobileOpen ? "is-open" : ""}`}>
      <div className="admin-sidebar-brand"><span><Egg weight="thin" /></span><div><strong>山大王农场</strong><small>经营管理后台</small></div><button onClick={() => setMobileOpen(false)} aria-label="关闭菜单"><X /></button></div>
      <nav>{navItems.map(([id, label, Icon]) => <button key={id} className={view === id ? "is-active" : ""} onClick={() => { setView(id); setMobileOpen(false); }}><Icon /><span>{label}</span></button>)}</nav>
      <div className="admin-sidebar-foot"><span>当前管理员</span><strong>{actor || "经营人员"}</strong><button onClick={signOut}><SignOut /> 退出后台</button></div>
    </aside>
  );
}

function SectionHead({ kicker, title, description, action }) {
  return <header className="admin-section-head"><div><p>{kicker}</p><h1>{title}</h1><span>{description}</span></div>{action}</header>;
}

function EmptyState({ icon: Icon = Cube, title, text }) {
  return <div className="admin-empty"><Icon weight="thin" /><h3>{title}</h3><p>{text}</p></div>;
}

function StatusPill({ value, labels }) {
  return <span className={`admin-status status-${value}`}>{labels[value] || value}</span>;
}

function Overview({ data, go }) {
  const metrics = data.metrics || {};
  const cards = [
    ["今日与累计订单", metrics.orders || 0, "orders", ClipboardText],
    ["待处理履约", metrics.pendingFulfillment || 0, "orders", Package],
    ["有效卡券", metrics.activeVouchers || 0, "vouchers", Ticket],
    ["年卡待寄箱数", metrics.scheduledDeliveries || 0, "deliveries", Truck],
  ];
  return <>
    <SectionHead kicker="农场经营台" title="今天要处理的事，一眼看清" description="商品、订单、卡券、农事与月度寄送使用同一套数据。" />
    <section className="admin-metrics">{cards.map(([label, value, target, Icon]) => <button key={label} onClick={() => go(target)}><Icon weight="thin" /><span>{label}</span><strong>{value}</strong><small>查看详情 <ArrowRight /></small></button>)}</section>
    <section className="admin-overview-grid">
      <article className="admin-panel"><div className="admin-panel-title"><div><p>最近订单</p><h2>刚刚发生的交易</h2></div><button onClick={() => go("orders")}>全部订单</button></div>{data.recentOrders?.length ? <div className="admin-list">{data.recentOrders.map((order) => <div key={order.id}><span><strong>{order.orderNo}</strong><small>{order.customerName} · {dateTime(order.createdAt)}</small></span><em>{money(order.total)}</em><StatusPill value={order.fulfillmentStatus} labels={fulfillmentLabels} /></div>)}</div> : <EmptyState icon={ClipboardText} title="还没有真实订单" text="顾客从前台提交后，会立即出现在这里。" />}</article>
      <article className="admin-panel"><div className="admin-panel-title"><div><p>库存提醒</p><h2>优先看库存较少的商品</h2></div><button onClick={() => go("products")}>管理商品</button></div><div className="admin-stock-list">{data.lowStock?.map((product) => <div key={product.id}><span><strong>{product.name}</strong><small>{product.status}</small></span><em className={product.inventory < 20 ? "is-low" : ""}>{product.inventory}<small>件</small></em></div>)}</div></article>
    </section>
    <section className="admin-revenue"><div><p>已支付订单金额</p><strong>{money(metrics.paidRevenue)}</strong></div><span>支付接口接入后，收入、退款和对账数据会在这里自动汇总。</span></section>
  </>;
}

function ProductEditor({ product, close, save }) {
  const [form, setForm] = useState(product);
  const creating = Boolean(product.__new);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.type === "checkbox" ? event.target.checked : event.target.value });
  return <div className="admin-drawer-wrap"><button className="admin-drawer-backdrop" onClick={close} aria-label="关闭" /><aside className="admin-drawer"><header><div><p>商品资料</p><h2>{product.name}</h2></div><button onClick={close}><X /></button></header><form onSubmit={(event) => { event.preventDefault(); const labels = { "farm-grown": "农场自产", vegetables: "时令时蔬", "ningbo-select": "宁波精选", "ningbo-specialty": "宁波特产", "gift-card": "礼品卡" }; const seasonLabels = { spring: "春", summer: "夏", autumn: "秋", winter: "冬", annual: "全年" }; save({ ...form, categoryLabel: labels[form.category] || form.categoryLabel, seasonLabel: seasonLabels[form.season] || "夏", saleMode: form.id === "egg-annual-card" ? "available" : "preorder", price: Number(form.price), inventory: Number(form.inventory), sortOrder: Number(form.sortOrder) }); }}>
    <div className="admin-field-grid"><label><span>商品名称</span><input required value={form.name} onChange={update("name")} /></label><label><span>商品编号</span><input required value={form.id} disabled={!creating} onChange={update("id")} placeholder="例如 seasonal-vegetables" /></label></div>
    <div className="admin-field-grid"><label><span>售价（元）</span><input type="number" min="0" value={form.price} onChange={update("price")} /></label><label><span>可售库存</span><input type="number" min="0" value={form.inventory} onChange={update("inventory")} /></label></div>
    <div className="admin-field-grid"><label><span>分类</span><select value={form.category} onChange={update("category")}><option value="farm-grown">农场自产</option><option value="vegetables">时令时蔬</option><option value="ningbo-select">宁波精选</option><option value="ningbo-specialty">宁波特产</option><option value="gift-card">礼品卡</option></select></label><label><span>前台状态</span><input value={form.status} onChange={update("status")} /></label></div>
    <div className="admin-field-grid"><label><span>时令归属</span><select value={form.season || "summer"} onChange={update("season")}><option value="spring">春季 · 2—4月</option><option value="summer">夏季 · 5—8月</option><option value="autumn">秋季 · 9—11月</option><option value="winter">冬季 · 11—次年2月</option><option value="annual">全年禽蛋 / 年卡</option></select></label><label><span>销售方式</span><input value={form.id === "egg-annual-card" ? "正常售卖" : "预售"} disabled /></label></div>
    {form.id !== "egg-annual-card" && <label><span>预计发出说明</span><input value={form.preorderNote || ""} onChange={update("preorderNote")} placeholder="例如：预计6月成熟后分批发出" /></label>}
    <label><span>规格</span><input value={form.spec || ""} onChange={update("spec")} /></label>
    <label><span>商品简介</span><textarea value={form.description || ""} onChange={update("description")} /></label>
    <label><span>发货说明</span><input value={form.delivery || ""} onChange={update("delivery")} /></label>
    <div className="admin-field-grid"><label><span>图片地址</span><input value={form.image || ""} onChange={update("image")} /></label><label><span>首页顺序</span><input type="number" value={form.sortOrder || 0} onChange={update("sortOrder")} /></label></div>
    <label className="admin-switch"><input type="checkbox" checked={form.active} onChange={update("active")} /><span><i /><strong>{form.active ? "前台正在展示" : "前台暂不展示"}</strong></span></label>
    <footer><button type="button" className="admin-secondary" onClick={close}>取消</button><button className="admin-primary" type="submit"><Check /> 保存商品</button></footer>
  </form></aside></div>;
}

function Products({ products, setProducts, notify }) {
  const [editing, setEditing] = useState(null);
  const save = async (product) => {
    const saved = await adminApi.saveProduct(product);
    setProducts((items) => product.__new ? [...items, saved] : items.map((item) => item.id === saved.id ? saved : item));
    setEditing(null); notify("商品资料已经保存");
  };
  return <>
    <SectionHead kicker="四季商品与库存" title="让货架跟着时令和真实批次变化" description="控制春夏秋冬归属、预售时间、售价、库存与上架状态；只有鸡蛋年卡保持正常售卖。" action={<button className="admin-primary" onClick={() => setEditing({ __new: true, id: "", name: "", category: "farm-grown", categoryLabel: "农场自产", season: "spring", seasonLabel: "春", saleMode: "preorder", preorderNote: "", price: 0, inventory: 0, status: "春季预售", active: false, sortOrder: products.length * 10 + 10, spec: "", description: "", delivery: "", image: "" })}><Plus /> 新建商品</button>} />
    <section className="admin-table-card"><div className="admin-table admin-products-table"><div className="admin-table-head"><span>商品</span><span>分类</span><span>售价</span><span>库存</span><span>前台状态</span><span /></div>{products.map((product) => <div className="admin-table-row" key={product.id}><span className="admin-product-cell">{product.image ? <img src={product.image} alt="" /> : <i><Cube /></i>}<b><strong>{product.name}</strong><small>{product.spec || product.id}</small></b></span><span>{product.categoryLabel}</span><span>{money(product.price)}</span><span className={product.inventory < 20 ? "is-low" : ""}><strong>{product.inventory}</strong> 件</span><span>{product.active ? <><Eye /> 正在展示</> : <><EyeSlash /> 已隐藏</>}</span><button className="admin-icon-button" onClick={() => setEditing(product)} aria-label={`编辑${product.name}`}><PencilSimple /></button></div>)}</div></section>
    {editing && <ProductEditor product={editing} close={() => setEditing(null)} save={save} />}
  </>;
}

function Orders({ orders, setOrders, notify }) {
  const [filter, setFilter] = useState("all");
  const visible = filter === "all" ? orders : orders.filter((order) => order.fulfillmentStatus === filter);
  const update = async (order, field, value) => {
    const updated = await adminApi.updateOrder(order.id, { [field]: value });
    setOrders((items) => items.map((item) => item.id === order.id ? { ...item, ...updated } : item)); notify("订单状态已经更新");
  };
  return <>
    <SectionHead kicker="订单处理" title="从下单、分拣到发货，按步骤推进" description="每次状态变化都会留在后台，后续可继续接支付与物流回调。" />
    <div className="admin-filter-row"><button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>全部订单</button>{Object.entries(fulfillmentLabels).slice(0, 6).map(([value, label]) => <button className={filter === value ? "is-active" : ""} key={value} onClick={() => setFilter(value)}>{label}</button>)}</div>
    <section className="admin-table-card">{visible.length ? <div className="admin-order-cards">{visible.map((order) => <article key={order.id}><header><div><strong>{order.orderNo}</strong><span>{dateTime(order.createdAt)}</span></div><em>{money(order.total)}</em></header><div className="admin-order-customer"><span>{order.customerName} · {order.phone}</span><small>{order.address ? `${order.address.province || ""}${order.address.city || ""}${order.address.district || ""}${order.address.detail || ""}` : ""}</small></div><div className="admin-order-items">{order.items?.map((item) => <span key={item.id}>{item.name} × {item.quantity}</span>)}</div><footer><label><span>付款</span><select value={order.paymentStatus} onChange={(event) => update(order, "paymentStatus", event.target.value)}>{Object.entries(paymentLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label><span>履约</span><select value={order.fulfillmentStatus} onChange={(event) => update(order, "fulfillmentStatus", event.target.value)}>{Object.entries(fulfillmentLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><span className="admin-pack-count"><Package /> 建议 {order.packingPlan?.packageCount || 1} 箱</span></footer></article>)}</div> : <EmptyState icon={ClipboardText} title="当前没有这类订单" text="新的前台订单会实时进入这里。" />}</section>
  </>;
}

function VoucherGenerator({ close, created, notify }) {
  const [form, setForm] = useState({ type: "annual_card", name: "2027散养鸡蛋年卡", count: 100, value: 798, prefix: "SDW-EGG-2027", expiresAt: "2027-12-31" });
  const [working, setWorking] = useState(false);
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const submit = async (event) => { event.preventDefault(); setWorking(true); try { const result = await adminApi.generateVouchers({ ...form, count: Number(form.count), value: Number(form.value) }); created(result); notify(`${result.count}张卡密已经生成，请立即下载保存`); } finally { setWorking(false); } };
  return <div className="admin-drawer-wrap"><button className="admin-drawer-backdrop" onClick={close} aria-label="关闭" /><aside className="admin-drawer admin-voucher-drawer"><header><div><p>卡密生成</p><h2>创建一批新的实体卡</h2></div><button onClick={close}><X /></button></header><form onSubmit={submit}>
    <label><span>卡券类型</span><select value={form.type} onChange={(event) => { const type = event.target.value; setForm(type === "annual_card" ? { type, name: "2027散养鸡蛋年卡", count: 100, value: 798, prefix: "SDW-EGG-2027", expiresAt: "2027-12-31" } : { type, name: "山大王农场礼赠卡", count: 20, value: 200, prefix: "SDW-GIFT", expiresAt: "2028-12-31" }); }}><option value="annual_card">鸡蛋年卡</option><option value="gift_balance">余额礼赠卡</option></select></label>
    <label><span>卡券名称</span><input value={form.name} onChange={update("name")} /></label>
    <div className="admin-field-grid"><label><span>生成数量</span><input type="number" min="1" max="100" value={form.count} onChange={update("count")} /></label><label><span>面值</span><input type="number" min="0" value={form.value} onChange={update("value")} /></label></div>
    <label><span>卡密前缀</span><input value={form.prefix} onChange={update("prefix")} /></label>
    <label><span>有效期</span><input type="date" value={form.expiresAt} onChange={update("expiresAt")} /></label>
    {form.type === "annual_card" && <div className="annual-rule-note"><Egg /><div><strong>2027年1月开始发货</strong><span>连续12个月 · 每月1箱 · 每箱30枚散养鸡蛋</span></div></div>}
    <footer><button type="button" className="admin-secondary" onClick={close}>取消</button><button className="admin-primary" disabled={working}>{working ? "正在生成…" : "生成卡密"}</button></footer>
  </form></aside></div>;
}

function downloadCodes(batch) {
  const rows = ["序号,卡密,类型,名称", ...batch.codes.map((code, index) => `${index + 1},${code},${batch.type},${batch.name}`)];
  const blob = new Blob(["\ufeff" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `山大王农场-${batch.name}-卡密.csv`; link.click(); URL.revokeObjectURL(url);
}

function Vouchers({ vouchers, setVouchers, notify, refresh }) {
  const [generator, setGenerator] = useState(false);
  const [batch, setBatch] = useState(null);
  const created = async (result) => { setBatch(result); setGenerator(false); await refresh(); };
  return <>
    <SectionHead kicker="卡券与卡密" title="实体卡、兑换和核销都在这里" description="卡密只以加密结果保存；完整卡密只在生成当次显示。" action={<button className="admin-primary" onClick={() => setGenerator(true)}><Plus /> 生成卡密</button>} />
    {batch && <section className="admin-code-batch"><div><Key weight="thin" /><span><strong>{batch.count}张卡密已经生成</strong><small>{batch.warning}</small></span></div><button className="admin-primary" onClick={() => downloadCodes(batch)}><DownloadSimple /> 下载卡密表</button></section>}
    <section className="admin-table-card">{vouchers.length ? <div className="admin-table admin-voucher-table"><div className="admin-table-head"><span>卡券</span><span>卡密尾号</span><span>面值</span><span>状态</span><span>有效期</span></div>{vouchers.map((voucher) => <div className="admin-table-row" key={voucher.id}><span><strong>{voucher.name}</strong><small>{voucher.type === "annual_card" ? "鸡蛋年卡" : "余额礼卡"}</small></span><span>•••• {voucher.codeHint}</span><span>{money(voucher.value)}</span><StatusPill value={voucher.status} labels={{ active: "可使用", activated: "已激活", used: "已用完", disabled: "已停用" }} /><span>{voucher.expiresAt || "长期有效"}</span></div>)}</div> : <EmptyState icon={Ticket} title="还没有生成卡密" text="点击右上角“生成卡密”，可以一次生成100张鸡蛋年卡。" />}</section>
    {generator && <VoucherGenerator close={() => setGenerator(false)} created={created} notify={notify} />}
  </>;
}

function FarmLogEditor({ log, close, save }) {
  const [form, setForm] = useState(log || { logDate: new Date().toISOString().slice(0, 10), label: "", season: "今天", summary: "", published: true, activities: [{ time: "06:20", place: "", title: "", body: "", images: [] }] });
  const updateActivity = (index, field, value) => setForm({ ...form, activities: form.activities.map((activity, activityIndex) => activityIndex === index ? { ...activity, [field]: value } : activity) });
  return <div className="admin-drawer-wrap"><button className="admin-drawer-backdrop" onClick={close} aria-label="关闭" /><aside className="admin-drawer admin-log-drawer"><header><div><p>农场日志</p><h2>{log ? "编辑当天记录" : "记录今天发生的事"}</h2></div><button onClick={close}><X /></button></header><form onSubmit={(event) => { event.preventDefault(); save({ ...form, summary: form.summary || `${form.activities.length}处农事` }); }}>
    <div className="admin-field-grid"><label><span>日期</span><input type="date" value={form.logDate} onChange={(event) => setForm({ ...form, logDate: event.target.value })} /></label><label><span>节气说明</span><input value={form.season} onChange={(event) => setForm({ ...form, season: event.target.value })} /></label></div>
    {form.activities.map((activity, index) => <section className="admin-activity-editor" key={index}><header><strong>农事 {index + 1}</strong>{form.activities.length > 1 && <button type="button" onClick={() => setForm({ ...form, activities: form.activities.filter((_, itemIndex) => itemIndex !== index) })}>移除</button>}</header><div className="admin-field-grid"><label><span>时间</span><input type="time" value={activity.time} onChange={(event) => updateActivity(index, "time", event.target.value)} /></label><label><span>地点</span><input value={activity.place} onChange={(event) => updateActivity(index, "place", event.target.value)} /></label></div><label><span>标题</span><input value={activity.title} onChange={(event) => updateActivity(index, "title", event.target.value)} /></label><label><span>现场说明</span><textarea value={activity.body} onChange={(event) => updateActivity(index, "body", event.target.value)} /></label><label><span>图片地址（每行一张）</span><textarea value={(activity.images || []).map((image) => image.src).join("\n")} onChange={(event) => updateActivity(index, "images", event.target.value.split("\n").filter(Boolean).map((src) => ({ src, alt: activity.title })))} /></label></section>)}
    <button type="button" className="admin-add-activity" onClick={() => setForm({ ...form, activities: [...form.activities, { time: "17:40", place: "", title: "", body: "", images: [] }] })}><Plus /> 添加当天另一项农事</button>
    <label className="admin-switch"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /><span><i /><strong>{form.published ? "保存后立即发布" : "先存为草稿"}</strong></span></label>
    <footer><button type="button" className="admin-secondary" onClick={close}>取消</button><button className="admin-primary"><Check /> 保存日志</button></footer>
  </form></aside></div>;
}

function FarmLogs({ logs, setLogs, notify }) {
  const [editing, setEditing] = useState(undefined);
  const save = async (log) => { const saved = await adminApi.saveFarmLog(log); setLogs((items) => log.id ? items.map((item) => item.id === saved.id ? saved : item) : [saved, ...items]); setEditing(undefined); notify("农场日志已经保存"); };
  return <>
    <SectionHead kicker="农场此刻" title="把同一天发生的农事一起记录下来" description="同一日期可以有采摘、分拣、捡蛋等多项记录，并为每项添加多张现场图。" action={<button className="admin-primary" onClick={() => setEditing(null)}><Plus /> 新建今日日志</button>} />
    <section className="admin-log-list">{logs.map((log) => <article key={log.id}><div className="admin-log-date"><strong>{log.label}</strong><span>{log.logDate}</span></div><div><header><span>{log.season}</span><StatusPill value={log.published ? "published" : "draft"} labels={{ published: "已发布", draft: "草稿" }} /></header><h2>{log.activities?.[0]?.title || "当天农场记录"}</h2><p>{log.summary || `${log.activities?.length || 0}处农事`}</p><div className="admin-log-activity-tags">{log.activities?.map((activity) => <span key={`${activity.time}-${activity.place}`}>{activity.time} · {activity.place}</span>)}</div></div><button className="admin-icon-button" onClick={() => setEditing(log)}><PencilSimple /></button></article>)}</section>
    {editing !== undefined && <FarmLogEditor log={editing} close={() => setEditing(undefined)} save={save} />}
  </>;
}

function Deliveries({ deliveries, setDeliveries, notify }) {
  const update = async (delivery, status) => { await adminApi.updateDelivery(delivery.id, { status, trackingNo: delivery.trackingNo }); setDeliveries((items) => items.map((item) => item.id === delivery.id ? { ...item, status } : item)); notify("寄送状态已经更新"); };
  return <>
    <SectionHead kicker="年卡寄送" title="连续12个月，每个月都不漏发" description="年卡激活后自动生成12次寄送计划；这里按月份完成分拣、装箱和物流登记。" />
    <section className="admin-delivery-intro"><Egg weight="thin" /><div><strong>2027散养鸡蛋年卡</strong><span>2027年1月开始发货 · 连续12个月 · 每月1箱 · 每箱30枚</span></div></section>
    <section className="admin-table-card">{deliveries.length ? <div className="admin-delivery-list">{deliveries.map((delivery) => <article key={delivery.id}><div className="admin-delivery-month"><CalendarDots /><strong>{delivery.deliveryMonth}</strong></div><div><strong>{delivery.customerName}</strong><small>{delivery.phone}</small></div><span>1箱 × {delivery.eggsPerBox}枚</span><label><select value={delivery.status} onChange={(event) => update(delivery, event.target.value)}>{Object.entries(deliveryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></article>)}</div> : <EmptyState icon={Truck} title="还没有激活的年卡" text="顾客激活卡密后，系统会自动生成2027年12个月的寄送计划。" />}</section>
  </>;
}

export function AdminApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [authError, setAuthError] = useState("");
  const [actor, setActor] = useState("");
  const [view, setView] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [dashboard, setDashboard] = useState({ metrics: {}, recentOrders: [], lowStock: [] });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  const notify = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2600); };
  const loadAll = async () => {
    setLoading(true);
    try {
      const [nextDashboard, nextProducts, nextOrders, nextVouchers, nextLogs, nextDeliveries] = await Promise.all([adminApi.dashboard(), adminApi.products(), adminApi.orders(), adminApi.vouchers(), adminApi.farmLogs(), adminApi.deliveries()]);
      setDashboard(nextDashboard); setProducts(nextProducts.products || []); setOrders(nextOrders.orders || []); setVouchers(nextVouchers.vouchers || []); setLogs(nextLogs.logs || []); setDeliveries(nextDeliveries.deliveries || []);
    } finally { setLoading(false); }
  };

  const verify = async () => {
    try {
      const status = await adminApi.authStatus();
      setSetupRequired(Boolean(status.setupRequired));
      setAuthenticated(Boolean(status.authenticated));
      setActor(status.actor || "");
      setAuthError("");
      if (status.authenticated) await loadAll();
      else setLoading(false);
    } catch (error) { setAuthenticated(false); setLoading(false); setAuthError(error.message); }
  };

  useEffect(() => { verify(); }, []);
  useEffect(() => { document.title = "经营管理后台｜山大王农场"; }, []);

  const finishAuthentication = async (action) => {
    setLoading(true); setAuthError("");
    try {
      const result = await action();
      setAuthenticated(true); setSetupRequired(false); setActor(result.actor || result.user?.displayName || "农场主");
      await loadAll();
    } catch (error) { setAuthenticated(false); setLoading(false); setAuthError(error.message); }
  };
  const submitLogin = (input) => finishAuthentication(() => adminApi.login(input));
  const submitRegistration = (input) => finishAuthentication(() => adminApi.register(input));
  const signOut = async () => { await adminApi.logout(); setAuthenticated(false); setActor(""); setAuthError(""); };
  const currentTitle = useMemo(() => navItems.find(([id]) => id === view)?.[1], [view]);

  if (!authenticated) return <AdminLogin error={authError} setupRequired={setupRequired} working={loading} onLogin={submitLogin} onRegister={submitRegistration} />;
  return <div className="admin-shell">
    <AdminSidebar view={view} setView={setView} actor={actor} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} signOut={signOut} />
    <header className="admin-mobile-head"><button onClick={() => setMobileOpen(true)}><List /></button><strong>{currentTitle}</strong><a href="/" aria-label="查看网站"><Eye /></a></header>
    <main className="admin-main">
      <div className="admin-topbar"><div><span>后台数据已连接</span><i /><strong>{currentTitle}</strong></div><div><a href="/" target="_blank" rel="noreferrer"><Eye /> 查看前台</a><button onClick={loadAll}><ArrowClockwise /> 刷新数据</button><button aria-label="系统设置" onClick={() => notify("权限与支付接口设置将在部署配置中完成")}><Gear /></button></div></div>
      <div className={`admin-content ${loading ? "is-loading" : ""}`}>
        {view === "overview" && <Overview data={dashboard} go={setView} />}
        {view === "products" && <Products products={products} setProducts={setProducts} notify={notify} />}
        {view === "orders" && <Orders orders={orders} setOrders={setOrders} notify={notify} />}
        {view === "vouchers" && <Vouchers vouchers={vouchers} setVouchers={setVouchers} notify={notify} refresh={async () => setVouchers((await adminApi.vouchers()).vouchers || [])} />}
        {view === "farm" && <FarmLogs logs={logs} setLogs={setLogs} notify={notify} />}
        {view === "deliveries" && <Deliveries deliveries={deliveries} setDeliveries={setDeliveries} notify={notify} />}
      </div>
    </main>
    <div className={`admin-toast ${notice ? "is-visible" : ""}`}>{notice}</div>
  </div>;
}
