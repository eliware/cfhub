import { jest } from "@jest/globals";
import {
  liveEnabled,
  liveReady,
  discoverContext,
  run,
  skipUnavailable,
  canRun,
  basicCommands,
  dryRunCommands,
  crudCommands,
  helpCommands,
  withContext,
} from "./cli-live-support.mjs";

const liveDescribe = liveEnabled && liveReady ? describe : describe.skip;
liveDescribe("authenticated live CLI smoke tests", () => {
  jest.setTimeout(120_000);
  beforeAll(discoverContext);

  test("general help commands work", async () => {
    for (const args of helpCommands) {
      const result = await run(args);
      expect(result.code).toBe(0);
    }
  });

  test.each(basicCommands)("runs %s", async (...args) => {
    if (!canRun(args[0], args[1])) return;
    const result = await run(withContext(args));
    if (result.code !== 0 && skipUnavailable(args.join(" "), result)) return;
    expect(result.code).toBe(0);
  });

  test("all supported dry-run write paths avoid Cloudflare mutations", async () => {
    if (!liveReady) return;
    for (const args of dryRunCommands) {
      const result = await run(withContext([...args, "--dry-run", "--json"]));
      if (result.code !== 0 && skipUnavailable(`${args[0]} ${args[1]} --dry-run`, result)) continue;
      expect(result.code).toBe(0);
    }
  });

  test("all CRUD actions expose working help", async () => {
    if (!liveReady) return;
    for (const [resource, actions] of crudCommands) {
      for (const action of actions) {
        if (!canRun(resource, action)) continue;
        const result = await run([resource, action, "--help"]);
        expect(result.code).toBe(0);
      }
    }
  });

  test("destructive commands require explicit force", async () => {
    if (!liveReady) return;
    const checks = [
      ["zones", "delete"],
      ["dns-records", "delete"],
      ["health", "delete"],
      ["origin-ca", "revoke"],
      ["list-items", "delete"],
    ];
    for (const args of checks) {
      if (!canRun(args[0], args[1])) continue;
      const result = await run(args);
      if (result.code !== 0 && skipUnavailable(args.join(" "), result)) continue;
      expect(result.code).not.toBe(0);
      expect(`${result.stdout}\n${result.stderr}`).toMatch(/force|required|usage|missing/i);
    }
  });
});
