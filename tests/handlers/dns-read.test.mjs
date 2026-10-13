import { jest } from "@jest/globals";
import { displayDnsRecord, displayDnsRecords } from "../../src/handlers/dns-read.mjs";

test("formats DNS record lists as JSON or tables", () => {
  const records = [{ id: "r", type: "A", name: "a.test", content: "1.2.3.4" }];
  const toJsonOutput = jest.fn();
  displayDnsRecords(
    { result: records },
    { outputJson: true, toJsonOutput, printer: { log: jest.fn() } },
  );
  expect(toJsonOutput).toHaveBeenCalledWith(records);
  const log = jest.fn();
  displayDnsRecords(records, { outputJson: false, toJsonOutput, printer: { log } });
  expect(log).toHaveBeenCalled();
});

test("formats a single DNS record", () => {
  const record = { id: "r" };
  const toJsonOutput = jest.fn();
  displayDnsRecord(record, { outputJson: true, toJsonOutput, printer: { log: jest.fn() } });
  expect(toJsonOutput).toHaveBeenCalledWith(record);
  const log = jest.fn();
  displayDnsRecord(record, { outputJson: false, toJsonOutput, printer: { log } });
  expect(log).toHaveBeenCalledWith(JSON.stringify(record, null, 2));
});
