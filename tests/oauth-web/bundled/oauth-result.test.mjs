import * as bundle from "../../../src/oauth-web/bundled/oauth-result.mjs";
test("result bundle exports CSS entry", () => {
  expect(bundle.cssOnlyEntry).toBe(true);
});
