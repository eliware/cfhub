import { scopeCategories } from "../src/oauth-scope-catalog.mjs";
import moduleCatalog from "../data/cloudflare-oauth-modules.json" with { type: "json" };

test("scope category files preserve catalog order and unique scope IDs", () => {
  const ids = Object.values(scopeCategories).flatMap((features) =>
    features.flatMap((feature) => feature.scopes.map(({ scope }) => scope)),
  );
  expect(Object.keys(scopeCategories)).toEqual([
    "Developer Platform",
    "AI & Machine Learning",
    "DNS & Zones",
    "App Security",
    "Rules & Configuration",
    "Cloudflare One / Zero Trust",
    "Analytics & Logs",
    "Network Services",
    "Media",
    "Email & Messaging",
    "Cache & Performance",
    "Account & Billing",
    "Other",
  ]);
  expect(new Set(ids).size).toBe(ids.length);
  expect(
    moduleCatalog.modules.flatMap((module) => module.scopes).every((scope) => ids.includes(scope)),
  ).toBe(true);
});
