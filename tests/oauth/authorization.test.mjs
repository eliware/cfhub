import { EventEmitter } from "node:events";
import { jest } from "@jest/globals";
import { loginOAuth } from "../../src/oauth.mjs";
import { createOAuthAuthorization } from "../../src/oauth/authorization.mjs";
import {
  getOAuthResponse,
  makeOAuthCallbackUrl,
  startOAuthTestLogin,
} from "../../test-fixtures/unit/oauth-http.mjs";
test("OAuth authorization builder is exported", () => {
  expect(createOAuthAuthorization).toEqual(expect.any(Function));
});

test("OAuth authorization toggles offline access", () => {
  const { makeAuthorization } = createOAuthAuthorization({
    clientId: "client",
    redirectUri: "http://localhost/callback",
  });
  expect(makeAuthorization(["read"]).searchParams.get("scope")).toBe("read");
  expect(makeAuthorization(["read"], true).searchParams.get("scope")).toBe("read offline_access");
});

test("OAuth callback reports token exchange and response errors", async () => {
  for (const [fetchImpl, message] of [
    [jest.fn().mockResolvedValue({ ok: false, status: 500 }), "OAuth token request failed"],
    [
      jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
      "OAuth token response did not include",
    ],
  ]) {
    const { promise, authorization } = await startOAuthTestLogin({
      fetchImpl,
      open: jest.fn(),
      setTimeoutImpl: (callback) => callback(),
    });
    const rejection = expect(promise).rejects.toThrow(message);
    await getOAuthResponse(makeOAuthCallbackUrl(authorization, { code: "code" }));
    await rejection;
  }
});

test("OAuth login reports exhausted and non-retryable callback listeners", async () => {
  class FailingServer extends EventEmitter {
    constructor(code) {
      super();
      this.code = code;
    }
    listen() {
      process.nextTick(() =>
        this.emit("error", Object.assign(new Error(this.code), { code: this.code })),
      );
    }
    close() {}
  }
  await expect(
    loginOAuth({
      clientId: "client",
      ports: [1, 2],
      serverFactory: () => new FailingServer("EADDRINUSE"),
      open: jest.fn(),
    }),
  ).rejects.toThrow("No OAuth callback ports are available");
  await expect(
    loginOAuth({
      clientId: "client",
      ports: [1],
      serverFactory: () => new FailingServer("EACCES"),
      open: jest.fn(),
    }),
  ).rejects.toThrow("EACCES");
  const occupiedError = Object.assign(new Error("busy"), {
    code: "EADDRINUSE",
  });
  await expect(
    loginOAuth({
      clientId: "client",
      ports: [1],
      serverFactory: () => {
        throw occupiedError;
      },
      open: jest.fn(),
    }),
  ).rejects.toThrow("No OAuth callback ports are available");
});

test("OAuth login accepts a callback server without an address object", async () => {
  class ListeningServer extends EventEmitter {
    once(...args) {
      return super.once(...args);
    }
    listen() {
      process.nextTick(() => this.emit("listening"));
    }
    address() {
      return undefined;
    }
    close() {}
  }
  const server = new ListeningServer();
  const printed = [];
  let resolveOpened;
  const opened = new Promise((resolve) => {
    resolveOpened = resolve;
  });
  const promise = loginOAuth({
    clientId: "client",
    ports: [4321],
    serverFactory: () => server,
    open: () => resolveOpened(),
    print: (value) => printed.push(value),
    fetchImpl: jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "access" }),
    }),
    setTimeoutImpl: (callback) => callback(),
  });
  await opened;
  const authorization = new URL(printed[0].match(/https?:\/\/\S+/)[0]);
  const response = { writeHead: jest.fn(), end: jest.fn() };
  server.emit(
    "request",
    {
      url: `/oauth/callback?state=${authorization.searchParams.get("state")}&code=code`,
    },
    response,
  );
  await expect(promise).resolves.toMatchObject({ accessToken: "access" });
});
