import { VERSION } from "../../version.mjs";
import { copyrightYear } from "../page-metadata.mjs";
import { pickerAsset } from "../picker/assets.mjs";
import { escapeOAuthHtml } from "../html.mjs";
import { renderOAuthTemplate } from "../template.mjs";

export function renderSuccessPage({ account, counts, moduleCards, examples }) {
  const logoData = encodeURIComponent(pickerAsset("oauth-web/cf-logo.svg")).replace(/'/g, "%27");
  return renderOAuthTemplate(pickerAsset("oauth-web/oauth-success.html"), {
    __SUCCESS_CSS__: pickerAsset("oauth-web/bundled/oauth-success.css"),
    __CFHUB_LOGO_DATA__: logoData,
    __ACCOUNT__: escapeOAuthHtml(account),
    __SCOPE_COUNT__: counts.scopeCount,
    __ENABLED_COUNT__: counts.enabledCount,
    __ZONE_COUNT__: counts.zoneCount,
    __DNS_COUNT__: counts.dnsCount,
    __ENABLED_MODULES__: moduleCards.enabled,
    __DISABLED_MODULES__: moduleCards.disabled,
    __EXAMPLES__: examples,
    __COPYRIGHT__: copyrightYear(),
    __VERSION__: VERSION,
  });
}
