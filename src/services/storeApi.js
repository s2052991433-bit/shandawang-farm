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

// Replace the methods below with real HTTP requests when the commerce backend is ready.
export const storeApi = {
  async validateVoucher(rawCode) {
    await wait();
    const code = rawCode.trim().toUpperCase();
    const voucher = mockVouchers[code];
    if (!voucher) throw new Error("没有找到这张卡券，请检查兑换码后重试");
    return { ...voucher };
  },

  async createOrder(payload) {
    await wait(520);
    const record = {
      ...payload,
      id: createId("SDW"),
      type: "purchase",
      status: "pending_payment",
      createdAt: new Date().toISOString(),
    };
    persist(record);
    return record;
  },

  async createRedemption(payload) {
    await wait(520);
    const record = {
      ...payload,
      id: createId("DH"),
      type: "redemption",
      status: payload.topUpAmount > 0 ? "pending_payment" : "confirmed",
      createdAt: new Date().toISOString(),
    };
    persist(record);
    return record;
  },
};
