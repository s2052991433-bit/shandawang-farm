const DEMO_KEY = "shandawang-admin-demo-state-v1";

try { window.sessionStorage.removeItem("shandawang-admin-access-key"); } catch { /* 浏览器禁止存储时无需处理 */ }

const demoProducts = [
  { id: "bayberries", name: "山里红杨梅", category: "farm-grown", categoryLabel: "农场自产", price: 168, inventory: 36, status: "本季最后一批", active: true, sortOrder: 10, spec: "2.5kg 保鲜装" },
  { id: "eggs", name: "散养初生蛋", category: "farm-grown", categoryLabel: "农场自产", price: 98, inventory: 120, status: "每周二、五发出", active: true, sortOrder: 20, spec: "30枚缓冲蛋托装" },
  { id: "peaches", name: "奉化水蜜桃", category: "ningbo-select", categoryLabel: "宁波精选", price: 138, inventory: 48, status: "采摘后24小时内发出", active: true, sortOrder: 30, spec: "6枚果托礼装" },
  { id: "egg-annual-card", name: "2027散养鸡蛋年卡", category: "gift", categoryLabel: "礼赠年卡", price: 798, inventory: 100, status: "首批限量100张", active: true, sortOrder: 40, spec: "连续12个月 · 每月30枚" },
];

function isLocalPreview() {
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

function defaultDemoState() {
  return {
    products: demoProducts,
    orders: [],
    vouchers: [],
    deliveries: [],
    logs: [{ id: "farm-log-today", logDate: new Date().toISOString().slice(0, 10), label: "今天", season: "农场此刻", summary: "2处农事 · 6张现场图", published: true, activities: [{ time: "06:20", place: "东坡桃园", title: "趁山雾未散，采下今天的桃子", body: "逐棵查看成熟度后采摘。", images: [] }, { time: "17:40", place: "林下鸡舍", title: "太阳落山前，把今天的蛋捡回来", body: "当天完成捡取、检查、分级与装托。", images: [] }] }],
  };
}

function demoState() {
  try { return JSON.parse(window.localStorage.getItem(DEMO_KEY)) || defaultDemoState(); } catch { return defaultDemoState(); }
}

function saveDemo(state) {
  window.localStorage.setItem(DEMO_KEY, JSON.stringify(state));
  return state;
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "后台操作失败");
    error.status = response.status;
    error.code = payload.error;
    error.needsConfiguration = payload.needsConfiguration;
    throw error;
  }
  return payload;
}

function makeDemoCode(prefix) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let tail = "";
  while (tail.length < 8) tail += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${tail.slice(0, 4)}-${tail.slice(4)}`;
}

async function withFallback(realCall, fallback) {
  try { return await realCall(); } catch (error) { if (!isLocalPreview()) throw error; return fallback(); }
}

export const adminApi = {
  authStatus() {
    return withFallback(() => request("/api/admin/auth/status"), () => ({ authenticated: true, setupRequired: false, actor: "本地预览", method: "preview", user: { displayName: "本地预览", phone: "", role: "owner" } }));
  },

  register(input) {
    return request("/api/admin/auth/register", { method: "POST", body: JSON.stringify(input) });
  },

  login(input) {
    return request("/api/admin/auth/login", { method: "POST", body: JSON.stringify(input) });
  },

  logout() {
    return withFallback(() => request("/api/admin/auth/logout", { method: "POST", body: "{}" }), () => ({ ok: true }));
  },

  session() {
    return withFallback(() => request("/api/admin/session"), () => ({ authenticated: true, actor: "本地预览", method: "preview" }));
  },

  dashboard() {
    return withFallback(() => request("/api/admin/dashboard"), () => {
      const state = demoState();
      return { metrics: { orders: state.orders.length, pendingFulfillment: state.orders.filter((order) => order.fulfillmentStatus !== "delivered").length, activeVouchers: state.vouchers.filter((voucher) => voucher.status === "active").length, scheduledDeliveries: state.deliveries.filter((delivery) => delivery.status === "scheduled").length, paidRevenue: state.orders.filter((order) => order.paymentStatus === "paid").reduce((sum, order) => sum + order.total, 0) }, recentOrders: state.orders.slice(0, 8), lowStock: [...state.products].sort((a, b) => a.inventory - b.inventory).slice(0, 8) };
    });
  },

  products() { return withFallback(() => request("/api/admin/products"), () => ({ products: demoState().products })); },
  saveProduct(product) {
    const creating = Boolean(product.__new);
    const cleanProduct = { ...product };
    delete cleanProduct.__new;
    return withFallback(() => request(creating ? "/api/admin/products" : `/api/admin/products/${encodeURIComponent(product.id)}`, { method: creating ? "POST" : "PATCH", body: JSON.stringify(cleanProduct) }), () => {
      const state = demoState();
      state.products = creating ? [...state.products, cleanProduct] : state.products.map((item) => item.id === cleanProduct.id ? { ...item, ...cleanProduct } : item);
      saveDemo(state);
      return cleanProduct;
    });
  },

  orders() { return withFallback(() => request("/api/admin/orders"), () => ({ orders: demoState().orders })); },
  updateOrder(id, changes) {
    return withFallback(() => request(`/api/admin/orders/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(changes) }), () => {
      const state = demoState();
      state.orders = state.orders.map((order) => order.id === id || order.orderNo === id ? { ...order, ...changes } : order);
      saveDemo(state);
      return state.orders.find((order) => order.id === id || order.orderNo === id);
    });
  },

  vouchers() { return withFallback(() => request("/api/admin/vouchers"), () => ({ vouchers: demoState().vouchers })); },
  generateVouchers(input) {
    return withFallback(() => request("/api/admin/vouchers", { method: "POST", body: JSON.stringify(input) }), () => {
      const state = demoState();
      const codes = Array.from({ length: Number(input.count) }, () => makeDemoCode(input.prefix));
      const createdAt = new Date().toISOString();
      state.vouchers.unshift(...codes.map((code, index) => ({ id: `demo-${Date.now()}-${index}`, codeHint: code.slice(-4), type: input.type, name: input.name, value: Number(input.value), balance: input.type === "gift_balance" ? Number(input.value) : 0, status: "active", expiresAt: input.expiresAt, createdAt })));
      saveDemo(state);
      return { codes, count: codes.length, type: input.type, name: input.name, warning: "本地预览卡密，仅用于检查流程" };
    });
  },

  farmLogs() { return withFallback(() => request("/api/admin/farm-logs"), () => ({ logs: demoState().logs })); },
  saveFarmLog(log) {
    const path = log.id ? `/api/admin/farm-logs/${encodeURIComponent(log.id)}` : "/api/admin/farm-logs";
    return withFallback(() => request(path, { method: log.id ? "PATCH" : "POST", body: JSON.stringify(log) }), () => {
      const state = demoState();
      const saved = { ...log, id: log.id || `log-${Date.now()}` };
      state.logs = log.id ? state.logs.map((item) => item.id === log.id ? saved : item) : [saved, ...state.logs];
      saveDemo(state);
      return saved;
    });
  },

  deliveries() { return withFallback(() => request("/api/admin/deliveries"), () => ({ deliveries: demoState().deliveries })); },
  updateDelivery(id, changes) { return request(`/api/admin/deliveries/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(changes) }); },
};
