import { renderPickerScopeCategory } from "../../../../src/oauth-web/picker/scope/category-markup.mjs";

test("renders category controls and escapes category names", () => {
  const markup = renderPickerScopeCategory('zone"<', [{ scopes: [{ scope: "zone.read" }] }]);
  expect(markup).toContain("<summary>zone&quot;&lt;");
  expect(markup).toContain('data-category-enable="zone&quot;&lt;"');
  expect(markup).toContain("0/1");
});
