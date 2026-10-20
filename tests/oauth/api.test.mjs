import {
  collectOAuthSummary,
  DEFAULT_OAUTH_CLIENT_ID,
  DEFAULT_OAUTH_PORTS,
  DEFAULT_OAUTH_SCOPES,
  openBrowser,
  refreshOAuth,
  REQUIRED_OAUTH_SCOPES,
  revokeOAuth,
} from "../../src/oauth/api.mjs";

test("OAuth API facade exposes defaults and focused operations", () => {
  expect(DEFAULT_OAUTH_PORTS).toEqual([1120, 1121, 1122, 1123, 1124]);
  expect(DEFAULT_OAUTH_SCOPES).toEqual(expect.any(Array));
  expect(REQUIRED_OAUTH_SCOPES).toEqual(expect.any(Array));
  expect(DEFAULT_OAUTH_CLIENT_ID).toEqual(expect.any(String));
  expect(collectOAuthSummary).toEqual(expect.any(Function));
  expect(openBrowser).toEqual(expect.any(Function));
  expect(refreshOAuth).toEqual(expect.any(Function));
  expect(revokeOAuth).toEqual(expect.any(Function));
});
