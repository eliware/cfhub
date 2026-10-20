import { escapePickerMarkup } from "../../escape-picker-markup.mjs";
import { countPickerScopes } from "./count.mjs";
import { renderPickerScopeFeature } from "./feature.mjs";

export function renderPickerScopeCategory(name, features) {
  const safeName = escapePickerMarkup(name);
  const { total } = countPickerScopes(features);
  return `<summary>${safeName}<b data-category-count="${safeName}">0/${total}</b></summary><div class="category-actions"><button type="button" data-category-enable="${safeName}">Enable all</button><button type="button" data-category-disable="${safeName}">Disable all</button></div>${features.map(renderPickerScopeFeature).join("")}`;
}
