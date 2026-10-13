export function bindPickerCategoryEvents({ categories, required, selected, render }) {
  document.querySelectorAll("[data-category-enable]").forEach((button) =>
    button.addEventListener("click", () => {
      categories[button.dataset.categoryEnable].forEach((feature) =>
        feature.scopes.forEach((scope) => selected.add(scope.scope)),
      );
      render();
    }),
  );
  document.querySelectorAll("[data-category-disable]").forEach((button) =>
    button.addEventListener("click", () => {
      categories[button.dataset.categoryDisable].forEach((feature) =>
        feature.scopes.forEach((scope) => {
          if (!required.has(scope.scope)) selected.delete(scope.scope);
        }),
      );
      render();
    }),
  );
}
