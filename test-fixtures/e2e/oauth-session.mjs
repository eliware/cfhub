import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import puppeteer from "puppeteer";
import { findBrowser } from "../../src/browser.mjs";
import { loginOAuth } from "../../src/oauth.mjs";

export const outputDir = resolve(process.env.CFHUB_SCREENSHOT_DIR ?? "artifacts/oauth-screenshots");
const fetchImpl = async () => ({
  ok: true,
  json: async () => ({ access_token: "preview-access" }),
});

export async function startOAuthSession(ports) {
  const printed = [];
  const login = loginOAuth({
    clientId: "preview-client",
    scopePicker: true,
    ports,
    open: () => {},
    print: (value) => printed.push(value),
    fetchImpl,
  });
  await new Promise((resolve) => setTimeout(resolve, 100));
  const previewUrl = printed[0]?.match(/https?:\/\/\S+/)?.[0];
  if (!previewUrl) throw new Error("OAuth preview URL was not created");
  const executablePath = await findBrowser({ puppeteerPath: puppeteer.executablePath() });
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: process.getuid?.() === 0 ? ["--no-sandbox"] : [],
  });
  await mkdir(outputDir, { recursive: true });
  return { browser, login, previewUrl, page: await browser.newPage() };
}

export { fetchImpl };
