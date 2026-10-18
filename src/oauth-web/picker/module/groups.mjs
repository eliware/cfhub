import { createPickerModuleCard } from "./card.mjs";

const moduleActions = (tier) =>
  `<div class="module-actions"><button type="button" data-tier-enable="${tier}">Enable</button><button type="button" data-tier-disable="${tier}">Disable</button></div>`;

export function renderPickerModuleGroups(modules, moduleGroups) {
  for (const [tier, title] of [
    ["basic", "Basic modules"],
    ["advanced", "Advanced modules"],
  ]) {
    const group = document.createElement("div");
    group.className = "module-tier";
    group.innerHTML = `<div class="module-tier-heading"><h3>${title}</h3>${moduleActions(tier)}</div><div class="module-list"></div>`;
    const list = group.querySelector(".module-list");
    modules
      .filter((module) => module.tier === tier)
      .forEach((module) => {
        list.append(createPickerModuleCard(module));
      });
    moduleGroups.append(group);
  }
}
