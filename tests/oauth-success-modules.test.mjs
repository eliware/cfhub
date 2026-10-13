import { successModuleCards } from "../src/oauth-success-modules.mjs";

test("module cards render enabled modules and disabled scope requirements", () => {
  const enabled = [{ name: "Zone <tools>" }];
  const cards = successModuleCards(enabled);
  expect(cards.enabled).toContain("Zone &lt;tools&gt;");
  expect(cards.enabled).toContain("Enabled · ready for its selected scopes.");
  expect(cards.disabled).toContain("Requires:");
});
test("module cards render no enabled items when selection is empty", () => {
  expect(successModuleCards([]).enabled).toBe("");
});
