// Read-only UI audit using existing demo accounts. No forms are submitted.
const fs = require("node:fs/promises");
const path = require("node:path");
const {
  chromium,
} = require("../.local/font-audit-tools/node_modules/playwright");
const sharp = require("sharp");
const base = process.env.AUDIT_BASE || "http://localhost:3000";
const phase = process.argv[2] || "before";
const out = path.resolve(".local/font-audit", phase);
async function api(url, token) {
  const response = await fetch(base + "/api/v1" + url, {
    headers: token ? { Authorization: "Bearer " + token } : {},
  });
  if (!response.ok) throw new Error(url + ": " + response.status);
  return response.json();
}
(async () => {
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const results = [];
  const products = (await api("/products?limit=60")).items;
  const studios = await api("/workshops");
  const traces = new Set();
  for (const product of products)
    for (const batch of (await api("/products/" + product._id)).batches)
      traces.add(batch._id);
  const publicPages = [
    ["home", "/"],
    ["catalog", "/tranh"],
    ["workshops", "/xuong"],
    ["map", "/ban-do"],
    ["news", "/tin-tuc"],
    ["login", "/dang-nhap"],
    ["not-found", "/font-audit-missing"],
    ...products.map((p, i) => ["product-" + (i + 1), "/tranh/" + p._id]),
    ...studios.map((s, i) => ["workshop-" + (i + 1), "/xuong/" + s._id]),
    ...[...traces].map((id, i) => ["trace-" + (i + 1), "/trace/" + id]),
  ];
  try {
    for (const width of (process.env.AUDIT_WIDTHS || "1440,390")
      .split(",")
      .map(Number)) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      async function settle() {
        await page
          .waitForFunction(() => !document.querySelector(".loading"), {
            timeout: 10000,
          })
          .catch(() => {});
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(350);
      }
      async function capture(name) {
        await settle();
        await page.evaluate(async () => {
          for (const img of document.images) img.loading = "eager";
          await Promise.all(
            [...document.images].map((img) => img.decode().catch(() => {})),
          );
        });
        const filename = width + "-" + name + ".png";
        await page.screenshot({
          path: path.join(out, filename),
          fullPage: true,
        });
        const data = await page.evaluate(() => {
          const visible = (e) => {
            const r = e.getBoundingClientRect();
            return (
              r.width > 0 &&
              r.height > 0 &&
              getComputedStyle(e).visibility !== "hidden"
            );
          };
          const nodes = [
            ...document.querySelectorAll(
              "h1,h2,h3,p,a,button,label,small,span,th,td,input,select",
            ),
          ].filter(visible);
          return {
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            width: document.documentElement.scrollWidth,
            smallText: nodes
              .filter(
                (e) =>
                  parseFloat(getComputedStyle(e).fontSize) < 11 &&
                  e.textContent.trim(),
              )
              .map((e) => ({
                selector: e.className,
                text: e.textContent.trim().slice(0, 75),
                size: getComputedStyle(e).fontSize,
              })),
            headings: [...document.querySelectorAll("h1,h2,h3")]
              .filter(visible)
              .map((e) => ({
                text: e.textContent,
                font: getComputedStyle(e).fontFamily,
                size: getComputedStyle(e).fontSize,
              })),
            overflowing: nodes
              .filter((e) => {
                const r = e.getBoundingClientRect();
                return r.right > innerWidth + 1 || r.left < -1;
              })
              .map((e) => ({
                text: e.textContent.trim().slice(0, 60),
                class: e.className,
              })),
          };
        });
        const cdp = await context.newCDPSession(page);
        await cdp.send("DOM.enable");
        await cdp.send("CSS.enable");
        const { root } = await cdp.send("DOM.getDocument");
        const { nodeId } = await cdp.send("DOM.querySelector", {
          nodeId: root.nodeId,
          selector: ".modal h2, main h1, main h2",
        });
        data.renderedFonts = nodeId
          ? (await cdp.send("CSS.getPlatformFontsForNode", { nodeId })).fonts
          : [];
        await cdp.detach();
        results.push({ name, viewportWidth: width, filename, ...data });
        console.log(
          width +
            " " +
            name +
            " overflow=" +
            data.overflow +
            " small=" +
            data.smallText.length,
        );
      }
      async function go(route) {
        await page.goto(base + "/#" + route);
        await settle();
      }
      if (process.env.AUDIT_PUBLIC !== "0") {
        for (const [name, route] of publicPages) {
          await go(route);
          await capture(name);
        }
        await go("/dang-nhap");
        await page
          .getByRole("button", { name: "Chưa có tài khoản? Đăng ký" })
          .click();
        await capture("register");
        await go("/tin-tuc");
        if (
          await page.getByRole("button", { name: "Đọc câu chuyện" }).count()
        ) {
          await page
            .getByRole("button", { name: "Đọc câu chuyện" })
            .first()
            .click();
          await capture("news-expanded");
        }
        await go("/tranh?search=font-audit-no-result");
        await capture("catalog-empty");
      }
      await go("/");
      for (const role of (process.env.AUDIT_ROLES || "buyer,artisan")
        .split(",")
        .filter(Boolean)) {
        const response = await fetch(base + "/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: role + "@vcraft.local",
            password: "DongHo@2026!",
          }),
        });
        if (!response.ok) {
          console.log("SKIPPED " + role + " login HTTP " + response.status);
          continue;
        }
        const { token } = await response.json();
        await page.evaluate(
          (token) => sessionStorage.setItem("vcraft-token", token),
          token,
        );
        await page.reload();
        await go("/workspace");
        await capture(role + "-dashboard");
        const quotes = await api("/quotes", token);
        for (let i = 0; i < quotes.length; i++) {
          await go("/quotes/" + quotes[i]._id);
          await capture(role + "-quote-" + (i + 1));
          if (
            role === "artisan" &&
            (await page
              .getByRole("button", { name: "Gửi / cập nhật chào giá" })
              .count())
          ) {
            await page
              .getByRole("button", { name: "Gửi / cập nhật chào giá" })
              .click();
            await capture("artisan-bid-dialog");
            await page
              .getByRole("button", { name: "Hủy", exact: true })
              .click();
          }
        }
        await go("/workspace");
        const tabs =
          role === "artisan"
            ? [
                ["studio", "Hồ sơ xưởng", "Chỉnh sửa"],
                ["products", "Tranh của xưởng", "Thêm tranh"],
                ["batches", "Lô tranh & nhật ký", "Tạo lô tranh"],
              ]
            : role === "admin"
              ? [
                  ["artisans", "Nghệ nhân & kiểm duyệt", "Cấp tài khoản"],
                  ["news", "Tin tức cộng đồng", "Viết tin"],
                ]
              : [["quote", "Yêu cầu đặt tranh", "Tạo yêu cầu"]];
        for (const [slug, tab, button] of tabs) {
          await page
            .locator(".workspace-sidebar")
            .getByRole("button", { name: tab, exact: true })
            .click();
          await capture(role + "-" + slug);
          await page
            .getByRole("button", { name: button, exact: true })
            .first()
            .click();
          await capture(role + "-" + slug + "-dialog");
          await page.getByRole("button", { name: "Hủy", exact: true }).click();
          if (
            slug === "batches" &&
            (await page
              .getByRole("button", { name: "Thêm mốc nhật ký" })
              .count())
          ) {
            await page
              .getByRole("button", { name: "Thêm mốc nhật ký" })
              .first()
              .click();
            await capture("artisan-event-dialog");
            await page
              .getByRole("button", { name: "Hủy", exact: true })
              .click();
            await page
              .getByRole("button", { name: "Chỉnh sửa lô", exact: true })
              .first()
              .click();
            await capture("artisan-edit-batch-dialog");
            await page
              .getByRole("button", { name: "Hủy", exact: true })
              .click();
          }
        }
      }
      await context.close();
    }
  } finally {
    await fs.writeFile(
      path.join(out, "audit.json"),
      JSON.stringify(results, null, 2),
    );
    for (let i = 0; i < results.length; i += 12) {
      const group = results.slice(i, i + 12),
        tiles = [];
      for (let j = 0; j < group.length; j++) {
        const r = group[j];
        const tile = await sharp(path.join(out, r.filename))
          .extract({
            left: 0,
            top: 0,
            width: r.width,
            height: Math.min(
              1000,
              (await sharp(path.join(out, r.filename)).metadata()).height,
            ),
          })
          .resize(360, 250, { fit: "contain", background: "#ddd" })
          .png()
          .toBuffer();
        tiles.push({
          input: tile,
          left: (j % 3) * 360,
          top: Math.floor(j / 3) * 280 + 30,
        });
        const label = Buffer.from(
          '<svg width="360" height="30"><rect width="360" height="30" fill="white"/><text x="8" y="20" font-size="13">' +
            r.width +
            " " +
            r.name +
            "</text></svg>",
        );
        tiles.push({
          input: label,
          left: (j % 3) * 360,
          top: Math.floor(j / 3) * 280,
        });
      }
      await sharp({
        create: {
          width: 1080,
          height: Math.ceil(group.length / 3) * 280,
          channels: 3,
          background: "#ddd",
        },
      })
        .composite(tiles)
        .png()
        .toFile(path.join(out, "contact-" + (Math.floor(i / 12) + 1) + ".png"));
    }
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
