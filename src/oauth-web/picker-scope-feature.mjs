export function renderPickerScopeFeature(feature) {
  return `<div class="feature"><span class="feature-name">${feature.name}</span><span class="variants">${feature.scopes
    .map(
      (scope) =>
        `<label><input type="checkbox" data-scope name="scope" value="${scope.scope}">${scope.label}</label>`,
    )
    .join("")}</span></div>`;
}
