import { securityResourceHelp } from "../../src/help/security-resources.mjs";
test("security help covers cache purge", () => {
  expect(securityResourceHelp("cache")).toContain("Purge");
});
