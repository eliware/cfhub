import { jest } from "@jest/globals";
import { simpleHandlers } from "../../src/cli/simple-handlers.mjs";

test("simple handler map covers platform resources", () => {
  expect(simpleHandlers).toHaveProperty("workers");
});

test("CLI manages aliases and config through the command surface", async () => {
  const mod = await import(`../../src/cli.mjs?ts=${Date.now() + 12}`);
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
  const mod = await import(`../../src/cli.mjs?ts=${Date.now() + 11}`);
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
  const mod = await import(`../../src/cli.mjs?ts=${Date.now() + 12}`);
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

test("CLI loads an installed extension without Cloudflare credentials", async () => {
  const mod = await import(`../../src/cli.mjs?ts=${Date.now() + 15}`);
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
  await mod.run({
    argv: ["hello", "--name", "Eli"],
    printer,
    fsImpl: fs,
    homeDir: home,
  });
  expect(printer.log).toHaveBeenCalledWith("Hello Eli");
});
