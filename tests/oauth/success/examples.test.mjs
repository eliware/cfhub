import { successExamples } from "../../../src/oauth/success/examples.mjs";

test("builds examples for enabled modules and escapes the zone name", () => {
  const examples = successExamples(
    [{ id: "zones" }, { id: "dns" }, { id: "workers" }, { id: "zone-settings" }],
    [{ id: "zone-id", name: "<example>.com" }],
  );
  expect(examples).toContain("cfhub zones list");
  expect(examples).toContain("cfhub dns-records list --zone-id zone-id");
  expect(examples).toContain("cfhub workers list");
  expect(examples).toContain("cfhub zone-settings get --zone-id zone-id --setting &lt;name&gt;");
});

test("uses an example zone when no zone result exists", () => {
  expect(successExamples([{ id: "dns" }], [])).toContain("--zone-id &lt;zone_id&gt;");
  expect(successExamples([], [])).toBe("");
});
