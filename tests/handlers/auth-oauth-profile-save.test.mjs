import { jest } from "@jest/globals";
import { saveOAuthProfile } from "../../src/handlers/auth-oauth-profile-save.mjs";

test("saves OAuth tokens and activates the scoped profile", async () => {
  const data = { profiles: {} };
  const writeCredentialImpl = jest.fn().mockResolvedValue(true);
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
    writeCredentialImpl: jest.fn().mockResolvedValue(true),
    write: jest.fn(),
  });
  expect(data.profiles.work.scopes).toEqual(["zone.read"]);
});

test("does not save the profile when the credential store reports failure", async () => {
  const data = { profiles: {} };
  const write = jest.fn();
  const fail = jest.fn();
  await saveOAuthProfile({
    data,
    name: "work",
    opts: {},
    scopes: ["zone.read"],
    oauth: { accessToken: "access", refreshToken: "refresh" },
    writeCredentialImpl: jest.fn().mockResolvedValue(false),
    write,
    fail,
  });
  expect(data.active).toBeUndefined();
  expect(data.profiles).toEqual({});
  expect(write).not.toHaveBeenCalled();
  expect(fail).toHaveBeenCalledWith(
    "Could not save OAuth credentials to the OS keychain or private credential file",
  );
});
