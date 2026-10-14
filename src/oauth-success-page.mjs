import { VERSION } from "./version.mjs";
import { copyrightYear } from "./oauth-page-metadata.mjs";
import { pickerAsset } from "./oauth-picker-assets.mjs";
import { successModuleCards } from "./oauth-success-modules.mjs";
import { escapeOAuthHtml } from "./oauth-html.mjs";
import { successExamples } from "./oauth-success-examples.mjs";
import { successPageCounts } from "./oauth-success-counts.mjs";
import { renderOAuthTemplate } from "./oauth-template.mjs";

export function successPage({ account, scopes, summary }) {
  const enabled = summary.enabled;
  const moduleCards = successModuleCards(enabled);
  const examples = successExamples(enabled, summary.zones);
  const counts = successPageCounts({
    scopes,
    enabled,
    zones: summary.zones,
    dns: summary.dns,
  });
  const logoData = encodeURIComponent(pickerAsset("oauth-web/cf-logo.svg")).replace(/'/g, "%27");
  return renderOAuthTemplate(pickerAsset("oauth-web/oauth-success.html"), {
    __SUCCESS_CSS__: pickerAsset("oauth-web/bundled/oauth-success.css"),
    __CFHUB_LOGO_DATA__: logoData,
    __ACCOUNT__: escapeOAuthHtml(account?.name || account?.email || "your Cloudflare account"),
    __SCOPE_COUNT__: counts.scopeCount,
    __ENABLED_COUNT__: counts.enabledCount,
    __ZONE_COUNT__: counts.zoneCount,
    __DNS_COUNT__: counts.dnsCount,
    __ENABLED_MODULES__: moduleCards.enabled,
    __DISABLED_MODULES__: moduleCards.disabled,
    __EXAMPLES__: examples || "<p>Select a module to see command examples.</p>",
    __COPYRIGHT__: copyrightYear(),
    __VERSION__: VERSION,
  });
}
