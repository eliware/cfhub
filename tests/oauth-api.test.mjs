import {
  collectOAuthSummary,
  copyrightYear,
  DEFAULT_OAUTH_CLIENT_ID,
  DEFAULT_OAUTH_PORTS,
  DEFAULT_OAUTH_SCOPES,
  openBrowser,
  refreshOAuth,
  REQUIRED_OAUTH_SCOPES,
  revokeOAuth,
} from "../src/oauth-api.mjs";

test("OAuth API facade exposes defaults and focused operations", () => {
  expect(DEFAULT_OAUTH_PORTS).toEqual([8765, 8766, 8767, 8768, 8769]);
  expect(DEFAULT_OAUTH_SCOPES).toEqual(expect.any(Array));
  expect(REQUIRED_OAUTH_SCOPES).toEqual(expect.any(Array));
  expect(copyrightYear(2025)).toBe("2026");
  expect(copyrightYear(2027)).toBe("2026-2027");
  expect(DEFAULT_OAUTH_CLIENT_ID).toEqual(expect.any(String));
  expect(collectOAuthSummary).toEqual(expect.any(Function));
  expect(openBrowser).toEqual(expect.any(Function));
  expect(refreshOAuth).toEqual(expect.any(Function));
  expect(revokeOAuth).toEqual(expect.any(Function));
});
