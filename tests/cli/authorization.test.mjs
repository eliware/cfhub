import { jest } from "@jest/globals";
import { authorizeCommand } from "../../src/cli/authorization.mjs";

function options(overrides = {}) {
  return {
    resource: "zones",
    action: "list",
    env: { CFHUB_OAUTH_SCOPES: "zone.read" },
    loadEnv: jest.fn(),
    projectRoot: "/repo",
    homeDir: "/tmp/cfhub-no-profile",
    fsImpl: { existsSync: () => false },
    printer: { error: jest.fn() },
    exit: jest.fn((code) => code),
    cfFactory: jest.fn(() => ({ client: true })),
    ...overrides,
  };
}

test("credential commands skip profiles and API clients", async () => {
  for (const [resource, action] of [
    ["auth", "login"],
    ["auth", "logout"],
    ["auth", "list"],
    ["auth", "switch"],
    ["oauth", "login"],
    ["oauth", "logout"],
    ["oauth", "list"],
    ["oauth", "switch"],
  ]) {
    const input = options({ resource, action, env: {} });
    await expect(authorizeCommand(input)).resolves.toEqual({ allowed: true, cf: null });
    expect(input.loadEnv).toHaveBeenCalledWith("/repo", input.env, input.fsImpl);
    expect(input.cfFactory).not.toHaveBeenCalled();
  }
});

test("other commands load profiles and create an API client", async () => {
  const input = options({ env: { CFHUB_OAUTH_SCOPES: ", zone.read,," } });
  await expect(authorizeCommand(input)).resolves.toEqual({
    allowed: true,
    cf: { client: true },
  });
  expect(input.cfFactory).toHaveBeenCalledWith({ env: input.env });
});

test("authorization reports one or many missing OAuth scopes", async () => {
  const one = options({ env: { CFHUB_OAUTH_SCOPES: "zone.write" } });
  await expect(authorizeCommand(one)).resolves.toEqual({ allowed: false, result: 1 });
  expect(one.printer.error).toHaveBeenCalledWith(expect.stringContaining("missing scope:"));

  const many = options({
    resource: "audit",
    action: "create",
    env: { CFHUB_OAUTH_SCOPES: "account-settings.write" },
  });
  await authorizeCommand(many);
  expect(many.printer.error).toHaveBeenCalledWith(expect.stringContaining("missing scopes:"));
  expect(many.exit).toHaveBeenCalledWith(1);
});

test("authorization reports one or many missing API token permissions", async () => {
  const one = options({
    env: {
      CFHUB_OAUTH_SCOPES: "zone.read",
      CFHUB_API_PERMISSIONS_KNOWN: "1",
      CFHUB_API_PERMISSIONS: "",
    },
  });
  await expect(authorizeCommand(one)).resolves.toEqual({ allowed: false, result: 1 });
  expect(one.printer.error).toHaveBeenCalledWith(expect.stringContaining("missing permission:"));

  const many = options({
    resource: "audit",
    action: "list",
    env: {
      CFHUB_OAUTH_SCOPES: "account-settings.read,zone.read,dns.read,ssl-and-certificates.read",
      CFHUB_API_PERMISSIONS_KNOWN: "1",
      CFHUB_API_PERMISSIONS: "",
    },
  });
  await authorizeCommand(many);
  expect(many.printer.error).toHaveBeenCalledWith(expect.stringContaining("missing permissions:"));
});

test("blocks API writes when the known token permissions only allow reads", async () => {
  const input = options({
    resource: "api",
    action: "/zones/zone-1/dns_records",
    opts: { method: "POST" },
    env: {
      CFHUB_OAUTH_SCOPES: "zone.read",
      CFHUB_API_PERMISSIONS_KNOWN: "1",
      CFHUB_API_PERMISSIONS: "DNS Read",
    },
  });
  await expect(authorizeCommand(input)).resolves.toEqual({ allowed: false, result: 1 });
  expect(input.printer.error).toHaveBeenCalledWith(expect.stringContaining("DNS Write"));
  expect(input.cfFactory).not.toHaveBeenCalled();
});

test("blocks API paths without a known permission mapping", async () => {
  const input = options({
    resource: "api",
    action: "/custom/unknown",
    opts: { method: "GET" },
    env: { CFHUB_API_PERMISSIONS_KNOWN: "1", CFHUB_API_PERMISSIONS: "" },
  });
  await expect(authorizeCommand(input)).resolves.toEqual({ allowed: false, result: 1 });
  expect(input.printer.error).toHaveBeenCalledWith(expect.stringContaining("cannot verify"));
  expect(input.cfFactory).not.toHaveBeenCalled();
});

test("allows list deletion previews with read-only grants", async () => {
  const input = options({
    resource: "lists",
    action: "delete",
    opts: { "dry-run": true },
    env: {
      CFHUB_OAUTH_SCOPES: "account-rule-lists.read",
      CFHUB_API_PERMISSIONS_KNOWN: "1",
      CFHUB_API_PERMISSIONS: "Account Rule Lists Read",
    },
  });
  await expect(authorizeCommand(input)).resolves.toMatchObject({ allowed: true });
  expect(input.cfFactory).toHaveBeenCalled();
});

test("does not treat an explicit false dry-run value as a preview", async () => {
  const input = options({
    resource: "lists",
    action: "delete",
    opts: { "dry-run": false },
    env: {
      CFHUB_OAUTH_SCOPES: "account-rule-lists.read",
      CFHUB_API_PERMISSIONS_KNOWN: "1",
      CFHUB_API_PERMISSIONS: "Account Rule Lists Read",
    },
  });
  await expect(authorizeCommand(input)).resolves.toMatchObject({ allowed: false });
});

test("OAuth command actions outside credential management use a client", async () => {
  const input = options({
    resource: "oauth",
    action: "status",
    env: { CFHUB_OAUTH_SCOPES: "user-details.read" },
  });
  await expect(authorizeCommand(input)).resolves.toMatchObject({
    allowed: true,
    cf: { client: true },
  });
});
