import { failurePage, successPage } from "../src/oauth-result-pages.mjs";
import moduleCatalog from "../data/cloudflare-oauth-modules.json" with { type: "json" };

test("OAuth result pages render account details and error text", () => {
  const summary = { enabled: [], zones: [], dns: [] };
  expect(successPage({ account: { name: "Cloudflare" }, scopes: [], summary })).toContain(
    "Cloudflare",
  );
  expect(failurePage({ title: "Login failed", detail: "Try again" })).toContain("Login failed");
});

test("OAuth result pages render missing text as empty values", () => {
  const page = failurePage({ title: null, detail: undefined });
  expect(page).not.toContain("Login failed");
  expect(page).not.toContain("undefined");
});

test("OAuth success pages render enabled modules and command examples", () => {
  const enabled = moduleCatalog.modules.filter(({ id }) =>
    ["zones", "dns", "zone-settings", "workers"].includes(id),
  );
  const page = successPage({
    account: { email: "user@example.com" },
    scopes: ["zone.read"],
    summary: {
      enabled,
      zones: [{ name: "example.org" }],
      dns: [{ name: "www.example.org" }],
    },
  });
  expect(page).toContain("user@example.com");
  expect(page).toContain("cfhub zone list");
  expect(page).toContain("cfhub dns record list --zone example.org");
  expect(page).toContain("cfhub zone settings list --zone example.org");
  expect(page).toContain("cfhub workers list");
  expect(page).toContain("Enabled · ready for its selected scopes.");
  expect(page).toContain("Requires:");
  expect(
    successPage({ account: {}, scopes: [], summary: { enabled: [], zones: [], dns: [] } }),
  ).toContain("your Cloudflare account");
});
