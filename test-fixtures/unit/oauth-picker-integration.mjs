import { jest } from "@jest/globals";
import { EventEmitter } from "node:events";
import { loginOAuth } from "../../src/oauth.mjs";
import http from "node:http";

export async function verifyOAuthPickerIntegration() {
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
}
