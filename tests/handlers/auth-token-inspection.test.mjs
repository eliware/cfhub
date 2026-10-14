import { jest } from "@jest/globals";
import { inspectLoginToken } from "../../src/handlers/auth-token-inspection.mjs";

test("inspects an API token for its account", async () => {
  const tokenInfo = { permissions: ["zone:read"] };
  const inspectApiTokenImpl = jest.fn().mockResolvedValue(tokenInfo);
  await expect(
    inspectLoginToken({
      token: "cfat_token",
      accountId: "account",
      inspectApiTokenImpl,
      fail: jest.fn(),
    }),
  ).resolves.toBe(tokenInfo);
  expect(inspectApiTokenImpl).toHaveBeenCalledWith({ token: "cfat_token", accountId: "account" });
});

test("reports API token inspection errors", async () => {
  const fail = jest.fn();
  await expect(
    inspectLoginToken({
      token: "bad-token",
      accountId: undefined,
      inspectApiTokenImpl: jest.fn().mockRejectedValue(Error("denied")),
      fail,
    }),
  ).resolves.toBeNull();
  expect(fail).toHaveBeenCalledWith("Could not verify API token: denied");
});
