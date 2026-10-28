import { jest } from "@jest/globals";
import { serveOAuthPickerSubmitRoute } from "../../../src/oauth/picker/submit-route.mjs";
test("filters requested scopes and redirects to authorization", async () => {
  const request = {
    method: "POST",
    headers: { origin: "http://localhost" },
    body: "scope=invalid&keep-signed-in=on",
  };
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const selected = jest.fn();
  const handled = await serveOAuthPickerSubmitRoute({
    request,
    response,
    url: new URL("http://localhost/oauth/start"),
    scopePicker: true,
    scopes: ["zone.read"],
    pickerScopes: ["dns.read"],
    requiredScopes: ["user-details.read"],
    setSelectedScopes: selected,
    makeAuthorization: (scopes, keep) =>
      new URL(`https://auth.test/?scopes=${scopes.join(",")}&keep=${keep}`),
  });
  expect(handled).toBe(true);
  expect(selected).toHaveBeenCalledWith(["user-details.read", "dns.read"]);
  expect(response.writeHead).toHaveBeenCalledWith(
    302,
    expect.objectContaining({ location: expect.stringContaining("keep=true") }),
  );
  expect(response.end).toHaveBeenCalled();
});

test("accepts a same-origin request without a form body", async () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  await serveOAuthPickerSubmitRoute({
    request: { method: "POST", headers: { origin: "http://localhost" } },
    response,
    url: new URL("http://localhost/oauth/start"),
    scopePicker: true,
    requiredScopes: [],
    setSelectedScopes: jest.fn(),
    makeAuthorization: () => new URL("http://auth.test/"),
  });
  expect(response.writeHead).toHaveBeenCalledWith(302, expect.any(Object));
});

test("ignores requests when the picker is disabled", async () => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const request = { method: "POST", headers: { origin: "http://localhost" }, body: "" };
  expect(
    await serveOAuthPickerSubmitRoute({
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
  const request = { method: "POST", headers: { origin: "http://localhost" }, body: "" };
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const error = new Error("invalid OAuth setup");
  await serveOAuthPickerSubmitRoute({
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
  expect(response.writeHead).toHaveBeenCalledWith(500, {
    "content-type": "text/plain; charset=utf-8",
  });
  expect(response.end).toHaveBeenCalledWith("OAuth setup failed");
});

test("returns 413 for an oversized OAuth form", async () => {
  const request = {
    method: "POST",
    headers: { origin: "http://localhost" },
    body: "a".repeat(16 * 1024 + 1),
  };
  const response = { writeHead: jest.fn(), end: jest.fn() };
  await serveOAuthPickerSubmitRoute({
    request,
    response,
    url: new URL("http://localhost/oauth/start"),
    scopePicker: true,
    scopes: [],
    requiredScopes: [],
    setSelectedScopes: jest.fn(),
    makeAuthorization: jest.fn(),
  });
  expect(response.writeHead).toHaveBeenCalledWith(413, {
    "content-type": "text/plain; charset=utf-8",
  });
  expect(response.end).toHaveBeenCalledWith("Request body is too large");
});

test.each([undefined, "https://attacker.test"])("rejects OAuth form Origin %s", async (origin) => {
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const selected = jest.fn();
  await serveOAuthPickerSubmitRoute({
    request: { method: "POST", headers: origin ? { origin } : {}, body: "" },
    response,
    url: new URL("http://localhost/oauth/start"),
    scopePicker: true,
    setSelectedScopes: selected,
    makeAuthorization: jest.fn(),
  });
  expect(response.writeHead).toHaveBeenCalledWith(403, {
    "content-type": "text/plain; charset=utf-8",
  });
  expect(selected).not.toHaveBeenCalled();
});
