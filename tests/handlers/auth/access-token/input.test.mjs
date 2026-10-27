import { jest } from "@jest/globals";
import { readLoginToken } from "../../../../src/handlers/auth/access-token/input.mjs";

test("token login reads a token from stdin", async () => {
  const readToken = jest.fn().mockResolvedValue("stdin-token");
  const result = await readLoginToken({
    opts: { "token-stdin": true },
    readToken,
    promptToken: jest.fn(),
    printer: {},
  });
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
  expect(printer.error).toHaveBeenCalledWith(
    expect.stringContaining("Create an Account API Token in Cloudflare:"),
  );
});

test("rejects a blank token", async () => {
  const fail = jest.fn();
  const result = await readLoginToken({
    opts: { "token-stdin": true },
    readToken: () => "  ",
    promptToken: jest.fn(),
    printer: {},
    fail,
  });
  expect(result).toEqual({ interactive: false, suppliedToken: null });
  expect(fail).toHaveBeenCalledWith("No API token supplied. Run cfhub auth login again.");
});
