import { normalizeOptionValue, readOptionValue } from "../../src/args/option-value.mjs";

test("reads a following token as an option value", () => {
  expect(readOptionValue("value")).toEqual({ value: "value", consumesNext: true });
});

test("keeps a bare option when the next token is another option or absent", () => {
  expect(readOptionValue("--next")).toEqual({ value: true, consumesNext: false });
  expect(readOptionValue(undefined)).toEqual({ value: true, consumesNext: false });
});

test("normalizes explicit dry-run values and preserves other option values", () => {
  expect(normalizeOptionValue("dry-run", "true")).toBe(true);
  expect(normalizeOptionValue("dry-run", "false")).toBe(false);
  expect(normalizeOptionValue("zone-id", "false")).toBe("false");
});
