export const DEFAULT_OAUTH_CLIENT_ID = "f4fb39624f6674b6fb50d5a793a23389";

export async function revokeOAuth({
  token,
  accessToken,
  clientId = DEFAULT_OAUTH_CLIENT_ID,
  fetchImpl = fetch,
}) {
  const response = await fetchImpl("https://dash.cloudflare.com/oauth2/revoke", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token: token || accessToken, client_id: clientId }),
  });
  return response.ok;
}
