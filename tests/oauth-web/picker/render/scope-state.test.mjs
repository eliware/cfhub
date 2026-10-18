import { jest } from "@jest/globals";
import { renderPickerScopeState } from "../../../../src/oauth-web/picker/render/scope-state.mjs";

const control = () => ({ setAttribute: jest.fn() });

test("renders selected, required, and login state", () => {
  const scopeCount = { textContent: "" };
  const login = control();
  const hint = { hidden: false };
  globalThis.document = {
    querySelector: () => scopeCount,
    querySelectorAll: (selector) => (selector === ".login" ? [login] : [hint]),
  };
  const selectedBox = { value: "zone.read" };
  const requiredBox = { value: "user.read" };
  renderPickerScopeState({
    boxes: [selectedBox, requiredBox],
    state: { selected: new Set(["zone.read"]), required: new Set(["user.read"]) },
  });
  expect(selectedBox).toMatchObject({ checked: true, disabled: false });
  expect(requiredBox).toMatchObject({ checked: false, disabled: true });
  expect(scopeCount.textContent).toBe(1);
  expect(login.disabled).toBe(false);
  expect(login.setAttribute).toHaveBeenCalledWith("aria-disabled", "false");
  expect(hint.hidden).toBe(true);
});
