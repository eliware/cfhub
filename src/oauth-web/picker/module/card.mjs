export function createPickerModuleCard(module, documentRef = document) {
  const button = documentRef.createElement("button");
  button.type = "button";
  button.className = "module";
  button.dataset.module = module.id;
  const name = documentRef.createElement("strong");
  name.textContent = module.name;
  const description = documentRef.createElement("small");
  description.textContent = module.description;
  button.append(name, description);
  return button;
}
