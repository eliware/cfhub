import { jest } from "@jest/globals";
import { validateApiRequest } from "../../../src/handlers/api/request-validation.mjs";

test("normalizes relative paths and methods", () => {
  expect(
    validateApiRequest({ action: "zones", opts: { method: "get" }, body: null, fail: jest.fn() }),
  ).toEqual({ path: "/zones", method: "GET" });
});

test("rejects invalid paths, methods, bodies, and unsafe deletes", () => {
  for (const [action, opts, body] of [
    ["", {}, null],
    ["https://example.test", {}, null],
    ["zones/../user/tokens", {}, null],
    ["zones/%2e%2e/user/tokens", {}, null],
    ["zones/%252e%252e/user/tokens", {}, null],
    ["zones/%25252e%25252e/user/tokens", {}, null],
    ["zones/%252e%25zz/user/tokens", {}, null],
    ["zones\\..\\user\\tokens", {}, null],
    ["zones/%zz", {}, null],
    ["zones", { method: "TRACE" }, null],
    ["zones", {}, {}],
    ["zones", { method: "DELETE" }, null],
  ]) {
    const fail = jest.fn();
    expect(validateApiRequest({ action, opts, body, fail })).toBeNull();
    expect(fail).toHaveBeenCalled();
  }
});

test("accepts leading slashes and dry-run deletes", () => {
  expect(validateApiRequest({ action: "/zones", opts: {}, body: null, fail: jest.fn() })).toEqual({
    path: "/zones",
    method: "GET",
  });
  expect(
    validateApiRequest({
      action: "zones/z1",
      opts: { method: "DELETE", "dry-run": true },
      body: null,
      fail: jest.fn(),
    }),
  ).toEqual({ path: "/zones/z1", method: "DELETE" });
});

test("requires force when dry-run is explicitly false for a DELETE", () => {
  const fail = jest.fn();
  expect(
    validateApiRequest({
      action: "zones/z1",
      opts: { method: "DELETE", "dry-run": false },
      body: null,
      fail,
    }),
  ).toBeNull();
  expect(fail).toHaveBeenCalledWith("Refusing DELETE without --force (or use --dry-run)");
});
