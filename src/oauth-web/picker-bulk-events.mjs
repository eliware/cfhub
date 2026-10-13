export function bindPickerBulkEvents({ required, selected, boxes, render }) {
  document.querySelector("[data-all-enable]").addEventListener("click", () => {
    boxes.forEach((box) => selected.add(box.value));
    render();
  });
  document.querySelector("[data-all-disable]").addEventListener("click", () => {
    selected.clear();
    required.forEach((scope) => selected.add(scope));
    render(false);
  });
}
