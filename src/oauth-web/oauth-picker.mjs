import { renderPickerGroups } from "./picker-groups.mjs";
import { bindPickerEvents } from "./picker-events.mjs";
import { createPickerState } from "./picker-state.mjs";
import { renderPickerState } from "./picker-render.mjs";

export function initializePicker() {
  const { categories, modules, requiredScopes = [] } = window.CFHUB_SCOPE_MODEL;
  const state = createPickerState(modules, requiredScopes);
  const boxes = [];
  const sessionOptions = document.querySelectorAll('input[name="keep-signed-in"]');
  const moduleGroups = document.querySelector("#module-groups");
  const scopeGroups = document.querySelector("#scope-groups");
  const moduleCount = document.querySelector("#module-count");
  const quickSetup = document.querySelector(".quick-setup");
  if (window.matchMedia("(max-width: 600px)").matches) quickSetup.open = false;
  const render = (syncModules = true) =>
    renderPickerState({ categories, modules, state, boxes, moduleCount, syncModules });
  renderPickerGroups({ categories, modules, moduleGroups, scopeGroups, boxes });
  bindPickerEvents({ categories, ...state, boxes, sessionOptions, render });
  render();
}

if (typeof window !== "undefined") initializePicker();
