import { jest } from "@jest/globals";

describe("cfhub run()", () => {
  test("dispatches to injected handlers and loads env", async () => {
    const log = jest.fn();
    const error = jest.fn();
    const cfFactory = jest.fn(() => ({
      zones: { list: jest.fn().mockResolvedValue({ result: [] }) },
    }));
    const loadEnv = jest.fn();
    const zones = jest.fn().mockResolvedValue(undefined);

    const mod = await import(`../bin/cfhub.mjs?ts=${Date.now()}`);
    await mod.run({
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
    const mod = await import(`../bin/cfhub.mjs?ts=${Date.now() + 1}`);
    await mod.run({
      argv: [],
      printer: { log, error },
      fsImpl: { readFileSync: jest.fn(() => "") },
      exit: jest.fn(),
    });
    await mod.run({
      argv: ["nope", "list"],
      printer: { log, error },
      fsImpl: { readFileSync: jest.fn(() => "") },
      cfFactory: jest.fn(),
      loadEnv: jest.fn(),
      exit: jest.fn(),
    });
    expect(error).not.toHaveBeenCalled();
  });

  test("suggests the intended auth command for a typo before loading credentials", async () => {
    const mod = await import(`../bin/cfhub.mjs?ts=${Date.now() + 2}`);
    const printer = { log: jest.fn(), error: jest.fn() };
    const exit = jest.fn();
    await mod.run({
      argv: ["auth", "lgin"],
      printer,
      exit,
      loadEnv: jest.fn(),
      cfFactory: jest.fn(),
    });
    expect(printer.error).toHaveBeenCalledWith(
      expect.stringContaining("Did you mean this?\n\tlogin"),
    );
    expect(exit).toHaveBeenCalledWith(1);
  });

  test("formats authorization errors from a handler", async () => {
    const mod = await import(`../bin/cfhub.mjs?ts=${Date.now() + 300}`);
    const printer = { log: jest.fn(), error: jest.fn() };
    const exit = jest.fn();
    await mod.run({
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

  test("handles resource help, unknown actions, missing scopes, and raw errors", async () => {
    const mod = await import(`../src/cli.mjs?ts=${Date.now() + 400}`);
    const printer = { log: jest.fn(), error: jest.fn() };
    const exit = jest.fn();
    await mod.run({
      argv: ["zones", "--help"],
      printer,
      exit,
      loadEnv: jest.fn(),
      fsImpl: { readFileSync: jest.fn(() => "") },
    });
    await mod.run({
      argv: ["zones", "far-away"],
      printer,
      exit,
      loadEnv: jest.fn(),
      fsImpl: { readFileSync: jest.fn(() => "") },
      cfFactory: jest.fn(),
    });
    await mod.run({
      argv: ["zones", "list"],
      env: { CFHUB_OAUTH_SCOPES: "dns.read" },
      printer,
      exit,
      loadEnv: jest.fn(),
      fsImpl: { readFileSync: jest.fn(() => "") },
      cfFactory: jest.fn(),
    });
    await mod.run({
      argv: ["inventory", "export"],
      env: { CFHUB_OAUTH_SCOPES: "" },
      printer,
      exit,
      loadEnv: jest.fn(),
      fsImpl: { readFileSync: jest.fn(() => "") },
      cfFactory: jest.fn(),
    });
    await expect(
      mod.run({
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

  test("run uses safe defaults when called with only an empty argv", async () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const mod = await import(`../src/cli.mjs?ts=${Date.now() + 500}`);
    await mod.run({ argv: [] });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("run can use every default dependency when invoked as the entrypoint", async () => {
    const originalArgv = process.argv;
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    process.argv = [process.execPath, "cfhub"];
    try {
      const mod = await import(`../src/cli.mjs?ts=${Date.now() + 600}`);
      await mod.run();
    } finally {
      process.argv = originalArgv;
      spy.mockRestore();
    }
  });
});

test("CLI loads file bodies and supports injected output/failure dependencies", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now()}`);
  const printer = { log: jest.fn(), error: jest.fn() };
  const loadEnv = jest.fn();
  const cfFactory = jest.fn(() => ({}));
  const handler = jest.fn(({ body, outputJson, printer: injected }) => {
    injected.log(body, outputJson);
  });
  await mod.run({
    argv: ["zones", "create", "--file", "/tmp/body.json", "--output", "json"],
    env: {},
    projectRoot: "/tmp",
    loadEnv,
    cfFactory,
    printer,
    fsImpl: { readFileSync: jest.fn(() => '{"name":"example.com"}') },
    handlers: { zones: handler },
    exit: jest.fn(),
  });
  expect(handler).toHaveBeenCalled();
  expect(printer.log).toHaveBeenCalledWith({ name: "example.com" }, true);
});

test("CLI does not require API credentials before auth login", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 20}`);
  const cfFactory = jest.fn(() => {
    throw new Error("client should not be created");
  });
  const auth = jest.fn();
  await mod.run({
    argv: ["auth", "login"],
    env: {},
    loadEnv: jest.fn(),
    cfFactory,
    printer: { log: jest.fn(), error: jest.fn() },
    handlers: { auth },
    fsImpl: { readFileSync: jest.fn(() => "") },
    exit: jest.fn(),
  });
  expect(auth).toHaveBeenCalledWith(expect.objectContaining({ cf: null }));
  expect(cfFactory).not.toHaveBeenCalled();
});

test("CLI does not apply a profile before OAuth logout", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 21}`);
  const oauth = jest.fn();
  const applyEnv = { CLOUDFLARE_API_TOKEN: "must-not-be-loaded" };
  await mod.run({
    argv: ["oauth", "logout", "--profile", "work"],
    env: applyEnv,
    loadEnv: jest.fn(),
    handlers: { oauth },
    cfFactory: jest.fn(() => {
      throw new Error("client should not be created");
    }),
    printer: { log: jest.fn(), error: jest.fn() },
    fsImpl: { existsSync: jest.fn(() => false), readFileSync: jest.fn(() => "") },
    exit: jest.fn(),
  });
  expect(oauth).toHaveBeenCalledWith(expect.objectContaining({ cf: null }));
});

test("CLI reports unknown resources through injected dependencies", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 2}`);
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn();
  await mod.run({
    argv: ["unknown", "list"],
    printer,
    exit,
    loadEnv: jest.fn(),
    cfFactory: jest.fn(),
  });
  expect(printer.log).toHaveBeenCalled();
  expect(exit).toHaveBeenCalledWith(1);
});

test("CLI exercises JSON output callback", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 3}`);
  const printer = { log: jest.fn(), error: jest.fn() };
  const handler = jest.fn(({ toJsonOutput }) => toJsonOutput({ ok: true }));
  await mod.run({
    argv: ["zones", "list", "--json"],
    env: {},
    printer,
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    handlers: { zones: handler },
    exit: jest.fn(),
  });
  expect(printer.log).toHaveBeenCalledWith(JSON.stringify({ ok: true }, null, 2));
});

test("CLI default exit dependency is exercised safely", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 4}`);
  const exit = process.exit;
  process.exit = jest.fn();
  try {
    await mod.run({
      argv: ["unknown", "list"],
      printer: { log: jest.fn(), error: jest.fn() },
      loadEnv: jest.fn(),
      cfFactory: jest.fn(),
    });
    expect(process.exit).toHaveBeenCalledWith(1);
  } finally {
    process.exit = exit;
  }
});

test("CLI exercises no-body and resource-help paths", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 5}`);
  const printer = { log: jest.fn(), error: jest.fn() };
  const handler = jest.fn(({ body }) => expect(body).toBeNull());
  await mod.run({
    argv: ["zones", "list"],
    env: {},
    printer,
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    handlers: { zones: handler },
    exit: jest.fn(),
  });
  await mod.run({ argv: ["zones"], printer });
  expect(printer.log).toHaveBeenCalled();
});

test("CLI routes subcommand help to command-specific output", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 25}`);
  const printer = { log: jest.fn(), error: jest.fn() };
  await mod.run({
    argv: ["auth", "login", "--help"],
    printer,
    fsImpl: { readFileSync: jest.fn(() => "") },
    exit: jest.fn(),
  });
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining("hidden input"));
});

test("CLI exercises injected failure callback", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 6}`);
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn();
  const handler = jest.fn(({ fail }) => fail("expected failure"));
  await mod.run({
    argv: ["zones", "list"],
    env: {},
    printer,
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    handlers: { zones: handler },
    exit,
  });
  expect(printer.error).toHaveBeenCalledWith("expected failure");
  expect(exit).toHaveBeenCalledWith(1);
});

test("loadBody returns null when no input is provided", async () => {
  const { loadBody } = await import(`../src/cli.mjs?ts=${Date.now() + 7}`);
  expect(loadBody({})).toBeNull();
});

test("CLI dispatches canonical resource names", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 8}`);
  const handler = jest.fn();
  await mod.run({
    argv: ["zones", "list"],
    printer: { log: jest.fn(), error: jest.fn() },
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    handlers: { zones: handler },
    exit: jest.fn(),
  });
  expect(handler).toHaveBeenCalled();
});

test("CLI reports missing OAuth scopes before creating a Cloudflare client", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 81}`);
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn();
  const cfFactory = jest.fn();
  await mod.run({
    argv: ["zones", "list"],
    env: { CFHUB_OAUTH_SCOPES: "zone.write" },
    printer,
    loadEnv: jest.fn(),
    cfFactory,
    exit,
  });
  expect(cfFactory).not.toHaveBeenCalled();
  expect(printer.error).toHaveBeenCalledWith(expect.stringContaining("zone.read"));
  expect(exit).toHaveBeenCalledWith(1);
});

test("CLI reports missing known API-token permissions before creating a client", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 82}`);
  const printer = { log: jest.fn(), error: jest.fn() };
  const exit = jest.fn();
  const cfFactory = jest.fn();
  await mod.run({
    argv: ["dns-records", "create"],
    env: { CFHUB_API_PERMISSIONS: "DNS Read", CFHUB_API_PERMISSIONS_KNOWN: "1" },
    printer,
    loadEnv: jest.fn(),
    cfFactory,
    exit,
  });
  expect(cfFactory).not.toHaveBeenCalled();
  expect(printer.error).toHaveBeenCalledWith(expect.stringContaining("DNS Write"));
  expect(exit).toHaveBeenCalledWith(1);
});

test("CLI manages aliases and config through the command surface", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 12}`);
  const home = `/tmp/cf-cli-settings-${Date.now()}`;
  const files = new Map();
  const fsImpl = {
    existsSync: (path) => files.has(path),
    readFileSync: (path) => files.get(path),
    mkdirSync: jest.fn(),
    writeFileSync: (path, value) => files.set(path, value),
    chmodSync: jest.fn(),
  };
  const printer = { log: jest.fn(), error: jest.fn() };
  const common = { homeDir: home, fsImpl, printer };
  await mod.run({ ...common, argv: ["alias", "set", "work", "zone", "list"] });
  await mod.run({
    ...common,
    argv: ["work"],
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    handlers: { zones: jest.fn() },
    exit: jest.fn(),
  });
  await mod.run({ ...common, argv: ["alias", "list"] });
  await mod.run({ ...common, argv: ["alias", "list", "--json"] });
  await mod.run({ ...common, argv: ["alias", "delete", "work"] });
  await mod.run({ ...common, argv: ["alias", "delete", "missing"] });
  await mod.run({ ...common, argv: ["alias", "delete"] });
  await mod.run({ ...common, argv: ["alias", "set", "missing"] });
  await mod.run({ ...common, argv: ["alias", "unknown"] });
  await mod.run({
    ...common,
    argv: ["alias", "set", "raw", "unknown", "list"],
  });
  await mod.run({
    ...common,
    argv: ["raw"],
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    exit: jest.fn(),
  });
  await mod.run({ ...common, argv: ["config", "set", "pager", "less"] });
  await mod.run({ ...common, argv: ["config", "get", "pager"] });
  await mod.run({ ...common, argv: ["config", "list", "--json"] });
  await mod.run({ ...common, argv: ["config", "list"] });
  await mod.run({ ...common, argv: ["config", "get", "missing"] });
  await mod.run({ ...common, argv: ["config", "set", "missing"] });
  await mod.run({ ...common, argv: ["config", "unset", "pager"] });
  await mod.run({ ...common, argv: ["config", "unknown"] });
  expect(printer.error).toHaveBeenCalledWith("Usage: cfhub config set <name> <value>");
});

test("CLI dispatches built-in load-balancer and tunnel handlers", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 11}`);
  const printer = { log: jest.fn(), error: jest.fn() };
  const cfFactory = jest.fn(() => ({
    get: jest.fn().mockResolvedValue({ ok: true }),
  }));
  const common = {
    printer,
    loadEnv: jest.fn(),
    cfFactory,
    env: {},
    exit: jest.fn(),
  };
  await mod.run({
    ...common,
    argv: ["load-balancer", "list", "--zone-id", "z1"],
  });
  await mod.run({ ...common, argv: ["tunnel", "list", "--account-id", "a1"] });
  expect(printer.log).toHaveBeenCalled();
});

test("CLI dispatches account platform handlers", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 12}`);
  const printer = { log: jest.fn(), error: jest.fn() };
  const cfFactory = jest.fn(() => ({
    get: jest.fn().mockResolvedValue({ ok: true }),
  }));
  for (const resource of [
    "workers",
    "pages",
    "r2",
    "d1",
    "queues",
    "stream",
    "images",
    "ai",
    "access",
  ]) {
    await mod.run({
      argv: [resource, "list", "--account-id", "a1"],
      printer,
      loadEnv: jest.fn(),
      cfFactory,
      env: {},
      exit: jest.fn(),
    });
  }
  expect(printer.log).toHaveBeenCalled();
});
