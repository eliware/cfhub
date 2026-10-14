import { jest } from "@jest/globals";
import "../../src/oauth-web/oauth-picker-app.mjs";

test("starts the picker when loaded in a browser", async () => {
  const initializePicker = jest.fn();
  await jest.unstable_mockModule("../../src/oauth-web/oauth-picker.mjs", () => ({
    initializePicker,
  }));
  globalThis.window = {};
  await import(`../../src/oauth-web/oauth-picker-app.mjs?browser=${Date.now()}`);
  expect(initializePicker).toHaveBeenCalledTimes(1);
});

test("does not start the picker outside a browser", async () => {
  const initializePicker = jest.fn();
  await jest.unstable_mockModule("../../src/oauth-web/oauth-picker.mjs", () => ({
    initializePicker,
  }));
  delete globalThis.window;
  await import(`../../src/oauth-web/oauth-picker-app.mjs?server=${Date.now()}`);
  expect(initializePicker).not.toHaveBeenCalled();
});
