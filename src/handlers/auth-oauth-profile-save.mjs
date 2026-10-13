export async function saveOAuthProfile({
  data,
  name,
  opts,
  scopes,
  oauth,
  writeCredentialImpl,
  write,
  profileHome,
  profileFs,
}) {
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
