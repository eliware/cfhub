import { requireAnyValue, requireValue } from "../../src/handlers/argument-validation.mjs";

test("requires one value and returns the valid value", () => {
  const fail = (message) => {
    throw new Error(message);
  };
  expect(requireValue(" value ", "required", fail)).toBe(" value ");
  expect(requireValue(1, "required", fail)).toBe(1);
  expect(() => requireValue("  ", "required", fail)).toThrow("required");
  expect(() => requireValue(null, "required", fail)).toThrow("required");
});

test("requires at least one value and returns the first value", () => {
  const fail = (message) => {
    throw new Error(message);
  };
  expect(requireAnyValue([null, "second", "third"], "required", fail)).toBe("second");
  expect(() => requireAnyValue([null, ""], "required", fail)).toThrow("required");
});
