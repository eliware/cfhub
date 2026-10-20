import { terminalColorMode } from "../../src/terminal/format.mjs";

test("selects terminal color modes", () => {
  expect(terminalColorMode("always", { isTTY: false })).toBe(true);
  expect(terminalColorMode("never", { isTTY: true })).toBe(false);
  expect(terminalColorMode("true", { isTTY: false })).toBe(true);
  expect(terminalColorMode("false", { isTTY: true })).toBe(false);
  expect(terminalColorMode("auto", { isTTY: true, noColor: false })).toBe(true);
  expect(terminalColorMode("auto", { isTTY: true, noColor: true })).toBe(false);
  expect(typeof terminalColorMode("auto")).toBe("boolean");
  expect(terminalColorMode(undefined, { isTTY: false, noColor: false })).toBe(false);
});

test("uses TTY and NO_COLOR defaults", () => {
  expect(terminalColorMode("auto")).toEqual(expect.any(Boolean));
});
