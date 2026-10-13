import { authCommandHelp } from "../../src/help/auth-commands.mjs";
test("auth command help describes login", () => {
  expect(authCommandHelp("auth login")).toContain("USAGE");
});
