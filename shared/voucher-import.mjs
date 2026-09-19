// Printed identifiers remain strings, including leading zeroes.
export function normalizeCards(cards) {
  if (!Array.isArray(cards) || !cards.length || cards.length > 100) throw new Error("每批请导入1至100张卡");
  const numbers = new Set();
  const passwords = new Set();
  return cards.map((card, index) => {
    if (typeof card?.cardNumber !== "string" || typeof card?.password !== "string") throw new Error(`第${index + 1}行卡号和密码必须为文本`);
    const cardNumber = card.cardNumber.trim();
    const password = card.password.trim();
    if (!/^[A-Za-z0-9-]{1,64}$/.test(cardNumber) || !/^[A-Za-z0-9-]{6,128}$/.test(password)) throw new Error(`第${index + 1}行卡号或密码格式不正确`);
    if (numbers.has(cardNumber) || passwords.has(password.toUpperCase())) throw new Error(`第${index + 1}行存在重复卡号或密码`);
    numbers.add(cardNumber); passwords.add(password.toUpperCase());
    return { cardNumber, password };
  });
}

export function parseCardText(text) {
  const rows = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/).filter((row) => row.trim());
  const cells = rows.map((row) => row.split(/[\t,]/).map((cell) => cell.trim().replace(/^"(.*)"$/, "$1")));
  if (cells[0]?.[0] === "卡号" && cells[0]?.[1] === "密码") cells.shift();
  if (cells.some((row) => row.length !== 2)) throw new Error("请只提供卡号、密码两列，以制表符或逗号分隔");
  return normalizeCards(cells.map(([cardNumber, password]) => ({ cardNumber, password })));
}
