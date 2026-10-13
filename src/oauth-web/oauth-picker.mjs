import { renderPickerGroups } from "./picker-groups.mjs";
import { bindPickerEvents } from "./picker-events.mjs";
import { createPickerState } from "./picker-state.mjs";

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
  const render = (syncModules = true) => {
    if (syncModules)
      modules.forEach((module) => {
        const satisfied = module.scopes.every((scope) => state.selected.has(scope));
        if (satisfied) state.enabledModules.add(module.id);
        else state.enabledModules.delete(module.id);
      });
    boxes.forEach((box) => {
      box.checked = state.selected.has(box.value);
      box.disabled = state.required.has(box.value);
    });
    document.querySelector("#scope-count").textContent = state.selected.size;
    document.querySelectorAll(".login").forEach((button) => {
      button.disabled = state.selected.size === 0;
      button.setAttribute("aria-disabled", String(state.selected.size === 0));
    });
    document.querySelectorAll(".login-hint").forEach((hint) => {
      hint.hidden = state.selected.size > 0;
    });
    document.querySelectorAll("[data-module]").forEach((button) => {
      button.classList.toggle("active", state.enabledModules.has(button.dataset.module));
      button.setAttribute("aria-pressed", String(state.enabledModules.has(button.dataset.module)));
    });
    document.querySelectorAll("[data-category-count]").forEach((counter) => {
      const values = categories[counter.dataset.categoryCount].flatMap((feature) =>
        feature.scopes.map((scope) => scope.scope),
      );
      counter.textContent = `${values.filter((scope) => state.selected.has(scope)).length}/${values.length}`;
    });
    moduleCount.textContent = `${state.enabledModules.size}/${modules.length} modules enabled`;
  };
  renderPickerGroups({ categories, modules, moduleGroups, scopeGroups, boxes });
  bindPickerEvents({ categories, ...state, boxes, sessionOptions, render });
  render();
}

if (typeof window !== "undefined") initializePicker();
