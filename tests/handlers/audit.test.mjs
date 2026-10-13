import { jest } from "@jest/globals";
import { handleAudit } from "../../src/handlers/audit.mjs";

test("audit lists account logs as JSON or text and rejects unknown actions", async () => {
  const printer = { log: jest.fn() };
  const toJsonOutput = jest.fn();
  const fail = jest.fn();
  const cf = { get: jest.fn().mockResolvedValue({ entries: [] }) };
  const common = { cf, opts: { "account-id": "a1" }, printer, toJsonOutput, fail };
  await handleAudit({ ...common, action: "list", outputJson: true });
  expect(cf.get).toHaveBeenCalledWith("/accounts/a1/audit_logs");
  expect(toJsonOutput).toHaveBeenCalledWith({ entries: [] });
  await handleAudit({ ...common, action: "list", outputJson: false });
  expect(printer.log).toHaveBeenCalledWith(JSON.stringify({ entries: [] }, null, 2));
  await handleAudit({ ...common, action: "get", outputJson: true });
  expect(fail).toHaveBeenCalledWith("Unknown audit action: get");
});
