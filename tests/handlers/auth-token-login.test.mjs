import { jest } from "@jest/globals";
import { saveApiTokenLogin } from "../../src/handlers/auth-token-login.mjs";

const savedEnv = {
  account: process.env.CLOUDFLARE_ACCOUNT_ID,
  zone: process.env.CLOUDFLARE_ZONE_ID,
};
afterEach(() => {
  for (const [key, value] of [
    ["CLOUDFLARE_ACCOUNT_ID", savedEnv.account],
    ["CLOUDFLARE_ZONE_ID", savedEnv.zone],
  ]) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

const setup = (overrides = {}) => {
  const data = { profiles: {} };
  const fail = jest.fn();
  const printer = { log: jest.fn(), error: jest.fn() };
  const write = jest.fn();
  const args = {
    data,
    opts: { "token-stdin": true },
    name: "work",
    readToken: () => "token",
    promptToken: jest.fn().mockResolvedValue("interactive-token"),
    promptAccountId: jest.fn().mockResolvedValue("prompt-account"),
    printer,
    fail,
    inspectApiTokenImpl: jest.fn().mockResolvedValue({
      permissions: [],
      permissionsKnown: false,
      permissionSummary: {},
    }),
    writeCredentialImpl: jest.fn().mockResolvedValue(true),
    write,
    profileHome: "home",
    profileFs: {},
    ...overrides,
  };
  return { args, data, fail, printer, write };
};

test("rejects an empty token", async () => {
  const { args, fail } = setup({ readToken: () => "  " });
  await saveApiTokenLogin(args);
  expect(fail).toHaveBeenCalledWith("No API token supplied. Run cfhub auth login again.");
  expect(args.inspectApiTokenImpl).not.toHaveBeenCalled();
});

test("prompts for an interactive token and account ID", async () => {
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  const { args } = setup({
    opts: {},
    promptToken: jest.fn().mockResolvedValue(" cfat_account-token "),
  });
  await saveApiTokenLogin(args);
  expect(args.printer.error).toHaveBeenCalled();
  expect(args.promptAccountId).toHaveBeenCalled();
  expect(args.inspectApiTokenImpl).toHaveBeenCalledWith({
    token: "cfat_account-token",
    accountId: "prompt-account",
  });
});

test("uses option and environment account and zone IDs", async () => {
  process.env.CLOUDFLARE_ACCOUNT_ID = "env-account";
  process.env.CLOUDFLARE_ZONE_ID = "env-zone";
  const { args, data, write } = setup({
    opts: { "token-stdin": true, "account-id": "option-account", "zone-id": "option-zone" },
    inspectApiTokenImpl: jest.fn().mockResolvedValue({
      permissions: ["zone:read"],
      permissionsKnown: true,
      permissionSummary: { total: 1, read: 1, write: 0, other: 0 },
    }),
  });
  await saveApiTokenLogin(args);
  expect(data.profiles.work).toEqual(
    expect.objectContaining({
      authMethod: "api-token",
      accountId: "option-account",
      zoneId: "option-zone",
    }),
  );
  expect(args.printer.log).toHaveBeenCalled();
  expect(write).toHaveBeenCalledWith(data, "home", args.profileFs);
});

test("reports token inspection and credential storage errors", async () => {
  const inspect = setup({ inspectApiTokenImpl: jest.fn().mockRejectedValue(Error("denied")) });
  await saveApiTokenLogin(inspect.args);
  expect(inspect.fail).toHaveBeenCalledWith("Could not verify API token: denied");

  const storage = setup({ writeCredentialImpl: jest.fn().mockResolvedValue(false) });
  await saveApiTokenLogin(storage.args);
  expect(storage.fail).toHaveBeenCalledWith(
    "Could not save the API token to the OS keychain or private credential file",
  );
  expect(storage.write).not.toHaveBeenCalled();
});

test("saves API tokens read from standard input", async () => {
  const { args, data } = setup();
  await saveApiTokenLogin(args);
  expect(data.active).toBe("work");
  expect(data.profiles.work.authMethod).toBe("api-token");
  expect(args.writeCredentialImpl).toHaveBeenCalledWith("work", { apiToken: "token" });
});
