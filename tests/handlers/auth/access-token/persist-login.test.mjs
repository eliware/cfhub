import { jest } from "@jest/globals";
import { persistApiTokenLogin } from "../../../../src/handlers/auth/access-token/persist-login.mjs";

const input = (overrides = {}) => ({
  data: { profiles: {} },
  name: "work",
  credential: { apiToken: "token" },
  opts: { "zone-id": "zone" },
  tokenInfo: { permissions: [], permissionsKnown: false, permissionSummary: {} },
  detectedAccountToken: false,
  accountId: undefined,
  writeCredentialImpl: jest.fn().mockResolvedValue(true),
  deleteCredentialImpl: jest.fn().mockResolvedValue(true),
  write: jest.fn(),
  profileHome: "home",
  profileFs: {},
  fail: jest.fn(),
  ...overrides,
});

test("stores the credential before saving the active profile", async () => {
  const args = input();
  await expect(persistApiTokenLogin(args)).resolves.toBe(true);
  expect(args.writeCredentialImpl).toHaveBeenCalledWith("work", { apiToken: "token" });
  expect(args.data.active).toBe("work");
  expect(args.write).toHaveBeenCalledWith(args.data, "home", args.profileFs);
});

test("stops when credential storage fails", async () => {
  const args = input({ writeCredentialImpl: jest.fn().mockResolvedValue(false) });
  await expect(persistApiTokenLogin(args)).resolves.toBe(false);
  expect(args.fail).toHaveBeenCalledWith(
    "Could not save the API token to the OS keychain or private credential file",
  );
  expect(args.write).not.toHaveBeenCalled();
});

test("removes stored credentials when profile persistence fails", async () => {
  const args = input({
    write: jest.fn(() => {
      throw new Error("disk full");
    }),
  });
  await expect(persistApiTokenLogin(args)).resolves.toBe(false);
  expect(args.deleteCredentialImpl).toHaveBeenCalledWith("work");
  expect(args.data.profiles).toEqual({});
  expect(args.data.active).toBeUndefined();
  expect(args.fail).toHaveBeenCalledWith(
    "Could not save the API token profile. The saved credentials were removed.",
  );
});

test("reports when credentials could not be removed after profile persistence fails", async () => {
  const args = input({
    write: jest.fn(() => {
      throw new Error("disk full");
    }),
    deleteCredentialImpl: jest.fn().mockResolvedValue(false),
  });
  await expect(persistApiTokenLogin(args)).resolves.toBe(false);
  expect(args.fail).toHaveBeenCalledWith(
    "Could not save the API token profile. The credentials may remain saved.",
  );
});

test("restores an existing profile when its replacement cannot be saved", async () => {
  const profile = { authMethod: "oauth" };
  const data = { profiles: { work: profile }, active: "other" };
  const args = input({
    data,
    readCredentialImpl: jest.fn().mockResolvedValue({ apiToken: "old-token" }),
    write: jest.fn(() => {
      throw new Error("disk full");
    }),
  });
  await expect(persistApiTokenLogin(args)).resolves.toBe(false);
  expect(args.writeCredentialImpl).toHaveBeenNthCalledWith(2, "work", { apiToken: "old-token" });
  expect(data.profiles.work).toBe(profile);
  expect(data.active).toBe("other");
  expect(args.fail).toHaveBeenCalledWith(
    "Could not save the API token profile. The previous credentials were restored.",
  );
});

test("does not replace credentials when it cannot read the saved profile", async () => {
  const profile = { authMethod: "oauth" };
  const data = { profiles: { work: profile }, active: "work" };
  const args = input({
    data,
    readCredentialImpl: jest.fn().mockRejectedValue(new Error("locked")),
  });
  await expect(persistApiTokenLogin(args)).resolves.toBe(false);
  expect(args.writeCredentialImpl).not.toHaveBeenCalled();
  expect(data.profiles.work).toBe(profile);
});
