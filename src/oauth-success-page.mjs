import { VERSION } from "./version.mjs";
import { copyrightYear } from "./oauth-pages.mjs";
import { pickerAsset } from "./oauth-picker-assets.mjs";
import { successModuleCards } from "./oauth-success-modules.mjs";
import { escapeOAuthHtml } from "./oauth-html.mjs";

export function successPage({ account, scopes, summary }) {
  const enabled = summary.enabled;
  const moduleCards = successModuleCards(enabled);
  const zone = summary.zones[0]?.name || "example.com";
  const examples = [
    enabled.some((module) => module.id === "zones") && "cfhub zone list",
    enabled.some((module) => module.id === "dns") && `cfhub dns record list --zone ${zone}`,
    enabled.some((module) => module.id === "zone-settings") &&
      `cfhub zone settings list --zone ${zone}`,
    enabled.some((module) => module.id === "workers") && "cfhub workers list",
  ]
    .filter(Boolean)
    .map((example) => `<div class="example"><code>${escapeOAuthHtml(example)}</code></div>`)
    .join("");
  const logoData = encodeURIComponent(pickerAsset("oauth-web/cf-logo.svg")).replace(/'/g, "%27");
  return pickerAsset("oauth-web/oauth-success.html")
    .replaceAll("__SUCCESS_CSS__", pickerAsset("oauth-web/bundled/oauth-success.css"))
    .replaceAll("__CFHUB_LOGO_DATA__", logoData)
    .replaceAll(
      "__ACCOUNT__",
      escapeOAuthHtml(account?.name || account?.email || "your Cloudflare account"),
    )
    .replaceAll("__SCOPE_COUNT__", String(scopes.length))
    .replaceAll("__ENABLED_COUNT__", String(enabled.length))
    .replaceAll("__ZONE_COUNT__", String(summary.zones.length))
    .replaceAll("__DNS_COUNT__", String(summary.dns.length))
    .replaceAll("__ENABLED_MODULES__", moduleCards.enabled)
    .replaceAll("__DISABLED_MODULES__", moduleCards.disabled)
    .replaceAll("__EXAMPLES__", examples || "<p>Select a module to see command examples.</p>")
    .replaceAll("__COPYRIGHT__", copyrightYear())
    .replaceAll("__VERSION__", VERSION);
}
