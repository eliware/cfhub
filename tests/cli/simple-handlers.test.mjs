import { jest } from "@jest/globals";
import { simpleHandlers } from "../../src/cli/simple-handlers.mjs";
import { run } from "../../src/cli.mjs";

test("simple handler map covers platform resources", async () => {
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
  ])
    expect(simpleHandlers).toHaveProperty(resource);
  for (const [name, handler] of Object.entries(simpleHandlers)) {
    const get = jest.fn().mockResolvedValue({ result: [] });
    await handler({
      cf: { get },
      action: "list",
      opts: name === "loadBalancer" ? { "zone-id": "zone" } : { "account-id": "account" },
      outputJson: true,
      toJsonOutput: jest.fn(),
      printer: { log: jest.fn() },
      fail: (message) => {
        throw new Error(message);
      },
    });
    expect(get).toHaveBeenCalledTimes(1);
  }
});

test("CLI manages aliases and config through the command surface", async () => {
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
  await run({ ...common, argv: ["alias", "set", "work", "zone", "list"] });
  await run({
    ...common,
    argv: ["work"],
    loadEnv: jest.fn(),
    cfFactory: jest.fn(() => ({})),
    handlers: { zones: jest.fn() },
    exit: jest.fn(),
  });
  await run({ ...common, argv: ["config", "set", "pager", "less"] });
  await run({ ...common, argv: ["config", "get", "pager"] });
  expect(printer.log).toHaveBeenCalledWith("less");
});

test("CLI dispatches built-in load-balancer and tunnel handlers", async () => {
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
  await run({
    ...common,
    argv: ["load-balancer", "list", "--zone-id", "z1"],
  });
  await run({ ...common, argv: ["tunnel", "list", "--account-id", "a1"] });
  expect(printer.log).toHaveBeenCalled();
});

test("CLI dispatches a configured account platform handler", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const cfFactory = jest.fn(() => ({
    get: jest.fn().mockResolvedValue({ ok: true }),
  }));
  await run({
    argv: ["workers", "list", "--account-id", "a1"],
    printer,
    loadEnv: jest.fn(),
    cfFactory,
    env: {},
    exit: jest.fn(),
  });
  expect(printer.log).toHaveBeenCalled();
});

test("CLI loads an installed extension without Cloudflare credentials", async () => {
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "cf-cli-ext-"));
  const root = path.join(home, ".config/cfhub/extensions/hello");
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(
    path.join(root, "cf-extension.json"),
    JSON.stringify({
      name: "hello",
      version: "1.0.0",
      commands: { hello: "hello.mjs" },
    }),
  );
  fs.writeFileSync(
    path.join(root, "hello.mjs"),
    "export default ({ printer, opts }) => printer.log(`Hello ${opts.name}`)",
  );
  const printer = { log: jest.fn(), error: jest.fn() };
  await run({
    argv: ["hello", "--name", "Eli"],
    printer,
    fsImpl: fs,
    homeDir: home,
  });
  expect(printer.log).toHaveBeenCalledWith("Hello Eli");
});
