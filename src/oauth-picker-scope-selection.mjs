import { ALLOWED_OAUTH_SCOPES } from "./oauth-scope-model.mjs";

export function selectOAuthPickerScopes({ form, scopes, requiredScopes }) {
  const requested = form.getAll("scope").filter((scope) => ALLOWED_OAUTH_SCOPES.has(scope));
  return [...new Set([...requiredScopes, ...(requested.length ? requested : scopes)])];
}
