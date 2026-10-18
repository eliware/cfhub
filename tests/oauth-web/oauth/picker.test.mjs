import { jest } from "@jest/globals";
import { initializePicker as exportedPicker } from "../../../src/oauth-web/oauth/picker.mjs";
test("picker initialization connects group, event, and render helpers", async () => {
  const state = {
    selected: new Set(["zone.read"]),
    required: new Set(["zone.read"]),
    enabledModules: new Set(),
  };
  const modules = [{ id: "zones", scopes: ["zone.read"] }];
  const renderGroups = jest.fn(({ boxes }) => boxes.push({ value: "zone.read" }));
  const bindEvents = jest.fn();
  const renderState = jest.fn();
  await jest.unstable_mockModule("../../../src/oauth-web/picker/groups.mjs", () => ({
    renderPickerGroups: renderGroups,
  }));
  await jest.unstable_mockModule("../../../src/oauth-web/picker/events.mjs", () => ({
    bindPickerEvents: bindEvents,
  }));
  await jest.unstable_mockModule("../../../src/oauth-web/picker/state.mjs", () => ({
    createPickerState: () => state,
  }));
  await jest.unstable_mockModule("../../../src/oauth-web/picker/render.mjs", () => ({
    renderPickerState: renderState,
  }));
  const quickSetup = {};
  const moduleCount = {};
  globalThis.document = {
    querySelector: (selector) =>
      ({
        ".quick-setup": quickSetup,
        "#module-count": moduleCount,
        "#module-groups": {},
        "#scope-groups": {},
      })[selector],
    querySelectorAll: () => [],
  };
  globalThis.window = {
    CFHUB_SCOPE_MODEL: { categories: {}, modules },
    matchMedia: () => ({ matches: true }),
  };
  const { initializePicker } =
    await import("../../../src/oauth-web/oauth/picker.mjs?test=picker-init");
  initializePicker();
  expect(quickSetup.open).toBe(false);
  expect(renderGroups).toHaveBeenCalledTimes(1);
  expect(bindEvents).toHaveBeenCalledWith(
    expect.objectContaining({ ...state, boxes: expect.any(Array), render: expect.any(Function) }),
  );
  expect(renderState).toHaveBeenCalledWith(
    expect.objectContaining({ categories: {}, modules, state, moduleCount }),
  );
  expect(initializePicker).toEqual(expect.any(Function));
  expect(exportedPicker).toEqual(expect.any(Function));
  globalThis.window.matchMedia = () => ({ matches: false });
  initializePicker();
  expect(renderGroups).toHaveBeenCalledTimes(2);
  expect(renderState).toHaveBeenCalledTimes(2);
});
