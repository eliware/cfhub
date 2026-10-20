import { terminalWidth } from "../../src/terminal/width.mjs";

test("accepts valid terminal widths and uses the fallback for invalid values", () => {
  expect(terminalWidth()).toBe(120);
  expect(terminalWidth("80")).toBe(80);
  expect(terminalWidth("bad", 90)).toBe(90);
  expect(terminalWidth("39")).toBe(120);
});
