import { jest } from "@jest/globals";
import { loadBody } from "../src/cli.mjs";

import { run } from "../src/cli.mjs";
import "../test-fixtures/unit/cli-defaults.mjs";

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

test("loadBody reads inline data, files, and empty bodies", () => {
  expect(loadBody({ data: JSON.stringify({ inline: true }) })).toEqual({ inline: true });
  const readFileSync = jest.fn().mockReturnValue(JSON.stringify({ file: true }));
  expect(loadBody({ file: "body.json" }, { readFileSync })).toEqual({ file: true });
  expect(readFileSync).toHaveBeenCalledWith("body.json", "utf8");
  expect(loadBody({})).toBeNull();
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
