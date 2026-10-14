import { serializeOAuthScopeModel } from "../src/oauth-scope-model.mjs";

test("scope model serialization escapes HTML openers", () => {
  expect(serializeOAuthScopeModel({ value: "<script>" })).toBe('{"value":"\\u003cscript>"}');
});
