export function bindPickerCheckboxEvents({ selected, enabledModules, owners, boxes, render }) {
  boxes.forEach((box) =>
    box.addEventListener("change", () => {
      if (box.checked) selected.add(box.value);
      else selected.delete(box.value);
      if (!box.checked) (owners.get(box.value) || []).forEach((id) => enabledModules.delete(id));
      render();
    }),
  );
}
