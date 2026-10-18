import { jest } from "@jest/globals";
import { requestTokenVerification } from "../../../../../src/handlers/auth/status/verify/request.mjs";

test("verifies account and user tokens and maps missing status", async () => {
  const cf = { get: jest.fn().mockResolvedValue({ result: { status: "active" } }) };
  await expect(
    requestTokenVerification({ token: "cfat_key", accountId: "acct", cf }),
  ).resolves.toEqual({
    verified: true,
    status: "active",
  });
  expect(cf.get).toHaveBeenLastCalledWith("/accounts/acct/tokens/verify");
  cf.get.mockResolvedValue({});
  await expect(requestTokenVerification({ token: "user-key", cf })).resolves.toEqual({
    verified: false,
    status: "unknown",
  });
  expect(cf.get).toHaveBeenLastCalledWith("/user/tokens/verify");
});
