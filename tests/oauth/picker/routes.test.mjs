import { jest } from "@jest/globals";
import { EventEmitter } from "node:events";
import { serveOAuthPickerRoute } from "../../../src/oauth/picker/routes.mjs";
test("OAuth picker route dispatches its landing page", () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const handled = serveOAuthPickerRoute({
    request: { method: "GET", headers: {} },
    response,
    url: new URL("http://localhost/"),
    scopePicker: true,
  });
  expect(handled).toBe(true);
  expect(response.end).toHaveBeenCalled();
});

test("OAuth picker route dispatches submit requests", async () => {
  const request = new EventEmitter();
  request.method = "POST";
  request.headers = {};
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const handled = serveOAuthPickerRoute({
    request,
    response,
    url: new URL("http://localhost/oauth/start"),
    scopePicker: true,
    scopes: [],
    requiredScopes: [],
    setSelectedScopes: jest.fn(),
    makeAuthorization: () => new URL("http://auth.test/"),
  });
  request.emit("data", "");
  request.emit("end");
  await Promise.resolve();
  await Promise.resolve();
  expect(handled).toBe(true);
  expect(response.end).toHaveBeenCalled();
});

test("OAuth picker route leaves unrelated requests open", () => {
  expect(
    serveOAuthPickerRoute({
      request: { method: "GET", headers: {} },
      response: { writeHead: jest.fn(), end: jest.fn() },
      url: new URL("http://localhost/unmatched"),
      scopePicker: false,
    }),
  ).toBe(false);
});
