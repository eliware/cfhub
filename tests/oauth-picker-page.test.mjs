import { pickerHtml } from "../src/oauth-picker-page.mjs";

test("renders picker assets and embedded scope data", () => {
  const page = pickerHtml();
  expect(page).toContain("<!doctype html>");
  expect(page).toContain("zone.read");
  expect(page).toContain("/oauth-picker.css?v=");
  expect(page).toContain("/oauth-picker-app.mjs?v=");
  expect(page).not.toContain("__CFHUB_SCOPE_MODEL__");
});
