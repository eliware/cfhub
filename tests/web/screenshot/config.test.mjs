import { resolveScreenshotConfig } from "../../../src/web/screenshot/config.mjs";

test("uses default browser check values", () => {
  expect(resolveScreenshotConfig({ environment: {} })).toEqual({
    url: "http://127.0.0.1:1020/",
    output: "artifacts/cfhub-oauth-picker.png",
  });
});

test("uses process environment when no options are passed", () => {
  expect(resolveScreenshotConfig()).toEqual({
    url: process.env.WEB_URL ?? "http://127.0.0.1:1020/",
    output: process.env.SCREENSHOT_PATH ?? "artifacts/cfhub-oauth-picker.png",
  });
});

test("uses explicit values before environment values", () => {
  expect(
    resolveScreenshotConfig({
      url: "http://localhost:9000/",
      output: "out/page.png",
      environment: { WEB_URL: "http://localhost:1/", SCREENSHOT_PATH: "ignored.png" },
    }),
  ).toEqual({ url: "http://localhost:9000/", output: "out/page.png" });
});
