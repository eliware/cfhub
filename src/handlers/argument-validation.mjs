export function requireValue(value, message, fail) {
  if (!value || (typeof value === "string" && !value.trim())) fail(message);
  return value;
}

export function requireAnyValue(values, message, fail) {
  if (!values.some(Boolean)) fail(message);
  return values.find(Boolean);
}
