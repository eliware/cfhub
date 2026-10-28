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
  const request = { method: "POST", headers: { origin: "http://localhost" }, body: "" };
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

test("OAuth picker route only serves version data when the picker is enabled", async () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  expect(
    await serveOAuthPickerRoute({
      request: { method: "GET", headers: {} },
      response,
      url: new URL("http://localhost/api/version?project=cfhub"),
      scopePicker: false,
    }),
  ).toBe(false);
  expect(response.end).not.toHaveBeenCalled();
});

test("OAuth picker route serves version and static asset requests", async () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  expect(
    await serveOAuthPickerRoute({
      request: { method: "GET", headers: {} },
      response,
      url: new URL("http://localhost/api/version?project=cfhub"),
      scopePicker: true,
    }),
  ).toBe(true);
  expect(
    await serveOAuthPickerRoute({
      request: { method: "GET", headers: {} },
      response,
      url: new URL("http://localhost/oauth-picker.css"),
      scopePicker: true,
    }),
  ).toBe(true);
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
