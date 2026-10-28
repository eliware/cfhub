import { escapeOAuthHtml } from "../html.mjs";
import { moduleCatalog } from "../module-catalog.mjs";

function moduleCard(module, enabled) {
  const status = enabled
    ? "Read access is enabled for the selected scopes."
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
