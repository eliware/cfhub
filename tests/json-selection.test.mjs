import { selectJson } from "../src/json-selection.mjs";

test("selects nested values and array properties", () => {
  const value = { result: [{ name: "a" }, { name: "b" }], meta: { count: 2 } };
  expect(selectJson(value, ".meta.count")).toBe(2);
  expect(selectJson(value, ".result[]")).toEqual(value.result);
  expect(selectJson(value, ".result[].name")).toEqual(["a", "b"]);
  expect(selectJson(value, ".missing[]")).toEqual([]);
  expect(selectJson(value, ".")).toBe(value);
});
