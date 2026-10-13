import { coreResourceHelp } from "../../src/help/core-resources.mjs";
test("core help covers DNS commands", () => {
  expect(coreResourceHelp("dns-records")).toContain("diff");
});

test("returns null for resources without core help", () => {
  expect(coreResourceHelp("unknown-resource")).toBeNull();
});
