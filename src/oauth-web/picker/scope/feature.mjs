import { escapePickerMarkup } from "../../escape-picker-markup.mjs";

const featureClass = "feature";

export function renderPickerScopeFeature(feature) {
  return `<div class="${featureClass}"><span class="feature-name">${escapePickerMarkup(feature.name)}</span><span class="variants">${feature.scopes
    .map(
      (scope) =>
        `<label><input type="checkbox" data-scope name="scope" value="${escapePickerMarkup(scope.scope)}">${escapePickerMarkup(scope.label)}</label>`,
    )
    .join("")}</span></div>`;
}
