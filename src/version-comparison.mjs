export function newerVersion(latest, current) {
  const parse = (value) =>
    String(value)
      .split(".")
      .map((part) => Number.parseInt(part, 10) || 0);
  const a = parse(latest);
  const b = parse(current);
  for (const index of [0, 1, 2]) {
    if (a[index] !== b[index]) return a[index] > b[index];
  }
  return false;
}
