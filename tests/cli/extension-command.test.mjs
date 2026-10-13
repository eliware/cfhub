import { jest } from "@jest/globals";
import { runExtensionCommand } from "../../src/cli/extension-command.mjs";

const context = (action, opts, printer = { log: jest.fn(), error: jest.fn() }) => ({
  action,
  opts,
  printer,
  fsImpl: { existsSync: () => false },
  homeDir: "home",
});

test("lists extensions as JSON", () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  runExtensionCommand(context("list", { json: true }, printer));
  expect(printer.log).toHaveBeenCalledWith("[]");
});

test("supports JSON output through the output option", () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  runExtensionCommand(context("list", { output: "json" }, printer));
  expect(printer.log).toHaveBeenCalledWith("[]");
});

test("prints extension lists and reports unknown actions", () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  runExtensionCommand(context("list", {}, printer));
  expect(printer.log).toHaveBeenCalled();
  runExtensionCommand(context("unknown", {}, printer));
  expect(printer.error).toHaveBeenCalledWith("Unknown extension action: unknown");
});
