import { renderPickerModuleGroups } from "./picker-module-groups.mjs";
import { renderPickerScopeGroups } from "./picker-scope-groups.mjs";

export function renderPickerGroups({ categories, modules, moduleGroups, scopeGroups, boxes }) {
  renderPickerModuleGroups(modules, moduleGroups);
  renderPickerScopeGroups(categories, scopeGroups, boxes);
}
