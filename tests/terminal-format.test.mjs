import {
  fitTerminal,
  styleTerminalText,
  terminalColorMode,
  terminalWidth,
} from "../src/terminal-format.mjs";

test("selects terminal color modes and validates widths", () => {
  expect(terminalColorMode("always", { isTTY: false })).toBe(true);
  expect(terminalColorMode("never", { isTTY: true })).toBe(false);
  expect(terminalColorMode("true", { isTTY: false })).toBe(true);
  expect(terminalColorMode("false", { isTTY: true })).toBe(false);
  expect(terminalColorMode("auto", { isTTY: true, noColor: false })).toBe(true);
  expect(terminalColorMode("auto", { isTTY: true, noColor: true })).toBe(false);
  expect(typeof terminalColorMode("auto")).toBe("boolean");
  expect(terminalColorMode(undefined, { isTTY: false, noColor: false })).toBe(false);
  expect(terminalWidth()).toBe(120);
  expect(terminalWidth("80")).toBe(80);
  expect(terminalWidth("bad", 90)).toBe(90);
  expect(terminalWidth("39")).toBe(120);
});

test("fits terminal lines and styles multiline headers", () => {
  expect(fitTerminal("short\nlonger", 5)).toBe("short\nlong…");
  expect(fitTerminal("plain")).toBe("plain");
  expect(styleTerminalText("one\ntwo")).toBe("one\ntwo");
  expect(styleTerminalText("one\ntwo", { color: true })).toContain(
    "\u001b[1m\u001b[36mone\u001b[0m\ntwo",
  );
});
