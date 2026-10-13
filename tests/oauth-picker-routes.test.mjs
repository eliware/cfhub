import { jest } from "@jest/globals";
import { EventEmitter } from "node:events";
import { serveOAuthPickerRoute } from "../src/oauth-picker-routes.mjs";

test("OAuth picker serves its landing page and filters requested scopes", async () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const request = { method: "GET", headers: {} };
  expect(
    serveOAuthPickerRoute({
      request,
      response,
      url: new URL("http://localhost/"),
      scopePicker: true,
    }),
  ).toBe(true);
  expect(response.writeHead).toHaveBeenCalledWith(
    200,
    expect.objectContaining({
      "cache-control": "no-store",
    }),
  );
  const post = new EventEmitter();
  post.method = "POST";
  post.headers = {};
  const redirect = { writeHead: jest.fn(), end: jest.fn() };
  const selected = jest.fn();
  const handled = serveOAuthPickerRoute({
    request: post,
    response: redirect,
    url: new URL("http://localhost/oauth/start"),
    scopePicker: true,
    scopes: ["zone.read"],
    requiredScopes: ["account.read"],
    setSelectedScopes: selected,
    makeAuthorization: (scopes, offline) =>
      new URL(`http://auth.test/?scope=${scopes.join(",")}&offline=${offline}`),
  });
  post.emit("data", "scope=invalid&scope=zone.read&keep-signed-in=on");
  post.emit("end");
  await new Promise((resolve) => setImmediate(resolve));
  expect(handled).toBe(true);
  expect(selected).toHaveBeenCalledWith(["account.read", "zone.read"]);
  expect(redirect.writeHead.mock.calls[0][1].location).toContain("offline=true");
});

test("OAuth picker route handler is exported", () => {
  expect(serveOAuthPickerRoute).toEqual(expect.any(Function));
});
