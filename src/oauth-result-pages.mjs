import { VERSION } from "./version.mjs";
import { copyrightYear } from "./oauth-pages.mjs";
import { pickerAsset } from "./oauth-picker-assets.mjs";
import moduleCatalog from "../data/cloudflare-oauth-modules.json" with { type: "json" };

const MODULE_CATALOG = moduleCatalog.modules;
function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );
}
function moduleCard(module, enabled) {
  return `<div class="module"><strong>${escapeHtml(module.name)}</strong><small>${enabled ? "Enabled · ready for its selected scopes." : `Requires: ${escapeHtml(module.scopes.join(", "))}`}</small></div>`;
}
export function successPage({ account, scopes, summary }) {
  const enabled = summary.enabled;
  const disabled = MODULE_CATALOG.filter((module) => !enabled.includes(module));
  const zone = summary.zones[0]?.name || "example.com";
  const examples = [
    enabled.some((module) => module.id === "zones") && "cfhub zone list",
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
    .replaceAll("__COPYRIGHT__", copyrightYear())
    .replaceAll("__VERSION__", VERSION);
}
export function failurePage({ title, detail }) {
  const logoData = encodeURIComponent(pickerAsset("oauth-web/cf-logo.svg")).replace(/'/g, "%27");
  return pickerAsset("oauth-web/oauth-result.html")
    .replaceAll("__RESULT_TITLE__", escapeHtml(title))
    .replaceAll("__RESULT_DETAIL__", escapeHtml(detail))
    .replaceAll("__RESULT_CSS__", pickerAsset("oauth-web/oauth-result.css"))
    .replaceAll("__CFHUB_LOGO_DATA__", logoData)
    .replaceAll("__COPYRIGHT__", copyrightYear())
    .replaceAll("__VERSION__", VERSION);
}
