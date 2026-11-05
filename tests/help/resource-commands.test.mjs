import { resourceCommandHelp } from "../../src/help/resource-commands.mjs";
test("resource command help describes DNS creation requirements", () => {
  const help = resourceCommandHelp("dns-records create");
  expect(help).toContain("Create DNS record.");
  expect(help).toContain(
    "cfhub dns-records create --zone-id <zone_id> --data <json> | --file <path>",
  );
  expect(help).toContain("DEFAULTS");
});

test("returns null for unknown resource commands", () => {
  expect(resourceCommandHelp("unknown action")).toBeNull();
});
