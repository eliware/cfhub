export async function requestOAuthAccountData({
  url,
  accessToken,
  fetchImpl,
  errors,
  onResultInfo,
}) {
  try {
    const response = await fetchImpl(`https://api.cloudflare.com/client/v4${url}`, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    onResultInfo?.(payload?.result_info);
    return payload?.result ?? null;
  } catch (error) {
    errors.push(error.message);
    return null;
  }
}
