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

test("escapes feature and scope text", () => {
  const markup = renderPickerScopeFeature({
    name: "<DNS>",
    scopes: [{ scope: 'dns"read', label: "Read & write" }],
  });
  expect(markup).toContain("&lt;DNS&gt;");
  expect(markup).toContain('value="dns&quot;read">Read &amp; write');
});
