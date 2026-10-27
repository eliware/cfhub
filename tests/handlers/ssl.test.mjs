import { jest } from "@jest/globals";
import { handleSsl } from "../../src/handlers/ssl.mjs";

const base = () => ({
  cf: {
    get: jest.fn().mockResolvedValue({
      result: [{ hosts: ["example.com"], status: "active", type: " Universal" }],
    }),
  },
  opts: { "zone-id": "z1" },
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  fail: jest.fn(),
});

test("routes certificate and coverage requests", async () => {
  const ctx = base();
  await handleSsl({ ...ctx, action: "certificates" });
  const coverage = base();
  await handleSsl({ ...coverage, action: "coverage" });
  expect(ctx.cf.get).toHaveBeenCalledWith("/zones/z1/ssl/certificate_packs");
  expect(ctx.toJsonOutput).toHaveBeenCalledWith({
    result: [{ hosts: ["example.com"], status: "active", type: " Universal" }],
  });
  expect(coverage.cf.get).toHaveBeenCalledWith("/zones/z1/ssl/certificate_packs");
  expect(coverage.toJsonOutput).toHaveBeenCalled();
  const text = base();
  text.outputJson = false;
  await handleSsl({ ...text, action: "certificates" });
  expect(text.printer.log).toHaveBeenCalled();
});

test("gets SSL settings and prints text output", async () => {
  const ctx = base();
  ctx.opts.setting = "tls_1_3";
  ctx.outputJson = false;
  await handleSsl({ ...ctx, action: "get" });
  expect(ctx.cf.get).toHaveBeenCalledWith("/zones/z1/settings/tls_1_3");
  expect(ctx.printer.log).toHaveBeenCalled();
});

test("sets SSL values with dry-run and API writes", async () => {
  const fail = (message) => {
    throw new Error(message);
  };
  await expect(handleSsl({ ...base(), action: "set", body: null, fail })).rejects.toThrow(
    "Missing --data",
  );
  const dry = base();
  dry.opts["dry-run"] = true;
  await handleSsl({ ...dry, action: "set", body: { value: "strict" } });
  expect(dry.printer.log).toHaveBeenCalledWith(expect.stringContaining('"dryRun": true'));
  const patch = jest.fn().mockResolvedValue({ value: "strict" });
  const toJsonOutput = jest.fn();
  await handleSsl({
    ...base(),
    action: "set",
    body: { value: "strict" },
    cf: { patch },
    toJsonOutput,
  });
  expect(patch).toHaveBeenCalledWith("/zones/z1/settings/ssl", { body: { value: "strict" } });
  expect(toJsonOutput).toHaveBeenCalledWith({ value: "strict" });
});

test("validates zone IDs and reports unknown actions", async () => {
  const fail = (message) => {
    throw new Error(message);
  };
  await expect(handleSsl({ ...base(), action: "get", opts: {}, fail })).rejects.toThrow(
    "Missing --zone-id",
  );
  await expect(handleSsl({ ...base(), action: "other", fail })).rejects.toThrow(
    "Unknown ssl action: other",
  );
});

test("gets JSON settings and prints updated settings", async () => {
  const json = base();
  await handleSsl({ ...json, action: "get" });
  expect(json.toJsonOutput).toHaveBeenCalled();
  const patch = jest.fn().mockResolvedValue({ value: "full" });
  const text = base();
  text.outputJson = false;
  await handleSsl({ ...text, action: "set", body: { value: "full" }, cf: { patch } });
  expect(text.printer.log).toHaveBeenCalledWith('{\n  "value": "full"\n}');
});
