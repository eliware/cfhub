import { jest } from "@jest/globals";
import { loginOAuth } from "../src/oauth.mjs";
import http from "node:http";

import { createOAuthAuthorization } from "../src/oauth-authorization.mjs";

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
    [jest.fn().mockResolvedValue({ ok: false, status: 500 }), "OAuth token exchange failed"],
    [
      jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
      "OAuth token response did not include",
    ],
  ]) {
    const printed = [];
    const promise = loginOAuth({
      clientId: "client",
      ports: [0],
      open: jest.fn(),
      print: (value) => printed.push(value),
      fetchImpl,
      setTimeoutImpl: (callback) => callback(),
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    const authorization = new URL(printed[0].match(/https?:\/\/\S+/)[0]);
    const rejection = expect(promise).rejects.toThrow(message);
    await new Promise((resolve, reject) =>
      http
        .get(
          `${authorization.searchParams.get("redirect_uri")}?state=${authorization.searchParams.get("state")}&code=code`,
          (response) => {
            response.resume();
            response.on("end", resolve);
          },
        )
        .on("error", reject),
    );
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
  ).rejects.toThrow("No OAuth callback port available");
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
  ).rejects.toThrow("No OAuth callback port available");
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
  const promise = loginOAuth({
    clientId: "client",
    ports: [4321],
    serverFactory: () => server,
    open: jest.fn(),
    print: (value) => printed.push(value),
    fetchImpl: jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "access" }),
    }),
    setTimeoutImpl: (callback) => callback(),
  });
  await new Promise((resolve) => setTimeout(resolve, 10));
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
import { EventEmitter } from "node:events";
