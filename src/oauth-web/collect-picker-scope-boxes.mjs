export function collectPickerScopeBoxes(category) {
  return [...category.querySelectorAll("[data-scope]")];
}
