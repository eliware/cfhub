import { jest } from "@jest/globals";
import { getDnsRecord } from "../../../src/handlers/dns/record-get.mjs";

test("gets a DNS record through generic and SDK clients", async () => {
  const generic = jest.fn().mockResolvedValue({ id: "generic" });
  const toJsonOutput = jest.fn();
  await getDnsRecord({
    cf: { get: generic },
    zoneId: "zone-1",
    id: "record-1",
    outputJson: true,
    toJsonOutput,
  });
  expect(generic).toHaveBeenCalledWith("/zones/zone-1/dns_records/record-1", undefined);
  expect(toJsonOutput).toHaveBeenCalledWith({ id: "generic" });

  const get = jest.fn().mockResolvedValue({ id: "sdk" });
  const printer = { log: jest.fn() };
  await getDnsRecord({
    cf: { dns: { records: { get } } },
    zoneId: "zone-2",
    id: "record-2",
    outputJson: false,
    printer,
  });
  expect(get).toHaveBeenCalledWith("record-2", { zone_id: "zone-2" });
  expect(printer.log).toHaveBeenCalledWith(JSON.stringify({ id: "sdk" }, null, 2));
});

test("requires a DNS record ID", async () => {
  const fail = jest.fn((message) => {
    throw new Error(message);
  });
  await expect(getDnsRecord({ cf: {}, zoneId: "zone", fail })).rejects.toThrow("Missing --id");
});
