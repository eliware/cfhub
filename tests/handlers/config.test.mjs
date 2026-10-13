import { jest } from "@jest/globals";
import { handleConfigCommand } from "../../src/handlers/config.mjs";

test("config handler reads and updates local settings", () => {
  const fsImpl = {
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() => '{"pager":"less"}'),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    chmodSync: jest.fn(),
  };
  const printer = { log: jest.fn(), error: jest.fn() };
  const context = { opts: {}, printer, homeDir: "/workspace/test-home", fsImpl };

  handleConfigCommand({ ...context, args: ["config", "get", "pager"] });
  handleConfigCommand({ ...context, args: ["config", "set", "color", "always"] });
  handleConfigCommand({ ...context, args: ["config", "unset", "pager"] });

  expect(printer.log).toHaveBeenCalledWith("less");
  expect(printer.log).toHaveBeenCalledWith("Set config color");
  expect(printer.log).toHaveBeenCalledWith("Unset config pager");
  expect(fsImpl.writeFileSync).toHaveBeenCalledTimes(2);
});

test("config handler lists values and validates writes", () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const fsImpl = { existsSync: () => false };
  const base = { opts: {}, printer, homeDir: "home", fsImpl };
  handleConfigCommand({ ...base, args: ["config", "list"] });
  handleConfigCommand({ ...base, args: ["config", "list"], opts: { json: true } });
  handleConfigCommand({ ...base, args: ["config", "get", "missing"] });
  handleConfigCommand({ ...base, args: ["config", "set"] });
  handleConfigCommand({ ...base, args: ["config", "set", "name"] });
  handleConfigCommand({ ...base, args: ["config", "unknown"] });
  expect(printer.log).toHaveBeenCalledWith("");
  expect(printer.error).toHaveBeenCalledWith("Usage: cfhub config set <name> <value>");
  expect(printer.log).toHaveBeenCalled();
});

test("config text listing prints each setting", () => {
  const printer = { log: jest.fn() };
  handleConfigCommand({
    args: ["config", "list"],
    opts: {},
    printer,
    homeDir: "home",
    fsImpl: { existsSync: () => true, readFileSync: () => JSON.stringify({ pager: "less" }) },
  });
  expect(printer.log).toHaveBeenCalledWith("pager less");
});
