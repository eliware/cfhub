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
