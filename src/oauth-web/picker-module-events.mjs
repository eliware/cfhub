import { bindPickerSessionEvents } from "./picker-session-events.mjs";

export function bindPickerModuleEvents({
  enabledModules,
  sessionOptions,
  moduleTier,
  enableModule,
  disableModule,
  render,
}) {
  bindPickerSessionEvents(sessionOptions);
  document.querySelectorAll("[data-module]").forEach((button) =>
    button.addEventListener("click", () => {
      if (enabledModules.has(button.dataset.module)) disableModule(button.dataset.module);
      else enableModule(button.dataset.module);
      render();
    }),
  );
  document.querySelectorAll("[data-tier-enable]").forEach((button) =>
    button.addEventListener("click", () => {
      moduleTier(button.dataset.tierEnable, true);
      render();
    }),
  );
  document.querySelectorAll("[data-tier-disable]").forEach((button) =>
    button.addEventListener("click", () => {
      moduleTier(button.dataset.tierDisable, false);
      render();
    }),
  );
}
