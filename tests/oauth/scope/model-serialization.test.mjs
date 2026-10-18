import { serializeOAuthScopeModel } from "../../../src/oauth/scope/model-serialization.mjs";

test("serializes the OAuth scope model with HTML-safe less-than characters", () => {
  expect(serializeOAuthScopeModel({ value: "<script>" })).toBe('{"value":"\\u003cscript>"}');
});
