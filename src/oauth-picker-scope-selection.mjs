import { ALLOWED_OAUTH_SCOPES } from "./oauth-scope-allowlist.mjs";

export function selectOAuthPickerScopes({ form, requiredScopes }) {
  const requested = form.getAll("scope").filter((scope) => ALLOWED_OAUTH_SCOPES.has(scope));
  return [...new Set([...requiredScopes, ...requested])];
}
