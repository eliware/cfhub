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
