import { spawn } from "node:child_process";
import { flushTerminalPager } from "./terminal/pager.mjs";
import { styleTerminalText } from "./terminal/text.mjs";
export { fitTerminal, styleTerminalText } from "./terminal/text.mjs";
export { terminalColorMode } from "./terminal/format.mjs";
export { terminalWidth } from "./terminal/width.mjs";

export function createTerminalOutput({
  printer = console,
  json = false,
  color = false,
  width = 120,
  pager = null,
  spawnImpl = spawn,
} = {}) {
  const lines = [];
  const normal = (value) => {
    const rendered = json ? String(value) : styleTerminalText(value, { color, width });
    if (pager) lines.push(rendered);
    else printer.log(rendered);
  };
  return {
    log: normal,
    error: (value) => printer.error(value),
    flush: async () => {
      await flushTerminalPager(lines, pager, spawnImpl);
    },
  };
}
