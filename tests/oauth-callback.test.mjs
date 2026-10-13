import { jest } from "@jest/globals";
import { loginOAuth } from "../src/oauth.mjs";
import http from "node:http";

import { createOAuthCallback } from "../src/oauth-callback.mjs";

test("OAuth callback factory is exported", () => {
  expect(createOAuthCallback).toEqual(expect.any(Function));
});

test("OAuth login serves a state-protected callback and exchanges the code", async () => {
  const printed = [];
  const fetchImpl = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      access_token: "access",
      refresh_token: "refresh",
      expires_in: 30,
    }),
  });
  const resultPromise = loginOAuth({
    clientId: "client",
    ports: [0],
    open: jest.fn(),
    print: (value) => printed.push(value),
    fetchImpl,
  });
  await new Promise((resolve) => setTimeout(resolve, 10));
  const authorization = new URL(printed[0].match(/https?:\/\/\S+/)[0]);
  await new Promise((resolve, reject) =>
    http
      .get(
        `${authorization.searchParams.get("redirect_uri").replace("/oauth/callback", "/wrong")}?state=${authorization.searchParams.get("state")}`,
        (response) => {
          expect(response.statusCode).toBe(404);
          response.resume();
          response.on("end", resolve);
        },
      )
      .on("error", reject),
  );
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
  await expect(resultPromise).resolves.toMatchObject({
    accessToken: "access",
    refreshToken: "refresh",
  });
  expect(fetchImpl).toHaveBeenCalledWith(
    "https://dash.cloudflare.com/oauth2/token",
    expect.any(Object),
  );
});

test("OAuth scope picker opens a local setup page and redirects with selected scopes", async () => {
  const yearSpy = jest.spyOn(Date.prototype, "getUTCFullYear").mockReturnValue(2027);
  const printed = [];
  const fetchImpl = jest
    .fn()
    .mockImplementation(async (url) =>
      url.includes("/token")
        ? { ok: true, json: async () => ({ access_token: "access" }) }
        : { ok: false },
    );
  const promise = loginOAuth({
    clientId: "client",
    scopePicker: true,
    scopes: ["zone.read"],
    ports: [0],
    open: jest.fn(),
    print: (value) => printed.push(value),
    fetchImpl,
  });
  await new Promise((resolve) => setTimeout(resolve, 10));
  const landing = new URL(printed[0].match(/https?:\/\/\S+/)[0]);
  await new Promise((resolve, reject) =>
    http
      .get(landing, (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          expect(body).toContain("Set up cfhub");
          expect(body).toContain("scope-search");
          expect(body).toContain("Keep me logged in");
          expect(body).toContain("2026-2027");
          resolve();
        });
      })
      .on("error", reject),
  );
  let authorization;
  const startUrl = new URL(landing);
  startUrl.pathname = "/oauth/start";
  await new Promise((resolve, reject) => {
    const request = http.request(startUrl, { method: "POST" }, (response) => {
      expect(response.statusCode).toBe(302);
      response.resume();
      response.on("end", resolve);
    });
    request.on("error", reject);
    request.end();
  });
  await new Promise((resolve, reject) => {
    const request = http.request(
      startUrl,
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
      },
      (response) => {
        expect(response.statusCode).toBe(302);
        authorization = new URL(response.headers.location);
        expect(authorization.searchParams.get("scope")).toContain("dns.write");
        expect(authorization.searchParams.get("scope")).toContain("offline_access");
        response.resume();
        response.on("end", resolve);
      },
    );
    request.on("error", reject);
    request.end("scope=zone.read&scope=dns.write&keep-signed-in=on");
  });
  const callback = new URL(landing);
  callback.pathname = "/oauth/callback";
  callback.search = `?state=${authorization.searchParams.get("state")}&code=code`;
  await new Promise((resolve, reject) =>
    http
      .get(callback, (response) => {
        response.resume();
        response.on("end", resolve);
      })
      .on("error", reject),
  );
  await expect(promise).resolves.toMatchObject({ accessToken: "access" });
  yearSpy.mockRestore();
});
