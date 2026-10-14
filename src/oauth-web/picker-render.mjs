import { syncPickerModuleState } from "./picker-module-sync.mjs";
import { renderPickerScopeState } from "./picker-render-scope-state.mjs";
import { renderPickerModuleState } from "./picker-render-module-state.mjs";

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
