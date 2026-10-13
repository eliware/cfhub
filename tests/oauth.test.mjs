import { jest } from "@jest/globals";
import { loginOAuth } from "../src/oauth.mjs";
import http from "node:http";
import { verifyOAuthPickerIntegration } from "../test-fixtures/unit/oauth-picker-integration.mjs";

test("OAuth login validates client configuration before opening a browser", async () => {
  await expect(loginOAuth({ clientId: "" })).rejects.toThrow("Missing CFHUB_OAUTH_CLIENT_ID");
});

test("OAuth login reports a browser launcher that throws", async () => {
  const printed = [];
  let closeServer;
  let closeDelay;
  const promise = loginOAuth({
    clientId: "client",
    ports: [0],
    open: () => {
      throw new Error("launcher unavailable");
    },
    print: (value) => printed.push(value),
    setTimeoutImpl: (callback, delay) => {
      closeServer = callback;
      closeDelay = delay;
    },
    fetchImpl: jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ access_token: "access" }) }),
  });
  await new Promise((resolve) => setTimeout(resolve, 10));
  const authorization = new URL(printed[0].match(/https?:\/\/\S+/)[0]);
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
  await expect(promise).resolves.toMatchObject({ accessToken: "access" });
  expect(closeDelay).toBe(250);
  closeServer();
  expect(printed).toEqual(
    expect.arrayContaining([expect.stringContaining("Could not open a browser automatically")]),
  );
});

test("OAuth login opens the scope picker before authorization", async () => {
  const printed = [];
  let closeServer;
  const promise = loginOAuth({
    clientId: "client",
    ports: [0],
    scopePicker: true,
    scopes: ["zone.read"],
    open: jest.fn(),
    print: (value) => printed.push(value),
    setTimeoutImpl: (callback) => (closeServer = callback),
    fetchImpl: jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "access" }),
    }),
  });
  await new Promise((resolve) => setTimeout(resolve, 10));
  const pickerUrl = new URL(printed[0].split(": ").at(-1));
  const startResponse = await fetch(new URL("/oauth/start", pickerUrl), {
    method: "POST",
    redirect: "manual",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "scope=zone.read",
  });
  const authorization = new URL(startResponse.headers.get("location"));
  const callbackUrl = new URL(authorization.searchParams.get("redirect_uri"));
  callbackUrl.searchParams.set("state", authorization.searchParams.get("state"));
  callbackUrl.searchParams.set("code", "code");
  await fetch(callbackUrl);
  await expect(promise).resolves.toMatchObject({ accessToken: "access" });
  expect(printed[0]).toContain("set up cfhub");
  closeServer();
});

test("OAuth login falls back when the first callback port is busy", async () => {
  const occupied = http.createServer();
  await new Promise((resolve) => occupied.listen(8765, "127.0.0.1", resolve));
  try {
    const printed = [];
    const promise = loginOAuth({
      clientId: "client",
      ports: [8765, 0],
      open: jest.fn(),
      print: (value) => printed.push(value),
      fetchImpl: jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: "access" }),
      }),
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    const authorization = new URL(printed[0].match(/https?:\/\/\S+/)[0]);
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
    await expect(promise).resolves.toMatchObject({ accessToken: "access" });
  } finally {
    await new Promise((resolve) => occupied.close(resolve));
  }
});

test("OAuth callback renders a generic provider failure", async () => {
  const printed = [];
  let closeServer;
  const promise = loginOAuth({
    clientId: "client",
    ports: [0],
    open: jest.fn(),
    print: (value) => printed.push(value),
    setTimeoutImpl: (callback) => (closeServer = callback),
  });
  const failure = promise.catch((error) => error);
  await new Promise((resolve) => setTimeout(resolve, 10));
  const authorization = new URL(printed[0].match(/https?:\/\/\S+/)[0]);
  await new Promise((resolve, reject) =>
    http
      .get(
        `${authorization.searchParams.get("redirect_uri")}?state=${authorization.searchParams.get("state")}&error=server_error`,
        (response) => {
          response.resume();
          response.on("end", resolve);
        },
      )
      .on("error", reject),
  );
  await expect(failure).resolves.toMatchObject({
    message: "Cloudflare authorization failed: server_error",
  });
  closeServer();
});

test(
  "OAuth picker serves its browser assets and summarizes zones and DNS",
  verifyOAuthPickerIntegration,
);
