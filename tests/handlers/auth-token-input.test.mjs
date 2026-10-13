import { jest } from "@jest/globals";
import { API_TOKEN_TUTORIAL, readLoginToken } from "../../src/handlers/auth-token-input.mjs";

test("token login exposes setup guidance and reads a token from stdin", async () => {
  const readToken = jest.fn(() => "stdin-token");
  const result = await readLoginToken({
    opts: { "token-stdin": true },
    readToken,
    promptToken: jest.fn(),
    printer: {},
  });
  expect(API_TOKEN_TUTORIAL).toContain("Account API Token");
  expect(result).toEqual({ interactive: false, suppliedToken: "stdin-token" });
  expect(readToken).toHaveBeenCalled();
});

test("interactive token login prints guidance before it prompts", async () => {
  const printer = { error: jest.fn() };
  const result = await readLoginToken({
    opts: {},
    readToken: jest.fn(),
    promptToken: async () => "cfat_account",
    printer,
  });
  expect(result).toEqual({ interactive: true, suppliedToken: "cfat_account" });
  expect(printer.error).toHaveBeenCalledWith(expect.stringContaining(API_TOKEN_TUTORIAL));
});
