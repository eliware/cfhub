import { terminalOptions } from "../../src/cli/terminal-options.mjs";

test("resolves JSON, color, width, and pager settings", () => {
  expect(
    terminalOptions({
      opts: { json: false, output: "json", color: "always", pager: true },
      settings: { color: false, width: "80", pager: "less" },
      env: { PAGER: "more" },
      isTTY: true,
    }),
  ).toEqual({ outputJson: true, color: true, width: 80, pager: null, useTerminal: true });
  expect(
    terminalOptions({ opts: { quiet: true, pager: true }, settings: {}, env: {}, isTTY: false }),
  ).toMatchObject({ pager: null, useTerminal: false });
});

test("lets an explicit text output selection override the JSON flag", () => {
  expect(
    terminalOptions({ opts: { json: true, output: "text" }, settings: {}, env: {}, isTTY: false }),
  ).toMatchObject({ outputJson: false });
});
