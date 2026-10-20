import { exchangeOAuthToken } from "./token-exchange.mjs";
import { loadOAuthAccountSummary } from "./account/summary.mjs";
import { writeOAuthTokenFailure, writeOAuthTokenSuccess } from "./callback/token-response.mjs";

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
    writeOAuthTokenSuccess(callbackResponse, page);
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
      scopes,
      account,
    };
  } catch (error) {
    writeOAuthTokenFailure(callbackResponse);
    throw error;
  }
}
