const USER_URL = "https://api.cloudflare.com/client/v4/user";

export async function loadOAuthAccountIdentity({ accessToken, fetchImpl }) {
  try {
    const response = await fetchImpl(USER_URL, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (response.ok) return (await response.json())?.result || null;
  } catch {
    // Account details add useful information to the success page.
    // Account details do not change login.
  }
  return null;
}
