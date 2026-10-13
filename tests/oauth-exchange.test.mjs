import { jest } from "@jest/globals";
import { loginOAuth } from "../src/oauth.mjs";
import { exchangeOAuthCode } from "../src/oauth-exchange.mjs";
import http from "node:http";

test("OAuth success page remains useful when account confirmation fails", async () => {
  expect(exchangeOAuthCode).toEqual(expect.any(Function));
  const printed = [];
  const fetchImpl = jest
    .fn()
    .mockImplementation(async (url) =>
      url.includes("/token")
        ? { ok: true, json: async () => ({ access_token: "access" }) }
        : Promise.reject(new Error("account unavailable")),
    );
  const promise = loginOAuth({
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
        `${authorization.searchParams.get("redirect_uri")}?state=${authorization.searchParams.get("state")}&code=code`,
        (response) => {
          response.resume();
          response.on("end", resolve);
        },
      )
      .on("error", reject),
  );
  await expect(promise).resolves.toMatchObject({ account: null });
});

test("OAuth success page tolerates an unavailable account response", async () => {
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
        `${authorization.searchParams.get("redirect_uri")}?state=${authorization.searchParams.get("state")}&code=code`,
        (response) => {
          response.resume();
          response.on("end", resolve);
        },
      )
      .on("error", reject),
  );
  await expect(promise).resolves.toMatchObject({ account: null });
});

test("OAuth callback rejects invalid state and provider errors", async () => {
  for (const providerError of [false, true]) {
    const printed = [];
    const promise = loginOAuth({
      clientId: "client",
      ports: [0],
      open: jest.fn(),
      print: (value) => printed.push(value),
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    const authorization = new URL(printed[0].match(/https?:\/\/\S+/)[0]);
    const rejection = expect(promise).rejects.toThrow(
      providerError
        ? "Cloudflare authorization failed"
        : "OAuth login expired or was opened in another browser",
    );
    const query = providerError
      ? `state=${authorization.searchParams.get("state")}&error=access_denied`
      : "state=wrong&code=code";
    await new Promise((resolve, reject) =>
      http
        .get(`${authorization.searchParams.get("redirect_uri")}?${query}`, (response) => {
          let body = "";
          response.on("data", (chunk) => {
            body += chunk;
          });
          response.on("end", () => {
            expect(body).toContain(
              providerError ? "Authorization cancelled" : "Authorization request expired",
            );
            expect(body).toContain("cfhub oauth login");
            resolve();
          });
        })
        .on("error", reject),
    );
    await rejection;
  }
});
