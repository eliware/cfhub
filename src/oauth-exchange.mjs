import { collectOAuthSummary } from "./oauth-pages.mjs";
import { successPage } from "./oauth-success-page.mjs";

const TOKEN_URL = "https://dash.cloudflare.com/oauth2/token";
const USER_URL = "https://api.cloudflare.com/client/v4/user";

export async function exchangeOAuthCode({
  clientId,
  code,
  redirectUri,
  verifier,
  callbackResponse,
  scopes,
  fetchImpl,
}) {
  try {
    const response = await fetchImpl(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
    });
    if (!response.ok) throw new Error(`OAuth token exchange failed (${response.status})`);
    const tokens = await response.json();
    if (!tokens.access_token) throw new Error("OAuth token response did not include access_token");
    let account = null;
    try {
      const accountResponse = await fetchImpl(USER_URL, {
        headers: { authorization: `Bearer ${tokens.access_token}` },
      });
      if (accountResponse.ok) account = (await accountResponse.json())?.result;
    } catch {
      /* account confirmation is best effort */
    }
    const summary = await collectOAuthSummary({
      accessToken: tokens.access_token,
      account,
      scopes,
      fetchImpl,
    });
    callbackResponse.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    callbackResponse.end(successPage({ account, scopes, summary }));
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
      scopes,
      account,
    };
  } catch (error) {
    callbackResponse.writeHead(400, { "content-type": "text/html; charset=utf-8" });
    callbackResponse.end(
      "<!doctype html><title>cfhub authorization failed</title><p>Cloudflare authorization could not be completed. You may close this window and try again.</p>",
    );
    throw error;
  }
}
