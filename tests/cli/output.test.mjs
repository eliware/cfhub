import { jest } from "@jest/globals";

test("CLI applies basic jq selection to JSON callbacks", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 9}`);
  const printer = { log: jest.fn(), error: jest.fn() };
  await mod.run({
    argv: ["zones", "list", "--json", "--jq", ".name"],
    printer,
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    handlers: {
      zones: ({ toJsonOutput }) => toJsonOutput({ name: "example.com" }),
    },
    exit: jest.fn(),
  });
  expect(printer.log).toHaveBeenCalledWith('"example.com"');
});

test("CLI quiet mode suppresses normal handler output", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 10}`);
  const printer = { log: jest.fn(), error: jest.fn() };
  await mod.run({
    argv: ["zones", "list", "--quiet"],
    printer,
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    handlers: { zones: ({ printer: injected }) => injected.log("hidden") },
    exit: jest.fn(),
  });
  expect(printer.log).not.toHaveBeenCalledWith("hidden");
});

test("CLI accepts terminal output controls without changing JSON contracts", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 11}`);
  const printer = { log: jest.fn(), error: jest.fn() };
  await mod.run({
    argv: ["zones", "list", "--pager=true", "--color=never", "--width", "80"],
    printer,
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    handlers: { zones: ({ printer: injected }) => injected.log("ID\nexample") },
    exit: jest.fn(),
    updateCheck: jest.fn().mockResolvedValue(null),
  });
  expect(printer.error).not.toHaveBeenCalled();
});

test("CLI supports a bare pager flag with and without saved pager settings", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 17}`);
  const home = `/tmp/cf-cli-pager-${Date.now()}`;
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
    process.env.PAGER = oldPager;
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
    process.env.PAGER = savedPager;
  }
  expect(printer.error).not.toHaveBeenCalled();
});

test("CLI prints dashboard links before dispatch", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 13}`);
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

test("CLI renders templates through injected handlers", async () => {
  const mod = await import(`../src/cli.mjs?ts=${Date.now() + 14}`);
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
