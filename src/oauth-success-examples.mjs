import { escapeOAuthHtml } from "./oauth-html.mjs";

export function successExamples(enabled, zones) {
  const zone = zones[0]?.id || "<zone_id>";
  return [
    enabled.some((module) => module.id === "zones") && "cfhub zones list",
    enabled.some((module) => module.id === "dns") && `cfhub dns-records list --zone-id ${zone}`,
    enabled.some((module) => module.id === "zone-settings") &&
      `cfhub zone-settings get --zone-id ${zone} --setting <setting>`,
    enabled.some((module) => module.id === "workers") && "cfhub workers list",
  ]
    .filter(Boolean)
    .map((example) => `<div class="example"><code>${escapeOAuthHtml(example)}</code></div>`)
    .join("");
}
