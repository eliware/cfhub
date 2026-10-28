import { successPage } from "../../../src/oauth/success/page.mjs";
import moduleCatalog from "../../../data/cloudflare-oauth-modules.json" with { type: "json" };

test("success page shows escaped account data, module status, and examples", () => {
  const page = successPage({
    account: { name: "Acme <Cloud>" },
    scopes: ["zone.read"],
    summary: {
      enabled: [{ id: "zones", name: "Zones" }],
      zones: [{ id: "zone-id", name: "example.com" }],
      dns: [],
    },
  });
  expect(page).toContain("Acme &lt;Cloud&gt;");
  expect(page).toContain("cfhub zones list");
  expect(page).toContain("Requires:");
});

test("success page lists enabled modules and their command examples", () => {
  const enabled = moduleCatalog.modules.filter(({ id }) =>
    ["zones", "dns", "zone-settings", "workers"].includes(id),
  );
  const page = successPage({
    account: { email: "user@example.com" },
    scopes: ["zone.read"],
    summary: {
      enabled,
      zones: [{ id: "zone-id", name: "example.org" }],
      dns: [{ name: "www.example.org" }],
    },
  });
  expect(page).toContain("user@example.com");
  expect(page).toContain("cfhub dns-records list --zone-id zone-id");
  expect(page).toContain("cfhub zone-settings get --zone-id zone-id --setting &lt;name&gt;");
  expect(page).toContain("cfhub workers list");
  expect(page).toContain("Read access is enabled for the selected scopes.");
});

test("success page uses a default account label when account data is absent", () => {
  expect(
    successPage({ account: {}, scopes: [], summary: { enabled: [], zones: [], dns: [] } }),
  ).toContain("your Cloudflare account");
});

test("success page safely renders a missing module name", () => {
  const page = successPage({
    account: {},
    scopes: [],
    summary: { enabled: [{ id: "zones", name: null }], zones: [], dns: [] },
  });
  expect(page).toContain("<strong></strong>");
});
