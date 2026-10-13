import { initializePicker } from "../../src/oauth-web/oauth-picker.mjs";
test("picker exports its initializer", () => {
  expect(initializePicker).toEqual(expect.any(Function));
});
