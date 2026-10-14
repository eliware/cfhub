import { authCommandHelp } from "../../src/help/auth-commands.mjs";
test("auth command help describes login", () => {
  expect(authCommandHelp("auth login")).toContain("USAGE");
  expect(authCommandHelp("auth login")).toContain("Account API Token");
});

test("auth login help provides API token setup steps", () => {
  const help = authCommandHelp("auth login");
  expect(help).toContain("Manage account > Account API tokens");
  expect(help).toContain("Copy Your API Token");
  expect(help).toContain("Copy the Account ID");
});

test("returns null for unknown auth commands", () => {
  expect(authCommandHelp("auth unknown")).toBeNull();
});
