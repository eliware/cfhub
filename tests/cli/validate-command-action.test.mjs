import { jest } from "@jest/globals";
import { validateCommandAction } from "../../src/cli/validate-command-action.mjs";

test("accepts API actions and valid actions", () => {
  const printer = { error: jest.fn() };
  expect(validateCommandAction({ resource: "api", action: "anything", printer })).toBeNull();
  expect(validateCommandAction({ resource: "zones", action: "list", printer })).toBeNull();
  expect(printer.error).not.toHaveBeenCalled();
});

test("reports invalid actions and suggests a close match", () => {
  const printer = { error: jest.fn() };
  const exit = jest.fn((code) => code);
  expect(validateCommandAction({ resource: "zones", action: "lis", printer, exit })).toEqual({
    done: true,
    value: 1,
  });
  expect(printer.error).toHaveBeenCalledWith(expect.stringContaining("Did you mean this?\n\tlist"));
  expect(exit).toHaveBeenCalledWith(1);
});

test("does not validate actions for unknown resource names", () => {
  expect(
    validateCommandAction({ resource: "unknown", action: "thing", printer: { error: jest.fn() } }),
  ).toBeNull();
});
