import moduleCatalog from "../../../data/cloudflare-oauth-modules.json" with { type: "json" };
import { escapeOAuthHtml } from "../html.mjs";

function moduleCard(module, enabled) {
  const status = enabled
    ? "Enabled · available for the selected scopes."
    : `Requires: ${escapeOAuthHtml(module.scopes.join(", "))}`;
  return `<div class="module"><strong>${escapeOAuthHtml(module.name)}</strong><small>${status}</small></div>`;
}

export function successModuleCards(enabled) {
  const disabled = moduleCatalog.modules.filter((module) => !enabled.includes(module));
  return {
    enabled: enabled.map((module) => moduleCard(module, true)).join(""),
    disabled: disabled.map((module) => moduleCard(module, false)).join(""),
  };
}
