import * as bundle from "../../../src/oauth-web/bundled/oauth-picker.mjs";
test("picker bundle exports CSS entry", () => {
  expect(bundle.cssOnlyEntry).toBe(true);
});
