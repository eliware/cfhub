import { renderTemplate, selectJson } from "../src/output-selection.mjs";

test("selects nested values and array properties", () => {
  const value = { result: [{ name: "a" }, { name: "b" }], meta: { count: 2 } };
  expect(selectJson(value, ".meta.count")).toBe(2);
  expect(selectJson(value, ".result[]")).toEqual(value.result);
  expect(selectJson(value, ".result[].name")).toEqual(["a", "b"]);
  expect(selectJson(value, ".missing[]")).toEqual([]);
  expect(selectJson(value, ".")).toBe(value);
});

test("renders selected values and empty text for null values", () => {
  expect(renderTemplate({ name: "example.com", count: 2 }, "{{.name}} ({{count}})")).toBe(
    "example.com (2)",
  );
  expect(renderTemplate({ name: null }, "{{.name}}")).toBe("");
});
