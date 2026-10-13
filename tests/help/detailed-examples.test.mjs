import { detailedExamples } from "../../src/help/detailed-examples.mjs";
test("detailed help examples list CLI commands", () => {
  expect(detailedExamples()).toContain("cfhub zones list");
});
