import { jest } from "@jest/globals";
import { run } from "../src/cli.mjs";
import { fixtureCase1 } from "../test-fixtures/unit/cli-defaults.mjs";
test("CLI prints its version without loading configuration", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  await run({ argv: ["--version"], printer, loadEnv: jest.fn(), cfFactory: jest.fn() });
  expect(printer.log).toHaveBeenCalled();
});

test("dispatches to injected handlers and loads env", async () => {
  const log = jest.fn();
  const error = jest.fn();
  const cfFactory = jest.fn(() => ({
    zones: { list: jest.fn().mockResolvedValue({ result: [] }) },
  }));
  const loadEnv = jest.fn();
  const zones = jest.fn().mockResolvedValue(undefined);

  await run({
    argv: ["zones", "list", "--json", "--data", "{}"],
    cfFactory,
    loadEnv,
    printer: { log, error },
    fsImpl: { readFileSync: jest.fn(() => "{}") },
    handlers: { zones },
    projectRoot: "/tmp/project",
    exit: jest.fn(),
  });

  expect(loadEnv).toHaveBeenCalledWith("/tmp/project", process.env, expect.any(Object));
  expect(cfFactory).toHaveBeenCalled();
  expect(zones).toHaveBeenCalled();
});

test("prints help with no args and unknown resource", async () => {
  const log = jest.fn();
  const error = jest.fn();
  const cfFactory = jest.fn();
  await run({
    argv: [],
    printer: { log, error },
    fsImpl: { readFileSync: jest.fn(() => "") },
    exit: jest.fn(),
  });
  await run({
    argv: ["nope", "list"],
    printer: { log, error },
    fsImpl: { readFileSync: jest.fn(() => "") },
    cfFactory,
    loadEnv: jest.fn(),
    exit: jest.fn(),
  });
  expect(error).toHaveBeenCalledWith(expect.stringContaining('unknown command "nope"'));
  expect(cfFactory).not.toHaveBeenCalled();
});

test("formats authorization errors from a handler", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn();
  await run({
    argv: ["zones", "list"],
    env: {},
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    handlers: {
      zones: jest
        .fn()
        .mockRejectedValue({ status: 403, errors: [{ code: 9109, message: "denied" }] }),
    },
    printer,
    exit,
  });
  expect(printer.error).toHaveBeenCalledWith(expect.stringContaining("Cloudflare denied"));
  expect(exit).toHaveBeenCalledWith(1);
});

test("handles resource help", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn();
  await run({
    argv: ["zones", "--help"],
    printer,
    exit,
    loadEnv: jest.fn(),
    fsImpl: { readFileSync: jest.fn(() => "") },
  });
  expect(printer.log).toHaveBeenCalled();
});

test("handles unknown actions", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn();
  await run({
    argv: ["zones", "far-away"],
    printer,
    exit,
    loadEnv: jest.fn(),
    fsImpl: { readFileSync: jest.fn(() => "") },
    cfFactory: jest.fn(),
  });
  expect(exit).toHaveBeenCalledWith(1);
});

test("rejects zone access when OAuth scopes are missing", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn();
  await run({
    argv: ["zones", "list"],
    env: { CFHUB_OAUTH_SCOPES: "dns.read" },
    printer,
    exit,
    loadEnv: jest.fn(),
    fsImpl: { readFileSync: jest.fn(() => "") },
    cfFactory: jest.fn(),
  });
  expect(exit).toHaveBeenCalledWith(1);
});

test("rejects inventory export when OAuth scopes are missing", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn();
  await run({
    argv: ["inventory", "export"],
    env: { CFHUB_OAUTH_SCOPES: "" },
    printer,
    exit,
    loadEnv: jest.fn(),
    fsImpl: { readFileSync: jest.fn(() => "") },
    cfFactory: jest.fn(),
  });
  expect(exit).toHaveBeenCalledWith(1);
});

test("surfaces raw handler errors", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn();
  await expect(
    run({
      argv: ["audit", "list"],
      env: {
        CFHUB_OAUTH_SCOPES: "account-settings.read,zone.read,dns.read,ssl-and-certificates.read",
      },
      printer,
      exit,
      loadEnv: jest.fn(),
      fsImpl: { readFileSync: jest.fn(() => "") },
      handlers: { audit: jest.fn().mockRejectedValue(new Error("raw failure")) },
      cfFactory: jest.fn(() => ({})),
    }),
  ).rejects.toThrow("raw failure");
});

test("routes extension commands before Cloudflare setup", async () => {
  const error = jest.fn();
  const cfFactory = jest.fn();
  await run({
    argv: ["extension", "list"],
    printer: { log: jest.fn(), error },
    fsImpl: { existsSync: () => false },
    cfFactory,
  });
  expect(error).not.toHaveBeenCalled();
  expect(cfFactory).not.toHaveBeenCalled();
});

test("supports a bare pager flag with and without saved pager settings", async () => {
  const mod = await import("../src/cli.mjs?ts=17");
  const home = "/tmp/cf-cli-pager-test";
  const printer = { log: jest.fn(), error: jest.fn() };
  const fsImpl = {
    existsSync: () => false,
    readFileSync: jest.fn(),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    chmodSync: jest.fn(),
  };
  const handler = ({ printer: injected }) => injected.log("pager output");
  const oldPager = process.env.PAGER;
  process.env.PAGER = "true";
  try {
    await mod.run({
      argv: ["zones", "list", "--pager"],
      env: {},
      homeDir: home,
      fsImpl,
      printer,
      loadEnv: jest.fn(),
      cfFactory: jest.fn(() => ({})),
      handlers: { zones: handler },
      exit: jest.fn(),
    });
  } finally {
    if (oldPager === undefined) delete process.env.PAGER;
    else process.env.PAGER = oldPager;
  }
  const savedPager = process.env.PAGER;
  delete process.env.PAGER;
  try {
    await mod.run({
      argv: ["zones", "list", "--pager", "--no-pager"],
      env: {},
      homeDir: `${home}-fallback`,
      fsImpl,
      printer,
      loadEnv: jest.fn(),
      cfFactory: jest.fn(() => ({})),
      handlers: { zones: handler },
      exit: jest.fn(),
    });
  } finally {
    if (savedPager === undefined) delete process.env.PAGER;
    else process.env.PAGER = savedPager;
  }
  expect(printer.error).not.toHaveBeenCalled();
});

test("prints dashboard links before dispatch", async () => {
  const mod = await import("../src/cli.mjs?ts=13");
  const printer = { log: jest.fn(), error: jest.fn() };
  const common = {
    printer,
    env: {},
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    exit: jest.fn(),
  };
  await mod.run({
    ...common,
    argv: ["zones", "get", "--zone-id", "z1", "--web"],
  });
  expect(printer.log).toHaveBeenCalledWith("https://dash.cloudflare.com/zones/z1");
  await mod.run({
    ...common,
    argv: ["zones", "get", "--account-id", "a1", "--web"],
  });
  await mod.run({ ...common, argv: ["zones", "get", "--web"] });
});

test("renders templates through injected handlers", async () => {
  const mod = await import("../src/cli.mjs?ts=14");
  const printer = { log: jest.fn(), error: jest.fn() };
  await mod.run({
    argv: ["zones", "list", "--template", "{{.name}}"],
    printer,
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    handlers: {
      zones: ({ toJsonOutput }) => toJsonOutput({ name: "example.com" }),
    },
    exit: jest.fn(),
  });
  expect(printer.log).toHaveBeenCalledWith("example.com");
});

test("covers default CLI inputs, exit handling, and web output", fixtureCase1);
