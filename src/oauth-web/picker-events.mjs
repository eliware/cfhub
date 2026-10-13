import { bindPickerNavigation } from "./picker-navigation.mjs";

export function bindPickerEvents({
  categories,
  required,
  selected,
  enabledModules,
  owners,
  boxes,
  sessionOptions,
  moduleTier,
  enableModule,
  disableModule,
  render,
}) {
  boxes.forEach((box) =>
    box.addEventListener("change", () => {
      if (box.checked) selected.add(box.value);
      else selected.delete(box.value);
      if (!box.checked) (owners.get(box.value) || []).forEach((id) => enabledModules.delete(id));
      render();
    }),
  );
  sessionOptions.forEach((option) =>
    option.addEventListener("change", () => {
      sessionOptions.forEach((other) => {
        other.checked = option.checked;
      });
    }),
  );
  document.querySelectorAll("[data-module]").forEach((button) =>
    button.addEventListener("click", () => {
      if (enabledModules.has(button.dataset.module)) disableModule(button.dataset.module);
      else enableModule(button.dataset.module);
      render();
    }),
  );
  document.querySelectorAll("[data-tier-enable]").forEach((button) =>
    button.addEventListener("click", () => {
      moduleTier(button.dataset.tierEnable, true);
      render();
    }),
  );
  document.querySelectorAll("[data-tier-disable]").forEach((button) =>
    button.addEventListener("click", () => {
      moduleTier(button.dataset.tierDisable, false);
      render();
    }),
  );
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
  document.querySelector("[data-all-enable]").addEventListener("click", () => {
    boxes.forEach((box) => selected.add(box.value));
    render();
  });
  document.querySelector("[data-all-disable]").addEventListener("click", () => {
    selected.clear();
    required.forEach((scope) => selected.add(scope));
    enabledModules.clear();
    render(false);
  });
  bindPickerNavigation();
}
