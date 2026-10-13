export function createPickerModuleState(modules, state) {
  const byId = new Map(modules.map((module) => [module.id, module]));
  const enableModule = (id) => {
    const module = byId.get(id);
    if (!module) return;
    state.enabledModules.add(id);
    module.scopes.forEach((scope) => state.selected.add(scope));
  };
  const disableModule = (id) => {
    const module = byId.get(id);
    if (!module) return;
    state.enabledModules.delete(id);
    module.scopes.forEach((scope) => {
      if (
        !(state.owners.get(scope) || []).some((owner) => state.enabledModules.has(owner)) &&
        !state.required.has(scope)
      )
        state.selected.delete(scope);
    });
  };
  const moduleTier = (tier, enable) =>
    modules
      .filter((module) => module.tier === tier)
      .forEach((module) => (enable ? enableModule(module.id) : disableModule(module.id)));
  return { enableModule, disableModule, moduleTier };
}
