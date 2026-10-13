import { renderTemplate } from "../src/template-rendering.mjs";

test("renders selected values and empty text for null values", () => {
  expect(renderTemplate({ name: "example.com", count: 2 }, "{{.name}} ({{count}})")).toBe(
    "example.com (2)",
  );
  expect(renderTemplate({ name: null }, "{{.name}}")).toBe("");
});
