import { countPickerScopes } from "../scope/count.mjs";

export function renderPickerModuleState({ categories, modules, state, moduleCount }) {
  document.querySelectorAll("[data-module]").forEach((button) => {
    button.classList.toggle("active", state.enabledModules.has(button.dataset.module));
    button.setAttribute("aria-pressed", String(state.enabledModules.has(button.dataset.module)));
  });
  document.querySelectorAll("[data-category-count]").forEach((counter) => {
    const count = countPickerScopes(categories[counter.dataset.categoryCount], state.selected);
    counter.textContent = `${count.selected}/${count.total}`;
  });
  moduleCount.textContent = `${state.enabledModules.size}/${modules.length} modules enabled`;
}
