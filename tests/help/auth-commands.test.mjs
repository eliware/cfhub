import { authCommandHelp } from "../../src/help/auth-commands.mjs";
test("auth command help describes login", () => {
  expect(authCommandHelp("auth login")).toContain("USAGE");
});

test("returns null for unknown auth commands", () => {
  expect(authCommandHelp("auth unknown")).toBeNull();
});
