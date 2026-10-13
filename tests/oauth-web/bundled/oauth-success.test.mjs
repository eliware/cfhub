import * as bundle from "../../../src/oauth-web/bundled/oauth-success.mjs";
test("success bundle exports CSS entry", () => {
  expect(bundle.cssOnlyEntry).toBe(true);
});
