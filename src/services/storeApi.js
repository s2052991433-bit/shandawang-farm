const STORAGE_KEY = "shandawang-demo-orders";

const mockVouchers = {
  SDW2026: {
    id: "voucher-2026",
    code: "SDW2026",
    name: "山大王农场礼赠卡",
    value: 200,
    balance: 200,
    expiresAt: "2026-12-31",
    eligibleProductIds: ["bayberries", "eggs", "peaches", "ningbo-rice-cakes", "weekly-vegetable-basket", "baby-bok-choy", "farm-tomatoes", "farm-cucumbers", "purple-eggplants", "fresh-edamame"],
    allowTopUp: true,
    allowAddOns: true,
  },
  "SDW-GIFT": {
    id: "voucher-gift",
    code: "SDW-GIFT",
    name: "山野时令礼卡",
    value: 300,
    balance: 300,
    expiresAt: "2026-12-31",
    eligibleProductIds: ["bayberries", "eggs", "peaches", "ningbo-rice-cakes", "weekly-vegetable-basket", "baby-bok-choy", "farm-tomatoes", "farm-cucumbers", "purple-eggplants", "fresh-edamame"],
    allowTopUp: true,
    allowAddOns: true,
  },
  "SDW-EGG-2027-DEMO": {
    id: "voucher-egg-annual-demo",
    code: "SDW-EGG-2027-DEMO",
    type: "annual_card",
    name: "2027散养鸡蛋年卡",
    value: 798,
    balance: 0,
    expiresAt: "2027-12-31",
    eligibleProductIds: [],
    allowTopUp: false,
    allowAddOns: false,
    deliveryPlan: { startsOn: "2027-01-01", months: 12, boxesPerMonth: 1, eggsPerBox: 30 },
  },
};

const wait = (milliseconds = 360) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function createId(prefix) {
  const now = new Date();
  const stamp = [
    String(now.getFullYear()).slice(-2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join("");
  return `${prefix}${stamp}${Math.floor(100 + Math.random() * 900)}`;
}

function persist(record) {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing].slice(0, 20)));
  } catch {
    // The interface still works when private browsing disables local storage.
  }
}

function isLocalPreview() {
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "系统暂时无法完成这次操作");
    error.code = payload.error;
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const storeApi = {
  async listProducts() {
    try {
      const payload = await request("/api/catalog/products");
      return payload.products || [];
    } catch (error) {
      if (isLocalPreview()) return null;
      throw error;
    }
  },

  async listFarmLogs() {
    try {
      const payload = await request("/api/farm-logs");
      return payload.logs || [];
    } catch (error) {
      if (isLocalPreview()) return null;
      throw error;
    }
  },

  async validateVoucher(rawCode) {
    try {
      return await request("/api/vouchers/validate", { method: "POST", body: JSON.stringify({ code: rawCode }) });
    } catch (error) {
      if (!isLocalPreview()) throw error;
      await wait();
      const code = rawCode.trim().toUpperCase();
      const voucher = mockVouchers[code];
      if (!voucher) throw new Error("没有找到这张卡券，请检查兑换码后重试");
      return { ...voucher };
    }
  },

  async createOrder(payload) {
    try {
      return await request("/api/orders", { method: "POST", body: JSON.stringify(payload) });
    } catch (error) {
      if (!isLocalPreview()) throw error;
      await wait(520);
      const record = { ...payload, id: createId("SDW"), orderNo: createId("SDW"), type: "purchase", status: "pending_payment", createdAt: new Date().toISOString() };
      persist(record);
      return record;
    }
  },

  async createRedemption(payload) {
    try {
      return await request("/api/redemptions", { method: "POST", body: JSON.stringify(payload) });
    } catch (error) {
      if (!isLocalPreview()) throw error;
      await wait(520);
      const annual = payload.voucherCode === "SDW-EGG-2027-DEMO";
      const record = { ...payload, id: createId(annual ? "NK" : "DH"), orderNo: createId(annual ? "NK" : "DH"), type: annual ? "annual_card_activation" : "redemption", status: payload.topUpAmount > 0 ? "pending_payment" : "confirmed", startsOn: annual ? "2027-01-01" : undefined, months: annual ? 12 : undefined, createdAt: new Date().toISOString() };
      persist(record);
      return record;
    }
  },
};
