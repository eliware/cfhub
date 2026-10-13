import { failurePage, successPage } from "../src/oauth-result-pages.mjs";

test("OAuth result pages render account details and error text", () => {
  const summary = { enabled: [], zones: [], dns: [] };
  expect(successPage({ account: { name: "Cloudflare" }, scopes: [], summary })).toContain(
    "Cloudflare",
  );
  expect(failurePage({ title: "Login failed", detail: "Try again" })).toContain("Login failed");
});
