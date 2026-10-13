import { jest } from "@jest/globals";
import { printCommandHelp, printDetailedHelp, printHelp, printResourceHelp } from "../src/help.mjs";

describe("help output", () => {
  test("prints general help", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});

    printHelp();

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toContain("Manage Cloudflare from the command line.");
    spy.mockRestore();
  });

  test("prints resource help", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});

    printResourceHelp("zones");

    expect(spy).toHaveBeenCalledWith(expect.stringContaining("zones"));
    spy.mockRestore();
  });
});

test("uses default printers for detailed and command help", () => {
  const spy = jest.spyOn(console, "log").mockImplementation(() => {});
  printDetailedHelp();
  printCommandHelp("unknown", "action");
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});

test("prints detailed help", () => {
  const printer = { log: jest.fn() };
  printDetailedHelp(printer);
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining("Global options:"));
});

test("prints unknown resource help", () => {
  const printer = { log: jest.fn() };
  printResourceHelp("unknown", printer);
  expect(printer.log).toHaveBeenCalledWith("Unknown resource: unknown");
});
