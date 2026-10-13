import { DEFAULT_OAUTH_CLIENT_ID } from "./oauth-tokens.mjs";

const TOKEN_URL = "https://dash.cloudflare.com/oauth2/token";

export async function refreshOAuth({
  refreshToken,
  clientId = DEFAULT_OAUTH_CLIENT_ID,
  fetchImpl = fetch,
}) {
  const response = await fetchImpl(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: refreshToken,
    }),
  });
  if (!response.ok) throw new Error(`OAuth token refresh failed (${response.status})`);
  const tokens = await response.json();
  if (!tokens.access_token) throw new Error("OAuth refresh response did not include access_token");
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || refreshToken,
    expiresIn: tokens.expires_in,
    expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
  };
}
