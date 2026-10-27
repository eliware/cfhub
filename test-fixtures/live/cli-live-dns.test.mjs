import { jest } from "@jest/globals";
import { liveEnabled, liveReady, wetEnabled } from "./cli-live-settings.mjs";
import { zoneId, discoverContext } from "./cli-live-context.mjs";
import { run, parseJson } from "./cli-live-runner.mjs";
import { skipUnavailable, canRun } from "./cli-live-capabilities.mjs";

const liveDescribe = liveEnabled && liveReady ? describe : describe.skip;
liveDescribe("authenticated live CLI dns lifecycle tests", () => {
  jest.setTimeout(120_000);
  beforeAll(discoverContext);

  test("wet DNS CRUD follows the complete create-read-update-read-delete lifecycle", async () => {
    if (!wetEnabled || !canRun("dns-records", "create")) return;
    expect(zoneId).toEqual(expect.any(String));
    const zonesResult = await run(["zones", "list", "--json"]);
    expect(zonesResult.code).toBe(0);
    const zones = parseJson(zonesResult);
    const zone = zones.find((item) => item.id === zoneId) || zones[0];
    expect(zone?.name).toEqual(expect.any(String));
    const name = `_cf-live-${Date.now()}.${zone.name}`;
    const createBody = {
      type: "A",
      name,
      content: "192.0.2.1",
      ttl: 60,
      proxied: false,
    };
    let recordId;
    try {
      const before = await run(["dns-records", "list", "--zone-id", zoneId, "--json"]);
      expect(before.code).toBe(0);
      expect(parseJson(before).some((record) => record.name === name)).toBe(false);

      const created = await run([
        "dns-records",
        "create",
        "--zone-id",
        zoneId,
        "--data",
        JSON.stringify(createBody),
        "--json",
      ]);
      if (created.code !== 0 && skipUnavailable("DNS CRUD", created)) return;
      expect(created.code).toBe(0);
      recordId = parseJson(created).id;
      expect(recordId).toEqual(expect.any(String));

      const readCreated = await run([
        "dns-records",
        "get",
        "--zone-id",
        zoneId,
        "--id",
        recordId,
        "--json",
      ]);
      expect(readCreated.code).toBe(0);
      expect(parseJson(readCreated).content).toBe("192.0.2.1");

      const updated = await run([
        "dns-records",
        "update",
        "--zone-id",
        zoneId,
        "--id",
        recordId,
        "--data",
        JSON.stringify({ ...createBody, content: "192.0.2.2" }),
        "--json",
      ]);
      expect(updated.code).toBe(0);

      const readUpdated = await run([
        "dns-records",
        "get",
        "--zone-id",
        zoneId,
        "--id",
        recordId,
        "--json",
      ]);
      expect(readUpdated.code).toBe(0);
      expect(parseJson(readUpdated).content).toBe("192.0.2.2");
    } finally {
      if (recordId) {
        const deleted = await run([
          "dns-records",
          "delete",
          "--zone-id",
          zoneId,
          "--id",
          recordId,
          "--force",
          "--json",
        ]);
        expect(deleted.code).toBe(0);
        const after = await run(["dns-records", "list", "--zone-id", zoneId, "--json"]);
        expect(after.code).toBe(0);
        expect(parseJson(after).some((record) => record.id === recordId)).toBe(false);
      }
    }
  });
});
