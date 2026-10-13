import * as common from "../../src/handlers/common.mjs";

test("identifier helpers prefer explicit values and use environment fallbacks", () => {
  expect(common.getId({ id: "item" })).toBe("item");
  expect(common.getAccountId({ "account-id": "option" }, { CLOUDFLARE_ACCOUNT_ID: "env" })).toBe(
    "option",
  );
  expect(common.getAccountId({}, { CLOUDFLARE_ACCOUNT_ID: "env" })).toBe("env");
  process.env.CLOUDFLARE_ACCOUNT_ID = "default-env";
  expect(common.getAccountId({})).toBe("default-env");
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  process.env.CLOUDFLARE_ZONE_ID = "env-zone";
  expect(common.getZoneId({})).toBe("env-zone");
  expect(common.getZoneId({ "zone-id": "option-zone" })).toBe("option-zone");
  delete process.env.CLOUDFLARE_ZONE_ID;
});

test("requireValue returns valid values and rejects empty values", () => {
  const fail = (message) => {
    throw new Error(message);
  };
  expect(common.requireValue(" value ", "required", fail)).toBe(" value ");
  expect(common.requireValue(1, "required", fail)).toBe(1);
  expect(() => common.requireValue("  ", "required", fail)).toThrow("required");
  expect(() => common.requireValue(null, "required", fail)).toThrow("required");
});

test("requireAnyValue returns the first value or rejects an empty list", () => {
  const fail = (message) => {
    throw new Error(message);
  };
  expect(common.requireAnyValue([null, "second", "third"], "required", fail)).toBe("second");
  expect(() => common.requireAnyValue([null, ""], "required", fail)).toThrow("required");
});
