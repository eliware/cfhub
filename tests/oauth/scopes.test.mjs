import { DEFAULT_OAUTH_SCOPES } from "../../src/oauth/scopes.mjs";

test("default OAuth scopes include the core zone permissions", () => {
  expect(DEFAULT_OAUTH_SCOPES).toContain("zone.read");
});
