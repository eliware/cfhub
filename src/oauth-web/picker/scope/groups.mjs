import { collectPickerScopeBoxes } from "../../collect-picker-scope-boxes.mjs";
import { renderPickerScopeCategory } from "./category-markup.mjs";

export function renderPickerScopeGroups(categories, scopeGroups, boxes) {
  Object.entries(categories).forEach(([name, features]) => {
    const category = document.createElement("details");
    category.className = "category";
    category.innerHTML = renderPickerScopeCategory(name, features);
    scopeGroups.append(category);
    boxes.push(...collectPickerScopeBoxes(category));
  });
}
