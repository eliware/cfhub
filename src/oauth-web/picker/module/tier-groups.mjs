import { moduleTierActions } from "./actions.mjs";

export function createPickerModuleTier(tier, title) {
  const group = document.createElement("div");
  group.className = "module-tier";
  group.innerHTML = `<div class="module-tier-heading"><h3>${title}</h3>${moduleTierActions(tier)}</div><div class="module-list"></div>`;
  return { group, list: group.querySelector(".module-list") };
}
