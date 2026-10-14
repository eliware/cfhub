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

test("requires an account ID for a non-interactive account token", async () => {
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  const { args, fail } = setup({ readToken: () => "cfat_account-token" });
  await saveApiTokenLogin(args);
  expect(fail).toHaveBeenCalledWith(
    "Missing account ID for this account API token. Set CLOUDFLARE_ACCOUNT_ID or pass --account-id.",
  );
  expect(args.inspectApiTokenImpl).not.toHaveBeenCalled();
});

test("saves a standard-input token with option and environment IDs", async () => {
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
  expect(data.active).toBe("work");
  expect(args.writeCredentialImpl).toHaveBeenCalledWith("work", { apiToken: "token" });
});

test("uses injected IDs when it saves a token profile", async () => {
  const env = { CLOUDFLARE_ACCOUNT_ID: "injected-account", CLOUDFLARE_ZONE_ID: "injected-zone" };
  const { args, data } = setup({
    env,
    readToken: () => "cfat_account-token",
    inspectApiTokenImpl: jest.fn().mockResolvedValue({
      permissions: [],
      permissionsKnown: false,
      permissionSummary: {},
    }),
  });
  await saveApiTokenLogin(args);
  expect(data.profiles.work).toMatchObject({
    accountId: "injected-account",
    zoneId: "injected-zone",
  });
});

test("reports token inspection errors", async () => {
  const inspect = setup({ inspectApiTokenImpl: jest.fn().mockRejectedValue(Error("denied")) });
  await saveApiTokenLogin(inspect.args);
  expect(inspect.fail).toHaveBeenCalledWith("Could not verify API token: denied");
});

test("does not report success when credential persistence fails", async () => {
  const { args, printer } = setup({ writeCredentialImpl: jest.fn().mockResolvedValue(false) });
  await saveApiTokenLogin(args);
  expect(printer.log).not.toHaveBeenCalled();
});

test("does not ask for an account ID for a user token", async () => {
  const promptAccountId = jest.fn();
  const { args, data } = setup({
    readToken: () => "cfut_user-token",
    promptAccountId,
  });
  await saveApiTokenLogin(args);
  expect(promptAccountId).not.toHaveBeenCalled();
  expect(data.profiles.work.authMethod).toBe("api-token");
});
