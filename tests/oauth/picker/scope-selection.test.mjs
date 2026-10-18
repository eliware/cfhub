import { selectOAuthPickerScopes } from "../../../src/oauth/picker/scope-selection.mjs";

test("filters unknown scopes and keeps required scopes first", () => {
  const form = new URLSearchParams("scope=unknown&scope=zone.read&scope=zone.read");
  expect(
    selectOAuthPickerScopes({
      form,
      scopes: ["dns.read"],
      requiredScopes: ["user-details.read"],
    }),
  ).toEqual(["user-details.read", "zone.read"]);
});

test("keeps only required scopes when no optional scope is selected", () => {
  const form = new URLSearchParams("scope=unknown");
  expect(
    selectOAuthPickerScopes({
      form,
      scopes: ["zone.read", "dns.read"],
      requiredScopes: ["user-details.read"],
    }),
  ).toEqual(["user-details.read"]);
});

test("keeps explicitly requested catalog scopes when the picker form omits them", () => {
  expect(
    selectOAuthPickerScopes({
      form: new URLSearchParams(),
      requiredScopes: ["user-details.read"],
      preservedScopes: ["dns.read", "unknown.scope"],
    }),
  ).toEqual(["user-details.read", "dns.read"]);
});
