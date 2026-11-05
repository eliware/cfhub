import { jest } from "@jest/globals";
import { printCommandHelp } from "../../src/help/commands.mjs";
import { commandNamesFor, resourceNames } from "../../src/suggestions.mjs";

test("command help covers specific and fallback resources", () => {
  const printer = { log: jest.fn() };
  printCommandHelp("auth", "login", printer);
  expect(printer.log.mock.calls[0][0]).toContain("USAGE");
  expect(printer.log.mock.calls[0][0]).toContain("hides the token during entry");

  printCommandHelp("unknown", "action", printer);
  expect(printer.log.mock.calls[1][0]).toContain("Use 'cfhub unknown --help'");
  printCommandHelp("unknown", undefined, printer);
  expect(printer.log.mock.calls[2][0]).toContain("<subcommand>");

  printCommandHelp("list-items", "list", printer);
  expect(printer.log.mock.calls[3][0]).toContain("--per-page <count>");
  expect(printer.log.mock.calls[3][0]).toContain("default with --paginate: 100");
});

test("uses the default help printer", () => {
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  printCommandHelp("unknown", "action");
  expect(log).toHaveBeenCalled();
  log.mockRestore();
});

test("prints complete help for every supported command action", () => {
  const printer = { log: jest.fn() };
  for (const resource of resourceNames) {
    for (const action of commandNamesFor(resource)) {
      printCommandHelp(resource, action, printer);
      const output = printer.log.mock.lastCall[0];
      expect(output).toContain("USAGE");
      expect(output).toMatch(/OPTIONS|FLAGS/);
      expect(output).toContain("DEFAULTS");
      expect(output.split("\n")[0]).not.toContain("Use 'cfhub");
    }
  }
});
