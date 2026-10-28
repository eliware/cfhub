import { requestOAuthAccountData } from "./request.mjs";

export async function loadOAuthAccountData({ enabled, accessToken, fetchImpl }) {
  const data = { zones: [], dns: [], errors: [] };
  const getAll = async (path, errors = data.errors) => {
    const results = [];
    for (let page = 1; ; page += 1) {
      let totalPages;
      const result = await requestOAuthAccountData({
        url: `${path}?per_page=50&page=${page}`,
        accessToken,
        fetchImpl,
        errors,
        onResultInfo: (info) => {
          if (Number.isInteger(info?.total_pages)) totalPages = info.total_pages;
        },
      });
      if (!Array.isArray(result)) break;
      results.push(...result);
      if (totalPages ? page >= totalPages : result.length < 50) break;
    }
    return results;
  };
  if (enabled.some((module) => module.id === "zones")) {
    data.zones = await getAll("/zones");
  }
  if (enabled.some((module) => module.id === "dns")) {
    const zones = data.zones.filter((zone) => zone.id);
    const results = [];
    for (let start = 0; start < zones.length; start += 5) {
      const batch = await Promise.all(
        zones.slice(start, start + 5).map(async (zone) => {
          const errors = [];
          const records = await getAll(`/zones/${encodeURIComponent(zone.id)}/dns_records`, errors);
          return { records, errors };
        }),
      );
      results.push(...batch);
    }
    data.dns = results.flatMap(({ records }) => records);
    data.errors.push(...results.flatMap(({ errors }) => errors));
  }
  return data;
}
