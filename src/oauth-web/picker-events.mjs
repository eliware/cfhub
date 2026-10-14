import { bindPickerNavigation } from "./picker-navigation.mjs";
import { bindPickerModuleEvents } from "./picker-module-events.mjs";
import { bindPickerScopeEvents } from "./picker-scope-events.mjs";
import { bindPickerSessionEvents } from "./picker-session-events.mjs";

export function bindPickerEvents(options) {
  bindPickerScopeEvents(options);
  bindPickerSessionEvents(options.sessionOptions);
  bindPickerModuleEvents(options);
  bindPickerNavigation();
}
