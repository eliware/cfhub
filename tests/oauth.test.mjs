import { jest } from "@jest/globals";
import { EventEmitter } from "node:events";
import { loginOAuth } from "../src/oauth.mjs";
import { verifyOAuthPickerIntegration } from "../test-fixtures/unit/oauth-picker-integration.mjs";
import {
  getOAuthResponse,
  makeOAuthCallbackUrl,
  requestOAuthResponse,
  startOAuthTestLogin,
} from "../test-fixtures/unit/oauth-http.mjs";

test("OAuth login validates client configuration before opening a browser", async () => {
  await expect(loginOAuth({ clientId: "" })).rejects.toThrow("Missing CFHUB_OAUTH_CLIENT_ID");
});

test("OAuth callback reports provider and browser errors", async () => {
  const browser = new EventEmitter();
  let closeServer;
  const { printed, promise, authorization } = await startOAuthTestLogin({
    open: () => browser,
    setTimeoutImpl: (callback) => (closeServer = callback),
  });
  const failure = promise.catch((error) => error);
  browser.emit("error", { message: "no opener" });
  await getOAuthResponse(makeOAuthCallbackUrl(authorization, { error: "access_denied" }));
  await expect(failure).resolves.toMatchObject({
    message: "Cloudflare authorization failed: access_denied",
  });
  closeServer();
  expect(printed).toEqual(expect.arrayContaining([expect.stringContaining("no opener")]));
});

test("OAuth login opens the scope picker before authorization", async () => {
  let closeServer;
  const {
    printed,
    promise,
    authorization: pickerUrl,
  } = await startOAuthTestLogin({
    open: jest.fn(),
    setTimeoutImpl: (callback) => (closeServer = callback),
    fetchImpl: jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "access" }),
    }),
    options: { scopePicker: true, scopes: ["zone.read"] },
  });
  const pickerPage = new URL(printed[0].split(": ").at(-1));
  const startResponse = await requestOAuthResponse(new URL("/oauth/start", pickerPage), {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "scope=zone.read",
  });
  const authorization = new URL(startResponse.headers.location);
  await getOAuthResponse(makeOAuthCallbackUrl(authorization, { code: "code" }));
  await expect(promise).resolves.toMatchObject({ accessToken: "access" });
  expect(printed[0]).toContain("set up cfhub");
  expect(pickerUrl.pathname).toBe("/");
  closeServer();
});

test("OAuth login falls back when the first callback port is busy", async () => {
  const servers = [];
  const serverFactory = jest.fn(() => {
    const server = new EventEmitter();
    const port = servers.length ? 43210 : 8765;
    server.listen = () =>
      queueMicrotask(() =>
        server.emit(
          servers.length === 1 ? "error" : "listening",
          Object.assign(new Error("Address in use"), { code: "EADDRINUSE" }),
        ),
      );
    server.address = () => ({ port });
    server.close = jest.fn();
    servers.push(server);
    return server;
  });
  const fetchImpl = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ access_token: "access" }),
  });
  const { promise, authorization, closeServer } = await startOAuthTestLogin({
    open: jest.fn(),
    fetchImpl,
    options: { ports: [8765, 0], serverFactory },
  });
  const callbackUrl = new URL(authorization.searchParams.get("redirect_uri"));
  expect(callbackUrl.port).toBe("43210");
  const callback = makeOAuthCallbackUrl(authorization, { code: "code" });
  const request = { method: "GET", url: `${callback.pathname}${callback.search}` };
  servers[1].emit("request", request, { writeHead: jest.fn(), end: jest.fn() });
  await expect(promise).resolves.toMatchObject({ accessToken: "access" });
  closeServer();
});

test("OAuth callback renders a generic provider failure", async () => {
  let closeServer;
  const { promise, authorization } = await startOAuthTestLogin({
    open: jest.fn(),
    setTimeoutImpl: (callback) => (closeServer = callback),
  });
  const failure = promise.catch((error) => error);
  await getOAuthResponse(makeOAuthCallbackUrl(authorization, { error: "server_error" }));
  await expect(failure).resolves.toMatchObject({
    message: "Cloudflare authorization failed: server_error",
  });
  closeServer();
});

test(
  "OAuth picker serves its browser assets and summarizes zones and DNS",
  verifyOAuthPickerIntegration,
);
