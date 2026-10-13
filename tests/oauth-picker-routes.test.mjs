import { jest } from "@jest/globals";
import { loginOAuth } from "../src/oauth.mjs";
import http from "node:http";

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

test("OAuth picker serves its browser assets and summarizes zones and DNS", async () => {
  const printed = [];
  const browser = new EventEmitter();
  const open = jest.fn(() => browser);
  const fetchImpl = jest.fn().mockImplementation(async (url) => {
    if (url.includes("/token")) return { ok: true, json: async () => ({ access_token: "access" }) };
    if (url.endsWith("/user"))
      return { ok: true, json: async () => ({ result: { name: "Test account" } }) };
    if (url.includes("/zones?"))
      return { ok: true, json: async () => ({ result: [{ id: "zone-1", name: "example.com" }] }) };
    return {
      ok: true,
      json: async () => ({ result: [{ id: "record-1", name: "www.example.com" }] }),
    };
  });
  const promise = loginOAuth({
    clientId: "client",
    scopePicker: true,
    scopes: ["zone.read", "zone.write", "dns.read", "dns.write"],
    ports: [0],
    open,
    print: (value) => printed.push(value),
    fetchImpl,
    setTimeoutImpl: (callback) => callback(),
  });
  await new Promise((resolve) => setTimeout(resolve, 10));
  const landing = new URL(printed[0].match(/https?:\/\/\S+/)[0]);
  for (const path of [
    "/oauth-picker.css",
    "/oauth-picker.mjs",
    "/picker-groups.mjs",
    "/picker-events.mjs",
    "/picker-state.mjs",
    "/picker-navigation.mjs",
    "/oauth-web/cf-logo.svg",
    "/oauth-web/cloudflare-115x53.png",
    "/oauth-web/eliware-58x58.png",
    "/oauth-result.css",
  ]) {
    const response = await fetch(`http://127.0.0.1:${landing.port}${path}`);
    expect(response.status).toBe(200);
  }
  const missingProject = await fetch(
    `http://127.0.0.1:${landing.port}/api/version?project=missing`,
  );
  expect(missingProject.status).toBe(404);
  expect(await missingProject.json()).toEqual({ error: "Project not found: missing" });
  const missingProjectName = await fetch(`http://127.0.0.1:${landing.port}/api/version`);
  expect(await missingProjectName.json()).toEqual({ error: "Project not found: " });
  const version = await fetch(`http://127.0.0.1:${landing.port}/api/version?project=cfhub`);
  expect(version.status).toBe(200);
  expect((await version.json()).name).toBe("cfhub");
  const wrongMethod = await fetch(`http://127.0.0.1:${landing.port}/api/version?project=cfhub`, {
    method: "POST",
  });
  expect(wrongMethod.status).not.toBe(200);
  browser.emit("error", { code: "ENOENT" });
  const startResponse = await fetch(new URL("/oauth/start", landing), {
    method: "POST",
    redirect: "manual",
  });
  const authorization = new URL(startResponse.headers.get("location"));
  const state = authorization.searchParams.get("state");
  authorization.protocol = "http:";
  authorization.host = landing.host;
  authorization.pathname = "/oauth/callback";
  authorization.search = new URLSearchParams({ state, code: "code" }).toString();
  await new Promise((resolve, reject) =>
    http
      .get(authorization, (response) => {
        response.resume();
        response.on("end", resolve);
      })
      .on("error", reject),
  );
  await expect(promise).resolves.toMatchObject({ account: { name: "Test account" } });
});

test("OAuth success page confirms the account without exposing the token", async () => {
  const yearSpy = jest.spyOn(Date.prototype, "getUTCFullYear").mockReturnValue(2027);
  const printed = [];
  const responses = [];
  const fetchImpl = jest.fn().mockImplementation(async (url) =>
    url.includes("/token")
      ? {
          ok: true,
          json: async () => ({
            access_token: "secret-access",
            refresh_token: "refresh",
          }),
        }
      : url.includes("/zones?")
        ? { ok: true, json: async () => ({ result: [{ id: "zone-1", name: "example.com" }] }) }
        : url.includes("/dns_records?")
          ? { ok: true, json: async () => ({ result: [{ id: "record-1" }] }) }
          : { ok: true, json: async () => ({ result: { name: `Acme & <Co> "'` } }) },
  );
  const promise = loginOAuth({
    clientId: "client",
    scopes: ["user-details.read", "zone.read", "zone.write", "dns.read", "dns.write"],
    ports: [0],
    open: jest.fn(),
    print: (value) => printed.push(value),
    fetchImpl,
    setTimeoutImpl: (callback) => callback(),
  });
  await new Promise((resolve) => setTimeout(resolve, 10));
  const authorization = new URL(printed[0].match(/https?:\/\/\S+/)[0]);
  await new Promise((resolve, reject) =>
    http
      .get(
        `${authorization.searchParams.get("redirect_uri")}?state=${authorization.searchParams.get("state")}&code=code`,
        (response) => {
          responses.push(response);
          let body = "";
          response.on("data", (chunk) => {
            body += chunk;
          });
          response.on("end", () => {
            expect(body).toContain("Acme &amp; &lt;Co&gt; &quot;&#39;");
            expect(body).not.toContain("secret-access");
            expect(body).toContain("2026-2027");
            resolve();
          });
        },
      )
      .on("error", reject),
  );
  await expect(promise).resolves.toMatchObject({
    account: { name: `Acme & <Co> "'` },
    scopes: ["user-details.read", "zone.read", "zone.write", "dns.read", "dns.write"],
  });
  yearSpy.mockRestore();
});
import { EventEmitter } from "node:events";
