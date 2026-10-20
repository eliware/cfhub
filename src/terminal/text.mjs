const ANSI = { bold: "\u001b[1m", cyan: "\u001b[36m", reset: "\u001b[0m" };

export function fitTerminal(text, width = 120) {
  return String(text)
    .split("\n")
    .map((line) => (line.length > width ? `${line.slice(0, Math.max(1, width - 1))}…` : line))
    .join("\n");
}

export function styleTerminalText(text, { color = false, width = 120 } = {}) {
  const fitted = fitTerminal(text, width);
  if (!color || !fitted.includes("\n")) return fitted;
  const [header, ...rest] = fitted.split("\n");
  return `${ANSI.bold}${ANSI.cyan}${header}${ANSI.reset}\n${rest.join("\n")}`;
}
