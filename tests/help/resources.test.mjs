import { jest } from "@jest/globals";
import { printResourceHelp } from "../../src/help/resources.mjs";

test("resource help prints matching help and an unknown fallback", () => {
  const printer = { log: jest.fn() };
  printResourceHelp("zones", printer);
  printResourceHelp("unknown", printer);
  expect(printer.log).toHaveBeenNthCalledWith(1, expect.stringContaining("zones"));
  expect(printer.log).toHaveBeenNthCalledWith(2, "Unknown resource: unknown");
});

test("uses the default resource help printer", () => {
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  printResourceHelp("unknown");
  expect(log).toHaveBeenCalledWith("Unknown resource: unknown");
  log.mockRestore();
});
