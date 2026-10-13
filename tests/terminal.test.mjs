import { terminalWidth } from "../src/terminal.mjs";
test("terminal helper returns a safe width", () => {
  expect(terminalWidth()).toBe(120);
});
