import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import worker, { __test } from "../worker/index.js";

function memoryD1() {
  const database = new DatabaseSync(":memory:");
  const prepare = (sql) => {
    let parameters = [];
    const statement = {
      bind(...values) { parameters = values; return statement; },
      async run() {
        const result = database.prepare(sql).run(...parameters);
        return { success: true, meta: { changes: Number(result.changes || 0) } };
      },
      async first() { return database.prepare(sql).get(...parameters) || null; },
      async all() { return { success: true, results: database.prepare(sql).all(...parameters) }; },
    };
    return statement;
  };
  return {
    prepare,
    async batch(statements) {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      return results;
    },
  };
}

test("redirects the root domain to the single www canonical address", async () => {
  const response = await worker.fetch(new Request("http://shandawangfarm.com/shop?season=summer"), {
    ASSETS: { fetch: async () => new Response("unused") },
  });

  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://www.shandawangfarm.com/shop?season=summer");
});

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("falls back to the app shell for an unknown app route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/" ? "app" : "missing", {
            status: url.pathname === "/" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/flow/step-two?source=share", "/"]);
});

test("marks the admin app shell private from indexing and framing", async () => {
  const response = await worker.fetch(
    new Request("https://example.test/admin", { headers: { accept: "text/html" } }),
    {
      ASSETS: {
        fetch: async (request) => new Response(new URL(request.url).pathname === "/" ? "app" : "missing", { status: new URL(request.url).pathname === "/" ? 200 : 404 }),
      },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
});

test("serves the admin app shell to embedded browsers without an HTML accept header", async () => {
  const response = await worker.fetch(
    new Request("https://example.test/admin", { headers: { accept: "*/*" } }),
    {
      ASSETS: {
        fetch: async (request) => new Response(new URL(request.url).pathname === "/" ? "app" : "missing", { status: new URL(request.url).pathname === "/" ? 200 : 404 }),
      },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "app");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("validates administrator phones and passwords", () => {
  assert.equal(__test.normalizePhone("138 0013 8000"), "13800138000");
  assert.equal(__test.validPhone("13800138000"), true);
  assert.equal(__test.validPhone("12800138000"), false);
  assert.equal(__test.passwordProblem("short"), "密码至少需要10位");
  assert.equal(__test.passwordProblem("abcdefghij"), "密码需要同时包含字母和数字");
  assert.equal(__test.passwordProblem("FarmAdmin2027"), "");
});

test("hashes administrator passwords with a salt and verifies them", async () => {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const hash = await __test.passwordHash("FarmAdmin2027", salt, 1000);
  const row = { password_hash: hash, password_salt: Buffer.from(salt).toString("base64"), password_iterations: 1000 };

  assert.equal(await __test.verifyPassword("FarmAdmin2027", row), true);
  assert.equal(await __test.verifyPassword("FarmAdmin2028", row), false);
});

test("keeps production password hashing within the worker runtime limit", () => {
  assert.equal(__test.PASSWORD_ITERATIONS, 100000);
});

test("opens each product in its real selling months and keeps other seasons in preorder", () => {
  const products = __test.DEFAULT_PRODUCTS;
  const annualCard = products.find((product) => product.id === "egg-annual-card");
  const product = (id) => products.find((item) => item.id === id);

  assert.equal(products.length, 17);
  assert.equal(annualCard.saleMode, "available");
  assert.equal(__test.productSaleMode(product("peaches"), 8), "available");
  assert.equal(__test.productSaleMode(product("bayberries"), 8), "preorder");
  assert.equal(__test.productSaleMode(product("spring-bamboo-shoots"), 3), "available");
  assert.equal(__test.productSaleMode(product("spring-bamboo-shoots"), 8), "preorder");
  assert.equal(__test.productSaleMode(product("autumn-persimmons"), 10), "available");
  assert.equal(__test.productSaleMode(product("winter-tangerines"), 12), "available");
  assert.equal(__test.productSaleMode(product("eggs"), 8), "available");
  assert.deepEqual(new Set(products.map((product) => product.season)), new Set(["spring", "summer", "autumn", "winter", "annual"]));
  assert.ok(["spring-bamboo-shoots", "peaches", "autumn-persimmons", "ningbo-rice-cakes"].every((id) => products.some((product) => product.id === id)));
});

test("uses an HttpOnly secure same-site administrator session cookie", () => {
  const cookie = __test.adminSessionCookie("token", 3600);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Max-Age=3600/);
});

test("registers one owner, closes registration, and logs in with a personal session", async () => {
  const env = { DB: memoryD1(), ADMIN_ACCESS_KEY: "BootstrapCode2027", ASSETS: { fetch: async () => new Response("missing", { status: 404 }) } };
  const statusBefore = await worker.fetch(new Request("https://example.test/api/admin/auth/status"), env);
  assert.deepEqual(await statusBefore.json(), { authenticated: false, setupRequired: true, actor: "", method: "session", user: null });

  const registration = await worker.fetch(new Request("https://example.test/api/admin/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://example.test" },
    body: JSON.stringify({ displayName: "农场主", phone: "13800138000", password: "FarmAdmin2027", setupKey: "BootstrapCode2027" }),
  }), env);
  const registrationBody = await registration.json();
  const sessionCookie = registration.headers.get("set-cookie").split(";")[0];
  assert.equal(registration.status, 201);
  assert.equal(registrationBody.user.phone, "138****8000");
  assert.match(registration.headers.get("set-cookie"), /HttpOnly/);

  const secondRegistration = await worker.fetch(new Request("https://example.test/api/admin/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://example.test" },
    body: JSON.stringify({ displayName: "其他人", phone: "13900139000", password: "AnotherAdmin2027", setupKey: "BootstrapCode2027" }),
  }), env);
  assert.equal(secondRegistration.status, 409);

  const session = await worker.fetch(new Request("https://example.test/api/admin/session", { headers: { cookie: sessionCookie } }), env);
  assert.equal(session.status, 200);
  assert.equal((await session.json()).method, "personal-account");

  const logout = await worker.fetch(new Request("https://example.test/api/admin/auth/logout", { method: "POST", headers: { cookie: sessionCookie, origin: "https://example.test" }, body: "{}" }), env);
  assert.equal(logout.status, 200);

  const login = await worker.fetch(new Request("https://example.test/api/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://example.test" },
    body: JSON.stringify({ phone: "13800138000", password: "FarmAdmin2027" }),
  }), env);
  assert.equal(login.status, 200);
  assert.match(login.headers.get("set-cookie"), /SameSite=Strict/);
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const [request, expectedAssetCalls] of [
    [new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }), 0],
    [new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }), 1],
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    assert.equal(response.status, 404);
    assert.equal(calls, expectedAssetCalls);
  }
});

test("reports a clear service error when a known API route has no database binding", async () => {
  const response = await worker.fetch(new Request("https://example.test/api/catalog/products"), {
    ASSETS: { fetch: async () => new Response("missing", { status: 404 }) },
  });
  const payload = await response.json();

  assert.equal(response.status, 503);
  assert.equal(payload.error, "database_unavailable");
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
  await access(new URL("../dist/.openai/drizzle/0001_admin_backend.sql", import.meta.url));
  await access(new URL("../dist/.openai/drizzle/0002_catalog_expansion.sql", import.meta.url));
  await access(new URL("../dist/.openai/drizzle/0003_admin_identity.sql", import.meta.url));
});
