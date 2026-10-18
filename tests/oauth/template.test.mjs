import { renderOAuthTemplate } from "../../src/oauth/template.mjs";

test("replaces every OAuth template token with its value", () => {
  expect(
    renderOAuthTemplate("__NAME__ and __NAME__; __VERSION__", {
      __NAME__: "cfhub",
      __VERSION__: "12.0.0",
    }),
  ).toBe("cfhub and cfhub; 12.0.0");
});
