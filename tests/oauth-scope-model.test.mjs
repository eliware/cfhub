import { ALLOWED_OAUTH_SCOPES, serializeOAuthScopeModel } from "../src/oauth-scope-model.mjs";

test("scope model allowlist contains catalog scopes", () => {
  expect(ALLOWED_OAUTH_SCOPES.has("zone.read")).toBe(true);
  expect(ALLOWED_OAUTH_SCOPES.has("scope.not.in.catalog")).toBe(false);
});

test("scope model serialization escapes HTML openers", () => {
  expect(serializeOAuthScopeModel({ value: "<script>" })).toBe('{"value":"\\u003cscript>"}');
});
