import { ALLOWED_OAUTH_SCOPES } from "../scope/allowlist.mjs";

export function selectOAuthPickerScopes({ form, requiredScopes, preservedScopes = [] }) {
  const requested = form.getAll("scope").filter((scope) => ALLOWED_OAUTH_SCOPES.has(scope));
  const preserved = preservedScopes.filter((scope) => ALLOWED_OAUTH_SCOPES.has(scope));
  return [...new Set([...requiredScopes, ...preserved, ...requested])];
}
