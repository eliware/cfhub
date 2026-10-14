import { EventEmitter } from "node:events";
import { jest } from "@jest/globals";
import { serveOAuthPickerSubmitRoute } from "../src/oauth-picker-submit-route.mjs";

test("filters requested scopes and redirects to authorization", async () => {
  const request = new EventEmitter();
  request.method = "POST";
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const selected = jest.fn();
  const handled = serveOAuthPickerSubmitRoute({
    request,
    response,
    url: new URL("http://localhost/oauth/start"),
    scopePicker: true,
    scopes: ["zone.read"],
    requiredScopes: ["user-details.read"],
    setSelectedScopes: selected,
    makeAuthorization: (scopes, keep) =>
      new URL(`https://auth.test/?scopes=${scopes.join(",")}&keep=${keep}`),
  });
  request.emit("data", "scope=invalid&keep-signed-in=on");
  request.emit("end");
  await new Promise((resolve) => setImmediate(resolve));
  expect(handled).toBe(true);
  expect(selected).toHaveBeenCalledWith(["user-details.read", "zone.read"]);
  expect(response.writeHead).toHaveBeenCalledWith(
    302,
    expect.objectContaining({ location: expect.stringContaining("keep=true") }),
  );
  expect(response.end).toHaveBeenCalled();
});

test("ignores requests when the picker is disabled", async () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const request = new EventEmitter();
  request.method = "POST";
  expect(
    serveOAuthPickerSubmitRoute({
      request,
      response,
      url: new URL("http://localhost/oauth/start"),
      scopePicker: false,
      scopes: [],
      requiredScopes: [],
      setSelectedScopes: jest.fn(),
      makeAuthorization: jest.fn(),
    }),
  ).toBe(false);
});

test("reports authorization URL errors and rejects the OAuth callback", async () => {
  const request = new EventEmitter();
  request.method = "POST";
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const error = new Error("invalid OAuth setup");
  serveOAuthPickerSubmitRoute({
    request,
    response,
    url: new URL("http://localhost/oauth/start"),
    scopePicker: true,
    scopes: [],
    requiredScopes: [],
    setSelectedScopes: jest.fn(),
    makeAuthorization: () => {
      throw error;
    },
  });
  request.emit("end");
  await new Promise((resolve) => setImmediate(resolve));
  expect(response.writeHead).toHaveBeenCalledWith(500, {
    "content-type": "text/plain; charset=utf-8",
  });
  expect(response.end).toHaveBeenCalledWith("OAuth setup failed");
});

test("returns 413 for an oversized OAuth form", async () => {
  const request = new EventEmitter();
  request.method = "POST";
  const response = { writeHead: jest.fn(), end: jest.fn() };
  serveOAuthPickerSubmitRoute({
    request,
    response,
    url: new URL("http://localhost/oauth/start"),
    scopePicker: true,
    scopes: [],
    requiredScopes: [],
    setSelectedScopes: jest.fn(),
    makeAuthorization: jest.fn(),
  });
  request.emit("data", Buffer.alloc(16 * 1024 + 1, 97));
  await new Promise((resolve) => setImmediate(resolve));
  expect(response.writeHead).toHaveBeenCalledWith(413, {
    "content-type": "text/plain; charset=utf-8",
  });
  expect(response.end).toHaveBeenCalledWith("Request body is too large");
});
