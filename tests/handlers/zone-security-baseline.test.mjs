import { buildZoneSecurityBaseline } from "../../src/handlers/zone-security-baseline.mjs";

test("selects baseline security settings and lists missing settings", () => {
  expect(
    buildZoneSecurityBaseline("z", { result: [{ id: "ssl", value: "strict" }, { id: "other" }] }),
  ).toEqual({
    zoneId: "z",
    settings: [{ id: "ssl", value: "strict" }],
    missing: ["min_tls_version", "always_use_https", "tls_1_3"],
  });
  expect(buildZoneSecurityBaseline("z", {})).toMatchObject({
    settings: [],
    missing: expect.arrayContaining(["ssl"]),
  });
});
