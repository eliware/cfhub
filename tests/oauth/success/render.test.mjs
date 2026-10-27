import { renderSuccessPage } from "../../../src/oauth/success/render.mjs";

test("renders escaped account data, counts, module cards, and examples", () => {
  const page = renderSuccessPage({
    account: "Acme <Cloud>",
    counts: { scopeCount: 1, enabledCount: 2, zoneCount: 3, dnsCount: 4 },
    moduleCards: { enabled: "<p>Enabled</p>", disabled: "<p>Disabled</p>" },
    examples: "<code>cfhub zones list</code>",
  });
  expect(page).toContain("Acme &lt;Cloud&gt;");
  expect(page).toContain("<p>Enabled</p>");
  expect(page).toContain("<p>Disabled</p>");
  expect(page).toContain("<code>cfhub zones list</code>");
  for (const count of [1, 2, 3, 4]) expect(page).toContain(String(count));
  expect(page).toContain("data:image/svg+xml");
  expect(page).toContain("color-scheme:dark");
});
