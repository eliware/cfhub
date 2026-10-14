import { requestOAuthAccountData } from "./oauth-account-request.mjs";

export async function loadOAuthAccountData({ enabled, accessToken, fetchImpl }) {
  const data = { zones: [], dns: [], errors: [] };
  const get = (url) =>
    requestOAuthAccountData({ url, accessToken, fetchImpl, errors: data.errors });
  if (enabled.some((module) => module.id === "zones")) {
    data.zones = (await get("/zones?per_page=5")) || [];
  }
  if (enabled.some((module) => module.id === "dns") && data.zones[0]?.id) {
    data.dns =
      (await get(`/zones/${encodeURIComponent(data.zones[0].id)}/dns_records?per_page=5`)) || [];
  }
  return data;
}
