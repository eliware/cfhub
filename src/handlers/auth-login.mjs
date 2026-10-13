import { saveOAuthLogin } from "./auth-oauth-login.mjs";
import { saveApiTokenLogin } from "./auth-token-login.mjs";

export function handleAuthLogin(context) {
  const { resource = "oauth", data, opts, name, oauthLogin, ...dependencies } = context;
  return resource === "oauth"
    ? saveOAuthLogin({ data, opts, name, oauthLogin, ...dependencies })
    : saveApiTokenLogin({ data, opts, name, ...dependencies });
}
