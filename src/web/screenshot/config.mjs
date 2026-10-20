import { DEFAULT_WEB_PORT } from "../port.mjs";

export function resolveScreenshotConfig({ url, output, environment = process.env } = {}) {
  return {
    url: url ?? environment.WEB_URL ?? `http://127.0.0.1:${DEFAULT_WEB_PORT}/`,
    output: output ?? environment.SCREENSHOT_PATH ?? "artifacts/cfhub-oauth-picker.png",
  };
}
