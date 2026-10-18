import { bindPickerCategoryEvents } from "../category-events.mjs";
import { bindPickerBulkEvents } from "../bulk-events.mjs";
import { bindPickerCheckboxEvents } from "../checkbox-events.mjs";

export function bindPickerScopeEvents({
  categories,
  required,
  selected,
  enabledModules,
  owners,
  boxes,
  render,
}) {
  bindPickerCheckboxEvents({ selected, enabledModules, owners, boxes, render });
  bindPickerCategoryEvents({ categories, required, selected, render });
  bindPickerBulkEvents({ required, selected, boxes, render });
}
