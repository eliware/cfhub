import { jest } from "@jest/globals";
import { serveOAuthPickerRoute } from "../../../src/oauth/picker/routes.mjs";
test("OAuth picker route dispatches its landing page", async () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const handled = await serveOAuthPickerRoute({
    request: { method: "GET", headers: {} },
    response,
    url: new URL("http://localhost/"),
    scopePicker: true,
  });
  expect(handled).toBe(true);
  expect(response.end).toHaveBeenCalled();
});

test("OAuth picker route dispatches submit requests", async () => {
  const request = { method: "POST", headers: {}, body: "" };
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const handled = await serveOAuthPickerRoute({
    request,
    response,
    url: new URL("http://localhost/oauth/start"),
    scopePicker: true,
    scopes: [],
    requiredScopes: [],
    setSelectedScopes: jest.fn(),
    makeAuthorization: () => new URL("http://auth.test/"),
  });
  expect(handled).toBe(true);
  expect(response.end).toHaveBeenCalled();
});

test("OAuth picker route leaves unrelated requests open", async () => {
  expect(
    await serveOAuthPickerRoute({
      request: { method: "GET", headers: {} },
      response: { writeHead: jest.fn(), end: jest.fn() },
      url: new URL("http://localhost/unmatched"),
      scopePicker: false,
    }),
  ).toBe(false);
});
