import { bindPickerSessionEvents } from "../../../src/oauth-web/picker/session-events.mjs";

const control = () => ({
  addEventListener(event, handler) {
    this.handlers ||= {};
    this.handlers[event] = handler;
  },
});

test("syncs all session options when one option changes", () => {
  const options = [control(), control()];
  bindPickerSessionEvents(options);
  options[0].checked = true;
  options[0].handlers.change();
  expect(options[1].checked).toBe(true);
  options[1].checked = false;
  options[1].handlers.change();
  expect(options[0].checked).toBe(false);
});
