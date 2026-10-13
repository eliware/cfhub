import { jest } from "@jest/globals";
import { handleAudit } from "../../src/handlers/audit.mjs";

test("audit lists account logs and rejects unknown actions", async () => {
  const ctx = {
    cf: { get: jest.fn().mockResolvedValue({ ok: true }) },
    opts: { "account-id": "a1" },
    outputJson: true,
    toJsonOutput: jest.fn(),
    fail: jest.fn(),
  };
  await handleAudit({ ...ctx, action: "list" });
  expect(ctx.cf.get).toHaveBeenCalledWith("/accounts/a1/audit_logs");
  await handleAudit({ ...ctx, action: "get" });
  expect(ctx.fail).toHaveBeenCalledWith("Unknown audit action: get");
});
