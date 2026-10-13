import { access } from "node:fs/promises";
import { browserCandidates } from "./browser-candidates.mjs";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function findBrowser({
  env = process.env,
  platform = process.platform,
  accessImpl = exists,
  puppeteerPath,
} = {}) {
  if (env.CHROME_PATH) {
    if (await accessImpl(env.CHROME_PATH)) return env.CHROME_PATH;
    throw new Error(`CHROME_PATH does not exist: ${env.CHROME_PATH}`);
  }

  const candidates = browserCandidates(env, platform);
  for (const candidate of candidates.standard) {
    if (await accessImpl(candidate)) return candidate;
  }

  if (puppeteerPath && (await accessImpl(puppeteerPath))) return puppeteerPath;
  for (const candidate of candidates.path) {
    if (await accessImpl(candidate)) return candidate;
  }
  throw new Error(
    "No supported Chrome, Edge, or Chromium browser was found. " +
      "Install one or set CHROME_PATH to its executable.",
  );
}
