import { jest } from "@jest/globals";
import { createOAuthCallback } from "../../src/oauth/callback.mjs";
import {
  getOAuthResponse,
  makeOAuthCallbackUrl,
  requestOAuthResponse,
  startOAuthTestLogin,
} from "../../test-fixtures/unit/oauth-http.mjs";
test("OAuth callback factory is exported", () => {
  expect(createOAuthCallback).toEqual(expect.any(Function));
});

test("OAuth picker setup errors reject the callback promise", async () => {
  let handleRequest;
  const server = { setOAuthRequestHandler: (handler) => (handleRequest = handler) };
  const error = new Error("invalid OAuth setup");
  const { callback } = createOAuthCallback({
    server,
    redirectUri: "http://localhost/oauth/callback",
    state: "state",
    scopePicker: true,
    scopes: [],
    requiredScopes: [],
    makeAuthorization: () => {
      throw error;
    },
  });
  const request = { method: "POST", url: "/oauth/start", headers: {}, body: "" };
  const response = { writeHead: jest.fn(), end: jest.fn() };
  const rejected = expect(callback).rejects.toBe(error);
  await handleRequest(request, response);
  await rejected;
  expect(response.writeHead).toHaveBeenCalledWith(500, expect.any(Object));
});

test("OAuth callback rejects requests with an invalid state", async () => {
  let handleRequest;
  const server = { setOAuthRequestHandler: (handler) => (handleRequest = handler) };
  const { callback } = createOAuthCallback({
    server,
    redirectUri: "http://localhost/oauth/callback",
    state: "expected",
    scopePicker: false,
    scopes: [],
    requiredScopes: [],
    makeAuthorization: jest.fn(),
  });
  const rejected = expect(callback).rejects.toThrow("login expired");
  await handleRequest(
    { method: "GET", url: "/oauth/callback?state=wrong", headers: {} },
    { writeHead: jest.fn(), end: jest.fn() },
  );
  await rejected;
});

test("OAuth login serves a state-protected callback and exchanges the code", async () => {
  const fetchImpl = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      access_token: "access",
      refresh_token: "refresh",
      expires_in: 30,
    }),
  });
  const { printed, promise, authorization, closeServer } = await startOAuthTestLogin({
    fetchImpl,
    open: () => {
      throw new Error("launcher unavailable");
    },
  });
  const wrongRoute = new URL(authorization.searchParams.get("redirect_uri"));
  wrongRoute.pathname = "/wrong";
  wrongRoute.searchParams.set("state", authorization.searchParams.get("state"));
  expect((await getOAuthResponse(wrongRoute)).statusCode).toBe(404);
  const callback = makeOAuthCallbackUrl(authorization, { code: "code" });
  await getOAuthResponse(callback);
  await expect(promise).resolves.toMatchObject({
    accessToken: "access",
    refreshToken: "refresh",
  });
  expect(fetchImpl).toHaveBeenCalledWith(
    "https://dash.cloudflare.com/oauth2/token",
    expect.any(Object),
  );
  expect(printed).toEqual(
    expect.arrayContaining([expect.stringContaining("Could not open a browser automatically")]),
  );
  closeServer();
});

test("OAuth scope picker opens a local setup page and redirects with selected scopes", async () => {
  const yearSpy = jest.spyOn(Date.prototype, "getUTCFullYear").mockReturnValue(2027);
  const fetchImpl = jest
    .fn()
    .mockImplementation(async (url) =>
      url.includes("/token")
        ? { ok: true, json: async () => ({ access_token: "access" }) }
        : { ok: false },
    );
  const {
    promise,
    printed,
    authorization: landing,
    closeServer,
  } = await startOAuthTestLogin({
    open: jest.fn(),
    fetchImpl,
    options: { scopePicker: true, scopes: ["zone.read"] },
  });
  expect(printed[0]).toContain("set up cfhub");
  const landingPage = await requestOAuthResponse(landing);
  expect(landingPage.body).toContain("Set up cfhub");
  expect(landingPage.body).toContain("scope-search");
  expect(landingPage.body).toContain("Keep me logged in");
  expect(landingPage.body).toContain("2026-2027");
  let authorization;
  const startUrl = new URL(landing);
  startUrl.pathname = "/oauth/start";
  expect((await requestOAuthResponse(startUrl, { method: "POST" })).statusCode).toBe(302);
  const selected = await requestOAuthResponse(startUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "scope=zone.read&scope=dns.write&keep-signed-in=on",
  });
  expect(selected.statusCode).toBe(302);
  authorization = new URL(selected.headers.location);
  expect(authorization.searchParams.get("scope")).toContain("dns.write");
  expect(authorization.searchParams.get("scope")).toContain("offline_access");
  const callback = new URL(landing);
  callback.pathname = "/oauth/callback";
  callback.search = `?state=${authorization.searchParams.get("state")}&code=code`;
  await requestOAuthResponse(callback);
  await expect(promise).resolves.toMatchObject({ accessToken: "access" });
  closeServer();
  yearSpy.mockRestore();
});
