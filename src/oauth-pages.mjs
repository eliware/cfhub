import moduleCatalog from "../data/cloudflare-oauth-modules.json" with { type: "json" };
import { selectOAuthModules } from "./oauth-module-selection.mjs";

export const REQUIRED_OAUTH_SCOPES = ["user-details.read", "zone.read"];
export function copyrightYear(year = new Date().getUTCFullYear()) {
  return year > 2026 ? `2026-${year}` : "2026";
}
export async function collectOAuthSummary({ accessToken, account, scopes, fetchImpl }) {
  const enabled = selectOAuthModules(moduleCatalog.modules, scopes);
  const summary = { zones: [], dns: [], errors: [] };
  const get = async (url) => {
    try {
      const response = await fetchImpl(`https://api.cloudflare.com/client/v4${url}`, {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) return null;
      return (await response.json())?.result ?? null;
    } catch (error) {
      summary.errors.push(error.message);
      return null;
    }
  };
  if (enabled.some((module) => module.id === "zones")) {
    summary.zones = (await get("/zones?per_page=5")) || [];
  }
  if (enabled.some((module) => module.id === "dns") && summary.zones[0]?.id) {
    summary.dns =
      (await get(`/zones/${encodeURIComponent(summary.zones[0].id)}/dns_records?per_page=5`)) || [];
  }
  return { enabled, zones: summary.zones, dns: summary.dns, errors: summary.errors, account };
}
