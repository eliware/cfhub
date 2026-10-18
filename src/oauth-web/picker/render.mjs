import { syncPickerModuleState } from "./module/sync.mjs";
import { renderPickerScopeState } from "./render/scope-state.mjs";
import { renderPickerModuleState } from "./render/module-state.mjs";

export function renderPickerState({
  categories,
  modules,
  state,
  boxes,
  moduleCount,
  syncModules = true,
}) {
  if (syncModules) syncPickerModuleState(modules, state.selected, state.enabledModules);
  renderPickerScopeState({ boxes, state });
  renderPickerModuleState({ categories, modules, state, moduleCount });
}
