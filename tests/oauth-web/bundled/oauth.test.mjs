import { cssOnlyEntry } from "../../../src/oauth-web/bundled/oauth.mjs";

test.each(["picker", "result", "success"])("%s bundle exports CSS entry", (entry) => {
  expect(cssOnlyEntry[entry]).toBe(true);
});
