import { jest } from "@jest/globals";
import { handleLocalCommand } from "../../src/cli/local-commands.mjs";

const context = (args, opts = {}, printer = { log: jest.fn(), error: jest.fn() }) => ({
  args,
  opts,
  printer,
  homeDir: "home",
  fsImpl: { existsSync: () => false },
});

test("handles version and help commands", () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  expect(handleLocalCommand(context([], { version: true }, printer)).handled).toBe(true);
  expect(handleLocalCommand(context([], {}, printer)).handled).toBe(true);
  expect(printer.log).toHaveBeenCalled();
});

test("routes alias and config commands", () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const fsImpl = { existsSync: () => true, readFileSync: () => JSON.stringify({ foo: "bar" }) };
  const alias = handleLocalCommand({ ...context(["alias", "list"], {}, printer), fsImpl });
  const config = handleLocalCommand({ ...context(["config", "list"], {}, printer), fsImpl });
  expect(alias.handled).toBe(true);
  expect(config.handled).toBe(true);
  expect(printer.log).toHaveBeenCalled();
});

test("leaves other resources for normal command dispatch", () => {
  expect(handleLocalCommand(context(["zones", "list"]))).toEqual({ handled: false });
});
