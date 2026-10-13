import { jest } from "@jest/globals";
import { validateApiRequest } from "../../src/handlers/api-request-validation.mjs";

test("normalizes relative paths and methods", () => {
  expect(
    validateApiRequest({ action: "zones", opts: { method: "get" }, body: null, fail: jest.fn() }),
  ).toEqual({ path: "/zones", method: "GET" });
});

test("rejects invalid paths, methods, bodies, and unsafe deletes", () => {
  for (const [action, opts, body] of [
    ["", {}, null],
    ["https://example.test", {}, null],
    ["zones", { method: "TRACE" }, null],
    ["zones", {}, {}],
    ["zones", { method: "DELETE" }, null],
  ]) {
    const fail = jest.fn();
    expect(validateApiRequest({ action, opts, body, fail })).toBeNull();
    expect(fail).toHaveBeenCalled();
  }
});
