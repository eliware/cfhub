import { renderPickerModuleGroups } from "./module/groups.mjs";
import { renderPickerScopeGroups } from "./scope/groups.mjs";

export function renderPickerGroups({ categories, modules, moduleGroups, scopeGroups, boxes }) {
  renderPickerModuleGroups(modules, moduleGroups);
  renderPickerScopeGroups(categories, scopeGroups, boxes);
}
