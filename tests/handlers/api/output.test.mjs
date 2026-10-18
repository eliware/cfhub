import { renderApiOutput } from "../../../src/handlers/api/output.mjs";

test("formats selected API output as JSON or a template", () => {
  const result = { result: [{ name: "zone" }], total: 1 };
  expect(renderApiOutput(result, { jq: ".result[].name" })).toBe(JSON.stringify(["zone"], null, 2));
  expect(renderApiOutput(result, { jq: ".total", template: "count={{.}}" })).toBe("count=1");
  expect(renderApiOutput(result, {})).toBe(JSON.stringify(result, null, 2));
});
