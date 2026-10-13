import { jest } from "@jest/globals";
import { handleAlias } from "../../src/handlers/alias.mjs";

test("alias handler lists, stores, and deletes aliases", () => {
  let content = '{"work":"zones list"}';
  const fsImpl = {
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() => content),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn((path, value) => {
      content = value;
    }),
    chmodSync: jest.fn(),
  };
  const printer = { log: jest.fn(), error: jest.fn() };
  const context = { opts: {}, printer, homeDir: "/workspace/test-home", fsImpl };

  handleAlias({ ...context, args: ["alias", "list"] });
  handleAlias({ ...context, args: ["alias", "set", "staging", "zones", "list"] });
  handleAlias({ ...context, args: ["alias", "delete", "staging"] });

  expect(printer.log).toHaveBeenCalledWith("work zones list");
  expect(printer.log).toHaveBeenCalledWith("Set alias staging");
  expect(printer.log).toHaveBeenCalledWith("Deleted alias staging");
  expect(fsImpl.writeFileSync).toHaveBeenCalledTimes(2);
});
