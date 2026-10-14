import { escapePickerMarkup } from "./escape-picker-markup.mjs";
import { renderPickerScopeFeature } from "./picker-scope-feature.mjs";

export function renderPickerScopeCategory(name, features) {
  const safeName = escapePickerMarkup(name);
  const count = features.reduce((sum, feature) => sum + feature.scopes.length, 0);
  return `<summary>${safeName}<b data-category-count="${safeName}">0/${count}</b></summary><div class="category-actions"><button type="button" data-category-enable="${safeName}">Enable all</button><button type="button" data-category-disable="${safeName}">Disable all</button></div>${features.map(renderPickerScopeFeature).join("")}`;
}
