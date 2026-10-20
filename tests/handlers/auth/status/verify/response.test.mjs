import {
  interpretTokenVerification,
  tokenVerificationEndpoint,
} from "../../../../../src/handlers/auth/status/verify/response.mjs";

test("selects the verification endpoint for each token type", () => {
  expect(tokenVerificationEndpoint("cfat_key", "account")).toBe("/accounts/account/tokens/verify");
  expect(tokenVerificationEndpoint("cfat_key", "account/name")).toBe(
    "/accounts/account%2Fname/tokens/verify",
  );
  expect(tokenVerificationEndpoint("user-key")).toBe("/user/tokens/verify");
});

test("maps verification status and defaults missing status", () => {
  expect(interpretTokenVerification({ result: { status: "active" } })).toEqual({
    verified: true,
    status: "active",
  });
  expect(interpretTokenVerification({})).toEqual({ verified: false, status: "unknown" });
  expect(interpretTokenVerification({ result: { status: "inactive" } })).toEqual({
    verified: false,
    status: "inactive",
  });
});
