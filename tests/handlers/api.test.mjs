import { jest } from "@jest/globals";
import { handleApi } from "../../src/handlers/api.mjs";

function context(overrides = {}) {
  return {
    cf: { get: jest.fn().mockResolvedValue({ result: ["ok"] }), post: jest.fn() },
    action: "zones",
    opts: {},
    body: null,
    outputJson: true,
    printer: { log: jest.fn(), error: jest.fn() },
    fail: jest.fn(),
    ...overrides,
  };
}

test("calls a relative GET path and normalizes it", async () => {
  const ctx = context();
  await handleApi(ctx);
  expect(ctx.cf.get).toHaveBeenCalledWith("/zones", undefined);
  expect(ctx.printer.log).toHaveBeenCalledWith(expect.stringContaining("ok"));
});

test("renders API results with the selected template", async () => {
  const ctx = context({ opts: { template: "{{.name}}" } });
  ctx.cf.get.mockResolvedValue({ name: "example.com" });
  await handleApi(ctx);
  expect(ctx.printer.log).toHaveBeenCalledWith("example.com");
});

test("returns after an API dry run", async () => {
  const ctx = context({
    action: "/zones",
    opts: { method: "DELETE", "dry-run": true },
  });
  await handleApi(ctx);
  expect(ctx.cf.get).not.toHaveBeenCalled();
  expect(ctx.printer.log).toHaveBeenCalledWith(expect.stringContaining('"dryRun": true'));
});

test("performs an API DELETE when dry-run is explicitly false", async () => {
  const ctx = context({
    action: "/zones/z1",
    opts: { method: "DELETE", "dry-run": false, force: true },
  });
  ctx.cf.delete = jest.fn().mockResolvedValue({ result: "deleted" });
  await handleApi(ctx);
  expect(ctx.cf.delete).toHaveBeenCalledWith("/zones/z1", undefined);
  expect(ctx.printer.log).toHaveBeenCalledWith(expect.stringContaining("deleted"));
});

test("does not send an API DELETE when dry-run is false without force", async () => {
  const ctx = context({
    action: "/zones/z1",
    opts: { method: "DELETE", "dry-run": false },
  });
  ctx.cf.delete = jest.fn();
  await handleApi(ctx);
  expect(ctx.cf.delete).not.toHaveBeenCalled();
  expect(ctx.fail).toHaveBeenCalledWith("Refusing DELETE without --force (or use --dry-run)");
});

test.each([
  [{ action: "" }, "requires a path"],
  [{ action: "https://example.com" }, "relative"],
  [{ opts: { method: "TRACE" } }, "Unsupported"],
  [{ body: {}, opts: {} }, "Read requests"],
  [{ opts: { method: "DELETE" } }, "DELETE"],
])("rejects invalid API request %#", async (overrides, message) => {
  const ctx = context(overrides);
  await handleApi(ctx);
  expect(ctx.fail).toHaveBeenCalledWith(expect.stringContaining(message));
});
