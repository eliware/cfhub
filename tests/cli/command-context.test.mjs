import { jest } from "@jest/globals";
import { createCommandContext } from "../../src/cli/command-context.mjs";

const context = (overrides = {}) => ({
  resource: "zones",
  action: "list",
  opts: {},
  cf: {},
  body: null,
  outputJson: true,
  printer: { error: jest.fn() },
  log: jest.fn(),
  exit: jest.fn(),
  ...overrides,
});

test("creates context fields and writes JSON output", () => {
  const log = jest.fn();
  const result = createCommandContext(context({ log }));
  expect(result).toMatchObject({ resource: "zones", action: "list", outputJson: true });
  result.toJsonOutput({ ok: true });
  expect(log).toHaveBeenCalledWith('{\n  "ok": true\n}');
});

test("renders templates from selected JSON fields", () => {
  const log = jest.fn();
  const result = createCommandContext(
    context({ opts: { jq: ".zone.name", template: "Zone: {{.}}" }, log }),
  );
  result.toJsonOutput({ zone: { name: "example.com" } });
  expect(log).toHaveBeenCalledWith("Zone: example.com");
});

test("reports failures with default and custom exit codes", () => {
  const printer = { error: jest.fn() };
  const exit = jest.fn();
  const result = createCommandContext(context({ printer, exit }));
  result.fail("failed");
  result.fail("bad input", 2);
  expect(printer.error).toHaveBeenNthCalledWith(1, "failed");
  expect(exit).toHaveBeenNthCalledWith(1, 1);
  expect(exit).toHaveBeenNthCalledWith(2, 2);
});
