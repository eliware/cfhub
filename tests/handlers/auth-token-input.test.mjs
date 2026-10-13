import { jest } from "@jest/globals";
import { readLoginToken, resolveTokenAccount } from "../../src/handlers/auth-token-input.mjs";

test("reads a token from stdin without prompting", async () => {
  const readToken = jest.fn(() => "stdin-token");
  const result = await readLoginToken({
    opts: { "token-stdin": true },
    readToken,
    promptToken: jest.fn(),
    printer: {},
  });
  expect(result).toEqual({ interactive: false, suppliedToken: "stdin-token" });
  expect(readToken).toHaveBeenCalled();
});

test("prompts for a token and account ID only for interactive account tokens", async () => {
  const printer = { error: jest.fn() };
  const result = await readLoginToken({
    opts: {},
    readToken: jest.fn(),
    promptToken: async () => "cfat_account",
    printer,
  });
  expect(result).toEqual({ interactive: true, suppliedToken: "cfat_account" });
  expect(printer.error).toHaveBeenCalled();
  await expect(
    resolveTokenAccount({
      opts: {},
      interactive: true,
      token: result.suppliedToken,
      promptAccountId: async () => "account",
    }),
  ).resolves.toMatchObject({ accountId: "account", detectedAccountToken: true });
});

test("uses supplied account IDs and skips prompts for user tokens", async () => {
  await expect(
    resolveTokenAccount({
      opts: { "account-id": "chosen" },
      interactive: true,
      token: "user",
      promptAccountId: jest.fn(),
    }),
  ).resolves.toMatchObject({ accountId: "chosen", detectedAccountToken: false });
  await expect(
    resolveTokenAccount({
      opts: {},
      interactive: false,
      token: "cfat_account",
      promptAccountId: jest.fn(),
    }),
  ).resolves.toMatchObject({ detectedAccountToken: true });
});
