import { escapeOAuthHtml } from "./oauth-html.mjs";

export function successExamples(enabled, zones) {
  const zone = zones[0]?.name || "example.com";
  return [
    enabled.some((module) => module.id === "zones") && "cfhub zone list",
    enabled.some((module) => module.id === "dns") && `cfhub dns record list --zone ${zone}`,
    enabled.some((module) => module.id === "zone-settings") &&
      `cfhub zone settings list --zone ${zone}`,
    enabled.some((module) => module.id === "workers") && "cfhub workers list",
  ]
    .filter(Boolean)
    .map((example) => `<div class="example"><code>${escapeOAuthHtml(example)}</code></div>`)
    .join("");
}
