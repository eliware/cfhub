import { fitTerminal, styleTerminalText } from "../../src/terminal/text.mjs";

test("fits terminal lines and styles multiline headers", () => {
  expect(fitTerminal("short\nlonger", 5)).toBe("short\nlong…");
  expect(fitTerminal("plain")).toBe("plain");
  expect(styleTerminalText("one\ntwo")).toBe("one\ntwo");
  expect(styleTerminalText("one\ntwo", { color: true })).toContain(
    "\u001b[1m\u001b[36mone\u001b[0m\ntwo",
  );
});
