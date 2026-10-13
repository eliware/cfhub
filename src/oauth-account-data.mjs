export async function loadOAuthAccountData({ enabled, accessToken, fetchImpl }) {
  const data = { zones: [], dns: [], errors: [] };
  const get = async (url) => {
    try {
      const response = await fetchImpl(`https://api.cloudflare.com/client/v4${url}`, {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) return null;
      return (await response.json())?.result ?? null;
    } catch (error) {
      data.errors.push(error.message);
      return null;
    }
  };
  if (enabled.some((module) => module.id === "zones")) {
    data.zones = (await get("/zones?per_page=5")) || [];
  }
  if (enabled.some((module) => module.id === "dns") && data.zones[0]?.id) {
    data.dns =
      (await get(`/zones/${encodeURIComponent(data.zones[0].id)}/dns_records?per_page=5`)) || [];
  }
  return data;
}
