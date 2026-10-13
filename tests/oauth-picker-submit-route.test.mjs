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
  request.emit("data", "scope=invalid&scope=zone.read&keep-signed-in=on");
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

test("uses default scopes and ignores unrelated requests", async () => {
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
  const selected = jest.fn();
  const authorize = jest.fn(() => new URL("https://auth.test/"));
  serveOAuthPickerSubmitRoute({
    request,
    response,
    url: new URL("http://localhost/oauth/start"),
    scopePicker: true,
    scopes: ["zone.read"],
    requiredScopes: ["user-details.read"],
    setSelectedScopes: selected,
    makeAuthorization: authorize,
  });
  request.emit("data", "scope=invalid");
  request.emit("end");
  await new Promise((resolve) => setImmediate(resolve));
  expect(selected).toHaveBeenCalledWith(["user-details.read", "zone.read"]);
  expect(authorize).toHaveBeenCalledWith(["user-details.read", "zone.read"], false);
});
