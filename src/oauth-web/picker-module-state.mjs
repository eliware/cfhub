export function syncPickerModuleState(modules, selected, enabledModules) {
  modules.forEach((module) => {
    const satisfied = module.scopes.every((scope) => selected.has(scope));
    if (satisfied) enabledModules.add(module.id);
    else enabledModules.delete(module.id);
  });
}
