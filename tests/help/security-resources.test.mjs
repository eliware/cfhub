import { securityResourceHelp } from "../../src/help/security-resources.mjs";
test("security help covers cache purge", () => {
  expect(securityResourceHelp("cache")).toContain("Purge");
});

test("returns null for unknown security resources", () => {
  expect(securityResourceHelp("unknown-resource")).toBeNull();
});
