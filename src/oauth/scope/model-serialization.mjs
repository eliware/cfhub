export function serializeOAuthScopeModel(model) {
  return JSON.stringify(model).replace(/</g, "\\u003c");
}
