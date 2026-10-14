import { getAccountId, getId, getZoneId } from "../../src/handlers/identifiers.mjs";

test("reads identifiers from options and environment values", () => {
  expect(getId({ id: "item" })).toBe("item");
  expect(getAccountId({ "account-id": "option" }, { CLOUDFLARE_ACCOUNT_ID: "env" })).toBe("option");
  expect(getAccountId({}, { CLOUDFLARE_ACCOUNT_ID: "env" })).toBe("env");
  expect(getZoneId({}, { CLOUDFLARE_ZONE_ID: "profile-zone" })).toBe("profile-zone");
  process.env.CLOUDFLARE_ACCOUNT_ID = "default-env";
  expect(getAccountId({})).toBe("default-env");
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  process.env.CLOUDFLARE_ZONE_ID = "env-zone";
  expect(getZoneId({})).toBe("env-zone");
  expect(getZoneId({ "zone-id": "option-zone" })).toBe("option-zone");
  delete process.env.CLOUDFLARE_ZONE_ID;
});
