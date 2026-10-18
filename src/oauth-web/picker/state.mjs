import { createPickerModuleState } from "./module/state.mjs";

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
  const state = { required, selected, enabledModules, owners };
  return { ...state, ...createPickerModuleState(modules, state) };
}
