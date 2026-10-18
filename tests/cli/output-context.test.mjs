import { jest } from "@jest/globals";
import { createOutputContext } from "../../src/cli/output-context.mjs";
test("output context is exported", () => {
  expect(createOutputContext).toEqual(expect.any(Function));
});

test("output context prints update notices and contains check failures", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const common = {
    opts: {},
    printer,
    homeDir: "/tmp/cfhub-output-context",
    env: {},
    fsImpl: { existsSync: () => false },
  };
  createOutputContext({ ...common, updateCheck: jest.fn().mockResolvedValue("99.0.0") });
  await Promise.resolve();
  await Promise.resolve();
  expect(printer.error).toHaveBeenCalledWith(expect.stringContaining("99.0.0"));

  printer.error.mockClear();
  createOutputContext({
    ...common,
    updateCheck: jest.fn().mockRejectedValue(new Error("offline")),
  });
  await Promise.resolve();
  await Promise.resolve();
  expect(printer.error).not.toHaveBeenCalled();
});

test("quiet output context suppresses command log output", () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const context = createOutputContext({
    opts: { quiet: true },
    printer,
    homeDir: "/tmp/cfhub-output-context",
    env: {},
    fsImpl: { existsSync: () => false },
    updateCheck: jest.fn(),
  });
  context.commandPrinter.log("hidden");
  expect(printer.log).not.toHaveBeenCalled();
});

test("CLI supports a bare pager flag with and without saved pager settings", async () => {
  const mod = await import("../../src/cli.mjs?ts=17");
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
  const mod = await import("../../src/cli.mjs?ts=13");
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
  const mod = await import("../../src/cli.mjs?ts=14");
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
