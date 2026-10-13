import { DEFAULT_OAUTH_CLIENT_ID } from "../oauth-tokens.mjs";
import { DEFAULT_OAUTH_SCOPES } from "../oauth.mjs";

export async function saveOAuthLogin({
  data,
  opts,
  name,
  oauthLogin,
  writeCredentialImpl,
  write,
  profileHome,
  profileFs,
}) {
  const configuredScopes = (process.env.CFHUB_OAUTH_SCOPES || "")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);
  const requestedScopes = []
    .concat(opts?.scopes || [], opts?.scope || [])
    .flatMap((value) => String(value).split(","))
    .map((scope) => scope.trim())
    .filter(Boolean);
  const scopes = [...new Set([...DEFAULT_OAUTH_SCOPES, ...configuredScopes, ...requestedScopes])];
  const oauth = await oauthLogin({
    clientId: process.env.CFHUB_OAUTH_CLIENT_ID || DEFAULT_OAUTH_CLIENT_ID,
    scopes,
    scopePicker: !opts?.["no-scope-picker"],
    bindHost: process.env.CFHUB_OAUTH_BIND_HOST || "0.0.0.0",
    redirectHost: process.env.CFHUB_OAUTH_REDIRECT_HOST || "127.0.0.1",
  });
  await writeCredentialImpl(name, {
    oauthAccessToken: oauth.accessToken,
    oauthRefreshToken: oauth.refreshToken,
    expiresIn: oauth.expiresIn,
    expiresAt: oauth.expiresAt,
  });
  data.profiles[name] = {
    authMethod: "oauth",
    scopes: oauth.scopes || scopes,
    accountId: opts?.["account-id"] || process.env.CLOUDFLARE_ACCOUNT_ID,
    zoneId: opts?.["zone-id"] || process.env.CLOUDFLARE_ZONE_ID,
  };
  data.active = name;
  write(data, profileHome, profileFs);
}
