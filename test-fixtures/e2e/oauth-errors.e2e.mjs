import assert from "node:assert/strict";
import { join } from "node:path";
import { outputDir, startOAuthSession } from "./oauth-session.mjs";

const { browser, login, previewUrl, page } = await startOAuthSession([1121, 1122, 1123, 1124]);
try {
  const cancellationFailure = login.catch((error) => error);
  const start = await fetch(new URL("/oauth/start", previewUrl), {
    method: "POST",
    redirect: "manual",
  });
  const authorization = new URL(start.headers.get("location"));
  const callback = new URL(previewUrl);
  callback.pathname = "/oauth/callback";
  callback.search = new URLSearchParams({
    state: authorization.searchParams.get("state"),
    error: "access_denied",
    error_description: "The user has denied the consent request.",
  }).toString();
  const response = await page.goto(callback, { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 400);
  assert.equal(await page.title(), "Authorization cancelled · cfhub");
  assert.match(await page.$eval("h1", (heading) => heading.textContent), /cancelled/i);
  for (const [name, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844, isMobile: true, hasTouch: true }],
    ["mobile-landscape", { width: 844, height: 390, isMobile: true, hasTouch: true }],
  ]) {
    await page.setViewport({ deviceScaleFactor: 1, ...viewport });
    await page.screenshot({ path: join(outputDir, `oauth-cancelled-${name}.png`), fullPage: true });
    await page.screenshot({
      path: join(outputDir, `oauth-cancelled-${name}-above-fold.png`),
      fullPage: false,
    });
  }
  assert.match((await cancellationFailure).message, /authorization failed: access_denied/);

  const invalid = await startOAuthSession([1122, 1123, 1124]);
  try {
    const invalidFailure = invalid.login.catch((error) => error);
    const invalidCallback = new URL(invalid.previewUrl);
    invalidCallback.pathname = "/oauth/callback";
    invalidCallback.search = "?state=invalid-preview-state&code=preview";
    const invalidResponse = await invalid.page.goto(invalidCallback, {
      waitUntil: "domcontentloaded",
    });
    assert.equal(invalidResponse?.status(), 400);
    assert.equal(await invalid.page.title(), "Authorization request expired · cfhub");
    assert.match(
      await invalid.page.$eval("h1", (heading) => heading.textContent),
      /request expired/i,
    );
    for (const [name, viewport] of [
      ["desktop", { width: 1440, height: 1000 }],
      ["mobile", { width: 390, height: 844, isMobile: true, hasTouch: true }],
      ["mobile-landscape", { width: 844, height: 390, isMobile: true, hasTouch: true }],
    ]) {
      await invalid.page.setViewport({ deviceScaleFactor: 1, ...viewport });
      await invalid.page.screenshot({
        path: join(outputDir, `oauth-invalid-state-${name}.png`),
        fullPage: true,
      });
      await invalid.page.screenshot({
        path: join(outputDir, `oauth-invalid-state-${name}-above-fold.png`),
        fullPage: false,
      });
    }
    assert.match(
      (await invalidFailure).message,
      /OAuth login expired or was opened in another browser/,
    );
  } finally {
    await invalid.browser.close();
  }
} finally {
  await browser.close();
}
console.log(`OAuth error screenshots written to ${outputDir}`);
