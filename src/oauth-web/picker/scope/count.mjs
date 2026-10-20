export function countPickerScopes(features, selected = new Set()) {
  const scopes = features.flatMap((feature) => feature.scopes.map((scope) => scope.scope));
  return {
    selected: scopes.filter((scope) => selected.has(scope)).length,
    total: scopes.length,
  };
}
