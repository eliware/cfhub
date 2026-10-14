import { renderPickerGroups } from "./picker-groups.mjs";
import { bindPickerEvents } from "./picker-events.mjs";
import { createPickerState } from "./picker-state.mjs";
import { renderPickerState } from "./picker-render.mjs";
import { createPickerSetup } from "./picker-setup.mjs";

export function initializePicker(documentRef = document, windowRef = window) {
  const {
    categories,
    modules,
    requiredScopes,
    boxes,
    sessionOptions,
    moduleGroups,
    scopeGroups,
    moduleCount,
  } = createPickerSetup(documentRef, windowRef);
  const state = createPickerState(modules, requiredScopes);
  const render = (syncModules = true) =>
    renderPickerState({ categories, modules, state, boxes, moduleCount, syncModules });
  renderPickerGroups({ categories, modules, moduleGroups, scopeGroups, boxes });
  bindPickerEvents({ categories, ...state, boxes, sessionOptions, render });
  render();
}
