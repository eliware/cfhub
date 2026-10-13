import { launchOAuthBrowser } from "../src/oauth-browser-launch.mjs";

test("OAuth browser launcher is exported", () => {
  expect(launchOAuthBrowser).toEqual(expect.any(Function));
});
