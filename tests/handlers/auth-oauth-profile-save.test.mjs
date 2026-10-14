import { jest } from "@jest/globals";
import { saveOAuthProfile } from "../../src/handlers/auth-oauth-profile-save.mjs";

test("saves OAuth tokens and activates the scoped profile", async () => {
  const data = { profiles: {} };
  const writeCredentialImpl = jest.fn();
  const write = jest.fn();
  await saveOAuthProfile({
    data,
    name: "work",
    opts: { "account-id": "a" },
    scopes: ["zone.read"],
    oauth: { accessToken: "access", refreshToken: "refresh", scopes: ["dns.read"] },
    writeCredentialImpl,
    write,
  });
  expect(data.profiles.work).toMatchObject({
    authMethod: "oauth",
    scopes: ["dns.read"],
    accountId: "a",
  });
  expect(writeCredentialImpl).toHaveBeenCalledWith(
    "work",
    expect.objectContaining({ oauthAccessToken: "access" }),
  );
  expect(write).toHaveBeenCalled();
});

test("uses requested scopes when OAuth returns no scope list", async () => {
  const data = { profiles: {} };
  await saveOAuthProfile({
    data,
    name: "work",
    opts: {},
    scopes: ["zone.read"],
    oauth: {},
    writeCredentialImpl: jest.fn(),
    write: jest.fn(),
  });
  expect(data.profiles.work.scopes).toEqual(["zone.read"]);
});

test("writes the profile when the credential store reports failure", async () => {
  const data = { profiles: {} };
  const write = jest.fn();
  await saveOAuthProfile({
    data,
    name: "work",
    opts: {},
    scopes: ["zone.read"],
    oauth: { accessToken: "access", refreshToken: "refresh" },
    writeCredentialImpl: jest.fn().mockResolvedValue(false),
    write,
  });
  expect(data.active).toBe("work");
  expect(data.profiles.work.authMethod).toBe("oauth");
  expect(write).toHaveBeenCalledWith(data, undefined, undefined);
});
