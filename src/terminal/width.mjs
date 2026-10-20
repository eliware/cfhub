export function terminalWidth(value, fallback = 120) {
  const width = Number.parseInt(value, 10);
  return Number.isFinite(width) && width >= 40 ? width : fallback;
}
