import { jest } from "@jest/globals";
import { run } from "../src/cli.mjs";
import { createCliDependencies } from "../src/cli/dependencies.mjs";

function dependencies(argv, overrides = {}) {
  return {
    argv,
    printer: { log: jest.fn(), error: jest.fn() },
    fsImpl: { existsSync: () => false, readFileSync: jest.fn(() => "") },
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    updateCheck: jest.fn(),
    exit: jest.fn(),
    ...overrides,
  };
}

test("prints the version without loading project services", async () => {
  const options = dependencies(["--version"]);
  await run(options);
  expect(options.printer.log).toHaveBeenCalled();
});

test("uses default arguments when options are omitted", async () => {
  const argv = process.argv;
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  process.argv = ["node", "cfhub", "--version"];
  try {
    await run();
  } finally {
    process.argv = argv;
    log.mockRestore();
  }
});

test("prints help for empty arguments", async () => {
  const options = dependencies([]);
  await run(options);
  expect(options.printer.log).toHaveBeenCalled();
});

test("resolves resource help before authorization", async () => {
  const options = dependencies(["zones", "--help"]);
  await run(options);
  expect(options.loadEnv).not.toHaveBeenCalled();
});

test("routes extension commands before authorization", async () => {
  const options = dependencies(["extension", "list"]);
  await run(options);
  expect(options.cfFactory).not.toHaveBeenCalled();
});

test("stops when authorization rejects a command", async () => {
  const options = dependencies(["zones", "list"], {
    env: { CFHUB_OAUTH_SCOPES: "dns.read" },
  });
  await run(options);
  expect(options.cfFactory).not.toHaveBeenCalled();
});

test("returns after printing dashboard links", async () => {
  const options = dependencies(["zones", "get", "--zone-id", "z1", "--web"], {
    env: {},
  });
  await run(options);
  expect(options.printer.log).toHaveBeenCalledWith("https://dash.cloudflare.com/zones/z1");
});

test("dispatches an authorized command to its injected handler", async () => {
  const zones = jest.fn();
  const options = dependencies(["zones", "list"], {
    env: {},
    cfFactory: jest.fn(() => ({ zones: { list: jest.fn().mockResolvedValue({ result: [] }) } })),
    handlers: { zones },
  });
  await run(options);
  expect(zones).toHaveBeenCalled();
});

test("uses the default exit callback for an unknown command", async () => {
  const exit = jest.spyOn(process, "exit").mockImplementation(() => undefined);
  try {
    createCliDependencies().exit(1);
    expect(exit).toHaveBeenCalledWith(1);
  } finally {
    exit.mockRestore();
  }
});
