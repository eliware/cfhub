export function readOptionValue(next) {
  if (next && !next.startsWith("--")) return { value: next, consumesNext: true };
  return { value: true, consumesNext: false };
}
