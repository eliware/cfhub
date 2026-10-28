import { jest } from "@jest/globals";
import { inspectLoginToken } from "../../../../src/handlers/auth/access-token/inspection.mjs";

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

test("reports API token inspection errors without exposing upstream details", async () => {
  const fail = jest.fn();
  await expect(
    inspectLoginToken({
      token: "bad-token",
      accountId: undefined,
      inspectApiTokenImpl: jest.fn().mockRejectedValue(Error("request used bad-token")),
      fail,
    }),
  ).resolves.toBeNull();
  expect(fail).toHaveBeenCalledWith(
    "Could not verify API token. Check that the token is valid and try again.",
  );
  expect(fail.mock.calls.flat().join(" ")).not.toContain("bad-token");
});
