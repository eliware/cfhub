import { selectOAuthScopes } from "../../../../src/handlers/auth/oauth/scope-selection.mjs";

test("parses and deduplicates environment and requested scopes", () => {
  expect(
    selectOAuthScopes(
      { scopes: [" zone.write,dns.read "], scope: "dns.read, account.read" },
      { CFHUB_OAUTH_SCOPES: ", zone.read, account.read,," },
      ["user-details.read", "zone.read"],
    ),
  ).toEqual({
    scopes: ["user-details.read", "zone.read", "account.read", "zone.write", "dns.read"],
    pickerScopes: ["zone.read", "account.read", "zone.write", "dns.read"],
  });
});

test("returns empty picker scopes when no optional scopes are configured", () => {
  expect(selectOAuthScopes({}, {}, ["user-details.read"])).toEqual({
    scopes: ["user-details.read"],
    pickerScopes: [],
  });
});

test("uses empty defaults when no scope inputs are provided", () => {
  expect(selectOAuthScopes()).toEqual({ scopes: [], pickerScopes: [] });
});
