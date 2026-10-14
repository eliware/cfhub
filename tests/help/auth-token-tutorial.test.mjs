import { API_TOKEN_TUTORIAL } from "../../src/help/auth-token-tutorial.mjs";

test("API token tutorial lists the account token setup steps", () => {
  expect(API_TOKEN_TUTORIAL).toContain("Manage account > Account API tokens");
  expect(API_TOKEN_TUTORIAL).toContain("Review Token");
  expect(API_TOKEN_TUTORIAL).toContain("Copy Your API Token");
  expect(API_TOKEN_TUTORIAL).toContain("Copy the Account ID");
});
