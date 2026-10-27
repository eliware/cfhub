export function readOptionValue(next) {
  if (next && !next.startsWith("--")) return { value: next, consumesNext: true };
  return { value: true, consumesNext: false };
}

export function normalizeOptionValue(key, value) {
  if (key === "dry-run" && (value === "true" || value === "false")) return value === "true";
  return value;
}
