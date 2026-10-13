import { jest } from "@jest/globals";
import { showAccountTokenStatus } from "../../src/handlers/auth-status-account-token.mjs";

test("account token status returns account details", async () => {
  const cf = { get: jest.fn().mockResolvedValue({ result: [{ id: "a" }] }) };
  const toJsonOutput = jest.fn();
  await showAccountTokenStatus({
    statusProfile: "work",
    opts: {},
    data: { profiles: {} },
    cf,
    outputJson: true,
    toJsonOutput,
  });
  expect(cf.get).toHaveBeenCalledWith("/accounts");
  expect(toJsonOutput).toHaveBeenCalledWith(expect.objectContaining({ accounts: [{ id: "a" }] }));
});

test("account token status uses account ID and text output", async () => {
  const cf = { get: jest.fn().mockResolvedValue({}) };
  const printer = { log: jest.fn() };
  await showAccountTokenStatus({
    statusProfile: "work",
    opts: { "account-id": "a" },
    data: { profiles: {} },
    cf,
    outputJson: false,
    printer,
  });
  expect(cf.get).toHaveBeenCalledWith("/accounts/a");
  expect(printer.log).toHaveBeenCalledWith("work authenticated with account API token");
});

test("account token status resolves saved and environment IDs and empty account lists", async () => {
  const cf = { get: jest.fn().mockResolvedValue({}) };
  const printer = { log: jest.fn() };
  await showAccountTokenStatus({
    statusProfile: "work",
    opts: {},
    data: { profiles: { work: { accountId: "saved" } } },
    cf,
    outputJson: false,
    printer,
  });
  expect(cf.get).toHaveBeenCalledWith("/accounts/saved");

  const prior = process.env.CLOUDFLARE_ACCOUNT_ID;
  process.env.CLOUDFLARE_ACCOUNT_ID = "environment";
  try {
    await showAccountTokenStatus({
      statusProfile: "work",
      opts: {},
      data: { profiles: {} },
      cf,
      outputJson: true,
      toJsonOutput: jest.fn(),
    });
    expect(cf.get).toHaveBeenLastCalledWith("/accounts/environment");
  } finally {
    if (prior === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID;
    else process.env.CLOUDFLARE_ACCOUNT_ID = prior;
  }

  const toJsonOutput = jest.fn();
  await showAccountTokenStatus({
    statusProfile: "work",
    opts: {},
    data: { profiles: {} },
    cf,
    outputJson: true,
    toJsonOutput,
  });
  expect(toJsonOutput).toHaveBeenCalledWith(expect.objectContaining({ accounts: [] }));
});
