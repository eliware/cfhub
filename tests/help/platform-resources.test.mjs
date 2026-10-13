import { platformResourceHelp } from "../../src/help/platform-resources.mjs";
test("platform help covers extensions", () => {
  expect(platformResourceHelp("extension")).toContain("install");
});

test("returns null for unknown platform resources", () => {
  expect(platformResourceHelp("unknown-resource")).toBeNull();
});
