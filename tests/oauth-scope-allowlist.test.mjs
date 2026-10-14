import { ALLOWED_OAUTH_SCOPES } from "../src/oauth-scope-allowlist.mjs";

test("allowlist accepts catalog scopes and rejects unknown scopes", () => {
  expect(ALLOWED_OAUTH_SCOPES.has("zone.read")).toBe(true);
  expect(ALLOWED_OAUTH_SCOPES.has("scope.not.in.catalog")).toBe(false);
});
