import { jest } from "@jest/globals";
import { loginOAuth } from "../../src/oauth.mjs";
import http from "node:http";

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
