import { localCommandHelp } from "../../src/help/local-commands.mjs";
test("local command help describes alias setup", () => {
  expect(localCommandHelp("alias set")).toContain("Save a command alias");
});

test("returns null for unknown local commands", () => {
  expect(localCommandHelp("unknown command")).toBeNull();
});
