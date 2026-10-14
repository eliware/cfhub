import { requiresTerminalOutput } from "../../src/cli/terminal-use-policy.mjs";

test.each([
  [{ pager: "less", opts: {}, settings: {} }, true],
  [{ pager: null, opts: { color: false }, settings: {} }, true],
  [{ pager: null, opts: { width: 80 }, settings: {} }, true],
  [{ pager: null, opts: {}, settings: { color: true } }, true],
  [{ pager: null, opts: {}, settings: { width: 80 } }, true],
  [{ pager: null, opts: {}, settings: {} }, false],
])("decides whether terminal output is required", (input, expected) => {
  expect(requiresTerminalOutput(input)).toBe(expected);
});
