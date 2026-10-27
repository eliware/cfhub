import { jest } from "@jest/globals";
import { liveEnabled, liveReady, wetEnabled } from "./cli-live-settings.mjs";
import { zoneId, discoverContext } from "./cli-live-context.mjs";
import { run, parseJson } from "./cli-live-runner.mjs";
import { skipUnavailable, canRun } from "./cli-live-capabilities.mjs";

const liveDescribe = liveEnabled && liveReady ? describe : describe.skip;
liveDescribe("authenticated live CLI health lifecycle tests", () => {
  jest.setTimeout(120_000);
  beforeAll(discoverContext);

  test("wet health CRUD creates, reads, deletes, and confirms a disposable monitor", async () => {
    if (!wetEnabled || !canRun("health", "create")) return;
    expect(zoneId).toEqual(expect.any(String));
    const monitor = {
      type: "HTTPS",
      address: "eliware.org",
      port: 443,
      method: "GET",
      path: "/health",
      expected_codes: "200",
      follow_redirects: true,
      allow_insecure: false,
      interval: 60,
      timeout: 5,
      retries: 2,
      consecutive_fails: 3,
      consecutive_successes: 2,
    };
    let monitorId;
    try {
      const created = await run([
        "health",
        "create",
        "--zone-id",
        zoneId,
        "--data",
        JSON.stringify(monitor),
        "--json",
      ]);
      if (created.code !== 0 && skipUnavailable("health CRUD", created)) return;
      expect(created.code).toBe(0);
      monitorId = parseJson(created).id;
      expect(monitorId).toEqual(expect.any(String));

      const read = await run(["health", "get", "--zone-id", zoneId, "--id", monitorId, "--json"]);
      expect(read.code).toBe(0);
      expect(parseJson(read).address).toBe("eliware.org");
    } finally {
      if (monitorId) {
        const deleted = await run([
          "health",
          "delete",
          "--zone-id",
          zoneId,
          "--id",
          monitorId,
          "--force",
          "--json",
        ]);
        expect(deleted.code).toBe(0);
        const readDeleted = await run([
          "health",
          "get",
          "--zone-id",
          zoneId,
          "--id",
          monitorId,
          "--json",
        ]);
        expect(readDeleted.code).not.toBe(0);
      }
    }
  });
});
