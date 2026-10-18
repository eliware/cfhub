import { createPickerSetup } from "../../../src/oauth-web/picker/setup.mjs";

test("collects picker elements and closes quick setup on a small screen", () => {
  const elements = new Map([
    [".quick-setup", {}],
    ["#module-groups", {}],
    ["#scope-groups", {}],
    ["#module-count", {}],
  ]);
  const documentRef = {
    querySelector: (selector) => elements.get(selector),
    querySelectorAll: () => ["session-option"],
  };
  const setup = createPickerSetup(documentRef, {
    CFHUB_SCOPE_MODEL: { categories: {}, modules: ["module"] },
    matchMedia: () => ({ matches: true }),
  });
  expect(setup).toMatchObject({
    categories: {},
    modules: ["module"],
    requiredScopes: [],
    boxes: [],
    sessionOptions: ["session-option"],
  });
  expect(setup.quickSetup.open).toBe(false);
});

test("keeps quick setup open on wider screens", () => {
  const quickSetup = { open: true };
  createPickerSetup(
    {
      querySelector: (selector) => (selector === ".quick-setup" ? quickSetup : {}),
      querySelectorAll: () => [],
    },
    { CFHUB_SCOPE_MODEL: { categories: {}, modules: [] }, matchMedia: () => ({ matches: false }) },
  );
  expect(quickSetup.open).toBe(true);
});
