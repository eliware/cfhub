import { jest } from "@jest/globals";
import { validateCommandResource } from "../../../src/cli/validate-command/resource.mjs";

test("accepts known resources and installed extension resources", () => {
  const printer = { error: jest.fn() };
  expect(validateCommandResource({ resource: "zones", printer })).toBeNull();
  expect(
    validateCommandResource({ resource: "sample", extensionManifest: {}, printer }),
  ).toBeNull();
  expect(printer.error).not.toHaveBeenCalled();
});

test("reports an unknown resource and suggests a close match", () => {
  const printer = { error: jest.fn() };
  const exit = jest.fn((code) => code);
  expect(validateCommandResource({ resource: "zone", printer, exit })).toEqual({
    done: true,
    value: 1,
  });
  expect(printer.error).toHaveBeenCalledWith(expect.stringContaining("\tzones"));
  expect(exit).toHaveBeenCalledWith(1);
});

test("rejects unknown resources without a close suggestion", () => {
  const printer = { error: jest.fn() };
  const exit = jest.fn((code) => code);
  expect(validateCommandResource({ resource: "zzzzzzzz", printer, exit })).toEqual({
    done: true,
    value: 1,
  });
  expect(printer.error).toHaveBeenCalledWith(expect.stringContaining('unknown command "zzzzzzzz"'));
  expect(exit).toHaveBeenCalledWith(1);
});
