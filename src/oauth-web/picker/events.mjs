import { bindPickerNavigation } from "./navigation.mjs";
import { bindPickerModuleEvents } from "./module/events.mjs";
import { bindPickerScopeEvents } from "./scope/events.mjs";
import { bindPickerSessionEvents } from "./session-events.mjs";

export function bindPickerEvents(options) {
  bindPickerScopeEvents(options);
  bindPickerSessionEvents(options.sessionOptions);
  bindPickerModuleEvents(options);
  bindPickerNavigation();
}
