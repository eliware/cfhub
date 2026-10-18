import { jest } from "@jest/globals";
import { printCommandHelp } from "../../src/help/commands.mjs";

test("command help covers specific and fallback resources", () => {
  const printer = { log: jest.fn() };
  printCommandHelp("auth", "login", printer);
  expect(printer.log.mock.calls[0][0]).toContain("USAGE");
  expect(printer.log.mock.calls[0][0]).toContain("hides the token during entry");

  printCommandHelp("unknown", "action", printer);
  expect(printer.log.mock.calls[1][0]).toContain("Use 'cfhub unknown --help'");
  printCommandHelp("unknown", undefined, printer);
  expect(printer.log.mock.calls[2][0]).toContain("<subcommand>");
});

test("uses the default help printer", () => {
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  printCommandHelp("unknown", "action");
  expect(log).toHaveBeenCalled();
  log.mockRestore();
});
