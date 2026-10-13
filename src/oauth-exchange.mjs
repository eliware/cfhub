import { exchangeOAuthToken } from "./oauth-token-exchange.mjs";
import { loadOAuthAccountSummary } from "./oauth-account-summary.mjs";

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
    const tokens = await exchangeOAuthToken({
      clientId,
      code,
      redirectUri,
      verifier,
      fetchImpl,
    });
    const { account, page } = await loadOAuthAccountSummary({
      accessToken: tokens.access_token,
      scopes,
      fetchImpl,
    });
    callbackResponse.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    callbackResponse.end(page);
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
