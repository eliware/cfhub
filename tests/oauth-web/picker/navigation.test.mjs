import { bindPickerNavigation } from "../../../src/oauth-web/picker/navigation.mjs";

test("picker navigation expands, collapses, and filters categories", () => {
  const listeners = {};
  const expand = { addEventListener: (name, fn) => (listeners.expand = fn) };
  const collapse = { addEventListener: (name, fn) => (listeners.collapse = fn) };
  const search = { addEventListener: (name, fn) => (listeners.search = fn) };
  const categories = [
    { textContent: "Zone settings", open: false },
    { textContent: "DNS records", open: false },
  ];
  globalThis.document = {
    querySelector: (selector) =>
      ({ "[data-expand]": expand, "[data-collapse]": collapse, "#scope-search": search })[selector],
    querySelectorAll: () => categories,
  };
  bindPickerNavigation();
  listeners.expand();
  expect(categories.every(({ open }) => open)).toBe(true);
  listeners.collapse();
  expect(categories.every(({ open }) => !open)).toBe(true);
  listeners.search({ target: { value: "ZONE" } });
  expect(categories.map(({ hidden }) => hidden)).toEqual([false, true]);
  expect(categories[0].open).toBe(true);
  listeners.search({ target: { value: "" } });
  expect(categories.map(({ hidden }) => hidden)).toEqual([false, false]);
});
