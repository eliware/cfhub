import { DEFAULT_OAUTH_CLIENT_ID } from "../../../oauth/tokens.mjs";
import { DEFAULT_OAUTH_SCOPES } from "../../../oauth/api.mjs";
import { selectOAuthScopes } from "./scope-selection.mjs";

export function authOAuthOptions(opts = {}, env = process.env) {
  const { scopes, pickerScopes } = selectOAuthScopes(opts, env, DEFAULT_OAUTH_SCOPES);
  return {
    clientId: env.CFHUB_OAUTH_CLIENT_ID || DEFAULT_OAUTH_CLIENT_ID,
    scopes,
    pickerScopes,
    scopePicker: !opts["no-scope-picker"],
    bindHost: env.CFHUB_OAUTH_BIND_HOST || "127.0.0.1",
    redirectHost: env.CFHUB_OAUTH_REDIRECT_HOST || "127.0.0.1",
  };
}
