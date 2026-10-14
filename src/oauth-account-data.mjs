import { requestOAuthAccountData } from "./oauth-account-request.mjs";

export async function loadOAuthAccountData({ enabled, accessToken, fetchImpl }) {
  const data = { zones: [], dns: [], errors: [] };
  const getAll = async (path) => {
    const results = [];
    for (let page = 1; ; page += 1) {
      const result = await requestOAuthAccountData({
        url: `${path}?per_page=50&page=${page}`,
        accessToken,
        fetchImpl,
        errors: data.errors,
      });
      if (!Array.isArray(result)) break;
      results.push(...result);
      if (result.length < 50) break;
    }
    return results;
  };
  if (enabled.some((module) => module.id === "zones")) {
    data.zones = await getAll("/zones");
  }
  if (enabled.some((module) => module.id === "dns")) {
    for (const zone of data.zones) {
      if (!zone.id) continue;
      data.dns.push(...(await getAll(`/zones/${encodeURIComponent(zone.id)}/dns_records`)));
    }
  }
  return data;
}
