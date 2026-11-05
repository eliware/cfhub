import { jest } from "@jest/globals";
import { resolveCredentialLifecycle } from "../../src/profile/credential-lifecycle.mjs";
import { createMemoryFs } from "../../test-fixtures/unit/memory-fs.mjs";

const lifecycle = (overrides = {}) => ({
  profileName: "work",
  credential: { oauthAccessToken: "access", expiresAt: 200_000 },
  homeDir: "/home",
  fsImpl: {},
  writeCredential: jest.fn(),
  deleteCredential: jest.fn(),
  refreshOAuth: jest.fn(),
  now: () => 100_000,
  removeExpired: jest.fn(),
  ...overrides,
});

test("keeps credentials that are not close to expiration", async () => {
  const options = lifecycle();
  await expect(resolveCredentialLifecycle(options)).resolves.toEqual({
    credential: options.credential,
    activeCredential: options.credential,
  });
  expect(options.refreshOAuth).not.toHaveBeenCalled();
  expect(options.removeExpired).not.toHaveBeenCalled();
});

test("removes an expired OAuth profile that has no refresh token", async () => {
  const options = lifecycle({ credential: { oauthAccessToken: "expired", expiresAt: 160_000 } });
  await expect(resolveCredentialLifecycle(options)).resolves.toBeNull();
  expect(options.removeExpired).toHaveBeenCalledWith(
    "work",
    "/home",
    options.fsImpl,
    options.deleteCredential,
  );
  expect(options.refreshOAuth).not.toHaveBeenCalled();
});

test("uses the default clock and expiry cleanup", async () => {
  jest.useFakeTimers().setSystemTime(100_000);
  const deleteCredential = jest.fn();
  try {
    await expect(
      resolveCredentialLifecycle({
        profileName: "work",
        credential: { oauthAccessToken: "expired", expiresAt: 160_000 },
        homeDir: "/home",
        fsImpl: createMemoryFs(),
        writeCredential: jest.fn(),
        deleteCredential,
        refreshOAuth: jest.fn(),
      }),
    ).resolves.toBeNull();
  } finally {
    jest.useRealTimers();
  }
  expect(deleteCredential).toHaveBeenCalledWith("work");
});

test("refreshes credentials inside the expiry buffer and persists the replacement", async () => {
  const credential = {
    oauthAccessToken: "old-access",
    oauthRefreshToken: "refresh",
    expiresAt: 160_000,
    accountId: "account",
  };
  const options = lifecycle({
    credential,
    refreshOAuth: jest.fn().mockResolvedValue({
      accessToken: "new-access",
      refreshToken: "new-refresh",
      expiresAt: 300_000,
    }),
  });
  await expect(resolveCredentialLifecycle(options)).resolves.toEqual({
    credential,
    activeCredential: {
      accessToken: "new-access",
      refreshToken: "new-refresh",
      expiresAt: 300_000,
      oauthAccessToken: "new-access",
      oauthRefreshToken: "new-refresh",
    },
  });
  expect(options.refreshOAuth).toHaveBeenCalledWith({ refreshToken: "refresh" });
  expect(options.writeCredential).toHaveBeenCalledWith("work", {
    ...credential,
    accessToken: "new-access",
    refreshToken: "new-refresh",
    expiresAt: 300_000,
    oauthAccessToken: "new-access",
    oauthRefreshToken: "new-refresh",
  });
  expect(options.removeExpired).not.toHaveBeenCalled();
});

test("removes an expired OAuth profile when refresh fails", async () => {
  const options = lifecycle({
    credential: { oauthAccessToken: "old", oauthRefreshToken: "expired", expiresAt: 160_000 },
    refreshOAuth: jest.fn().mockRejectedValue(new Error("expired")),
  });
  await expect(resolveCredentialLifecycle(options)).resolves.toBeNull();
  expect(options.removeExpired).toHaveBeenCalledWith(
    "work",
    "/home",
    options.fsImpl,
    options.deleteCredential,
  );
});
