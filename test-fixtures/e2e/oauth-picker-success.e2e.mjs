import assert from "node:assert/strict";
import { join } from "node:path";
import { outputDir, startOAuthSession } from "./oauth-session.mjs";

const { browser, login, previewUrl, page } = await startOAuthSession([
  8765, 8766, 8767, 8768, 8769,
]);
try {
  for (const [name, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844, isMobile: true, hasTouch: true }],
    ["mobile-landscape", { width: 844, height: 390, isMobile: true, hasTouch: true }],
  ]) {
    await page.setViewport({ deviceScaleFactor: 1, ...viewport });
    const response = await page.goto(previewUrl, { waitUntil: "networkidle0" });
    assert.equal(response?.status(), 200);
    await page.screenshot({ path: join(outputDir, `oauth-picker-${name}.png`), fullPage: true });
    await page.screenshot({
      path: join(outputDir, `oauth-picker-${name}-above-fold.png`),
      fullPage: false,
    });
    assert.equal(
      await page.$eval("#scope-search", (input) => input.getAttribute("aria-label")),
      "Search permission scopes",
    );
    const pickerText = await page.$eval(".faq", (faq) => faq.textContent);
    assert.match(pickerText, /Can I use my own OAuth client\?/);
    assert.match(pickerText, /Can Eliware access my Cloudflare account\?/);
    console.log(`Captured ${name} OAuth picker screenshot`);
  }
  const start = await fetch(new URL("/oauth/start", previewUrl), {
    method: "POST",
    redirect: "manual",
  });
  const authorization = new URL(start.headers.get("location"));
  const callback = new URL(previewUrl);
  callback.pathname = "/oauth/callback";
  callback.search = `?state=${authorization.searchParams.get("state")}&code=preview`;
  await page.goto(callback, { waitUntil: "domcontentloaded" }).catch(() => {});
  await login;
  assert.equal(await page.title(), "Cloudflare connected · cfhub");
  assert.match(await page.$eval("h1", (heading) => heading.textContent), /connected/i);
  const successHtml = await page.content();
  for (const [name, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844, isMobile: true, hasTouch: true }],
    ["mobile-landscape", { width: 844, height: 390, isMobile: true, hasTouch: true }],
  ]) {
    const successPage = await browser.newPage();
    await successPage.setViewport({ deviceScaleFactor: 1, ...viewport });
    await successPage.setContent(successHtml, { waitUntil: "domcontentloaded" });
    await successPage.screenshot({
      path: join(outputDir, `oauth-success-${name}.png`),
      fullPage: true,
    });
    await successPage.screenshot({
      path: join(outputDir, `oauth-success-${name}-above-fold.png`),
      fullPage: false,
    });
    await successPage.close();
  }
  console.log("Captured OAuth success screenshots");
} finally {
  await browser.close();
}
console.log(`OAuth picker and success screenshots written to ${outputDir}`);
