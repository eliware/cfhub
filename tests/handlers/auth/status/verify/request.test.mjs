import { jest } from "@jest/globals";
import { requestTokenVerification } from "../../../../../src/handlers/auth/status/verify/request.mjs";

test("requests account token verification", async () => {
  const cf = { get: jest.fn().mockResolvedValue({ result: { status: "active" } }) };
  await requestTokenVerification({ token: "cfat_key", accountId: "acct", cf });
  expect(cf.get).toHaveBeenLastCalledWith("/accounts/acct/tokens/verify");
});

test("requests user token verification", async () => {
  const cf = { get: jest.fn().mockResolvedValue({ result: { status: "active" } }) };
  await requestTokenVerification({ token: "user-key", cf });
  expect(cf.get).toHaveBeenCalledWith("/user/tokens/verify");
});
