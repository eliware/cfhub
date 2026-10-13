export function createPickerState(modules, requiredScopes) {
  const required = new Set(requiredScopes);
  const selected = new Set(requiredScopes);
  const enabledModules = new Set();
  const owners = new Map();
  modules.forEach((module) =>
    module.scopes.forEach((scope) => {
      if (!owners.has(scope)) owners.set(scope, []);
      owners.get(scope).push(module.id);
    }),
  );
  const byId = new Map(modules.map((module) => [module.id, module]));
  const enableModule = (id) => {
    const module = byId.get(id);
    if (!module) return;
    enabledModules.add(id);
    module.scopes.forEach((scope) => selected.add(scope));
  };
  const disableModule = (id) => {
    const module = byId.get(id);
    if (!module) return;
    enabledModules.delete(id);
    module.scopes.forEach((scope) => {
      if (
        !(owners.get(scope) || []).some((owner) => enabledModules.has(owner)) &&
        !required.has(scope)
      )
        selected.delete(scope);
    });
  };
  const moduleTier = (tier, enable) =>
    modules
      .filter((module) => module.tier === tier)
      .forEach((module) => (enable ? enableModule(module.id) : disableModule(module.id)));
  return { required, selected, enabledModules, owners, enableModule, disableModule, moduleTier };
}
