import { renderPickerScopeFeature } from "./picker-scope-feature.mjs";
import { collectPickerScopeBoxes } from "./collect-picker-scope-boxes.mjs";

export function renderPickerScopeGroups(categories, scopeGroups, boxes) {
  Object.entries(categories).forEach(([name, features]) => {
    const category = document.createElement("details");
    category.className = "category";
    category.innerHTML = `<summary>${name}<b data-category-count="${name}">0/${features.reduce((sum, feature) => sum + feature.scopes.length, 0)}</b></summary><div class="category-actions"><button type="button" data-category-enable="${name}">Enable all</button><button type="button" data-category-disable="${name}">Disable all</button></div>${features.map(renderPickerScopeFeature).join("")}`;
    scopeGroups.append(category);
    boxes.push(...collectPickerScopeBoxes(category));
  });
}
