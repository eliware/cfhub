export async function requestOAuthAccountData({ url, accessToken, fetchImpl, errors }) {
  try {
    const response = await fetchImpl(`https://api.cloudflare.com/client/v4${url}`, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return null;
    return (await response.json())?.result ?? null;
  } catch (error) {
    errors.push(error.message);
    return null;
  }
}
