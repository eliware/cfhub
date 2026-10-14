import { jest } from "@jest/globals";
import { resolveCommandHelp } from "../../src/cli/resolve-command-help.mjs";

test("resolves resource help and command help", () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  expect(
    resolveCommandHelp({ args: ["zones"], opts: { help: true }, resource: "zones", printer }).done,
  ).toBe(true);
  expect(
    resolveCommandHelp({
      args: ["zones", "list"],
      opts: { help: true },
      resource: "zones",
      action: "list",
      printer,
    }).done,
  ).toBe(true);
});

test("shows resource help when no action is set outside help mode", () => {
  const result = resolveCommandHelp({
    args: ["zones"],
    opts: {},
    resource: "zones",
    printer: { log: jest.fn() },
  });
  expect(result.done).toBe(true);
});

test("does not intercept an extension resource without help", () => {
  expect(
    resolveCommandHelp({
      args: ["sample"],
      opts: {},
      resource: "sample",
      extensionManifest: { name: "sample" },
    }),
  ).toBeNull();
});
