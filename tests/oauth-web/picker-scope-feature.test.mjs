import { renderPickerScopeFeature } from "../../src/oauth-web/picker-scope-feature.mjs";

test("renders scope variants for one picker feature", () => {
  expect(
    renderPickerScopeFeature({
      name: "DNS",
      scopes: [
        { scope: "dns.read", label: "Read" },
        { scope: "dns.write", label: "Write" },
      ],
    }),
  ).toContain('value="dns.read">Read</label>');
});
