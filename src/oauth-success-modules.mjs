import moduleCatalog from "../data/cloudflare-oauth-modules.json" with { type: "json" };

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );
}

function moduleCard(module, enabled) {
  const status = enabled
    ? "Enabled · ready for its selected scopes."
    : `Requires: ${escapeHtml(module.scopes.join(", "))}`;
  return `<div class="module"><strong>${escapeHtml(module.name)}</strong><small>${status}</small></div>`;
}

export function successModuleCards(enabled) {
  const disabled = moduleCatalog.modules.filter((module) => !enabled.includes(module));
  return {
    enabled: enabled.map((module) => moduleCard(module, true)).join(""),
    disabled: disabled.map((module) => moduleCard(module, false)).join(""),
  };
}
