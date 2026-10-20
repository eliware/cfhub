import { jest } from "@jest/globals";
import { showAccountTokenStatus } from "../../../../../src/handlers/auth/status/account/token.mjs";

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
  expect(toJsonOutput).toHaveBeenCalledTimes(1);
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

test.each([
  ["saved profile", { work: { accountId: "saved" } }, "environment", "saved"],
  ["environment fallback", {}, "environment", "environment"],
])("account token status resolves the %s", async (_name, profiles, environmentId, expectedId) => {
  const previous = process.env.CLOUDFLARE_ACCOUNT_ID;
  process.env.CLOUDFLARE_ACCOUNT_ID = environmentId;
  const cf = { get: jest.fn().mockResolvedValue({}) };
  try {
    await showAccountTokenStatus({
      statusProfile: "work",
      opts: {},
      data: { profiles },
      cf,
      outputJson: true,
      toJsonOutput: jest.fn(),
    });
  } finally {
    if (previous === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID;
    else process.env.CLOUDFLARE_ACCOUNT_ID = previous;
  }
  expect(cf.get).toHaveBeenCalledWith(`/accounts/${expectedId}`);
});
