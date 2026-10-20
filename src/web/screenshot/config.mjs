export function resolveScreenshotConfig({ url, output, environment = process.env } = {}) {
  return {
    url: url ?? environment.WEB_URL ?? "http://127.0.0.1:1020/",
    output: output ?? environment.SCREENSHOT_PATH ?? "artifacts/cfhub-oauth-picker.png",
  };
}
