const TOKEN_URL = "https://dash.cloudflare.com/oauth2/token";

export async function exchangeOAuthToken({ clientId, code, redirectUri, verifier, fetchImpl }) {
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
  return tokens;
}
