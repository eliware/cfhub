import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { VERSION } from "./version.mjs";
import scopeCatalog from "../data/cloudflare-oauth-scopes.json" with { type: "json" };
import moduleCatalog from "../data/cloudflare-oauth-modules.json" with { type: "json" };

export const REQUIRED_OAUTH_SCOPES = ["user-details.read", "zone.read"];
/* istanbul ignore next */
function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );
}
function currentCopyright() {
  return copyrightYear();
}
export function copyrightYear(year = new Date().getUTCFullYear()) {
  return year > 2026 ? `2026-${year}` : "2026";
}
export async function collectOAuthSummary({ accessToken, account, scopes, fetchImpl }) {
  const enabled = MODULE_CATALOG.filter((module) =>
    module.scopes.every((scope) => scopes.includes(scope)),
  );
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
function moduleCard(module, enabled) {
  return `<div class="module"><strong>${escapeHtml(module.name)}</strong><small>${enabled ? "Enabled · ready for its selected scopes." : `Requires: ${escapeHtml(module.scopes.join(", "))}`}</small></div>`;
}
export function successPage({ account, scopes, summary }) {
  const enabled = summary.enabled;
  const disabled = MODULE_CATALOG.filter((module) => !enabled.includes(module));
  const zone = summary.zones[0]?.name || "example.com";
  const examples = [
    enabled.some((module) => module.id === "zones") && `cfhub zone list`,
    enabled.some((module) => module.id === "dns") && `cfhub dns record list --zone ${zone}`,
    enabled.some((module) => module.id === "zone-settings") &&
      `cfhub zone settings list --zone ${zone}`,
    enabled.some((module) => module.id === "workers") && "cfhub workers list",
  ]
    .filter(Boolean)
    .map((example) => `<div class="example"><code>${escapeHtml(example)}</code></div>`)
    .join("");
  const logoData = encodeURIComponent(pickerAsset("oauth-web/cf-logo.svg")).replace(/'/g, "%27");
  return pickerAsset("oauth-web/oauth-success.html")
    .replaceAll("__SUCCESS_CSS__", pickerAsset("oauth-web/bundled/oauth-success.css"))
    .replaceAll("__CFHUB_LOGO_DATA__", logoData)
    .replaceAll(
      "__ACCOUNT__",
      escapeHtml(account?.name || account?.email || "your Cloudflare account"),
    )
    .replaceAll("__SCOPE_COUNT__", String(scopes.length))
    .replaceAll("__ENABLED_COUNT__", String(enabled.length))
    .replaceAll("__ZONE_COUNT__", String(summary.zones.length))
    .replaceAll("__DNS_COUNT__", String(summary.dns.length))
    .replaceAll("__ENABLED_MODULES__", enabled.map((module) => moduleCard(module, true)).join(""))
    .replaceAll(
      "__DISABLED_MODULES__",
      disabled.map((module) => moduleCard(module, false)).join(""),
    )
    .replaceAll("__EXAMPLES__", examples || "<p>Select a module to see command examples.</p>")
    .replaceAll("__COPYRIGHT__", currentCopyright())
    .replaceAll("__VERSION__", VERSION);
}
export function failurePage({ title, detail }) {
  const logoData = encodeURIComponent(pickerAsset("oauth-web/cf-logo.svg")).replace(/'/g, "%27");
  return pickerAsset("oauth-web/oauth-result.html")
    .replaceAll("__RESULT_TITLE__", escapeHtml(title))
    .replaceAll("__RESULT_DETAIL__", escapeHtml(detail))
    .replaceAll("__RESULT_CSS__", pickerAsset("oauth-web/oauth-result.css"))
    .replaceAll("__CFHUB_LOGO_DATA__", logoData)
    .replaceAll("__COPYRIGHT__", currentCopyright())
    .replaceAll("__VERSION__", VERSION);
}

const SCOPE_CATALOG_DATA = scopeCatalog.categories;
const MODULE_CATALOG = moduleCatalog.modules;
export const ALLOWED_OAUTH_SCOPES = new Set(
  Object.values(SCOPE_CATALOG_DATA).flatMap((features) =>
    features.flatMap((feature) => feature.scopes.map((scope) => scope.scope)),
  ),
);
const publicAssets = new Set([
  "oauth-web/cf-logo.svg",
  "oauth-web/cloudflare-115x53.png",
  "oauth-web/eliware-58x58.png",
]);
export const pickerAsset = (name) => {
  const root = publicAssets.has(name) ? "../public/" : "./";
  return readFileSync(fileURLToPath(new URL(`${root}${name}`, import.meta.url)), "utf8");
};
export function sendAsset(
  request,
  response,
  body,
  contentType,
  { cacheControl = "public, max-age=31536000, immutable" } = {},
) {
  const acceptsGzip = /(?:^|,\s*)gzip(?:\s*;|\s*,|\s*$)/i.test(
    request.headers["accept-encoding"] || "",
  );
  const payload = acceptsGzip ? gzipSync(body) : Buffer.from(body);
  const headers = {
    "content-type": contentType,
    "cache-control": cacheControl,
    "content-length": payload.length,
    vary: "Accept-Encoding",
  };
  if (acceptsGzip) headers["content-encoding"] = "gzip";
  response.writeHead(200, headers);
  response.end(payload);
}
export const pickerHtml = () =>
  pickerAsset("oauth-web/oauth-picker.html")
    .replaceAll('href="/oauth-web/cf-logo.svg"', `href="/oauth-web/cf-logo.svg?v=${VERSION}"`)
    .replaceAll('href="/oauth-picker.css"', `href="/oauth-picker.css?v=${VERSION}"`)
    .replaceAll(
      'src="/oauth-web/cloudflare-115x53.png"',
      `src="/oauth-web/cloudflare-115x53.png?v=${VERSION}"`,
    )
    .replaceAll(
      'src="/oauth-web/eliware-58x58.png"',
      `src="/oauth-web/eliware-58x58.png?v=${VERSION}"`,
    )
    .replaceAll('src="/oauth-picker.mjs"', `src="/oauth-picker.mjs?v=${VERSION}"`)
    .replace(
      "__CFHUB_SCOPE_MODEL__",
      JSON.stringify({
        categories: SCOPE_CATALOG_DATA,
        modules: MODULE_CATALOG,
        requiredScopes: REQUIRED_OAUTH_SCOPES,
      }).replace(/</g, "\\u003c"),
    )
    .replaceAll("__COPYRIGHT_YEAR__", copyrightYear())
    .replaceAll("__APP_VERSION__", VERSION);
export function readRequestBody(request) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(new URLSearchParams(body)));
  });
}
