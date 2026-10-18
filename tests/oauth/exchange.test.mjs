import { jest } from "@jest/globals";
import { exchangeOAuthCode } from "../../src/oauth/exchange.mjs";
import {
  getOAuthResponse,
  makeOAuthCallbackUrl,
  startOAuthTestLogin,
} from "../../test-fixtures/unit/oauth-http.mjs";

test("OAuth success page remains useful when account confirmation fails", async () => {
  expect(exchangeOAuthCode).toEqual(expect.any(Function));
  const fetchImpl = jest
    .fn()
    .mockImplementation(async (url) =>
      url.includes("/token")
        ? { ok: true, json: async () => ({ access_token: "access" }) }
        : Promise.reject(new Error("account unavailable")),
    );
  const { promise, authorization, closeServer } = await startOAuthTestLogin({
    fetchImpl,
    open: jest.fn(),
  });
  await getOAuthResponse(makeOAuthCallbackUrl(authorization, { code: "code" }));
  await expect(promise).resolves.toMatchObject({ account: null });
  closeServer();
});

test("OAuth success page tolerates an unavailable account response", async () => {
  const fetchImpl = jest
    .fn()
    .mockImplementation(async (url) =>
      url.includes("/token")
        ? { ok: true, json: async () => ({ access_token: "access" }) }
        : { ok: false },
    );
  const { promise, authorization, closeServer } = await startOAuthTestLogin({
    fetchImpl,
    open: jest.fn(),
  });
  await getOAuthResponse(makeOAuthCallbackUrl(authorization, { code: "code" }));
  await expect(promise).resolves.toMatchObject({ account: null });
  closeServer();
});

test("OAuth callback rejects invalid state and provider errors", async () => {
  for (const providerError of [false, true]) {
    const { promise, authorization, closeServer } = await startOAuthTestLogin({
      open: jest.fn(),
      setTimeoutImpl: (callback) => callback(),
    });
    const rejection = expect(promise).rejects.toThrow(
      providerError
        ? "Cloudflare authorization failed"
        : "OAuth login expired or is open in a different browser",
    );
    const callback = makeOAuthCallbackUrl(
      authorization,
      providerError ? { error: "access_denied" } : { state: "wrong", code: "code" },
    );
    const response = await getOAuthResponse(callback);
    expect(response.body).toContain(
      providerError ? "Authorization cancelled" : "Authorization request expired",
    );
    expect(response.body).toContain("cfhub oauth login");
    await rejection;
    closeServer();
  }
});
