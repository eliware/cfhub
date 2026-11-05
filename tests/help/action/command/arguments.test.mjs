import { positional } from "../../../../src/help/action/command/arguments.mjs";

test("formats positional values for local commands", () => {
  expect(positional("alias", "set")).toBe("<name> <command>");
  expect(positional("config", "set")).toBe("<name> <value>");
  expect(positional("extension", "install")).toBe("--path <directory>");
  expect(positional("extension", "remove")).toBe("--name <name>");
  expect(positional("api", "request")).toBe("");
});
