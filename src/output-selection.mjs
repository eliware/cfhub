export function selectJson(value, expression) {
  if (!expression || expression === ".") return value;
  const parts = expression.replace(/^\./, "").split(".").filter(Boolean);
  return parts.reduce((current, part) => {
    if (Array.isArray(current)) return current.map((item) => item?.[part]);
    if (part.endsWith("[]")) {
      const key = part.slice(0, -2);
      return [current].flat().flatMap((item) => item?.[key] || []);
    }
    return current?.[part];
  }, value);
}

export function renderTemplate(value, template) {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, expression) => {
    const selected = selectJson(
      value,
      expression.trim().startsWith(".") ? expression.trim() : `.${expression.trim()}`,
    );
    return selected === undefined || selected === null ? "" : String(selected);
  });
}
