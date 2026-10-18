export function renderPickerScopeState({ boxes, state }) {
  boxes.forEach((box) => {
    box.checked = state.selected.has(box.value);
    box.disabled = state.required.has(box.value);
  });
  document.querySelector("#scope-count").textContent = state.selected.size;
  document.querySelectorAll(".login").forEach((button) => {
    button.disabled = state.selected.size === 0;
    button.setAttribute("aria-disabled", String(state.selected.size === 0));
  });
  document.querySelectorAll(".login-hint").forEach((hint) => {
    hint.hidden = state.selected.size > 0;
  });
}
