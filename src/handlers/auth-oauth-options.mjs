import { DEFAULT_OAUTH_CLIENT_ID } from "../oauth-tokens.mjs";
import { DEFAULT_OAUTH_SCOPES } from "../oauth-api.mjs";

export function authOAuthOptions(opts = {}, env = process.env) {
  const configuredScopes = (env.CFHUB_OAUTH_SCOPES || "")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);
  const requestedScopes = []
    .concat(opts.scopes || [], opts.scope || [])
    .flatMap((value) => String(value).split(","))
    .map((scope) => scope.trim())
    .filter(Boolean);
  return {
    clientId: env.CFHUB_OAUTH_CLIENT_ID || DEFAULT_OAUTH_CLIENT_ID,
    scopes: [...new Set([...DEFAULT_OAUTH_SCOPES, ...configuredScopes, ...requestedScopes])],
    scopePicker: !opts["no-scope-picker"],
    bindHost: env.CFHUB_OAUTH_BIND_HOST || "0.0.0.0",
    redirectHost: env.CFHUB_OAUTH_REDIRECT_HOST || "127.0.0.1",
  };
}
