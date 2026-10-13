import { successExamples } from "../src/oauth-success-examples.mjs";

test("builds examples for enabled modules and escapes the zone name", () => {
  const examples = successExamples(
    [{ id: "zones" }, { id: "dns" }, { id: "workers" }, { id: "zone-settings" }],
    [{ name: "<example>.com" }],
  );
  expect(examples).toContain("cfhub zone list");
  expect(examples).toContain("cfhub dns record list --zone &lt;example&gt;.com");
  expect(examples).toContain("cfhub workers list");
  expect(examples).toContain("cfhub zone settings list");
});

test("uses an example zone when no zone result exists", () => {
  expect(successExamples([{ id: "dns" }], [])).toContain("--zone example.com");
  expect(successExamples([], [])).toBe("");
});
