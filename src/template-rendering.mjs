import { selectJson } from "./json-selection.mjs";

export function renderTemplate(value, template) {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, expression) => {
    const selected = selectJson(
      value,
      expression.trim().startsWith(".") ? expression.trim() : `.${expression.trim()}`,
    );
    return selected === undefined || selected === null ? "" : String(selected);
  });
}
