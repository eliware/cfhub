import { dashboardUrl } from "../../src/cli/dashboard-url.mjs";

test("builds dashboard URLs from zone and account options", () => {
  expect(dashboardUrl({ "zone-id": "zone" })).toBe("https://dash.cloudflare.com/zones/zone");
  expect(dashboardUrl({ "account-id": "account" })).toBe(
    "https://dash.cloudflare.com/accounts/account",
  );
  expect(dashboardUrl({})).toBe("https://dash.cloudflare.com/");
});
