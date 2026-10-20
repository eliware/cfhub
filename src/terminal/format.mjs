export function terminalColorMode(
  value,
  { isTTY = Boolean(process.stdout?.isTTY), noColor = Boolean(process.env.NO_COLOR) } = {},
) {
  if (value === "always" || value === "true") return true;
  if (value === "never" || value === "false") return false;
  return isTTY && !noColor;
}
