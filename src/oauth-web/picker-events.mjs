import { bindPickerNavigation } from "./picker-navigation.mjs";
import { bindPickerModuleEvents } from "./picker-module-events.mjs";
import { bindPickerScopeEvents } from "./picker-scope-events.mjs";

export function bindPickerEvents(options) {
  bindPickerScopeEvents(options);
  bindPickerModuleEvents(options);
  bindPickerNavigation();
}
