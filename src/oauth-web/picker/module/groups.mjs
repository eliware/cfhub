import { createPickerModuleCard } from "./card.mjs";
import { createPickerModuleTier } from "./tier-groups.mjs";

export function renderPickerModuleGroups(modules, moduleGroups) {
  for (const [tier, title] of [
    ["basic", "Basic modules"],
    ["advanced", "Advanced modules"],
  ]) {
    const { group, list } = createPickerModuleTier(tier, title);
    modules
      .filter((module) => module.tier === tier)
      .forEach((module) => {
        list.append(createPickerModuleCard(module));
      });
    moduleGroups.append(group);
  }
}
