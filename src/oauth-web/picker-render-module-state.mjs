export function renderPickerModuleState({ categories, modules, state, moduleCount }) {
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
