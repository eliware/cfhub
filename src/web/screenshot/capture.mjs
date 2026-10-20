export async function captureScreenshot({ puppeteer, url, prepareTarget }) {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    const target = await prepareTarget();
    await page.screenshot({ path: target, fullPage: true });
    return target;
  } finally {
    await browser.close();
  }
}
