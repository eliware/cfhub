import { resourceCommandHelp } from "../../src/help/resource-commands.mjs";
test("resource command help describes DNS creation", () => {
  expect(resourceCommandHelp("dns-records create")).toContain("Create a DNS record");
});
