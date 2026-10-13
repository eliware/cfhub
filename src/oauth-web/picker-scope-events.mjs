import { bindPickerCategoryEvents } from "./picker-category-events.mjs";
import { bindPickerBulkEvents } from "./picker-bulk-events.mjs";

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
  bindPickerBulkEvents({ required, selected, boxes, render });
}
