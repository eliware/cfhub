import { escapePickerMarkup } from "./escape-picker-markup.mjs";

export function renderPickerScopeFeature(feature) {
  return `<div class="feature"><span class="feature-name">${escapePickerMarkup(feature.name)}</span><span class="variants">${feature.scopes
    .map(
      (scope) =>
        `<label><input type="checkbox" data-scope name="scope" value="${escapePickerMarkup(scope.scope)}">${escapePickerMarkup(scope.label)}</label>`,
    )
    .join("")}</span></div>`;
}
