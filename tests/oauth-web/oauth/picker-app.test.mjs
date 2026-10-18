import { jest } from "@jest/globals";

test("starts the picker when loaded in a browser", async () => {
  const initializePicker = jest.fn();
  await jest.resetModules();
  await jest.unstable_mockModule("../../../src/oauth-web/oauth/picker.mjs", () => ({
    initializePicker,
  }));
  globalThis.window = {};
  try {
    await import("../../../src/oauth-web/oauth/picker-app.mjs");
    expect(initializePicker).toHaveBeenCalledTimes(1);
  } finally {
    delete globalThis.window;
  }
});

test("does not start the picker outside a browser", async () => {
  const initializePicker = jest.fn();
  await jest.resetModules();
  await jest.unstable_mockModule("../../../src/oauth-web/oauth/picker.mjs", () => ({
    initializePicker,
  }));
  delete globalThis.window;
  await import("../../../src/oauth-web/oauth/picker-app.mjs");
  expect(initializePicker).not.toHaveBeenCalled();
});
