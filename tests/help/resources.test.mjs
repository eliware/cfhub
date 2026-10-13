import { jest } from "@jest/globals";
import { printResourceHelp } from "../../src/help/resources.mjs";

test("resource help prints matching help and an unknown fallback", () => {
  const printer = { log: jest.fn() };
  printResourceHelp("zones", printer);
  printResourceHelp("unknown", printer);
  expect(printer.log).toHaveBeenNthCalledWith(1, expect.stringContaining("zones"));
  expect(printer.log).toHaveBeenNthCalledWith(2, "Unknown resource: unknown");
});
