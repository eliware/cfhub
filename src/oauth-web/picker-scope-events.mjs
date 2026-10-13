import { bindPickerCategoryEvents } from "./picker-category-events.mjs";

export function bindPickerScopeEvents({
  categories,
  required,
  selected,
  enabledModules,
  owners,
  boxes,
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
  bindPickerCategoryEvents({ categories, required, selected, render });
  document.querySelector("[data-all-enable]").addEventListener("click", () => {
    boxes.forEach((box) => selected.add(box.value));
    render();
  });
  document.querySelector("[data-all-disable]").addEventListener("click", () => {
    selected.clear();
    required.forEach((scope) => selected.add(scope));
    render(false);
  });
}
