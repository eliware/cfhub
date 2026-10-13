export function renderPickerState({
  categories,
  modules,
  state,
  boxes,
  moduleCount,
  syncModules = true,
}) {
  if (syncModules) syncPickerModuleState(modules, state.selected, state.enabledModules);
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
}
import { syncPickerModuleState } from "./picker-module-sync.mjs";
