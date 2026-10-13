import { jest } from "@jest/globals";
import { printDetailedHelp } from "../../src/help/detailed.mjs";

test("detailed help prints global options", () => {
  const printer = { log: jest.fn() };
  printDetailedHelp(printer);
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining("Global options:"));
});
